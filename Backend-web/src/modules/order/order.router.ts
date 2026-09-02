import { Router } from 'express'
import { orderService } from './order.service'

export const orderRouter = Router()

orderRouter.get('/', async (req, res) => {
  res.json(await orderService.list())
})

orderRouter.get('/:id', async (req, res) => {
  const item = await orderService.getById(req.params.id)
  if (!item) {
    res.status(404).json({ message: 'Not found' })
    return
  }
  res.json(item)
})

orderRouter.post('/', async (req, res) => {
  res.status(201).json(await orderService.create(req.body))
})

orderRouter.put('/:id', async (req, res) => {
  res.json(await orderService.update(req.params.id, req.body))
})

orderRouter.delete('/:id', async (req, res) => {
  await orderService.remove(req.params.id)
  res.status(204).send()
})
