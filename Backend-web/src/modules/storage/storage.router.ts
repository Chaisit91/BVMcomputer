import { Router } from 'express'
import { storageService } from './storage.service'

export const storageRouter = Router()

storageRouter.get('/', async (req, res) => {
  res.json(await storageService.list())
})

storageRouter.get('/:id', async (req, res) => {
  const item = await storageService.getById(req.params.id)
  if (!item) {
    res.status(404).json({ message: 'Not found' })
    return
  }
  res.json(item)
})

storageRouter.post('/', async (req, res) => {
  res.status(201).json(await storageService.create(req.body))
})

storageRouter.put('/:id', async (req, res) => {
  res.json(await storageService.update(req.params.id, req.body))
})

storageRouter.delete('/:id', async (req, res) => {
  await storageService.remove(req.params.id)
  res.status(204).send()
})
