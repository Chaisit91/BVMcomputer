import { Router } from 'express'
import { gpuService } from './gpu.service'

export const gpuRouter = Router()

gpuRouter.get('/', async (req, res) => {
  res.json(await gpuService.list())
})

gpuRouter.get('/:id', async (req, res) => {
  const item = await gpuService.getById(req.params.id)
  if (!item) {
    res.status(404).json({ message: 'Not found' })
    return
  }
  res.json(item)
})

gpuRouter.post('/', async (req, res) => {
  res.status(201).json(await gpuService.create(req.body))
})

gpuRouter.put('/:id', async (req, res) => {
  res.json(await gpuService.update(req.params.id, req.body))
})

gpuRouter.delete('/:id', async (req, res) => {
  await gpuService.remove(req.params.id)
  res.status(204).send()
})
