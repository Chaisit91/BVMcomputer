import type { UpgradeComponentKey } from '../types/upgrade';

// Shared order + labels for "current spec" lists across the upgrade flow (step 2's
// sidebar and step 3's analysis page). Mainboard is listed but isn't swappable in step 2.
export const upgradeSpecRows: { key: UpgradeComponentKey; label: string }[] = [
  { key: 'cpu', label: 'CPU' },
  { key: 'motherboard', label: 'Mainboard' },
  { key: 'ram', label: 'RAM' },
  { key: 'gpu', label: 'GPU' },
  { key: 'storage', label: 'Storage' },
  { key: 'psu', label: 'PSU' },
  { key: 'case', label: 'Case' },
  { key: 'cooling', label: 'CPU Cooler' },
];
