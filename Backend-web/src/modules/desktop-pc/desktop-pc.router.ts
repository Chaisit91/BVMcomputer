import { Router } from 'express'
import { desktopPcService } from './desktop-pc.service'

export const desktopPcRouter = Router()

desktopPcRouter.get('/', async (req, res) => {
  res.json(await desktopPcService.list())
})

desktopPcRouter.get('/:id', async (req, res) => {
  const item = await desktopPcService.getById(req.params.id)
  if (!item) {
    res.status(404).json({ message: 'Not found' })
    return
  }
  res.json(item)
})

desktopPcRouter.post('/', async (req, res) => {
  res.status(201).json(await desktopPcService.create(req.body))
})

desktopPcRouter.put('/:id', async (req, res) => {
  res.json(await desktopPcService.update(req.params.id, req.body))
})

desktopPcRouter.delete('/:id', async (req, res) => {
  await desktopPcService.remove(req.params.id)
  res.status(204).send()
})
