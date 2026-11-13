import { Link } from 'react-router-dom'
import type { AnnouncementBrief } from '../../types/dashboard'

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime()
  const minutes = Math.floor(diffMs / 60000)
  if (minutes < 1) return 'เมื่อสักครู่'
  if (minutes < 60) return `${minutes} นาทีที่แล้ว`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} ชั่วโมงที่แล้ว`
  const days = Math.floor(hours / 24)
  return `${days} วันที่แล้ว`
}

export function AnnouncementFeed({ announcements }: { announcements: AnnouncementBrief[] }) {
  if (announcements.length === 0) {
    return <p className="py-8 text-center text-sm text-gray-400">ยังไม่มีประกาศ</p>
  }

  return (
    <ul className="divide-y divide-gray-50">
      {announcements.map((item) => (
        <li key={item.id} className="py-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-800">{item.authorName}</p>
            <p className="text-xs text-gray-400">{timeAgo(item.createdAt)}</p>
          </div>
          <p className="mt-1 line-clamp-2 text-sm text-gray-600">{item.content}</p>
        </li>
      ))}
      <li className="pt-3 text-center">
        <Link to="/announcements" className="text-xs font-medium text-rose-500 hover:text-rose-600">
          ดูประกาศทั้งหมด
        </Link>
      </li>
    </ul>
  )
}
