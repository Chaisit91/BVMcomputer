import { getCategoryProducts } from '../../api/productApi';
import { mockDelay } from '../../api/request';
import { listUpgradeProducts } from './productSearchService';
import type { CategoryProductMap } from '../../data/catalog';
import type {
  CompatibilityCheck,
  UpgradeAnalysisRequest,
  UpgradeAnalysisResult,
  UpgradeComponentKey,
  UpgradeProduct,
  UpgradeRecommendation,
} from '../../types/upgrade';

/*
 * Stand-in for POST /upgrade/analyze while the AI backend isn't connected. Rule-based, but every
 * result is computed from the real attributes of the parts in the build (socket, RAM type, PSU
 * wattage, form factor ...) — nothing is a fixed number. Results are tagged `source: 'mock'` so the
 * UI never presents them as a real AI review.
 */

const KEYS: UpgradeComponentKey[] = ['cpu', 'gpu', 'motherboard', 'ram', 'storage', 'psu', 'case', 'cooling'];

const LABELS: Record<UpgradeComponentKey, string> = {
  cpu: 'CPU',
  gpu: 'GPU',
  motherboard: 'Mainboard',
  ram: 'RAM',
  storage: 'Storage',
  psu: 'PSU',
  case: 'Case',
  cooling: 'CPU Cooler',
};

type RawBuild = { [K in UpgradeComponentKey]?: CategoryProductMap[K] };
type RawCatalogs = { [K in UpgradeComponentKey]: CategoryProductMap[K][] };

const watts = (value: string | undefined) => Number(value?.match(/\d+/)?.[0] ?? NaN);
const FORM_FACTOR_RANK: Record<string, number> = { 'Mini-ITX': 1, 'Micro-ATX': 2, ATX: 3, 'E-ATX': 4 };
const HIGH_POWER_CPU_W = 200;

function missingCheck(id: string, title: string, components: UpgradeComponentKey[], build: RawBuild): CompatibilityCheck {
  const missing = components.filter((key) => !build[key]).map((key) => LABELS[key]);
  return {
    id,
    title,
    components,
    status: 'warning',
    detail: `ไม่มีข้อมูล ${missing.join(', ')} จึงยังตรวจสอบจุดนี้ไม่ได้`,
    fix: 'ระบุรุ่นอุปกรณ์ให้ครบ หรือสอบถามแอดมินเพื่อยืนยัน',
  };
}

function evaluateChecks(build: RawBuild): CompatibilityCheck[] {
  const { cpu, motherboard: mb, ram, gpu, psu, cooling, storage, case: pcCase } = build;
  const checks: CompatibilityCheck[] = [];

  // CPU ↔ Mainboard: socket must match.
  if (cpu && mb) {
    checks.push(
      cpu.socket === mb.socket
        ? { id: 'cpu-mb', title: 'CPU ↔ Mainboard', components: ['cpu', 'motherboard'], status: 'compatible', detail: `ซ็อกเก็ตตรงกัน (${cpu.socket})` }
        : {
            id: 'cpu-mb',
            title: 'CPU ↔ Mainboard',
            components: ['cpu', 'motherboard'],
            status: 'incompatible',
            detail: `ซ็อกเก็ตไม่ตรงกัน: CPU ใช้ ${cpu.socket} แต่ Mainboard เป็น ${mb.socket}`,
            fix: `เลือก Mainboard ซ็อกเก็ต ${cpu.socket} หรือเลือก CPU ซ็อกเก็ต ${mb.socket}`,
          },
    );
  } else {
    checks.push(missingCheck('cpu-mb', 'CPU ↔ Mainboard', ['cpu', 'motherboard'], build));
  }

  // RAM ↔ Mainboard: DDR generation must match.
  if (ram && mb) {
    checks.push(
      ram.memoryType === mb.memoryType
        ? { id: 'ram-mb', title: 'RAM ↔ Mainboard', components: ['ram', 'motherboard'], status: 'compatible', detail: `รองรับแรม ${ram.memoryType} ตรงกัน` }
        : {
            id: 'ram-mb',
            title: 'RAM ↔ Mainboard',
            components: ['ram', 'motherboard'],
            status: 'incompatible',
            detail: `แรมเป็น ${ram.memoryType} แต่ Mainboard รองรับ ${mb.memoryType}`,
            fix: `เลือกแรม ${mb.memoryType} หรือ Mainboard ที่รองรับ ${ram.memoryType}`,
          },
    );
  } else {
    checks.push(missingCheck('ram-mb', 'RAM ↔ Mainboard', ['ram', 'motherboard'], build));
  }

  // GPU ↔ PSU: PSU wattage vs the card's recommended system power.
  if (gpu && psu) {
    const need = watts(gpu.power);
    const have = watts(psu.wattage);
    if (Number.isNaN(need) || Number.isNaN(have)) {
      checks.push(missingCheck('gpu-psu', 'GPU ↔ PSU', ['gpu', 'psu'], {}));
    } else if (have >= need) {
      checks.push({ id: 'gpu-psu', title: 'GPU ↔ PSU', components: ['gpu', 'psu'], status: 'compatible', detail: `PSU ${have}W เพียงพอ (การ์ดจอแนะนำ ${need}W)` });
    } else if (have >= need * 0.9) {
      checks.push({
        id: 'gpu-psu',
        title: 'GPU ↔ PSU',
        components: ['gpu', 'psu'],
        status: 'warning',
        detail: `PSU ${have}W ต่ำกว่าที่แนะนำเล็กน้อย (${need}W)`,
        fix: `แนะนำ PSU อย่างน้อย ${need}W เพื่อความเสถียร`,
      });
    } else {
      checks.push({
        id: 'gpu-psu',
        title: 'GPU ↔ PSU',
        components: ['gpu', 'psu'],
        status: 'incompatible',
        detail: `PSU ${have}W ไม่พอสำหรับการ์ดจอ (แนะนำ ${need}W)`,
        fix: `เปลี่ยน PSU เป็น ${need}W ขึ้นไป`,
      });
    }
  } else {
    checks.push(missingCheck('gpu-psu', 'GPU ↔ PSU', ['gpu', 'psu'], build));
  }

  // CPU Cooler ↔ CPU: mounting socket and cooling headroom for high-power CPUs.
  if (cooling && cpu) {
    const cpuPower = watts(cpu.maxTurboPower);
    if (cooling.socket !== cpu.socket) {
      checks.push({
        id: 'cooler-cpu',
        title: 'CPU Cooler ↔ CPU',
        components: ['cooling', 'cpu'],
        status: 'warning',
        detail: `ชุดระบายความร้อนระบุรองรับ ${cooling.socket} แต่ CPU ใช้ ${cpu.socket}`,
        fix: `ตรวจสอบขาติดตั้ง (Bracket) สำหรับ ${cpu.socket} หรือเลือกรุ่นที่รองรับ`,
      });
    } else if (cpuPower >= HIGH_POWER_CPU_W && !/aio|liquid/i.test(cooling.type)) {
      checks.push({
        id: 'cooler-cpu',
        title: 'CPU Cooler ↔ CPU',
        components: ['cooling', 'cpu'],
        status: 'warning',
        detail: `CPU กินไฟสูงสุด ${cpuPower}W ชุดระบายความร้อนแบบลมอาจไม่พอเมื่อทำงานหนัก`,
        fix: 'แนะนำชุดน้ำ AIO 240mm ขึ้นไป',
      });
    } else {
      checks.push({ id: 'cooler-cpu', title: 'CPU Cooler ↔ CPU', components: ['cooling', 'cpu'], status: 'compatible', detail: `รองรับซ็อกเก็ต ${cpu.socket} และระบายความร้อนได้เพียงพอ` });
    }
  } else {
    checks.push(missingCheck('cooler-cpu', 'CPU Cooler ↔ CPU', ['cooling', 'cpu'], build));
  }

  // Storage ↔ Mainboard: interface.
  if (storage && mb) {
    checks.push({
      id: 'storage-mb',
      title: 'Storage ↔ Mainboard',
      components: ['storage', 'motherboard'],
      status: 'compatible',
      detail: storage.type === 'SSD M.2 NVMe' ? 'ติดตั้งผ่านช่อง M.2 บนเมนบอร์ด' : 'เชื่อมต่อผ่านพอร์ต SATA',
    });
  } else {
    checks.push(missingCheck('storage-mb', 'Storage ↔ Mainboard', ['storage', 'motherboard'], build));
  }

  // Case ↔ Mainboard: the case must take the board's form factor.
  if (pcCase && mb) {
    const fits = (FORM_FACTOR_RANK[pcCase.formFactor] ?? 0) >= (FORM_FACTOR_RANK[mb.formFactor] ?? 99);
    checks.push(
      fits
        ? { id: 'case-mb', title: 'Case ↔ Mainboard', components: ['case', 'motherboard'], status: 'compatible', detail: `เคส ${pcCase.formFactor} รองรับเมนบอร์ด ${mb.formFactor}` }
        : {
            id: 'case-mb',
            title: 'Case ↔ Mainboard',
            components: ['case', 'motherboard'],
            status: 'incompatible',
            detail: `เคสรองรับสูงสุด ${pcCase.formFactor} แต่เมนบอร์ดเป็น ${mb.formFactor}`,
            fix: `เลือกเคสที่รองรับ ${mb.formFactor}`,
          },
    );
  } else {
    checks.push(missingCheck('case-mb', 'Case ↔ Mainboard', ['case', 'motherboard'], build));
  }

  return checks;
}

/** Would this candidate fit with the rest of the build? Unknown neighbours don't disqualify it. */
function fitsBuild(key: UpgradeComponentKey, id: string, build: RawBuild, raw: RawCatalogs): boolean {
  const { cpu, motherboard: mb, ram, gpu, psu, case: pcCase } = build;
  switch (key) {
    case 'cpu': {
      const p = raw.cpu.find((x) => x.id === id);
      return !p || !mb || p.socket === mb.socket;
    }
    case 'motherboard': {
      const p = raw.motherboard.find((x) => x.id === id);
      if (!p) return true;
      return (
        (!cpu || p.socket === cpu.socket) &&
        (!ram || p.memoryType === ram.memoryType) &&
        (!pcCase || (FORM_FACTOR_RANK[pcCase.formFactor] ?? 0) >= (FORM_FACTOR_RANK[p.formFactor] ?? 99))
      );
    }
    case 'ram': {
      const p = raw.ram.find((x) => x.id === id);
      return !p || !mb || p.memoryType === mb.memoryType;
    }
    case 'gpu': {
      const p = raw.gpu.find((x) => x.id === id);
      return !p || !psu || watts(p.power) <= watts(psu.wattage);
    }
    case 'psu': {
      const p = raw.psu.find((x) => x.id === id);
      return !p || !gpu || watts(p.wattage) >= watts(gpu.power);
    }
    case 'cooling': {
      const p = raw.cooling.find((x) => x.id === id);
      return !p || !cpu || p.socket === cpu.socket;
    }
    case 'case': {
      const p = raw.case.find((x) => x.id === id);
      return !p || !mb || (FORM_FACTOR_RANK[p.formFactor] ?? 0) >= (FORM_FACTOR_RANK[mb.formFactor] ?? 99);
    }
    default:
      return true;
  }
}

const REASONS: Record<UpgradeComponentKey, string[]> = {
  cpu: ['เพิ่มประสิทธิภาพการประมวลผล', 'ลดปัญหาคอขวดกับการ์ดจอ'],
  gpu: ['เพิ่มประสิทธิภาพการเล่นเกมและกราฟิก'],
  motherboard: ['รองรับ CPU และแรมในชุดนี้'],
  ram: ['เพิ่มความลื่นไหลเมื่อเปิดหลายโปรแกรม', 'รองรับ Mainboard ในชุดนี้'],
  storage: ['โหลดเกมและโปรแกรมได้เร็วขึ้น'],
  psu: ['จ่ายไฟเพียงพอสำหรับการ์ดจอในชุดนี้', 'เพิ่มความเสถียรของระบบ'],
  case: ['รองรับเมนบอร์ดในชุดนี้', 'ช่วยระบายอากาศได้ดีขึ้น'],
  cooling: ['รองรับซ็อกเก็ต CPU ในชุดนี้', 'ช่วยให้ CPU ทำงานได้เต็มประสิทธิภาพ'],
};

const DEFAULT_PRIMARY: UpgradeComponentKey[] = ['cpu', 'ram', 'cooling'];
const DEFAULT_SEQUENTIAL: UpgradeComponentKey[] = ['gpu', 'psu'];
const PRIMARY_LABELS = ['แนะนำที่สุด', 'คุ้มค่า', 'เสริมระบบ'];

/** Which part to suggest replacing for a failed check — prefer one the customer hasn't already chosen to upgrade. */
const FIX_TARGETS: Record<string, UpgradeComponentKey[]> = {
  'cpu-mb': ['motherboard', 'cpu'],
  'ram-mb': ['ram', 'motherboard'],
  'gpu-psu': ['psu', 'gpu'],
  'cooler-cpu': ['cooling'],
  'case-mb': ['case'],
};

export async function mockAnalyzeUpgrade(request: UpgradeAnalysisRequest): Promise<UpgradeAnalysisResult> {
  // All eight category lists are independent — fetch them in parallel (both are cached after the first call).
  const [rawLists, upgradeLists] = await Promise.all([
    Promise.all(KEYS.map((key) => getCategoryProducts(key))),
    Promise.all(KEYS.map((key) => listUpgradeProducts(key))),
  ]);
  const raw = Object.fromEntries(KEYS.map((key, i) => [key, rawLists[i]])) as RawCatalogs;
  const pool = Object.fromEntries(KEYS.map((key, i) => [key, upgradeLists[i]])) as Record<UpgradeComponentKey, UpgradeProduct[]>;

  // The build being analysed: each chosen upgrade replaces the current part in its category.
  const final = { ...request.currentSpec, ...request.upgrades };
  const build: RawBuild = {};
  for (const key of KEYS) {
    const id = final[key]?.productId;
    const match = id ? (raw[key] as { id: string }[]).find((p) => p.id === id) : undefined;
    if (match) (build as Record<string, unknown>)[key] = match;
  }

  const checks = evaluateChecks(build);
  const problems = checks.filter((c) => c.status === 'incompatible');
  const warnings = checks.filter((c) => c.status === 'warning');
  const score = Math.max(0, 100 - problems.length * 25 - warnings.length * 8);

  // Pick a concrete product to recommend for a category: compatible with the build, not what's
  // already there, in stock first, then a step up in price from the current part (an actual upgrade).
  const pick = (key: UpgradeComponentKey, mustFix: boolean): UpgradeProduct | undefined => {
    const inBuild = final[key];
    const rawById = new Map((raw[key] as { id: string; inStock: boolean; badge?: string }[]).map((p) => [p.id, p]));
    const candidates = pool[key]
      .filter((p) => p.productId !== inBuild?.productId && p.productId !== request.currentSpec[key]?.productId)
      .filter((p) => fitsBuild(key, p.productId, build, raw))
      .filter((p) => mustFix || !inBuild || p.price > inBuild.price)
      .sort((a, b) => {
        const ra = rawById.get(a.productId);
        const rb = rawById.get(b.productId);
        if (ra?.inStock !== rb?.inStock) return ra?.inStock ? -1 : 1;
        if (Boolean(ra?.badge) !== Boolean(rb?.badge)) return ra?.badge ? -1 : 1;
        return a.price - b.price;
      });
    return candidates[0];
  };

  const recommendations: UpgradeRecommendation[] = [];
  const used = new Set<UpgradeComponentKey>();

  for (const check of [...problems, ...warnings]) {
    const targets = FIX_TARGETS[check.id] ?? [];
    const target = targets.find((key) => !request.upgrades[key]) ?? targets[0];
    if (!target || used.has(target)) continue;
    const product = pick(target, true);
    if (!product) continue;
    used.add(target);
    recommendations.push({
      category: target,
      tier: 'primary',
      product,
      label: check.status === 'incompatible' ? 'แก้ปัญหาที่พบ' : 'แนะนำเพิ่มเติม',
      reasons: [check.fix ?? check.detail, ...REASONS[target].slice(0, 1)],
    });
  }

  for (const key of DEFAULT_PRIMARY) {
    if (recommendations.filter((r) => r.tier === 'primary').length >= 3 || used.has(key)) continue;
    const product = pick(key, false);
    if (!product) continue;
    used.add(key);
    const index = recommendations.filter((r) => r.tier === 'primary').length;
    recommendations.push({ category: key, tier: 'primary', product, label: PRIMARY_LABELS[index] ?? 'แนะนำ', reasons: REASONS[key] });
  }

  for (const key of DEFAULT_SEQUENTIAL) {
    if (used.has(key)) continue;
    const product = pick(key, false);
    if (!product) continue;
    used.add(key);
    recommendations.push({ category: key, tier: 'sequential', product, label: 'อัปเกรดลำดับถัดไป', reasons: REASONS[key] });
  }

  // Parts that are fine as they are: no purchase suggested, just the current part for reference.
  for (const key of ['storage', 'case', 'motherboard'] as UpgradeComponentKey[]) {
    const current = request.currentSpec[key];
    if (!current || used.has(key) || request.upgrades[key]) continue;
    recommendations.push({ category: key, tier: 'skip', product: current, label: 'ยังไม่จำเป็น', reasons: ['สเปคปัจจุบันยังเพียงพอสำหรับการใช้งาน'] });
  }

  let insight: string;
  if (problems.length > 0) {
    insight = `พบปัญหาความเข้ากันได้ ${problems.length} จุด — ${problems[0].title}: ${problems[0].fix ?? problems[0].detail} ควรแก้ไขก่อนสั่งซื้อ`;
  } else if (warnings.length > 0) {
    insight = `ชุดนี้ใช้งานได้ แต่มีข้อควรระวัง: ${warnings[0].detail}${warnings[0].fix ? ` — ${warnings[0].fix}` : ''}`;
  } else if (request.upgrades.gpu && !request.upgrades.cpu) {
    insight = 'อัปเกรดการ์ดจอโดยใช้ CPU เดิม อาจเกิดคอขวด (Bottleneck) ในบางเกม ลองพิจารณาอัปเกรด CPU ควบคู่กัน';
  } else {
    insight = 'ชิ้นส่วนทั้งหมดในชุดนี้เข้ากันได้ตามข้อมูลสเปค พร้อมสรุปรายการอัปเกรดได้';
  }

  await mockDelay(900);
  return { source: 'mock', score, maxScore: 100, checks, insight, recommendations, analyzedAt: new Date().toISOString() };
}
