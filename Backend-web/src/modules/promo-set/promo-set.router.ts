import { Router } from 'express'
import { promoSetService } from './promo-set.service'

export const promoSetRouter = Router()

promoSetRouter.get('/', async (req, res) => {
  res.json(await promoSetService.list())
})

promoSetRouter.get('/:id', async (req, res) => {
  const item = await promoSetService.getById(req.params.id)
  if (!item) {
    res.status(404).json({ message: 'Not found' })
    return
  }
  res.json(item)
})

promoSetRouter.post('/', async (req, res) => {
  res.status(201).json(await promoSetService.create(req.body))
})

promoSetRouter.put('/:id', async (req, res) => {
  res.json(await promoSetService.update(req.params.id, req.body))
})

promoSetRouter.delete('/:id', async (req, res) => {
  await promoSetService.remove(req.params.id)
  res.status(204).send()
})
