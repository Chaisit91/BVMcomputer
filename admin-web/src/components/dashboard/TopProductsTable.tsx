import { Badge } from '../ui/Badge'
import type { StockStatus, TopProduct } from '../../types/dashboard'

const stockMap: Record<StockStatus, { label: string; variant: 'success' | 'warning' }> = {
  in_stock: { label: 'พร้อมขาย', variant: 'success' },
  low_stock: { label: 'ใกล้หมด', variant: 'warning' },
}

export function TopProductsTable({ products }: { products: TopProduct[] }) {
  if (products.length === 0) {
    return <p className="py-8 text-center text-sm text-gray-400">ยังไม่มีข้อมูลสินค้าขายดี</p>
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="text-xs text-gray-400">
            <th className="pb-3 font-medium">อันดับ</th>
            <th className="pb-3 font-medium">สินค้า</th>
            <th className="pb-3 font-medium">หมวดหมู่</th>
            <th className="pb-3 font-medium">จำนวนที่ขาย</th>
            <th className="pb-3 font-medium">ยอดขาย</th>
            <th className="pb-3 font-medium">สถานะสต็อก</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {products.map((product) => (
            <tr key={product.id}>
              <td className="py-3 font-medium text-gray-800">{product.rank}</td>
              <td className="py-3 text-gray-800">{product.name}</td>
              <td className="py-3 text-gray-500">{product.category}</td>
              <td className="py-3 text-gray-600">{product.sold} ชิ้น</td>
              <td className="py-3 font-medium text-gray-800">{product.revenue.toLocaleString()}</td>
              <td className="py-3">
                <Badge variant={stockMap[product.stockStatus].variant}>
                  {stockMap[product.stockStatus].label}
                </Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
