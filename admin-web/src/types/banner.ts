export type BannerType = 'hero' | 'promo' | 'popup'
export type BannerStatus = 'active' | 'inactive' | 'expired'

export interface Banner {
  id: string
  name: string
  type: BannerType
  targetLink: string
  startDate: string
  endDate: string
  active: boolean
  // Derived from active + endDate (see lib/bannerStatus.ts) — not a stored field.
  status: BannerStatus
  previewTone: string
  imageUrl: string
  imageWidth: number | null
  imageHeight: number | null
  imageFormat: string
}

export interface BannerSummary {
  totalCount: number
  activeCount: number
  inactiveCount: number
  expiredCount: number
}
