function text(...values: Array<string | null | undefined>) {
  return values.filter(Boolean).join(' ').toUpperCase()
}

export function gpuFamily(...values: string[]): string {
  const value = text(...values)
  if (/\bRTX\b/.test(value)) return 'NVIDIA RTX'
  if (/\bGTX\b/.test(value)) return 'NVIDIA GTX'
  if (/\bRADEON\b|\bRX\s*\d/.test(value)) return 'AMD Radeon RX'
  if (/\bARC\b/.test(value)) return 'Intel Arc'
  return 'อื่น ๆ'
}

export function gpuGeneration(...values: string[]): string {
  const value = text(...values)
  const nvidia = value.match(/\b(?:RTX|GTX)\s*(\d{2})\d{2}\b/)
  if (nvidia) return `${nvidia[1]} Series`
  const radeon = value.match(/\bRX\s*(\d)\d{3}\b/)
  if (radeon) return `RX ${radeon[1]}000 Series`
  const arc = value.match(/\bARC\s*([AB])\d{3}\b/)
  if (arc) return `Arc ${arc[1]} Series`
  return 'รุ่นอื่น ๆ'
}

export function storageFamily(value: string): string {
  const normalized = text(value)
  if (normalized.includes('NVME') || normalized.includes('M.2')) return 'NVMe SSD'
  if (normalized.includes('SSD')) return 'SATA SSD'
  if (normalized.includes('HDD')) return 'HDD'
  return 'อื่น ๆ'
}

export function motherboardPlatform(cpuSupport: string, socket: string): string {
  const normalized = text(cpuSupport, socket)
  if (normalized.includes('AMD') || /\bAM[45]\b/.test(normalized)) return 'AMD'
  if (normalized.includes('INTEL') || normalized.includes('LGA')) return 'Intel'
  return 'อื่น ๆ'
}

export function coolingFamily(value: string): string {
  const normalized = text(value)
  if (normalized.includes('AIO') || normalized.includes('LIQUID') || normalized.includes('WATER')) return 'Liquid / AIO'
  if (normalized.includes('AIR')) return 'Air Cooler'
  return 'อื่น ๆ'
}

export function caseSizeFamily(value: string): string {
  const normalized = text(value)
  if (normalized.includes('FULL')) return 'Full Tower'
  if (normalized.includes('MID')) return 'Mid Tower'
  if (normalized.includes('MINI') || normalized.includes('SMALL')) return 'Mini / Small Form Factor'
  if (normalized.includes('OPEN')) return 'Open Frame'
  return 'อื่น ๆ'
}

export function psuPowerGroup(value: string): string {
  const watts = Number(value.match(/\d+/)?.[0] ?? 0)
  if (watts >= 1000) return '1000W ขึ้นไป'
  if (watts >= 800) return '800–999W'
  if (watts >= 600) return '600–799W'
  if (watts > 0) return 'ต่ำกว่า 600W'
  return 'ไม่ระบุกำลังไฟ'
}

export function capacityGroup(value: string): string {
  const normalized = value.trim().toUpperCase().replace(/\s+/g, '')
  const amount = normalized.match(/\d+(?:\.\d+)?/)?.[0]
  if (!amount) return 'ไม่ระบุความจุ'
  return `${amount}${normalized.includes('TB') ? 'TB' : 'GB'}`
}
