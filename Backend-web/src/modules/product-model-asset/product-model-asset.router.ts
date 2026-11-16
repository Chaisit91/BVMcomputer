import { Router } from 'express'
import multer from 'multer'
import { uploadImage } from '../../utils/uploadImage'
import { productModelAssetRepository } from './product-model-asset.repository'

export const productModelAssetRouter = Router({ mergeParams: true })

// No mimetype filter — the AI pipeline may want a 3D mesh format (.glb/.obj/.fbx)
// rather than a flat image, so this stays generic like announcement attachments.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024, files: 10 },
})

productModelAssetRouter.get('/', async (req, res) => {
  res.json(await productModelAssetRepository.list((req.params as any).productId))
})

productModelAssetRouter.post('/', upload.array('files', 10), async (req, res) => {
  const productId = (req.params as any).productId as string
  const files = (req.files as Express.Multer.File[] | undefined) ?? []

  const created = await Promise.all(
    files.map(async (file, index) => {
      const ext = file.originalname.split('.').pop() ?? 'bin'
      const path = `product-model-assets/${productId}-${Date.now()}-${index}.${ext}`
      const url = await uploadImage(path, file.buffer, file.mimetype)
      return productModelAssetRepository.add(productId, {
        url,
        fileName: file.originalname,
        contentType: file.mimetype,
        fileSizeBytes: file.size,
      })
    }),
  )

  res.status(201).json(created)
})

productModelAssetRouter.delete('/:assetId', async (req, res) => {
  await productModelAssetRepository.remove((req.params as any).productId, req.params.assetId)
  res.status(204).send()
})
