import { useEffect, useMemo, useRef, useState } from 'react'
import { FiLink, FiPaperclip, FiSearch, FiSend, FiTrash2, FiX } from 'react-icons/fi'
import { HiMegaphone } from 'react-icons/hi2'
import { formatDateTime } from '../../lib/formatDate'
import { matchesSearchText } from '../../lib/textSearch'
import { deleteAnnouncement, getAnnouncements, markAnnouncementsSeen, postAnnouncement } from '../../services/announcement.service'
import { useAppSelector } from '../../store/hooks'
import { adminRoleMeta, type AdminRole } from '../../types/admin'
import type { Announcement } from '../../types/announcement'

type LoadStatus = 'loading' | 'error' | 'success'
type TargetDepartment = AdminRole | 'all'
// 'global' = broadcast to every department (department: null); otherwise a specific department.
type FilterValue = 'all' | 'global' | AdminRole

const departmentOptions: AdminRole[] = ['inventory_manager', 'sales_staff', 'content_moderator']

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function AnnouncementsPage() {
  const currentUser = useAppSelector((state) => state.auth.user)
  const [status, setStatus] = useState<LoadStatus>('loading')
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [draft, setDraft] = useState('')
  const [link, setLink] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [posting, setPosting] = useState(false)
  const [targetDepartment, setTargetDepartment] = useState<TargetDepartment>('all')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<FilterValue>('all')

  const canPost = currentUser?.role === 'super_admin' || Boolean(currentUser?.isTeamLead)
  const isSuperAdmin = currentUser?.role === 'super_admin'

  const canDelete = (announcement: Announcement) =>
    announcement.authorId === currentUser?.id ||
    isSuperAdmin ||
    (Boolean(currentUser?.isTeamLead) && announcement.department === currentUser?.role)

  // Only offer filter pills for departments that actually have announcements
  // right now — an empty filter option is dead weight, not a real choice.
  const filterOptions = useMemo(() => {
    const departmentsPresent = departmentOptions.filter((role) => announcements.some((a) => a.department === role))
    const hasGlobal = announcements.some((a) => !a.department)
    const options: { value: FilterValue; label: string }[] = [{ value: 'all', label: 'ทั้งหมด' }]
    if (hasGlobal) options.push({ value: 'global', label: 'ทุกแผนก' })
    departmentsPresent.forEach((role) => options.push({ value: role, label: adminRoleMeta[role].label }))
    return options
  }, [announcements])

  const filterCounts = useMemo(() => {
    const counts: Partial<Record<FilterValue, number>> = { all: announcements.length }
    for (const announcement of announcements) {
      const key: FilterValue = announcement.department ?? 'global'
      counts[key] = (counts[key] ?? 0) + 1
    }
    return counts
  }, [announcements])

  const visibleAnnouncements = useMemo(
    () =>
      announcements
        .filter((a) => {
          if (filter === 'all') return true
          if (filter === 'global') return !a.department
          return a.department === filter
        })
        .filter((a) => matchesSearchText(search, a.content, a.authorName)),
    [announcements, filter, search],
  )

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
      const announcement = await postAnnouncement(
        content,
        isSuperAdmin && targetDepartment !== 'all' ? targetDepartment : null,
        link.trim() || null,
        files,
      )
      setAnnouncements((prev) => [announcement, ...prev])
      setDraft('')
      setLink('')
      setFiles([])
      if (fileInputRef.current) fileInputRef.current.value = ''
    } finally {
      setPosting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('ยืนยันลบประกาศนี้?')) return
    try {
      await deleteAnnouncement(id)
    } catch (error: any) {
      // Someone else already deleted it (or it's gone for any other reason) —
      // the end state the user wants is the same, so just drop it locally
      // instead of leaving a stale row stuck on screen.
      if (error?.response?.status !== 404) {
        window.alert('ลบประกาศไม่สำเร็จ กรุณาลองใหม่')
        return
      }
    }
    setAnnouncements((prev) => prev.filter((item) => item.id !== id))
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
          className="space-y-2 card p-4"
        >
          {isSuperAdmin && (
            <select
              value={targetDepartment}
              onChange={(event) => setTargetDepartment(event.target.value as TargetDepartment)}
              className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 outline-none focus:border-rose-400"
            >
              <option value="all">ส่งถึงทุกแผนก</option>
              {departmentOptions.map((role) => (
                <option key={role} value={role}>
                  ส่งถึงเฉพาะ{adminRoleMeta[role].label}
                </option>
              ))}
            </select>
          )}
          <textarea
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="เขียนประกาศ..."
            rows={3}
            className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
          />
          <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2">
            <FiLink size={14} className="shrink-0 text-gray-400" />
            <input
              type="url"
              value={link}
              onChange={(event) => setLink(event.target.value)}
              placeholder="แปะลิงก์ (ถ้ามี)"
              className="w-full bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400"
            />
          </div>

          <div>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={(event) => setFiles(Array.from(event.target.files ?? []))}
              className="hidden"
              id="announcement-files"
            />
            <label
              htmlFor="announcement-files"
              className="inline-flex cursor-pointer items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-rose-500"
            >
              <FiPaperclip size={14} />
              แนบไฟล์ (รูป, PDF, อื่นๆ สูงสุด 5 ไฟล์ ไฟล์ละไม่เกิน 10MB)
            </label>
            {files.length > 0 && (
              <ul className="mt-2 space-y-1">
                {files.map((file, index) => (
                  <li key={`${file.name}-${index}`} className="flex items-center justify-between gap-2 rounded-lg bg-gray-50 px-3 py-1.5 text-xs text-gray-600">
                    <span className="truncate">
                      {file.name} <span className="text-gray-400">({formatFileSize(file.size)})</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setFiles((prev) => prev.filter((_, i) => i !== index))}
                      className="shrink-0 text-gray-400 hover:text-rose-500"
                      aria-label="เอาไฟล์นี้ออก"
                    >
                      <FiX size={14} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="flex items-center justify-between gap-3">
            <p className="text-xs text-gray-400">
              {isSuperAdmin
                ? targetDepartment === 'all'
                  ? 'ประกาศนี้จะส่งถึงทุกแผนก'
                  : `ประกาศนี้จะส่งถึงเฉพาะ${adminRoleMeta[targetDepartment].label}`
                : 'ประกาศนี้จะส่งถึงเฉพาะทีมของคุณ และผู้ดูแลสูงสุด'}
            </p>
            <button
              type="submit"
              disabled={!draft.trim() || posting}
              className="flex shrink-0 items-center gap-2 rounded-xl bg-rose-500 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <FiSend size={14} />
              {posting ? 'กำลังส่ง...' : 'ประกาศ'}
            </button>
          </div>
        </form>
      )}

      {announcements.length > 0 && (
        <div className="space-y-3">
          <div className="relative">
            <FiSearch size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="ค้นหาประกาศ..."
              className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {filterOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setFilter(option.value)}
                className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
                  filter === option.value ? 'bg-rose-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {option.label}
                <span className={`rounded-full px-1.5 text-xs ${filter === option.value ? 'bg-white/20' : 'bg-white text-gray-400'}`}>
                  {filterCounts[option.value] ?? 0}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-3">
        {announcements.length === 0 ? (
          <div className="flex flex-col items-center gap-2 card py-16 text-center text-sm text-gray-400">
            <HiMegaphone size={28} className="text-gray-300" />
            ยังไม่มีประกาศ
          </div>
        ) : visibleAnnouncements.length === 0 ? (
          <div className="flex flex-col items-center gap-2 card py-16 text-center text-sm text-gray-400">
            <HiMegaphone size={28} className="text-gray-300" />
            ไม่พบประกาศที่ค้นหา
          </div>
        ) : (
          visibleAnnouncements.map((announcement) => {
            const isFromSuperAdmin = announcement.authorRole === 'super_admin'
            return (
            <div
              key={announcement.id}
              className={`card p-4 border-l-4 ${
                isFromSuperAdmin ? 'border-l-rose-400' : 'border-l-blue-400'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-rose-500 text-xs font-semibold text-white">
                    {getInitials(announcement.authorName)}
                  </span>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-semibold text-gray-800">{announcement.authorName}</p>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                          isFromSuperAdmin ? 'bg-rose-50 text-rose-600' : 'bg-blue-50 text-blue-600'
                        }`}
                      >
                        {isFromSuperAdmin ? 'ผู้ดูแลระบบ' : 'หัวหน้าแผนก'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400">{formatDateTime(announcement.createdAt)}</p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                      announcement.department ? adminRoleMeta[announcement.department].badgeClass : 'bg-purple-50 text-purple-600'
                    }`}
                  >
                    ถึง: {announcement.department ? adminRoleMeta[announcement.department].label : 'ทุกแผนก'}
                  </span>
                  {canDelete(announcement) && (
                    <button
                      type="button"
                      onClick={() => void handleDelete(announcement.id)}
                      className="text-gray-300 hover:text-rose-500"
                      aria-label="ลบประกาศ"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
              <p className="mt-3 whitespace-pre-wrap break-words text-sm text-gray-700">{announcement.content}</p>
              {announcement.linkUrl && (
                <a
                  href={announcement.linkUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-flex items-center gap-1.5 text-sm text-blue-500 hover:underline"
                >
                  <FiLink size={14} />
                  {announcement.linkUrl}
                </a>
              )}
              {announcement.attachments.length > 0 && (
                <ul className="mt-3 space-y-1.5">
                  {announcement.attachments.map((attachment) => (
                    <li key={attachment.id}>
                      <a
                        href={attachment.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2 rounded-lg border border-gray-100 px-3 py-2 text-xs text-gray-600 hover:border-rose-200 hover:text-rose-500"
                      >
                        <FiPaperclip size={14} className="shrink-0" />
                        <span className="truncate">{attachment.fileName}</span>
                        <span className="shrink-0 text-gray-400">({formatFileSize(attachment.fileSizeBytes)})</span>
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            )
          })
        )}
      </div>
    </main>
  )
}
