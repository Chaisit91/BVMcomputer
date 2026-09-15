import { Router } from 'express'
import { customerService } from './customer.service'

export const customerRouter = Router()

customerRouter.get('/', async (req, res) => {
  res.json(await customerService.list())
})

customerRouter.get('/:id', async (req, res) => {
  const item = await customerService.getById(req.params.id)
  if (!item) {
    res.status(404).json({ message: 'Not found' })
    return
  }
  res.json(item)
})

customerRouter.post('/', async (req, res) => {
  res.status(201).json(await customerService.create(req.body))
})

customerRouter.put('/:id', async (req, res) => {
  res.json(await customerService.update(req.params.id, req.body))
})

customerRouter.delete('/:id', async (req, res) => {
  await customerService.remove(req.params.id)
  res.status(204).send()
})
