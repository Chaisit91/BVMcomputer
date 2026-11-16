import { Router } from 'express'
import multer from 'multer'
import { ValidationError } from '../../lib/errors'
import { uploadImage } from '../../utils/uploadImage'
import { productImageRepository } from './product-image.repository'

export const productImageRouter = Router({ mergeParams: true })

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 10 },
  fileFilter: (_req, file, cb) => cb(null, file.mimetype.startsWith('image/')),
})

productImageRouter.get('/', async (req, res) => {
  res.json(await productImageRepository.list((req.params as any).productId))
})

productImageRouter.post('/', upload.array('files', 10), async (req, res) => {
  const productId = (req.params as any).productId as string
  const files = (req.files as Express.Multer.File[] | undefined) ?? []
  if (files.length === 0) throw new ValidationError('no image files received (JPG/PNG only, max 5MB each)')

  const created = await Promise.all(
    files.map(async (file, index) => {
      const ext = file.originalname.split('.').pop() ?? 'jpg'
      const path = `product-images/${productId}-${Date.now()}-${index}.${ext}`
      const url = await uploadImage(path, file.buffer, file.mimetype)
      return productImageRepository.add(productId, { url, fileName: file.originalname })
    }),
  )

  res.status(201).json(created)
})

productImageRouter.delete('/:imageId', async (req, res) => {
  await productImageRepository.remove((req.params as any).productId, req.params.imageId)
  res.status(204).send()
})
