// Missing source facts are empty form fields, never invented specifications.
const keys: Record<string, string> = {
  motherboard: 'cpuSupport socket chipset mainboardSupport memorySlots memoryType maxMemory maxMemorySpeed formFactor m2Slots pcieSlots usbPorts audio lan wifi bluetooth warranty',
  gpu: 'baseClock memoryClock hdmiPort displayPort openGl cudaCores powerConnector powerRequirement memoryInterface dimension boostClock warranty pcieInterface',
  ram: 'memoryType capacity speed voltage casLatency warranty heatSpreader rgbLighting',
  storage: 'type capacity interface formFactor sequentialRead sequentialWrite cacheMemory mtbf warranty',
  case: 'mbSupport caseType sidePanel dimensions weight driveBays fanSupport radiatorSupport ioPorts warranty',
  psu: 'continuousPower certification modularity formFactor fanSize connectors protection warranty',
  cooling: 'coolingType socketSupport radiatorSize fanSize fanSpeed noiseLevel tdpRating rgb warranty',
}
export function formSpecDefaults(category: string) {
  return Object.fromEntries((keys[category] ?? '').split(' ').filter(Boolean).map(key => [key, '']))
}

export function presentSpecs(category: string, stored: Record<string, string>) {
  const specs = { ...formSpecDefaults(category), ...stored }
  if (category === 'motherboard' && !Object.prototype.hasOwnProperty.call(stored, 'pcieSlots') && /^\d+(\.0)?$/.test(stored.pcie_x16_slots ?? '')) {
    specs.pcieSlots = `${Number(stored.pcie_x16_slots)}x PCIe x16`
  }
  return specs
}

// Several existing admin forms expose only one of the two publication controls.
export function publicationFields(body: Record<string, unknown>) {
  const product = { ...body }
  if (typeof body.publishImmediately === 'boolean' && body.status === undefined) {
    product.status = body.publishImmediately ? 'active' : 'inactive'
  } else if (typeof body.status === 'string' && body.publishImmediately === undefined) {
    product.publishImmediately = body.status === 'active'
  }
  return product
}
