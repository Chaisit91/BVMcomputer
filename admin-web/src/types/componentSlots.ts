// Shared by Desktop PC / Promo Set / Custom Build — each bundles a real
// product from these 8 catalog categories into one slot. `apiCategory` is the
// backend route segment (GET /api/{apiCategory}) ProductPicker fetches from.
export type ComponentSlot = 'cpu' | 'gpu' | 'motherboard' | 'ram' | 'storage' | 'psu' | 'case' | 'cooling'

export const COMPONENT_SLOTS: ComponentSlot[] = ['cpu', 'gpu', 'motherboard', 'ram', 'storage', 'psu', 'case', 'cooling']

export const COMPONENT_SLOT_LABELS: Record<ComponentSlot, string> = {
  cpu: 'CPU',
  gpu: 'GPU',
  motherboard: 'Mainboard',
  ram: 'RAM',
  storage: 'Storage',
  psu: 'PSU',
  case: 'Case',
  cooling: 'Cooling',
}

export const COMPONENT_SLOT_TO_API_CATEGORY: Record<ComponentSlot, string> = {
  cpu: 'cpus',
  gpu: 'gpus',
  motherboard: 'motherboards',
  ram: 'rams',
  storage: 'storages',
  psu: 'psus',
  case: 'cases',
  cooling: 'coolings',
}
