import { ProductFileSection } from './ProductFileSection'
import {
  deleteProductImage,
  listProductImages,
  uploadProductImages,
  type ProductImage,
} from '../../services/productImage.service'

export function ProductImageUpload({
  productId,
  readOnly = false,
  stagedFiles,
  onStagedFilesChange,
}: {
  productId?: string
  readOnly?: boolean
  stagedFiles?: File[]
  onStagedFilesChange?: (files: File[]) => void
}) {
  return (
    <ProductFileSection<ProductImage>
      productId={productId}
      readOnly={readOnly}
      stagedFiles={stagedFiles}
      onStagedFilesChange={onStagedFilesChange}
      inputId="product-image-input"
      accept="image/*"
      previewAsImage
      title="รูปภาพสินค้า"
      description="รองรับ JPG, PNG ขนาดไม่เกิน 5MB ต่อไฟล์"
      emptyLabel="ยังไม่มีรูปภาพ"
      savePrompt="บันทึกสินค้าก่อน จึงเพิ่มรูปภาพได้"
      confirmDeleteLabel={() => 'ลบรูปภาพนี้?'}
      list={listProductImages}
      upload={uploadProductImages}
      remove={deleteProductImage}
      toItem={(image) => ({ id: image.id, url: image.url, label: image.altText || 'รูปสินค้า' })}
    />
  )
}
