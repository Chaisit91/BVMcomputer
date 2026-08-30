import type { LowStockItem } from '../../types/dashboard'

export function LowStockList({ items }: { items: LowStockItem[] }) {
  if (items.length === 0) {
    return <p className="py-8 text-center text-sm text-gray-400">สินค้าคงเหลือปกติทั้งหมด</p>
  }

  return (
    <ul className="divide-y divide-gray-50">
      {items.map((item) => (
        <li key={item.id} className="flex items-center justify-between py-3">
          <div>
            <p className="text-sm font-medium text-gray-800">{item.name}</p>
            <p className="text-xs text-gray-400">เหลือ {item.remaining} ชิ้น</p>
          </div>
          <button
            type="button"
            className="rounded-lg bg-rose-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-rose-600"
          >
            สั่งซื้อ
          </button>
        </li>
      ))}
    </ul>
  )
}
