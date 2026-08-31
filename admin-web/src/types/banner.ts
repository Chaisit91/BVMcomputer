export type BannerType = 'hero' | 'promo' | 'popup'
export type BannerStatus = 'active' | 'inactive' | 'expired'

export interface Banner {
  id: string
  name: string
  type: BannerType
  targetLink: string
  startDate: string
  endDate: string
  status: BannerStatus
  previewTone: string
  imageFilename: string
  imageDimensions: string
  imageFormat: string
}

export interface BannerSummary {
  totalCount: number
  activeCount: number
  inactiveCount: number
  expiredCount: number
}
