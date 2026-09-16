import assert from 'node:assert/strict'
import test from 'node:test'
import { facetValues, matchesFacet } from '../src/lib/catalogFilters.ts'

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
