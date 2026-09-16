import assert from 'node:assert/strict'
import test from 'node:test'
import { facetValues, matchesFacet } from '../src/lib/catalogFilters.ts'
import {
  capacityGroup,
  caseSizeFamily,
  coolingFamily,
  gpuFamily,
  gpuGeneration,
  motherboardPlatform,
  psuPowerGroup,
  storageFamily,
} from '../src/lib/catalogGroups.ts'

test('facet options come from real data, trim blanks, deduplicate and sort naturally', () => {
  const rows = [
    { brand: ' AMD ' },
    { brand: 'Intel' },
    { brand: 'AMD' },
    { brand: '' },
    { brand: 'Brand 10' },
    { brand: 'Brand 2' },
  ]

  assert.deepEqual(facetValues(rows, (row) => row.brand), ['AMD', 'Brand 2', 'Brand 10', 'Intel'])
})

test('a facet is optional when empty and restrictive when values are selected', () => {
  assert.equal(matchesFacet('AM5', new Set()), true)
  assert.equal(matchesFacet('AM5', new Set(['AM5', 'AM4'])), true)
  assert.equal(matchesFacet('LGA 1700', new Set(['AM5', 'AM4'])), false)
})

test('raw product specs are grouped into shopper-friendly filters', () => {
  assert.equal(gpuFamily('GeForce RTX 5070 Ti'), 'NVIDIA RTX')
  assert.equal(gpuGeneration('GeForce RTX 5070 Ti'), '50 Series')
  assert.equal(gpuFamily('Radeon RX 7900 XTX'), 'AMD Radeon RX')
  assert.equal(gpuGeneration('Radeon RX 7900 XTX'), 'RX 7000 Series')
  assert.equal(motherboardPlatform('Ryzen 9000 Series', 'AM5'), 'AMD')
  assert.equal(storageFamily('SSD M.2 PCIe NVMe'), 'NVMe SSD')
  assert.equal(coolingFamily('AIO Liquid 360mm'), 'Liquid / AIO')
  assert.equal(caseSizeFamily('Mini Tower'), 'Mini / Small Form Factor')
  assert.equal(psuPowerGroup('850 Watt'), '800–999W')
  assert.equal(capacityGroup('16 GB (8GBx2)'), '16GB')
})
