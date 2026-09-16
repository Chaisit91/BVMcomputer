import { api } from '../lib/api'
import { deriveBannerStatus } from '../lib/bannerStatus'
import type { BannerFormValues } from '../schemas/banner.schema'
import type { Banner } from '../types/banner'

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

export function getBanners(): Promise<Banner[]> {
  return api.get('/banners').then((res) => res.data.map(mapBannerFromApi))
}

export function getBannerDetail(id: string): Promise<Banner | null> {
  return api
    .get(`/banners/${id}`)
    .then((res) => mapBannerFromApi(res.data))
    .catch(() => null)
}

export function saveBanner(id: string, data: BannerFormValues): Promise<void> {
  return api.put(`/banners/${id}`, data).then(() => undefined)
}

export function createBanner(data: BannerFormValues): Promise<{ id: string }> {
  return api.post('/banners', data).then((res) => ({ id: res.data.id }))
}

export function updateBannerActive(id: string, active: boolean): Promise<void> {
  return api.put(`/banners/${id}`, { active }).then(() => undefined)
}

export function deleteBanner(id: string): Promise<void> {
  return api.delete(`/banners/${id}`).then(() => undefined)
}
