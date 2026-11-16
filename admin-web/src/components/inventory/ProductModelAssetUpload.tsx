import { ProductFileSection } from './ProductFileSection'
import {
  deleteModelAsset,
  listModelAssets,
  uploadModelAssets,
  type ProductModelAsset,
} from '../../services/productModelAsset.service'

// Admin-only: not shown on the storefront. Fed to the AI service later to
// assemble a full-PC 3D render, so this accepts any file (mesh formats like
// .glb/.obj/.fbx), not just images.
export function ProductModelAssetUpload({
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
    <ProductFileSection<ProductModelAsset>
      productId={productId}
      readOnly={readOnly}
      stagedFiles={stagedFiles}
      onStagedFilesChange={onStagedFilesChange}
      inputId="product-model-asset-input"
      title="ไฟล์โมเดลปั้น (สำหรับ AI ประกอบภาพ 3D)"
      description="ใช้ภายในทีมเท่านั้น ไม่แสดงบนหน้าเว็บที่ลูกค้าเห็น — รองรับไฟล์โมเดล 3D (.glb, .obj, .fbx) หรือรูปภาพ"
      emptyLabel="ยังไม่มีไฟล์โมเดลปั้น"
      savePrompt="บันทึกสินค้าก่อน จึงเพิ่มไฟล์โมเดลปั้นได้"
      confirmDeleteLabel={(label) => `ลบไฟล์โมเดล "${label}" นี้?`}
      list={listModelAssets}
      upload={uploadModelAssets}
      remove={deleteModelAsset}
      toItem={(asset) => ({ id: asset.id, url: asset.url, label: asset.fileName })}
    />
  )
}
