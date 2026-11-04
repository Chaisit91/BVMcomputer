import { useEffect, useRef, useState } from 'react'
import { FiBell, FiChevronDown, FiLogOut, FiMenu, FiMonitor, FiUser, FiX } from 'react-icons/fi'
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
import { InventoryMenu } from './InventoryMenu'
import { ManageMenu } from './ManageMenu'

const managePaths = ['/manage/orders', '/manage/users', '/manage/banners', '/manage/chats']

type OpenMenu = 'inventory' | 'manage' | 'user' | null

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export function Topbar() {
  const user = useAppSelector((state) => state.auth.user)
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const [openMenu, setOpenMenu] = useState<OpenMenu>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  const navRef = useRef<HTMLDivElement>(null)
  const userMenuRef = useRef<HTMLDivElement>(null)
  const mobilePanelRef = useRef<HTMLDivElement>(null)
  const hamburgerRef = useRef<HTMLButtonElement>(null)

  const isInventoryActive = location.pathname.startsWith('/inventory')
  const isManageActive = location.pathname.startsWith('/manage')
  const isAdminsActive = location.pathname.startsWith('/admins')

  const showInventoryNav = canAccess(user?.role, '/inventory')
  const showManageNav = managePaths.some((path) => canAccess(user?.role, path))
  const { showChatBadge, unreadChatCount, soleUnreadConversationId, unreadAnnouncementCount } = useNotificationBadges()
  // super_admin manages every account; every other role gets a "my team" link
  // scoped to their own department instead of the full admin-management page.
  const showAdminsNav = Boolean(user)
  const adminsNavLabel = user?.role === 'super_admin' ? 'ผู้ดูแลระบบ' : 'ทีมของฉัน'
  const roleLabel = user?.role ? adminRoleMeta[user.role].label : 'ผู้ดูแลระบบ'

  useEffect(() => {
    if (!openMenu && !mobileMenuOpen) return

    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node
      const insideDesktopNav = navRef.current?.contains(target)
      const insideUserMenu = userMenuRef.current?.contains(target)
      const insideMobilePanel = mobilePanelRef.current?.contains(target)
      const insideHamburger = hamburgerRef.current?.contains(target)

      if (!insideDesktopNav && !insideUserMenu && !insideMobilePanel) {
        setOpenMenu(null)
      }
      if (!insideMobilePanel && !insideHamburger) {
        setMobileMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [openMenu, mobileMenuOpen])

  const toggleMenu = (menu: Exclude<OpenMenu, null>) => {
    setOpenMenu((current) => (current === menu ? null : menu))
  }

  const handleNavigate = () => {
    setOpenMenu(null)
    setMobileMenuOpen(false)
  }

  const handleLogout = async () => {
    if (loggingOut) return
    setLoggingOut(true)
    try {
      await logout()
    } catch {
      // ponytail: no real backend yet — clear local session regardless of the call's outcome
    }
    dispatch(clearUser())
    navigate('/login', { replace: true })
  }

  // Linear-style nav: no colored pill for the active item, just a brightness
  // step (muted gray → white) — color is spent only on the things that are
  // actually actionable (the brand mark, unread badges), not on wayfinding.
  const navItemClass = (active: boolean) =>
    `flex items-center gap-1 rounded-md px-3 py-1.5 hover:bg-white/5 ${
      active ? 'text-white' : 'text-gray-400 hover:text-gray-200'
    }`

  // Always mounted, visibility driven by CSS — a conditionally-rendered panel
  // can only ever animate its *entrance* (it's gone from the DOM the instant
  // state flips), which is exactly why closing felt instant/not smooth.
  // transition-all here covers both directions.
  const dropdownPanelClass = (open: boolean) =>
    `absolute top-full origin-top transition-all duration-200 ease-out ${
      open ? 'visible translate-y-0 scale-100 opacity-100' : 'invisible -translate-y-1 scale-95 opacity-0'
    }`

  return (
    <header className="sticky top-0 z-20 border-b border-white/[0.06] bg-[#0d0e11]">
      <div className="flex items-center justify-between px-4 py-3 md:px-6">
        <div className="flex items-center gap-4 md:gap-8">
          <Link to="/dashboard" className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-500 text-white">
              <FiMonitor size={16} />
            </span>
            <span className="text-sm font-semibold text-gray-100">BVMcomputer</span>
          </Link>

          <nav ref={navRef} className="hidden items-center gap-1 text-sm font-medium md:flex">
            {showInventoryNav && (
              <div className="relative">
                <button type="button" onClick={() => toggleMenu('inventory')} className={navItemClass(isInventoryActive)}>
                  คลังสินค้า
                  <FiChevronDown size={14} className={`transition-transform ${openMenu === 'inventory' ? 'rotate-180' : ''}`} />
                </button>
                <div className={`left-0 mt-2 w-80 ${dropdownPanelClass(openMenu === 'inventory')}`}>
                  <InventoryMenu onNavigate={handleNavigate} isOpen={openMenu === 'inventory'} />
                </div>
              </div>
            )}

            {showManageNav && (
              <div className="relative">
                <button type="button" onClick={() => toggleMenu('manage')} className={navItemClass(isManageActive)}>
                  จัดการ
                  <FiChevronDown size={14} className={`transition-transform ${openMenu === 'manage' ? 'rotate-180' : ''}`} />
                </button>
                <div className={`left-0 mt-2 w-96 ${dropdownPanelClass(openMenu === 'manage')}`}>
                  <ManageMenu onNavigate={handleNavigate} isOpen={openMenu === 'manage'} />
                </div>
              </div>
            )}

            {showAdminsNav && (
              <Link to="/admins" onClick={handleNavigate} className={navItemClass(isAdminsActive)}>
                {adminsNavLabel}
              </Link>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-3 md:gap-4">
          <button
            ref={hamburgerRef}
            type="button"
            onClick={() => setMobileMenuOpen((open) => !open)}
            className="rounded-md p-1.5 text-gray-400 hover:bg-white/5 hover:text-gray-200 md:hidden"
            aria-label="เมนู"
          >
            {mobileMenuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
          </button>
          {user && (
            <Link
              to="/announcements"
              className="relative rounded-md p-1.5 text-gray-400 hover:bg-white/5 hover:text-gray-200"
              aria-label="ประกาศที่ยังไม่ได้อ่าน"
            >
              <HiMegaphone size={20} />
              {unreadAnnouncementCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-semibold text-white shadow-sm shadow-rose-500/50">
                  {unreadAnnouncementCount > 99 ? '99+' : unreadAnnouncementCount}
                </span>
              )}
            </Link>
          )}
          {showChatBadge ? (
            <Link
              to={soleUnreadConversationId ? `/manage/chats/${soleUnreadConversationId}` : '/manage/chats'}
              className="relative rounded-md p-1.5 text-gray-400 hover:bg-white/5 hover:text-gray-200"
              aria-label="แชทลูกค้าที่ยังไม่ได้ตอบ"
            >
              <FiBell size={20} />
              {unreadChatCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-semibold text-white shadow-sm shadow-rose-500/50">
                  {unreadChatCount > 99 ? '99+' : unreadChatCount}
                </span>
              )}
            </Link>
          ) : (
            <button type="button" className="rounded-md p-1.5 text-gray-400 hover:bg-white/5 hover:text-gray-200" aria-label="การแจ้งเตือน">
              <FiBell size={20} />
            </button>
          )}

          <div ref={userMenuRef} className="relative">
            <button
              type="button"
              onClick={() => toggleMenu('user')}
              className="flex items-center gap-2 rounded-md py-1 pl-1 pr-2 hover:bg-white/5"
            >
              <Avatar
                key={user?.avatarUrl ?? 'none'}
                url={user?.avatarUrl}
                initials={getInitials(user?.name ?? 'แอดมิน')}
                size={32}
              />
              <span className="hidden text-right sm:block">
                <span className="block text-sm font-medium text-gray-200">{user?.name ?? 'แอดมิน'}</span>
                <span className="block text-xs text-gray-500">{roleLabel}</span>
              </span>
              <FiChevronDown
                size={14}
                className={`hidden text-gray-400 transition-transform sm:block ${openMenu === 'user' ? 'rotate-180' : ''}`}
              />
            </button>

            <div
              className={`right-0 mt-2 w-64 origin-top-right overflow-hidden rounded-xl border border-white/10 bg-[#0d0e11] shadow-xl shadow-black/50 ${dropdownPanelClass(
                openMenu === 'user',
              )}`}
            >
              <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3">
                <Avatar
                  key={user?.avatarUrl ?? 'none'}
                  url={user?.avatarUrl}
                  initials={getInitials(user?.name ?? 'แอดมิน')}
                  size={40}
                />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-gray-100">{user?.name ?? 'แอดมิน'}</p>
                  <p className="truncate text-xs text-gray-500">{user?.email ?? 'ผู้ดูแลระบบ'}</p>
                </div>
              </div>
              <div className="p-1.5">
                <Link
                  to={user ? `/admins/${user.id}/edit` : '#'}
                  onClick={handleNavigate}
                  className="nav-wipe flex w-full items-center gap-2.5 rounded-md px-3 py-2.5 text-left text-sm text-gray-300"
                >
                  <FiUser size={16} />
                  แก้ไขข้อมูลส่วนตัว
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setOpenMenu(null)
                    setLogoutConfirmOpen(true)
                  }}
                  className="nav-wipe flex w-full items-center gap-2.5 rounded-md px-3 py-2.5 text-left text-sm font-medium text-rose-400"
                >
                  <FiLogOut size={16} />
                  ออกจากระบบ
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid-rows trick: animates to/from an intrinsic height smoothly in
          both directions, which a plain conditional render or a fixed max-h
          transition can't do cleanly for content whose height varies by role. */}
      <div
        className={`grid transition-[grid-template-rows] duration-300 ease-out md:hidden ${
          mobileMenuOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
        }`}
      >
        <div ref={mobilePanelRef} className="overflow-hidden">
          <div className="space-y-2 border-t border-white/10 px-4 py-3">
            {showInventoryNav && (
              <>
                <button
                  type="button"
                  onClick={() => toggleMenu('inventory')}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium ${
                    isInventoryActive ? 'text-white' : 'text-gray-400'
                  }`}
                >
                  คลังสินค้า
                  <FiChevronDown className={`transition-transform ${openMenu === 'inventory' ? 'rotate-180' : ''}`} size={16} />
                </button>
                <div
                  className={`grid transition-[grid-template-rows] duration-200 ease-out ${
                    openMenu === 'inventory' ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                  }`}
                >
                  <div className="overflow-hidden">
                    <InventoryMenu onNavigate={handleNavigate} isOpen={openMenu === 'inventory'} />
                  </div>
                </div>
              </>
            )}

            {showManageNav && (
              <>
                <button
                  type="button"
                  onClick={() => toggleMenu('manage')}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium ${
                    isManageActive ? 'text-white' : 'text-gray-400'
                  }`}
                >
                  จัดการ
                  <FiChevronDown className={`transition-transform ${openMenu === 'manage' ? 'rotate-180' : ''}`} size={16} />
                </button>
                <div
                  className={`grid transition-[grid-template-rows] duration-200 ease-out ${
                    openMenu === 'manage' ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                  }`}
                >
                  <div className="overflow-hidden">
                    <ManageMenu onNavigate={handleNavigate} isOpen={openMenu === 'manage'} />
                  </div>
                </div>
              </>
            )}

            {showAdminsNav && (
              <Link
                to="/admins"
                onClick={handleNavigate}
                className={`block rounded-lg px-3 py-2 text-sm font-medium ${isAdminsActive ? 'text-white' : 'text-gray-400'}`}
              >
                {adminsNavLabel}
              </Link>
            )}
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={logoutConfirmOpen}
        title="ยืนยันออกจากระบบ"
        message="คุณต้องการออกจากระบบใช่หรือไม่?"
        confirmLabel="ออกจากระบบ"
        confirming={loggingOut}
        onConfirm={handleLogout}
        onCancel={() => setLogoutConfirmOpen(false)}
      />
    </header>
  )
}
