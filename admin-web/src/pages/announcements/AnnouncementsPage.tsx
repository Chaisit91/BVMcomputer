import { useEffect, useState } from 'react'
import { FiSend } from 'react-icons/fi'
import { HiMegaphone } from 'react-icons/hi2'
import { formatDateTime } from '../../lib/formatDate'
import { getAnnouncements, markAnnouncementsSeen, postAnnouncement } from '../../services/announcement.service'
import { useAppSelector } from '../../store/hooks'
import { adminRoleMeta } from '../../types/admin'
import type { Announcement } from '../../types/announcement'

type LoadStatus = 'loading' | 'error' | 'success'

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export function AnnouncementsPage() {
  const currentUser = useAppSelector((state) => state.auth.user)
  const [status, setStatus] = useState<LoadStatus>('loading')
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [draft, setDraft] = useState('')
  const [posting, setPosting] = useState(false)

  const canPost = currentUser?.role === 'super_admin' || Boolean(currentUser?.isTeamLead)
  const isSuperAdmin = currentUser?.role === 'super_admin'

  useEffect(() => {
    let cancelled = false

    getAnnouncements()
      .then((result) => {
        if (!cancelled) {
          setAnnouncements(result)
          setStatus('success')
        }
      })
      .catch(() => {
        if (!cancelled) setStatus('error')
      })
    markAnnouncementsSeen().catch(() => {})

    return () => {
      cancelled = true
    }
  }, [])

  const handlePost = async () => {
    const content = draft.trim()
    if (!content || posting) return
    setPosting(true)
    try {
      const announcement = await postAnnouncement(content)
      setAnnouncements((prev) => [announcement, ...prev])
      setDraft('')
    } finally {
      setPosting(false)
    }
  }

  if (status === 'loading') {
    return <div className="flex min-h-screen items-center justify-center text-sm text-gray-400">กำลังโหลดข้อมูล...</div>
  }

  if (status === 'error') {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-rose-500">
        โหลดข้อมูลไม่สำเร็จ กรุณาลองใหม่
      </div>
    )
  }

  return (
    <main className="mx-auto max-w-3xl space-y-6 px-6 py-6">
      <h1 className="text-xl font-bold text-gray-900">ประกาศ</h1>

      {canPost && (
        <form
          onSubmit={(event) => {
            event.preventDefault()
            void handlePost()
          }}
          className="space-y-2 rounded-2xl border border-gray-100 bg-white p-4"
        >
          <textarea
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="เขียนประกาศ..."
            rows={3}
            className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
          />
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs text-gray-400">
              {isSuperAdmin ? 'ประกาศนี้จะส่งถึงทุกแผนก' : 'ประกาศนี้จะส่งถึงเฉพาะทีมของคุณ และผู้ดูแลสูงสุด'}
            </p>
            <button
              type="submit"
              disabled={!draft.trim() || posting}
              className="flex shrink-0 items-center gap-2 rounded-xl bg-rose-500 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <FiSend size={14} />
              ประกาศ
            </button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {announcements.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-2xl border border-gray-100 bg-white py-16 text-center text-sm text-gray-400">
            <HiMegaphone size={28} className="text-gray-300" />
            ยังไม่มีประกาศ
          </div>
        ) : (
          announcements.map((announcement) => (
            <div key={announcement.id} className="rounded-2xl border border-gray-100 bg-white p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-rose-500 text-xs font-semibold text-white">
                    {getInitials(announcement.authorName)}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{announcement.authorName}</p>
                    <p className="text-xs text-gray-400">{formatDateTime(announcement.createdAt)}</p>
                  </div>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${
                    announcement.department ? adminRoleMeta[announcement.department].badgeClass : 'bg-purple-50 text-purple-600'
                  }`}
                >
                  {announcement.department ? adminRoleMeta[announcement.department].label : 'ทุกแผนก'}
                </span>
              </div>
              <p className="mt-3 whitespace-pre-wrap break-words text-sm text-gray-700">{announcement.content}</p>
            </div>
          ))
        )}
      </div>
    </main>
  )
}
