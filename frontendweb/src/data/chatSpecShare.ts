import { specFields, type UpgradeSpecFieldId } from './upgradeSpecFields';
import type { SharedSpecItem } from '../types/chat';
import type { UpgradeSelection } from '../types/upgrade';

export interface SpecShareOption {
  field: UpgradeSpecFieldId;
  label: string;
  /** null = the customer left it blank; it's shown as "not specified" and never sent. */
  item: SharedSpecItem | null;
}

interface UpgradeSpecSource {
  currentSpec: UpgradeSelection;
  budget: string;
  usage: string;
  games: string;
}

const detailFields: { field: 'budget' | 'usage' | 'games'; label: string }[] = [
  { field: 'budget', label: 'งบประมาณ' },
  { field: 'usage', label: 'จุดประสงค์การใช้งาน' },
  { field: 'games', label: 'เกม / โปรแกรมที่ใช้งาน' },
];

/** Everything the "send my spec" dialog can offer, built only from what the customer actually entered. */
export function buildSpecShareOptions({ currentSpec, budget, usage, games }: UpgradeSpecSource): SpecShareOption[] {
  const parts = specFields.map(({ key, label }): SpecShareOption => {
    const product = currentSpec[key];
    return {
      field: key,
      label,
      item: product ? { field: key, label, value: product.name, productId: product.productId, sku: product.sku } : null,
    };
  });

  const values = { budget, usage, games: games.trim() };
  const details = detailFields.map(({ field, label }): SpecShareOption => ({
    field,
    label,
    item: values[field] ? { field, label, value: values[field] } : null,
  }));

  return [...parts, ...details];
}
