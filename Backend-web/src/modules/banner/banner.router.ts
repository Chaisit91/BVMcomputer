import { Router } from 'express'
import { bannerService } from './banner.service'

export const bannerRouter = Router()

bannerRouter.get('/', async (req, res) => {
  res.json(await bannerService.list())
})

bannerRouter.get('/:id', async (req, res) => {
  const item = await bannerService.getById(req.params.id)
  if (!item) {
    res.status(404).json({ message: 'Not found' })
    return
  }
  res.json(item)
})

bannerRouter.post('/', async (req, res) => {
  res.status(201).json(await bannerService.create(req.body))
})

bannerRouter.put('/:id', async (req, res) => {
  res.json(await bannerService.update(req.params.id, req.body))
})

bannerRouter.delete('/:id', async (req, res) => {
  await bannerService.remove(req.params.id)
  res.status(204).send()
})
