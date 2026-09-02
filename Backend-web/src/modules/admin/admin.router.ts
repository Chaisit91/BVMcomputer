import { Router } from 'express'
import { adminService } from './admin.service'

export const adminRouter = Router()

export function withoutPasswordHash<T extends { passwordHash: string }>(admin: T) {
  const { passwordHash, ...rest } = admin
  return rest
}

adminRouter.get('/', async (req, res) => {
  res.json((await adminService.list()).map(withoutPasswordHash))
})

adminRouter.get('/:id', async (req, res) => {
  const item = await adminService.getById(req.params.id)
  if (!item) {
    res.status(404).json({ message: 'Not found' })
    return
  }
  res.json(withoutPasswordHash(item))
})

adminRouter.post('/', async (req, res) => {
  res.status(201).json(withoutPasswordHash(await adminService.create(req.body)))
})

adminRouter.put('/:id', async (req, res) => {
  res.json(withoutPasswordHash(await adminService.update(req.params.id, req.body)))
})

adminRouter.delete('/:id', async (req, res) => {
  await adminService.remove(req.params.id)
  res.status(204).send()
})
