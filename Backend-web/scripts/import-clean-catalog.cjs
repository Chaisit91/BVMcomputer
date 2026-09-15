// Imports curated data as drafts. Run without --apply for a read-only preview.
const { execFileSync } = require('node:child_process')
const path = require('node:path')
const { randomUUID } = require('node:crypto')
require('dotenv').config({ path: path.join(__dirname, '../.env'), quiet: true })
const { PrismaClient } = require('../generated/prisma')
const prisma = new PrismaClient()
const mappings = {
  motherboard: { socket: 'socket', chipset: 'chipset', memoryType: 'ram_type', memorySlots: 'memory_slots', maxMemory: 'memory_max_gb', formFactor: 'form_factor', m2Slots: 'm2_slot_count' },
  gpu: { baseClock: 'base_clock', boostClock: 'boost_clock', cudaCores: 'core_count', pcieInterface: 'interface' },
  ram: { memoryType: 'ram_type', capacity: 'capacity_gb', speed: 'speed_mhz', casLatency: 'cas_latency', voltage: 'voltage' },
  storage: { capacity: 'capacity_gb', type: 'storage_type', interface: 'interface', formFactor: 'form_factor' },
  case: { mbSupport: 'supported_motherboards' },
  psu: { continuousPower: 'wattage', certification: 'efficiency_rating', formFactor: 'form_factor' },
  cooling: { socketSupport: 'cpu_sockets', radiatorSize: 'radiator_size_mm', fanSize: 'fan_size_mm' },
}
const n = value => value === '' || value == null ? 0 : Number(value)

async function main() {
  const rows = JSON.parse(execFileSync(process.env.PYTHON ?? 'python', ['-B', path.join(__dirname, '../../ai/my-scripts/export_clean_catalog.py')], { encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 }))
  const ids = rows.map(r => r.opendb_id)
  const existing = await prisma.product.findMany({ where: { OR: [{ id: { in: ids } }, { sku: { in: ids.map(id => 'OPENDB-' + id) } }] }, select: { id: true, sku: true } })
  const fresh = rows.filter(r => !existing.some(e => e.id === r.opendb_id || e.sku === 'OPENDB-' + r.opendb_id))
  const counts = Object.fromEntries(Object.keys(mappings).concat('cpu').map(c => [c, fresh.filter(r => r.category === c).length]))
  console.log(JSON.stringify({ mode: process.argv.includes('--apply') ? 'apply' : 'preview', newDrafts: fresh.length, skipped: rows.length - fresh.length, counts }))
  if (!process.argv.includes('--apply') || !fresh.length) return
  await prisma.$transaction(async tx => {
    await tx.product.createMany({ data: fresh.map(r => ({ id: r.opendb_id, sku: 'OPENDB-' + r.opendb_id, category: r.category, name: r.name, brand: r.manufacturer,
      sellingPrice: 0, costPrice: null, stock: 0, status: 'inactive', publishImmediately: false,
      description: 'Imported clean-data draft. Price, stock, warranty and missing specifications require review. Zero is an unset placeholder, not a sale price.',
    })) })
    const fields = new Map()
    const values = []
    for (const r of fresh) {
      const specs = { ...r }
      for (const key of ['opendb_id', 'category', 'name', 'manufacturer', 'image_url']) delete specs[key]
      for (const [alias, key] of Object.entries(mappings[r.category] ?? {})) specs[alias] = r[key] ?? ''
      for (const [key, value] of Object.entries(specs)) {
        const fieldKey = r.category + ':' + key
        if (!fields.has(fieldKey)) fields.set(fieldKey, { id: randomUUID(), category: r.category, key, label: key })
        values.push({ productId: r.opendb_id, fieldKey, value: String(value ?? '') })
      }
    }
    await tx.specField.createMany({ data: [...fields.values()], skipDuplicates: true })
    const storedFields = await tx.specField.findMany()
    const fieldIds = new Map(storedFields.map(f => [f.category + ':' + f.key, f.id]))
    // Batches keep parameter counts below PostgreSQL's protocol limit.
    for (let i = 0; i < values.length; i += 1000) {
      await tx.productSpecValue.createMany({ data: values.slice(i, i + 1000).map(v => ({ productId: v.productId, fieldId: fieldIds.get(v.fieldKey), value: v.value })) })
    }
    const cpus = fresh.filter(r => r.category === 'cpu')
    if (cpus.length) await tx.cpu.createMany({ data: cpus.map(r => ({ productId: r.opendb_id, socket: r.socket, series: r.microarchitecture || '', processorLine: '', processorNumber: '', cores: n(r.cores_total), threads: n(r.threads), baseFrequencyGhz: n(r.base_clock), maxTurboFrequencyGhz: n(r.boost_clock), l2CacheMb: 0, l3CacheMb: 0, graphics: '', tdpWatts: n(r.tdp), maxTdpWatts: 0, warrantyMonths: 0 })) })
    const gpus = fresh.filter(r => r.category === 'gpu')
    if (gpus.length) await tx.gpu.createMany({ data: gpus.map(r => ({ productId: r.opendb_id, series: '', model: '', chipsetModel: r.chipset || '', memorySize: r.memory_gb || '' })) })
    const rams = fresh.filter(r => r.category === 'ram')
    if (rams.length) await tx.ram.createMany({ data: rams.map(r => ({ productId: r.opendb_id, series: '' })) })
    for (const category of ['case', 'psu', 'cooling']) {
      const parts = fresh.filter(r => r.category === category)
      if (parts.length) await tx[category].createMany({ data: parts.map(r => ({ productId: r.opendb_id, displayCode: 'OPENDB-' + r.opendb_id })) })
    }
  }, { timeout: 120000 })
  console.log('Draft import committed. Existing products were preserved.')
}
main().catch(error => { console.error('Import failed; transaction rolled back. Error code:', error.code ?? error.name); process.exitCode = 1 }).finally(() => prisma.$disconnect())
