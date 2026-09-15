import { Router } from 'express'
import { ramService } from './ram.service'

export const ramRouter = Router()

ramRouter.get('/', async (req, res) => {
  res.json(await ramService.list())
})

ramRouter.get('/:id', async (req, res) => {
  const item = await ramService.getById(req.params.id)
  if (!item) {
    res.status(404).json({ message: 'Not found' })
    return
  }
  res.json(item)
})

ramRouter.post('/', async (req, res) => {
  res.status(201).json(await ramService.create(req.body))
})

ramRouter.put('/:id', async (req, res) => {
  res.json(await ramService.update(req.params.id, req.body))
})

ramRouter.delete('/:id', async (req, res) => {
  await ramService.remove(req.params.id)
  res.status(204).send()
})
