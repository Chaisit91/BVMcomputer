import { Router } from 'express'
import { caseService } from './case.service'

export const caseRouter = Router()

caseRouter.get('/', async (req, res) => {
  res.json(await caseService.list())
})

caseRouter.get('/:id', async (req, res) => {
  const item = await caseService.getById(req.params.id)
  if (!item) {
    res.status(404).json({ message: 'Not found' })
    return
  }
  res.json(item)
})

caseRouter.post('/', async (req, res) => {
  res.status(201).json(await caseService.create(req.body))
})

caseRouter.put('/:id', async (req, res) => {
  res.json(await caseService.update(req.params.id, req.body))
})

caseRouter.delete('/:id', async (req, res) => {
  await caseService.remove(req.params.id)
  res.status(204).send()
})
