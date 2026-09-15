import { Router } from 'express'
import multer from 'multer'
import { uploadImage } from '../../utils/uploadImage'
import { customBuildService } from './custom-build.service'

export const customBuildRouter = Router()

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    cb(null, file.mimetype.startsWith('image/'))
  },
})

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

customBuildRouter.post('/:id/ai-preview-image', upload.single('image'), async (req, res) => {
  if (!req.file) {
    res.status(400).json({ message: 'ต้องแนบไฟล์รูปภาพ (image)' })
    return
  }

  const ext = req.file.originalname.split('.').pop() ?? 'jpg'
  const path = `custom-build-ai-preview/${req.params.id}-${Date.now()}.${ext}`
  const imageUrl = await uploadImage(path, req.file.buffer, req.file.mimetype)

  res.json(await customBuildService.setAiPreviewImage(String(req.params.id), imageUrl))
})
