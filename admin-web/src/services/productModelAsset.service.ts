import { api } from '../lib/api'

export interface ProductModelAsset {
  id: string
  productId: string
  url: string
  fileName: string
  contentType: string
  fileSizeBytes: number
  createdAt: string
}

export function listModelAssets(productId: string) {
  return api.get<ProductModelAsset[]>(`/products/${productId}/model-assets`).then((res) => res.data)
}

export function uploadModelAssets(productId: string, files: File[]) {
  const form = new FormData()
  files.forEach((file) => form.append('files', file))
  return api.post<ProductModelAsset[]>(`/products/${productId}/model-assets`, form).then((res) => res.data)
}

export function deleteModelAsset(productId: string, assetId: string) {
  return api.delete(`/products/${productId}/model-assets/${assetId}`)
}
