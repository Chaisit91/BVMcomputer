import { useEffect, useRef, useState } from 'react'
import { FiChevronDown, FiLogOut, FiMenu, FiMonitor, FiUser, FiUsers, FiX } from 'react-icons/fi'
import { HiMegaphone } from 'react-icons/hi2'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Avatar } from '../ui/Avatar'
import { ConfirmDialog } from '../ui/ConfirmDialog'
import { canAccess } from '../../lib/permissions'
import { useNotificationBadges } from '../../hooks/useNotificationBadges'
import { logout } from '../../services/auth.service'
import { clearUser } from '../../store/authSlice'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { adminRoleMeta } from '../../types/admin'
import { inventoryMenuItems } from './InventoryMenu'
import { manageMenuItems } from './ManageMenu'

// Every non-super_admin role (one department each) gets this persistent
// sidebar with just their own department's pages pulled in directly, instead
// of Topbar's dropdown — super_admin still needs the horizontal Topbar since
// it alone spans every department at once, so this component never renders
// for that role (see AppLayout.tsx).

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export function Sidebar() {
  const user = useAppSelector((state) => state.auth.user)
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  const profileRef = useRef<HTMLDivElement>(null)
  const { showChatBadge, unreadChatCount, soleUnreadConversationId, unreadAnnouncementCount } = useNotificationBadges()

  useEffect(() => {
    if (!profileMenuOpen) return
    function handleClickOutside(event: MouseEvent) {
      if (!profileRef.current?.contains(event.target as Node)) setProfileMenuOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [profileMenuOpen])

  const departmentItems =
    user?.role === 'inventory_manager'
      ? inventoryMenuItems
      : manageMenuItems.filter((item) => !item.path || canAccess(user?.role, item.path))

  const roleLabel = user?.role ? adminRoleMeta[user.role].label : 'ผู้ดูแลระบบ'

  const handleNavigate = () => setMobileOpen(false)

  const handleLogout = async () => {
    if (loggingOut) return
    setLoggingOut(true)
    try {
      await logout()
    } catch {
      // ponytail: clear local session regardless of the call's outcome
    }
    dispatch(clearUser())
    navigate('/login', { replace: true })
  }

  const rowClass = (active: boolean) =>
    `nav-wipe flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium ${
      active ? 'bg-white/5 text-white' : 'text-gray-400 hover:text-gray-200'
    }`

  const navContent = (
    <>
      <Link to="/dashboard" onClick={handleNavigate} className="mb-6 flex items-center gap-2 px-1">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-500 text-white">
          <FiMonitor size={16} />
        </span>
        <span className="text-sm font-semibold text-gray-100">BVMcomputer</span>
      </Link>

      <nav className="flex-1 space-y-0.5 overflow-y-auto">
        <Link to="/admins" onClick={handleNavigate} className={rowClass(location.pathname.startsWith('/admins'))}>
          <FiUsers size={16} className="shrink-0" />
          <span className="flex-1">ทีมของฉัน</span>
        </Link>

        <div className="my-3 border-t border-white/[0.06]" />

        <p className="px-3 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-gray-600">{roleLabel}</p>
        {departmentItems.map((item) => {
          const isActive = item.path === location.pathname
          const content = (
            <>
              <span className="shrink-0 text-base">{item.icon}</span>
              <span className="min-w-0 flex-1 truncate">{item.name}</span>
            </>
          )
          return item.path ? (
            <Link key={item.id} to={item.path} onClick={handleNavigate} className={rowClass(isActive)}>
              {content}
            </Link>
          ) : (
            <button key={item.id} type="button" className={rowClass(false)}>
              {content}
            </button>
          )
        })}

        <div className="my-3 border-t border-white/[0.06]" />

        <Link
          to="/announcements"
          onClick={handleNavigate}
          className={rowClass(location.pathname.startsWith('/announcements'))}
        >
          <HiMegaphone size={16} className="shrink-0" />
          <span className="flex-1">ประกาศ</span>
          {unreadAnnouncementCount > 0 && (
            <span className="flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-semibold text-white">
              {unreadAnnouncementCount > 99 ? '99+' : unreadAnnouncementCount}
            </span>
          )}
        </Link>
        {showChatBadge && unreadChatCount > 0 && (
          <Link
            to={soleUnreadConversationId ? `/manage/chats/${soleUnreadConversationId}` : '/manage/chats'}
            onClick={handleNavigate}
            className="nav-wipe flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-rose-400"
          >
            <span className="flex h-5 min-w-[1.25rem] shrink-0 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-semibold text-white">
              {unreadChatCount > 99 ? '99+' : unreadChatCount}
            </span>
            <span className="flex-1">แชทที่ยังไม่ได้ตอบ</span>
          </Link>
        )}
      </nav>

      <div ref={profileRef} className="relative mt-4 border-t border-white/[0.06] pt-4">
        {/* Opens upward (bottom-full) since this sits at the very bottom of
            the sidebar — a downward dropdown here would run off-screen. */}
        <div
          className={`absolute inset-x-0 bottom-full mb-2 origin-bottom overflow-hidden rounded-xl border border-white/10 bg-[#0d0e11] shadow-xl shadow-black/50 transition-all duration-200 ease-out ${
            profileMenuOpen ? 'visible translate-y-0 scale-100 opacity-100' : 'invisible translate-y-1 scale-95 opacity-0'
          }`}
        >
          <Link
            to={user ? `/admins/${user.id}/edit` : '#'}
            onClick={() => {
              setProfileMenuOpen(false)
              handleNavigate()
            }}
            className="nav-wipe flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium text-gray-300"
          >
            <FiUser size={16} className="shrink-0" />
            <span>แก้ไขข้อมูลส่วนตัว</span>
          </Link>
          <button
            type="button"
            onClick={() => {
              setProfileMenuOpen(false)
              setLogoutConfirmOpen(true)
            }}
            className="nav-wipe flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-sm font-medium text-rose-400"
          >
            <FiLogOut size={16} className="shrink-0" />
            <span>ออกจากระบบ</span>
          </button>
        </div>

        <button
          type="button"
          onClick={() => setProfileMenuOpen((v) => !v)}
          className="flex w-full items-center gap-2.5 rounded-lg p-1.5 hover:bg-white/5"
        >
          <Avatar key={user?.avatarUrl ?? 'none'} url={user?.avatarUrl} initials={getInitials(user?.name ?? 'แอดมิน')} size={34} />
          <div className="min-w-0 flex-1 text-left">
            <p className="truncate text-sm font-medium text-gray-200">{user?.name ?? 'แอดมิน'}</p>
            <p className="truncate text-xs text-gray-500">{roleLabel}</p>
          </div>
          <FiChevronDown size={14} className={`shrink-0 text-gray-500 transition-transform ${profileMenuOpen ? '' : 'rotate-180'}`} />
        </button>
      </div>
    </>
  )

  return (
    <>
      {/* Mobile-only top strip — the sidebar itself is a slide-in drawer below
          md, so there's still something to tap to open it and somewhere for
          the unread badges to live when the full nav is off-screen. */}
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-white/[0.06] bg-[#0d0e11] px-4 py-3 md:hidden">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="rounded-md p-1.5 text-gray-400 hover:bg-white/5 hover:text-gray-200"
          aria-label="เมนู"
        >
          <FiMenu size={22} />
        </button>
        <Link to="/dashboard" className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-500 text-white">
            <FiMonitor size={16} />
          </span>
          <span className="text-sm font-semibold text-gray-100">BVMcomputer</span>
        </Link>
        <Link to="/announcements" className="relative rounded-md p-1.5 text-gray-400 hover:bg-white/5 hover:text-gray-200" aria-label="ประกาศ">
          <HiMegaphone size={20} />
          {unreadAnnouncementCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-semibold text-white">
              {unreadAnnouncementCount > 99 ? '99+' : unreadAnnouncementCount}
            </span>
          )}
        </Link>
      </header>

      {/* Mobile drawer */}
      <div className={`fixed inset-0 z-30 md:hidden ${mobileOpen ? '' : 'pointer-events-none'}`}>
        <div
          className={`absolute inset-0 bg-black/60 transition-opacity duration-200 ${mobileOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={() => setMobileOpen(false)}
        />
        <div
          className={`absolute inset-y-0 left-0 flex w-72 flex-col bg-[#0d0e11] p-4 shadow-2xl transition-transform duration-250 ease-out ${
            mobileOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="absolute right-3 top-3 rounded-md p-1.5 text-gray-500 hover:bg-white/5 hover:text-gray-200"
            aria-label="ปิดเมนู"
          >
            <FiX size={18} />
          </button>
          {navContent}
        </div>
      </div>

      {/* Desktop persistent sidebar */}
      <aside className="hidden md:sticky md:top-0 md:flex md:h-screen md:w-64 md:shrink-0 md:flex-col md:border-r md:border-white/[0.06] md:bg-[#0d0e11] md:p-4">
        {navContent}
      </aside>

      {/* Rendered once here (not inside navContent, which is duplicated
          between the mobile drawer and the desktop aside above) — two
          simultaneous fixed-position dialogs in the DOM at once broke the
          backdrop's stacking, leaving page content underneath still clickable. */}
      <ConfirmDialog
        open={logoutConfirmOpen}
        title="ยืนยันออกจากระบบ"
        message="คุณต้องการออกจากระบบใช่หรือไม่?"
        confirmLabel="ออกจากระบบ"
        confirming={loggingOut}
        onConfirm={handleLogout}
        onCancel={() => setLogoutConfirmOpen(false)}
      />
    </>
  )
}
