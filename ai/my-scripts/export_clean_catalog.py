"""Export only curated CSVs for the Backend-owned import command."""
import csv
import json
from project_paths import DATA_DIR

FILES = {'cpu': 'cpu', 'motherboard': 'motherboard', 'gpu': 'gpu', 'ram': 'ram',
         'case': 'pc_case', 'cooling': 'cpu_cooler', 'psu': 'psu', 'storage': 'storage'}

def export():
    items = []
    seen = set()
    for category, filename in FILES.items():
        with (DATA_DIR / 'processed' / 'web_catalog' / (filename + '.csv')).open(encoding='utf-8-sig', newline='') as stream:
            rows = list(csv.DictReader(stream))
        if not rows:
            raise ValueError('Empty clean category: ' + category)
        for row in rows:
            ident = row.get('opendb_id')
            if not ident or ident in seen or not row.get('name') or not row.get('manufacturer'):
                raise ValueError('Invalid clean product identity')
            seen.add(ident)
            items.append({'category': category, **row})
    return items

if __name__ == '__main__':
    print(json.dumps(export(), ensure_ascii=True))
