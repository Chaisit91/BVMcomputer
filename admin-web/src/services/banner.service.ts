import type { BannerFormValues } from '../schemas/banner.schema'
import type { Banner, BannerSummary } from '../types/banner'

// ponytail: mock data stands in for the real endpoints until the backend ships;
// swap the body for an `api.get(...)` call later, callers don't change.
function mockDelay<T>(value: T, ms = 400): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

// ponytail: startDate/endDate are stored ISO (yyyy-mm-dd) to match <input type="date">'s
// native value format directly — no parsing layer needed between form and storage.
const banners: Banner[] = [
  { id: '1', name: 'โปรโมชั่น Summer Sale 2024', type: 'hero', targetLink: '/promotion/summer', startDate: '2023-11-01', endDate: '2023-12-31', status: 'active', previewTone: 'bg-rose-100', imageFilename: 'summer-sale-2024.jpg', imageDimensions: '1920 x 600 px', imageFormat: 'JPG' },
  { id: '2', name: 'แบนเนอร์ GPU RTX 4090', type: 'hero', targetLink: '/product/gpu-rtx4090', startDate: '2023-10-15', endDate: '2023-11-30', status: 'active', previewTone: 'bg-blue-100', imageFilename: 'gpu-rtx4090-banner.jpg', imageDimensions: '1920 x 600 px', imageFormat: 'JPG' },
  { id: '3', name: 'Flash Sale คีย์บอร์ด', type: 'promo', targetLink: '/flash-sale/keyboard', startDate: '2023-10-20', endDate: '2023-10-25', status: 'inactive', previewTone: 'bg-amber-100', imageFilename: 'flash-sale-keyboard.jpg', imageDimensions: '1200 x 400 px', imageFormat: 'JPG' },
  { id: '4', name: 'ส่วนลด RAM DDR5', type: 'promo', targetLink: '/promotion/ram', startDate: '2023-11-01', endDate: '2023-11-15', status: 'active', previewTone: 'bg-emerald-100', imageFilename: 'ram-ddr5-promo.jpg', imageDimensions: '1200 x 400 px', imageFormat: 'JPG' },
  { id: '5', name: 'Popup สมัครสมาชิก', type: 'popup', targetLink: '/register', startDate: '2023-10-01', endDate: '', status: 'active', previewTone: 'bg-purple-100', imageFilename: 'register-popup.png', imageDimensions: '600 x 700 px', imageFormat: 'PNG' },
  { id: '6', name: 'แบนเนอร์เปิดตัวโน้ตบุ๊กเกมมิ่ง', type: 'hero', targetLink: '/product/gaming-notebook', startDate: '2023-09-05', endDate: '2023-09-20', status: 'expired', previewTone: 'bg-indigo-100', imageFilename: 'gaming-notebook-launch.jpg', imageDimensions: '1920 x 600 px', imageFormat: 'JPG' },
  { id: '7', name: 'Popup แจ้งเตือนจัดส่งฟรี', type: 'popup', targetLink: '/shipping-promo', startDate: '2023-09-10', endDate: '2023-10-10', status: 'inactive', previewTone: 'bg-teal-100', imageFilename: 'free-shipping-popup.png', imageDimensions: '600 x 700 px', imageFormat: 'PNG' },
  { id: '8', name: 'Banner ลดราคาเมาส์-คีย์บอร์ด', type: 'promo', targetLink: '/promotion/peripherals', startDate: '2023-12-01', endDate: '2023-12-31', status: 'active', previewTone: 'bg-rose-200', imageFilename: 'peripherals-promo.jpg', imageDimensions: '1200 x 400 px', imageFormat: 'JPG' },
]

export function getBannerSummary(): Promise<BannerSummary> {
  return mockDelay({
    totalCount: banners.length,
    activeCount: banners.filter((b) => b.status === 'active').length,
    inactiveCount: banners.filter((b) => b.status === 'inactive').length,
    expiredCount: banners.filter((b) => b.status === 'expired').length,
  })
}

export function getBanners(): Promise<Banner[]> {
  return mockDelay(banners)
}

export function getBannerDetail(id: string): Promise<Banner | null> {
  return mockDelay(banners.find((item) => item.id === id) ?? null)
}

export function saveBanner(_id: string, _data: BannerFormValues): Promise<void> {
  return mockDelay(undefined)
}

export function createBanner(_data: BannerFormValues): Promise<{ id: string }> {
  return mockDelay({ id: String(banners.length + 1) })
}

export function updateBannerActive(_id: string, _active: boolean): Promise<void> {
  return mockDelay(undefined)
}

export function deleteBanner(_id: string): Promise<void> {
  return mockDelay(undefined)
}
