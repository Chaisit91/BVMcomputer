import { Router } from 'express'
import multer from 'multer'
import type { AuthenticatedRequest } from '../../middleware/authMiddleware'
import { uploadImage } from '../../utils/uploadImage'
import { computerUpgradeService } from './computer-upgrade.service'

export const computerUpgradeRouter = Router()

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    cb(null, file.mimetype.startsWith('image/'))
  },
})

computerUpgradeRouter.get('/', async (_req, res) => {
  res.json(await computerUpgradeService.list())
})

computerUpgradeRouter.get('/:id', async (req, res) => {
  const item = await computerUpgradeService.getById(String(req.params.id))
  if (!item) {
    res.status(404).json({ message: 'Not found' })
    return
  }
  res.json(item)
})

computerUpgradeRouter.post('/', async (req, res) => {
  const created = await computerUpgradeService.create(req.body)
  res.status(201).json(created)
})

computerUpgradeRouter.put('/:id', async (req, res) => {
  res.json(await computerUpgradeService.update(String(req.params.id), req.body))
})

computerUpgradeRouter.delete('/:id', async (req, res) => {
  await computerUpgradeService.remove(String(req.params.id))
  res.status(204).send()
})

computerUpgradeRouter.post('/:id/items/:slot/photo', upload.single('photo'), async (req, res) => {
  if (!req.file) {
    res.status(400).json({ message: 'ต้องแนบไฟล์รูปภาพ (photo)' })
    return
  }

  const ext = req.file.originalname.split('.').pop() ?? 'jpg'
  const path = `computer-upgrade/${req.params.id}-${req.params.slot}-${Date.now()}.${ext}`
  const photoUrl = await uploadImage(path, req.file.buffer, req.file.mimetype)

  const updated = await computerUpgradeService.setItemPhoto(String(req.params.id), String(req.params.slot), photoUrl)
  res.json(updated)
})

computerUpgradeRouter.post('/:id/items/:slot/verify', async (req: AuthenticatedRequest, res) => {
  const updated = await computerUpgradeService.verifyItem(String(req.params.id), String(req.params.slot), req.user!.id)
  res.json(updated)
})
