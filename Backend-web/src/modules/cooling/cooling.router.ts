import { Router } from 'express'
import { coolingService } from './cooling.service'

export const coolingRouter = Router()

coolingRouter.get('/', async (req, res) => {
  res.json(await coolingService.list())
})

coolingRouter.get('/:id', async (req, res) => {
  const item = await coolingService.getById(req.params.id)
  if (!item) {
    res.status(404).json({ message: 'Not found' })
    return
  }
  res.json(item)
})

coolingRouter.post('/', async (req, res) => {
  res.status(201).json(await coolingService.create(req.body))
})

coolingRouter.put('/:id', async (req, res) => {
  res.json(await coolingService.update(req.params.id, req.body))
})

coolingRouter.delete('/:id', async (req, res) => {
  await coolingService.remove(req.params.id)
  res.status(204).send()
})
