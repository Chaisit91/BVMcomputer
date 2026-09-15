import assert from 'node:assert/strict'
import { test } from 'node:test'
import { cpuFacetOptions, cpuFacetValue, LEGACY_CPU_SERIES, matchesCpuFacet } from '../src/lib/cpuFilters.ts'

const cpus = [
  { name: 'AMD Ryzen 9 9950X3D2', brand: 'AMD', series: 'Zen 5', processorLine: '', socket: 'AM5' },
  { name: 'AMD Ryzen 7 7700X3D', brand: 'AMD', series: 'Zen 4', processorLine: '', socket: 'AM5' },
  { name: 'Intel Core Ultra 5 250K Plus', brand: 'Intel', series: 'Arrow Lake Refresh', processorLine: '', socket: 'LGA1851' },
  { name: 'Intel Core Ultra 9 285', brand: 'Intel', series: 'Arrow Lake', processorLine: '', socket: 'LGA 1851' },
]
test('series uses the original product-generation labels', () => {
  assert.deepEqual([...LEGACY_CPU_SERIES], ['12th Gen', '14th Gen', 'CORE ULTRA', '5000 Series', '7000 Series', '7000 WX-Series', '8000 Series', '9000 Series'])
  assert.deepEqual(cpus.map(cpu => cpuFacetValue(cpu, 'series')), ['9000 Series', '7000 Series', 'CORE ULTRA', 'CORE ULTRA'])
  assert.ok(cpuFacetOptions(cpus, 'processorLine').includes('Core Ultra 9'))
  assert.deepEqual(cpuFacetOptions(cpus, 'socket'), ['AM5', 'LGA 1851'])
})
test('multiple values within one filter match either; different filters intersect', () => {
  const filtered = cpus.filter(cpu => matchesCpuFacet(cpu, 'brand', new Set(['AMD', 'Intel']))
    && matchesCpuFacet(cpu, 'series', new Set(['9000 Series', '7000 Series']))
    && matchesCpuFacet(cpu, 'processorLine', new Set(['Ryzen 9'])))
  assert.deepEqual(filtered, [cpus[0]])
  assert.equal(cpus.filter(cpu => matchesCpuFacet(cpu, 'brand', new Set())).length, 4)
})
test('whitespace/case differences match and unsupported names stay unspecified', () => {
  assert.equal(matchesCpuFacet(cpus[0], 'series', new Set([' 9000   series '])), true)
  assert.equal(cpuFacetValue({ name: 'Unrecognized CPU', processorLine: '' }, 'processorLine'), 'ไม่ระบุ')
  assert.equal(cpuFacetValue({ name: 'Unrecognized CPU', series: 'Zen 5' }, 'series'), 'ไม่ระบุ')
  assert.equal(cpuFacetValue({ name: 'Intel Core i5-14500', series: 'Raptor Lake Refresh' }, 'series'), '14th Gen')
  assert.equal(cpuFacetValue({ name: 'AMD Ryzen Threadripper PRO 7975WX', series: 'Zen 4' }, 'series'), '7000 WX-Series')
  assert.equal(cpuFacetValue({ name: cpus[0].name, processorLine: 'Custom family' }, 'processorLine'), 'Custom family')
})
