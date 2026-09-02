import { Router } from 'express'
import { customBuildService } from './custom-build.service'

export const customBuildRouter = Router()

customBuildRouter.get('/', async (req, res) => {
  res.json(await customBuildService.list())
})

customBuildRouter.get('/:id', async (req, res) => {
  const item = await customBuildService.getById(req.params.id)
  if (!item) {
    res.status(404).json({ message: 'Not found' })
    return
  }
  res.json(item)
})

customBuildRouter.post('/', async (req, res) => {
  res.status(201).json(await customBuildService.create(req.body))
})

customBuildRouter.put('/:id', async (req, res) => {
  res.json(await customBuildService.update(req.params.id, req.body))
})

customBuildRouter.delete('/:id', async (req, res) => {
  await customBuildService.remove(req.params.id)
  res.status(204).send()
})
