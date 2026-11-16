import { api } from '../lib/api'

export interface ProductImage {
  id: string
  productId: string
  url: string
  altText: string
  sortOrder: number
  isPrimary: boolean
  createdAt: string
}

export function listProductImages(productId: string) {
  return api.get<ProductImage[]>(`/products/${productId}/images`).then((res) => res.data)
}

export function uploadProductImages(productId: string, files: File[]) {
  const form = new FormData()
  files.forEach((file) => form.append('files', file))
  return api.post<ProductImage[]>(`/products/${productId}/images`, form).then((res) => res.data)
}

export function deleteProductImage(productId: string, imageId: string) {
  return api.delete(`/products/${productId}/images/${imageId}`)
}
