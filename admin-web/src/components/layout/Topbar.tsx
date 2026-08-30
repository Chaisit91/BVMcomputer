import { useEffect, useRef, useState } from 'react'
import { FiBell, FiChevronDown, FiMenu, FiMonitor, FiX } from 'react-icons/fi'
import { Link, useLocation } from 'react-router-dom'
import { useAppSelector } from '../../store/hooks'
import { InventoryMenu } from './InventoryMenu'
import { ManageMenu } from './ManageMenu'

type OpenMenu = 'inventory' | 'manage' | null

export function Topbar() {
  const user = useAppSelector((state) => state.auth.user)
  const location = useLocation()
  const [openMenu, setOpenMenu] = useState<OpenMenu>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const navRef = useRef<HTMLDivElement>(null)
  const mobilePanelRef = useRef<HTMLDivElement>(null)
  const hamburgerRef = useRef<HTMLButtonElement>(null)

  const isInventoryActive = location.pathname.startsWith('/inventory')
  const isManageActive = location.pathname.startsWith('/manage')

  useEffect(() => {
    if (!openMenu && !mobileMenuOpen) return

    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node
      const insideDesktopNav = navRef.current?.contains(target)
      const insideMobilePanel = mobilePanelRef.current?.contains(target)
      const insideHamburger = hamburgerRef.current?.contains(target)

      if (!insideDesktopNav && !insideMobilePanel) {
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
                  <ManageMenu />
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
          <div className="text-right">
            <p className="text-sm font-medium text-gray-800">{user?.name ?? 'แอดมิน'}</p>
            <p className="text-xs text-gray-400">ผู้ดูแลระบบ</p>
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
          {openMenu === 'manage' && <ManageMenu />}
        </div>
      )}
    </header>
  )
}
