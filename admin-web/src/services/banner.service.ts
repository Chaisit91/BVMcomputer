import { api } from '../lib/api'
import { deriveBannerStatus } from '../lib/bannerStatus'
import { USE_MOCK_DATA } from '../lib/mockMode'
import type { BannerFormValues } from '../schemas/banner.schema'
import type { Banner } from '../types/banner'

function mockDelay<T>(value: T, ms = 400): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

// startDate/endDate come back as full ISO DateTimes; the form works with bare
// yyyy-mm-dd (native <input type="date"> value), so truncate on the way in.
function mapBannerFromApi(raw: any): Banner {
  return {
    id: raw.id,
    name: raw.name,
    type: raw.type,
    targetLink: raw.targetLink,
    startDate: raw.startDate ? raw.startDate.split('T')[0] : '',
    endDate: raw.endDate ? raw.endDate.split('T')[0] : '',
    active: raw.active,
    status: deriveBannerStatus(raw.active, raw.endDate),
    previewTone: raw.previewTone,
    imageUrl: raw.imageUrl,
    imageWidth: raw.imageWidth,
    imageHeight: raw.imageHeight,
    imageFormat: raw.imageFormat,
  }
}

const rawMockBanners = [
  { id: 'mock-banner-1', name: 'โปรโมชั่นเดือนกันยา', type: 'hero', targetLink: '/promo/september', startDate: '2026-09-01T00:00:00.000Z', endDate: '2026-09-30T00:00:00.000Z', active: true, previewTone: '#e11d48', imageUrl: '', imageWidth: 1920, imageHeight: 600, imageFormat: 'jpg' },
  { id: 'mock-banner-2', name: 'ลดราคาการ์ดจอ RTX 40 Series', type: 'promo', targetLink: '/category/gpu', startDate: '2026-09-05T00:00:00.000Z', endDate: '2026-09-20T00:00:00.000Z', active: true, previewTone: '#2563eb', imageUrl: '', imageWidth: 1200, imageHeight: 400, imageFormat: 'png' },
  { id: 'mock-banner-3', name: 'ป็อปอัปสมัครสมาชิกใหม่', type: 'popup', targetLink: '/register', startDate: '2026-08-01T00:00:00.000Z', endDate: '2026-12-31T00:00:00.000Z', active: true, previewTone: '#059669', imageUrl: '', imageWidth: 600, imageHeight: 800, imageFormat: 'png' },
  { id: 'mock-banner-4', name: 'แบนเนอร์คอมพิวเตอร์ตั้งโต๊ะซัมเมอร์', type: 'hero', targetLink: '/category/desktop-pc', startDate: '2026-06-01T00:00:00.000Z', endDate: '2026-08-31T00:00:00.000Z', active: false, previewTone: '#b45309', imageUrl: '', imageWidth: 1920, imageHeight: 600, imageFormat: 'jpg' },
  { id: 'mock-banner-5', name: 'โปรจัดสเปคคอมมิ่งซอย', type: 'promo', targetLink: '/custom-build', startDate: '2026-09-10T00:00:00.000Z', endDate: '2026-09-25T00:00:00.000Z', active: true, previewTone: '#7c3aed', imageUrl: '', imageWidth: 1200, imageHeight: 400, imageFormat: 'jpg' },
]

const MOCK_BANNERS: Banner[] = rawMockBanners.map(mapBannerFromApi)

export function getBanners(): Promise<Banner[]> {
  if (USE_MOCK_DATA) return mockDelay(MOCK_BANNERS)
  return api.get('/banners').then((res) => res.data.map(mapBannerFromApi))
}

export function getBannerDetail(id: string): Promise<Banner | null> {
  if (USE_MOCK_DATA) return mockDelay(MOCK_BANNERS.find((item) => item.id === id) ?? null)
  return api
    .get(`/banners/${id}`)
    .then((res) => mapBannerFromApi(res.data))
    .catch(() => null)
}

export function saveBanner(id: string, data: BannerFormValues): Promise<void> {
  if (USE_MOCK_DATA) return mockDelay(undefined)
  return api.put(`/banners/${id}`, data).then(() => undefined)
}

export function createBanner(data: BannerFormValues): Promise<{ id: string }> {
  if (USE_MOCK_DATA) return mockDelay({ id: `mock-banner-${Date.now()}` })
  return api.post('/banners', data).then((res) => ({ id: res.data.id }))
}

export function updateBannerActive(id: string, active: boolean): Promise<void> {
  if (USE_MOCK_DATA) return mockDelay(undefined)
  return api.put(`/banners/${id}`, { active }).then(() => undefined)
}

export function deleteBanner(id: string): Promise<void> {
  if (USE_MOCK_DATA) return mockDelay(undefined)
  return api.delete(`/banners/${id}`).then(() => undefined)
}
