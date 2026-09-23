require('ts-node/register')
const assert = require('node:assert/strict')
const { test } = require('node:test')
const express = require('express')
const { prisma } = require('../src/lib/prisma')
const { catalogRouter, catalogPublicationFilter } = require('../src/modules/ai/catalog.router')
const { publicationFields, presentSpecs } = require('../src/lib/catalogPresentation')

test('private catalog authorization and field whitelist', async () => {
  const originalToken = process.env.AI_CATALOG_TOKEN
  const originalFind = prisma.product.findMany
  let calls = 0
  prisma.product.findMany = async query => {
    calls++
    assert.equal(query.where.status, 'active')
    assert.equal(query.where.publishImmediately, true)
    assert.equal(query.select.costPrice, undefined)
    assert.equal(query.select.stock, undefined)
    return [{ id: 'product-id', name: 'Board', category: 'motherboard', specValues: [
      { value: 'AM5', field: { key: 'socket', category: 'motherboard' } },
      { value: 'ignore', field: { key: 'other', category: 'gpu' } },
    ], images: [] }]
  }
  const app = express()
  app.use('/api/internal/ai', catalogRouter)
  const server = app.listen(0, '127.0.0.1')
  await new Promise(resolve => server.once('listening', resolve))
  const url = `http://127.0.0.1:${server.address().port}/api/internal/ai/catalog`
  try {
    delete process.env.AI_CATALOG_TOKEN
    assert.equal((await fetch(url)).status, 503)
    process.env.AI_CATALOG_TOKEN = 'x'.repeat(32)
    assert.equal((await fetch(url)).status, 401)
    assert.equal(calls, 0)
    const response = await fetch(url, { headers: { Authorization: `Bearer ${process.env.AI_CATALOG_TOKEN}` } })
    assert.equal(response.status, 200)
    assert.deepEqual((await response.json()).items[0].specs, { socket: 'AM5' })
    assert.equal(calls, 1)
  } finally {
    prisma.product.findMany = originalFind
    if (originalToken === undefined) delete process.env.AI_CATALOG_TOKEN
    else process.env.AI_CATALOG_TOKEN = originalToken
    await new Promise(resolve => server.close(resolve))
    await prisma.$disconnect()
  }
})

test('existing admin publication controls activate imported drafts', () => {
  assert.deepEqual(publicationFields({ status: 'active' }), { status: 'active', publishImmediately: true })
  assert.deepEqual(publicationFields({ publishImmediately: true }), { status: 'active', publishImmediately: true })
  assert.deepEqual(publicationFields({ status: 'active', publishImmediately: false }), { status: 'active', publishImmediately: false })
  assert.deepEqual(publicationFields({ name: 'Edit only' }), { name: 'Edit only' })
})

test('draft catalog is opt-in and remains disabled by default', () => {
  const original = process.env.AI_INCLUDE_DRAFT_CATALOG
  try {
    delete process.env.AI_INCLUDE_DRAFT_CATALOG
    assert.deepEqual(catalogPublicationFilter(), { status: 'active', publishImmediately: true })
    process.env.AI_INCLUDE_DRAFT_CATALOG = 'true'
    assert.deepEqual(catalogPublicationFilter(), {})
  } finally {
    if (original === undefined) delete process.env.AI_INCLUDE_DRAFT_CATALOG
    else process.env.AI_INCLUDE_DRAFT_CATALOG = original
  }
})

test('editing an imported board retains its known PCIe slot count', () => {
  assert.equal(presentSpecs('motherboard', { pcie_x16_slots: '2.0' }).pcieSlots, '2x PCIe x16')
  assert.equal(presentSpecs('motherboard', { pcie_x16_slots: '2', pcieSlots: '' }).pcieSlots, '')
  assert.equal(presentSpecs('motherboard', {}).pcieSlots, '')
})
