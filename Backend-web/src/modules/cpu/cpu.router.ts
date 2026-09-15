import { Router } from 'express'
import { cpuService } from './cpu.service'

export const cpuRouter = Router()

cpuRouter.get('/', async (req, res) => {
  res.json(await cpuService.list())
})

cpuRouter.get('/:id', async (req, res) => {
  const item = await cpuService.getById(req.params.id)
  if (!item) {
    res.status(404).json({ message: 'Not found' })
    return
  }
  res.json(item)
})

cpuRouter.post('/', async (req, res) => {
  res.status(201).json(await cpuService.create(req.body))
})

cpuRouter.put('/:id', async (req, res) => {
  res.json(await cpuService.update(req.params.id, req.body))
})

cpuRouter.delete('/:id', async (req, res) => {
  await cpuService.remove(req.params.id)
  res.status(204).send()
})
