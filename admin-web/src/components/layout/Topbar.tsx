import { useEffect, useRef, useState } from 'react'
import { FiBell, FiChevronDown, FiLogOut, FiMenu, FiMonitor, FiUser, FiX } from 'react-icons/fi'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { logout } from '../../services/auth.service'
import { clearUser } from '../../store/authSlice'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { InventoryMenu } from './InventoryMenu'
import { ManageMenu } from './ManageMenu'

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
  const [loggingOut, setLoggingOut] = useState(false)
  const navRef = useRef<HTMLDivElement>(null)
  const userMenuRef = useRef<HTMLDivElement>(null)
  const mobilePanelRef = useRef<HTMLDivElement>(null)
  const hamburgerRef = useRef<HTMLButtonElement>(null)

  const isInventoryActive = location.pathname.startsWith('/inventory')
  const isManageActive = location.pathname.startsWith('/manage')

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

  return (
    <header className="sticky top-0 z-10 border-b border-gray-100 bg-white">
      <div className="flex items-center justify-between px-4 py-3 md:px-6">
        <div className="flex items-center gap-4 md:gap-8">
          <Link to="/dashboard" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-500 text-white">
              <FiMonitor size={18} />
            </span>
            <span className="text-base font-bold text-gray-900">BVMcomputer</span>
          </Link>

          <nav ref={navRef} className="hidden items-center gap-6 text-sm font-medium text-gray-500 md:flex">
            <div className="relative">
              <button
                type="button"
                onClick={() => toggleMenu('inventory')}
                className={`flex items-center gap-1 hover:text-gray-900 ${isInventoryActive ? 'text-rose-500' : ''}`}
              >
                คลังสินค้า
                <FiChevronDown size={14} />
              </button>
              {openMenu === 'inventory' && (
                <div className="absolute left-0 top-full mt-2 w-80">
                  <InventoryMenu onNavigate={handleNavigate} />
                </div>
              )}
            </div>

            <div className="relative">
              <button
                type="button"
                onClick={() => toggleMenu('manage')}
                className={`flex items-center gap-1 hover:text-gray-900 ${isManageActive ? 'text-rose-500' : ''}`}
              >
                จัดการ
                <FiChevronDown size={14} />
              </button>
              {openMenu === 'manage' && (
                <div className="absolute left-0 top-full mt-2 w-96">
                  <ManageMenu onNavigate={handleNavigate} />
                </div>
              )}
            </div>
          </nav>
        </div>

        <div className="flex items-center gap-3 md:gap-4">
          <button
            ref={hamburgerRef}
            type="button"
            onClick={() => setMobileMenuOpen((open) => !open)}
            className="text-gray-400 hover:text-gray-600 md:hidden"
            aria-label="เมนู"
          >
            {mobileMenuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
          </button>
          <button type="button" className="text-gray-400 hover:text-gray-600" aria-label="การแจ้งเตือน">
            <FiBell size={20} />
          </button>

          <div ref={userMenuRef} className="relative">
            <button
              type="button"
              onClick={() => toggleMenu('user')}
              className="flex items-center gap-2 rounded-xl py-1 pl-1 pr-2 hover:bg-gray-50"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-rose-500 text-sm font-semibold text-white">
                {getInitials(user?.name ?? 'แอดมิน')}
              </span>
              <span className="hidden text-right sm:block">
                <span className="block text-sm font-medium text-gray-800">{user?.name ?? 'แอดมิน'}</span>
                <span className="block text-xs text-gray-400">ผู้ดูแลระบบ</span>
              </span>
              <FiChevronDown
                size={14}
                className={`hidden text-gray-400 transition-transform sm:block ${openMenu === 'user' ? 'rotate-180' : ''}`}
              />
            </button>

            {openMenu === 'user' && (
              <div className="absolute right-0 top-full mt-2 w-64 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xl">
                <div className="flex items-center gap-3 border-b border-gray-100 px-4 py-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-500 text-sm font-semibold text-white">
                    {getInitials(user?.name ?? 'แอดมิน')}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-gray-800">{user?.name ?? 'แอดมิน'}</p>
                    <p className="truncate text-xs text-gray-400">{user?.email ?? 'ผู้ดูแลระบบ'}</p>
                  </div>
                </div>
                <div className="p-1.5">
                  <button
                    type="button"
                    disabled
                    className="flex w-full cursor-not-allowed items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm text-gray-300"
                  >
                    <FiUser size={16} />
                    โปรไฟล์ของฉัน
                  </button>
                  <button
                    type="button"
                    onClick={handleLogout}
                    disabled={loggingOut}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-rose-500 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <FiLogOut size={16} />
                    {loggingOut ? 'กำลังออกจากระบบ...' : 'ออกจากระบบ'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div ref={mobilePanelRef} className="space-y-2 border-t border-gray-100 px-4 py-3 md:hidden">
          <button
            type="button"
            onClick={() => toggleMenu('inventory')}
            className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium ${
              isInventoryActive ? 'text-rose-500' : 'text-gray-700'
            }`}
          >
            คลังสินค้า
            <FiChevronDown className={`transition-transform ${openMenu === 'inventory' ? 'rotate-180' : ''}`} size={16} />
          </button>
          {openMenu === 'inventory' && <InventoryMenu onNavigate={handleNavigate} />}

          <button
            type="button"
            onClick={() => toggleMenu('manage')}
            className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium ${
              isManageActive ? 'text-rose-500' : 'text-gray-700'
            }`}
          >
            จัดการ
            <FiChevronDown className={`transition-transform ${openMenu === 'manage' ? 'rotate-180' : ''}`} size={16} />
          </button>
          {openMenu === 'manage' && <ManageMenu onNavigate={handleNavigate} />}
        </div>
      )}
    </header>
  )
}
