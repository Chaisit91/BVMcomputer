import { Router } from 'express'
import { motherboardService } from './motherboard.service'

export const motherboardRouter = Router()

motherboardRouter.get('/', async (req, res) => {
  res.json(await motherboardService.list())
})

motherboardRouter.get('/:id', async (req, res) => {
  const item = await motherboardService.getById(req.params.id)
  if (!item) {
    res.status(404).json({ message: 'Not found' })
    return
  }
  res.json(item)
})

motherboardRouter.post('/', async (req, res) => {
  res.status(201).json(await motherboardService.create(req.body))
})

motherboardRouter.put('/:id', async (req, res) => {
  res.json(await motherboardService.update(req.params.id, req.body))
})

motherboardRouter.delete('/:id', async (req, res) => {
  await motherboardService.remove(req.params.id)
  res.status(204).send()
})
