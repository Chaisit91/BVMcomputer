import { Router } from 'express'
import { psuService } from './psu.service'

export const psuRouter = Router()

psuRouter.get('/', async (req, res) => {
  res.json(await psuService.list())
})

psuRouter.get('/:id', async (req, res) => {
  const item = await psuService.getById(req.params.id)
  if (!item) {
    res.status(404).json({ message: 'Not found' })
    return
  }
  res.json(item)
})

psuRouter.post('/', async (req, res) => {
  res.status(201).json(await psuService.create(req.body))
})

psuRouter.put('/:id', async (req, res) => {
  res.json(await psuService.update(req.params.id, req.body))
})

psuRouter.delete('/:id', async (req, res) => {
  await psuService.remove(req.params.id)
  res.status(204).send()
})
