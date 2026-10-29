import { test, expect } from '@playwright/test'
import { sessionCookieHeader } from '../support/jwt'
import { createFixtureAdmin, deleteFixtureAdmin } from '../support/fixtures'

// Covers the 8 part categories backed by `lib/categoryRepository.ts` (cpu is
// the one bespoke repository, with its own extra required columns) — every
// one is mounted under the same `inventory` role gate in index.ts, so a
// single parameterized create/read/update/delete + RBAC check per category
// is representative instead of redundant. The 4 bundle categories
// (desktop-pcs, promo-sets, custom-builds, computer-upgrades) assemble
// existing products into slots rather than taking flat fields, so they get
// a lighter RBAC-only smoke test in the second describe block below.

interface CategoryCase {
  path: string
  skuPrefix: string
  extraFields: Record<string, unknown>
  updateField: string
  updateValue: unknown
}

const categories: CategoryCase[] = [
  { path: 'motherboards', skuPrefix: 'MB', extraFields: {}, updateField: 'name', updateValue: 'Updated Motherboard' },
  { path: 'storages', skuPrefix: 'STG', extraFields: {}, updateField: 'name', updateValue: 'Updated Storage' },
  {
    path: 'rams',
    skuPrefix: 'RAM',
    extraFields: { series: 'Fury Beast' },
    updateField: 'series',
    updateValue: 'Trident Z',
  },
  {
    path: 'gpus',
    skuPrefix: 'GPU',
    extraFields: { series: 'RTX 40', model: 'RTX 4070', chipsetModel: 'AD104', memorySize: '12GB' },
    updateField: 'model',
    updateValue: 'RTX 4070 Super',
  },
  {
    path: 'psus',
    skuPrefix: 'PSU',
    extraFields: { displayCode: `PSU-FIX-${Date.now()}` },
    updateField: 'name',
    updateValue: 'Updated PSU',
  },
  {
    path: 'coolings',
    skuPrefix: 'COOL',
    extraFields: { displayCode: `COOL-FIX-${Date.now()}` },
    updateField: 'name',
    updateValue: 'Updated Cooler',
  },
  {
    path: 'cases',
    skuPrefix: 'CASE',
    extraFields: { displayCode: `CASE-FIX-${Date.now()}` },
    updateField: 'name',
    updateValue: 'Updated Case',
  },
  {
    path: 'cpus',
    skuPrefix: 'CPU',
    extraFields: {
      series: '9000 Series',
      processorLine: 'Ryzen 9',
      socket: 'AM5',
      processorNumber: '9950X3D-FIX',
      cores: 16,
      threads: 32,
      baseFrequencyGhz: 4.3,
      maxTurboFrequencyGhz: 5.7,
      l2CacheMb: 16,
      l3CacheMb: 64,
      graphics: 'Radeon',
      tdpWatts: 120,
      maxTdpWatts: 162,
      warrantyMonths: 36,
    },
    updateField: 'cores',
    updateValue: 24,
  },
]

test.describe('Inventory categories — CRUD + RBAC (parameterized)', () => {
  for (const category of categories) {
    test(`${category.path}: inventory_manager can create, read, update, and delete`, async ({ request }) => {
      const manager = await createFixtureAdmin('inventory_manager')
      let createdId: string | undefined
      try {
        const sku = `${category.skuPrefix}-FIX-${Date.now()}`
        const createRes = await request.post(`/api/${category.path}`, {
          headers: { Cookie: sessionCookieHeader(manager.id, manager.role) },
          data: { sku, name: `Fixture ${category.path}`, sellingPrice: 1000, ...category.extraFields },
        })
        expect(createRes.status()).toBe(201)
        const created = await createRes.json()
        createdId = created.id
        expect(created.sku).toBe(sku)

        const getRes = await request.get(`/api/${category.path}/${createdId}`, {
          headers: { Cookie: sessionCookieHeader(manager.id, manager.role) },
        })
        expect(getRes.status()).toBe(200)

        const updateRes = await request.put(`/api/${category.path}/${createdId}`, {
          headers: { Cookie: sessionCookieHeader(manager.id, manager.role) },
          data: { [category.updateField]: category.updateValue },
        })
        expect(updateRes.status()).toBe(200)
        expect((await updateRes.json())[category.updateField]).toBe(category.updateValue)

        const deleteRes = await request.delete(`/api/${category.path}/${createdId}`, {
          headers: { Cookie: sessionCookieHeader(manager.id, manager.role) },
        })
        expect(deleteRes.status()).toBe(204)
        createdId = undefined

        const afterDeleteRes = await request.get(`/api/${category.path}/${created.id}`, {
          headers: { Cookie: sessionCookieHeader(manager.id, manager.role) },
        })
        expect(afterDeleteRes.status()).toBe(404)
      } finally {
        if (createdId) await request.delete(`/api/${category.path}/${createdId}`, { headers: { Cookie: sessionCookieHeader(manager.id, manager.role) } })
        await deleteFixtureAdmin(manager.id)
      }
    })

    test(`${category.path}: a non-inventory role is forbidden from both reading and writing`, async ({ request }) => {
      const staff = await createFixtureAdmin('sales_staff')
      try {
        const listRes = await request.get(`/api/${category.path}`, {
          headers: { Cookie: sessionCookieHeader(staff.id, staff.role) },
        })
        expect(listRes.status()).toBe(403)

        const createRes = await request.post(`/api/${category.path}`, {
          headers: { Cookie: sessionCookieHeader(staff.id, staff.role) },
          data: { sku: `BLOCKED-${Date.now()}`, name: 'Should not be created', sellingPrice: 1 },
        })
        expect(createRes.status()).toBe(403)
      } finally {
        await deleteFixtureAdmin(staff.id)
      }
    })
  }
})

test.describe('Bundle categories — RBAC smoke (desktop PCs, promo sets, custom builds, computer upgrades)', () => {
  const bundlePaths = ['desktop-pcs', 'promo-sets', 'custom-builds', 'computer-upgrades']

  for (const path of bundlePaths) {
    test(`${path}: inventory_manager can list, other roles are forbidden`, async ({ request }) => {
      const manager = await createFixtureAdmin('inventory_manager')
      const staff = await createFixtureAdmin('content_moderator')
      try {
        const okRes = await request.get(`/api/${path}`, {
          headers: { Cookie: sessionCookieHeader(manager.id, manager.role) },
        })
        expect(okRes.status()).toBe(200)
        expect(Array.isArray(await okRes.json())).toBe(true)

        const blockedRes = await request.get(`/api/${path}`, {
          headers: { Cookie: sessionCookieHeader(staff.id, staff.role) },
        })
        expect(blockedRes.status()).toBe(403)
      } finally {
        await deleteFixtureAdmin(manager.id)
        await deleteFixtureAdmin(staff.id)
      }
    })
  }
})
