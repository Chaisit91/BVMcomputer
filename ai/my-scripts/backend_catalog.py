"""Read the managed catalog through Backend-web; no database credentials needed."""
import json
import re
from urllib.parse import urlparse
from urllib.request import Request, build_opener, HTTPRedirectHandler

CATEGORIES = {key: key for key in ('cpu', 'motherboard', 'gpu', 'ram', 'storage', 'case', 'psu')}
CATEGORIES['cooling'] = 'cooler'
ALIASES = {
    'motherboard': {'socket': 'socket', 'chipset': 'chipset', 'memoryType': 'ram_type', 'memorySlots': 'memory_slots', 'maxMemory': 'memory_max_gb', 'formFactor': 'form_factor', 'm2Slots': 'm2_slot_count'},
    'gpu': {'baseClock': 'base_clock', 'boostClock': 'boost_clock', 'cudaCores': 'core_count', 'pcieInterface': 'interface'},
    'ram': {'memoryType': 'ram_type', 'capacity': 'capacity_gb', 'speed': 'speed_mhz', 'casLatency': 'cas_latency', 'voltage': 'voltage'},
    'storage': {'capacity': 'capacity_gb', 'type': 'storage_type', 'interface': 'interface', 'formFactor': 'form_factor'},
    'case': {'mbSupport': 'supported_motherboards'},
    'psu': {'continuousPower': 'wattage', 'certification': 'efficiency_rating', 'formFactor': 'form_factor'},
    'cooler': {'socketSupport': 'cpu_sockets', 'radiatorSize': 'radiator_size_mm', 'fanSize': 'fan_size_mm'},
}
NUMERIC = {'memory_slots', 'memory_max_gb', 'm2_slot_count', 'capacity_gb', 'speed_mhz', 'cas_latency', 'voltage', 'wattage', 'radiator_size_mm', 'fan_size_mm', 'core_count', 'base_clock', 'boost_clock', 'memory_gb'}

def scalar(value):
    return '' if value is None else str(value).strip()

def numeric(value, field):
    # Accept a scalar and a known unit only; never guess from compound specs.
    if field in {'memory_slots', 'm2_slot_count'}:
        slots = re.fullmatch(r'\s*(\d+)\s*(?:x\s*)?(?:DIMM|M\.2(?:\s+NVMe)?)?\s*', scalar(value), re.I)
        return slots[1] if slots else ''
    match = re.fullmatch(r'\s*(\d+(?:\.\d+)?)\s*(GB|TB|MHz|GHz|W|mm|V)?\s*', scalar(value), re.I)
    if not match:
        return ''
    number = float(match[1])
    unit = (match[2] or '').upper()
    if field in {'capacity_gb', 'memory_max_gb', 'memory_gb'} and unit == 'TB':
        number *= 1000
    if field in {'base_clock', 'boost_clock'} and unit == 'GHZ':
        number *= 1000
    return f'{number:g}'

def normalize_catalog(payload):
    if not isinstance(payload, dict) or payload.get('version') != 1 or not isinstance(payload.get('items'), list):
        raise ValueError('Invalid backend catalog contract')
    catalog = {part: [] for part in CATEGORIES.values()}
    seen = set()
    for item in payload['items']:
        if not isinstance(item, dict) or item.get('category') not in CATEGORIES:
            raise ValueError('Invalid catalog category')
        part = CATEGORIES[item['category']]
        ident = item.get('id')
        if not isinstance(ident, str) or not ident or ident in seen or not item.get('name'):
            raise ValueError('Missing or duplicate product identity')
        seen.add(ident)
        specs = item.get('specs')
        if not isinstance(specs, dict):
            raise ValueError('Invalid product specifications')
        row = {key: scalar(value) for key, value in specs.items()}
        for source, target in ALIASES.get(part, {}).items():
            if source in specs:
                row[target] = numeric(specs[source], target) if target in NUMERIC else scalar(specs[source])
        if part == 'motherboard':
            if 'm2Slots' in specs:
                row['has_m2'] = str(float(row.get('m2_slot_count') or 0) > 0).lower()
            if 'pcieSlots' in specs:
                # Only explicit slot counts are understood. Blank/ambiguous edits
                # invalidate the old value rather than retaining outdated facts.
                slots = re.findall(r'(\d+)\s*x\s*PCIe\s*(?:[345]\.0\s*)?x16\b', scalar(specs['pcieSlots']), re.I)
                row['pcie_x16_slots'] = str(sum(map(int, slots))) if slots else ''
        if part == 'cooler' and specs.get('coolingType'):
            kind = scalar(specs['coolingType']).lower()
            row['water_cooled'] = 'true' if 'liquid' in kind else 'false' if kind == 'air cooler' else ''
        if part == 'cpu':
            cpu = item.get('cpu') or {}
            for source, target in {'socket': 'socket', 'cores': 'cores_total', 'threads': 'threads', 'baseFrequencyGhz': 'base_clock', 'maxTurboFrequencyGhz': 'boost_clock', 'tdpWatts': 'tdp'}.items():
                if source in cpu:
                    row[target] = scalar(cpu[source])
            # Recompute derived scores after admin edits.
            row['performance_score'] = str(float(row.get('cores_total') or 0) * float(row.get('boost_clock') or 0))
        if part == 'gpu':
            gpu = item.get('gpu') or {}
            if 'memorySize' in gpu:
                row['memory_gb'] = numeric(gpu['memorySize'], 'memory_gb')
            if 'chipsetModel' in gpu:
                row['chipset'] = scalar(gpu['chipsetModel'])
            row['compute_score'] = str(float(row.get('core_count') or 0) * float(row.get('boost_clock') or 0))
            watts = float(row.get('tdp') or 0)
            row['performance_per_watt'] = str(float(row['compute_score']) / watts) if watts > 0 else ''
        if part == 'ram':
            latency = float(row.get('cas_latency') or 0)
            row['speed_score'] = str(float(row.get('speed_mhz') or 0) / latency) if latency > 0 else ''
        # Identity is always taken from Product, even if a spec has a reserved key.
        row.update(opendb_id=ident, name=scalar(item['name']), manufacturer=scalar(item.get('brand')), image_url=scalar(item.get('image_url')))
        catalog[part].append(row)
    return catalog

class NoRedirect(HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        raise ValueError('Backend catalog redirects are not allowed')

def load_backend_catalog(base_url, token, timeout=5):
    parsed = urlparse(base_url)
    if parsed.username or parsed.password or parsed.query or parsed.fragment or parsed.path not in ('', '/'):
        raise ValueError('AI_BACKEND_URL must be a service origin')
    if parsed.scheme != 'https' and not (parsed.scheme == 'http' and parsed.hostname in {'localhost', '127.0.0.1', '::1'}):
        raise ValueError('AI_BACKEND_URL requires HTTPS except on loopback')
    if not parsed.hostname or len(token) < 32:
        raise ValueError('AI_CATALOG_TOKEN must have at least 32 characters')
    request = Request(base_url.rstrip('/') + '/api/internal/ai/catalog', headers={'Authorization': f'Bearer {token}', 'Accept': 'application/json'})
    with build_opener(NoRedirect).open(request, timeout=timeout) as response:
        body = response.read(16 * 1024 * 1024 + 1)
    if len(body) > 16 * 1024 * 1024:
        raise ValueError('Catalog response exceeds 16 MB')
    return normalize_catalog(json.loads(body))
