import { useEffect, useRef, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import axios from 'axios'
import { useForm } from 'react-hook-form'
import { FiClock, FiLock, FiSave, FiShield, FiSlash, FiUser } from 'react-icons/fi'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Avatar } from '../../components/ui/Avatar'
import { Toggle } from '../../components/ui/Toggle'
import { formatDateTime } from '../../lib/formatDate'
import { isOnline } from '../../lib/onlineStatus'
import { parseUserAgent } from '../../lib/parseUserAgent'
import { adminEditSchema, type AdminEditFormValues } from '../../schemas/admin.schema'
import {
  forceLogoutAdmin,
  getAdminDetail,
  saveAdmin,
  updateAdminStatus,
  uploadAdminAvatar,
} from '../../services/admin.service'
import { setUser } from '../../store/authSlice'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { adminRoleMeta, type AdminAccount, type AdminRole } from '../../types/admin'

const MAX_AVATAR_BYTES = 5 * 1024 * 1024

type LoadStatus = 'loading' | 'error' | 'not_found' | 'success'

const inputClass =
  'w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-rose-400 focus:ring-2 focus:ring-rose-100 disabled:cursor-default disabled:text-gray-500'

const roleOptions = (Object.keys(adminRoleMeta) as AdminRole[]).map((value) => ({
  value,
  label: adminRoleMeta[value].label,
}))

function getInitials(firstName: string) {
  return firstName.slice(0, 2).toUpperCase()
}

export function AdminEditPage() {
  const { adminId = '' } = useParams()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const currentUser = useAppSelector((state) => state.auth.user)
  const [status, setStatus] = useState<LoadStatus>('loading')
  const [detail, setDetail] = useState<AdminAccount | null>(null)
  const [logoutNotice, setLogoutNotice] = useState(false)
  const [avatarUploading, setAvatarUploading] = useState(false)
  const [avatarError, setAvatarError] = useState('')
  const [showAllLogins, setShowAllLogins] = useState(false)
  const avatarInputRef = useRef<HTMLInputElement>(null)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AdminEditFormValues>({
    resolver: zodResolver(adminEditSchema),
  })

  useEffect(() => {
    let cancelled = false

    getAdminDetail(adminId)
      .then((result) => {
        if (cancelled) return
        if (!result) {
          setStatus('not_found')
          return
        }
        setDetail(result)
        reset({
          firstName: result.firstName,
          lastName: result.lastName,
          email: result.email,
          phone: result.phone,
          jobTitle: result.jobTitle,
          role: result.role,
          isTeamLead: result.isTeamLead,
          active: result.status === 'active',
          password: '',
          confirmPassword: '',
        })
        setStatus('success')
      })
      .catch(() => {
        if (!cancelled) setStatus('error')
      })

    return () => {
      cancelled = true
    }
  }, [adminId, reset])

  const active = watch('active')
  const isTeamLead = watch('isTeamLead')
  const isSuperAdminEditor = currentUser?.role === 'super_admin'
  const isSelf = currentUser?.id === adminId
  // Only super_admin can move someone across departments or grant super_admin.
  const canEditRole = isSuperAdminEditor
  // Status + team-lead flag: super_admin always, or a team lead managing
  // their own department — matches what the backend actually accepts
  // (src/modules/admin/admin.router.ts PUT /:id strips these otherwise).
  const canEditStatusAndLead = isSuperAdminEditor || Boolean(currentUser?.isTeamLead)

  // Redux's auth.user only refreshes on login/checkSession — editing your own
  // account here otherwise leaves the Topbar showing stale name/avatar until
  // next login, so push the change through manually when it's the same admin.
  const syncSelfIfNeeded = (updated: {
    id: string
    firstName: string
    lastName: string
    email: string
    role: AdminRole
    isTeamLead: boolean
    avatarUrl: string | null
  }) => {
    if (currentUser && currentUser.id === updated.id) {
      dispatch(
        setUser({
          id: updated.id,
          name: `${updated.firstName} ${updated.lastName}`,
          email: updated.email,
          role: updated.role,
          isTeamLead: updated.isTeamLead,
          avatarUrl: updated.avatarUrl,
        }),
      )
    }
  }

  const onSubmit = handleSubmit(async (values) => {
    await saveAdmin(adminId, values)
    syncSelfIfNeeded({
      id: adminId,
      firstName: values.firstName,
      lastName: values.lastName,
      email: values.email,
      role: values.role,
      isTeamLead: values.isTeamLead,
      avatarUrl: detail?.avatarUrl ?? null,
    })
    navigate('/admins', { state: { toast: { type: 'success', message: 'บันทึกการเปลี่ยนแปลงสำเร็จ' } } })
  })

  const handleForceLogout = async () => {
    if (!window.confirm('บังคับออกจากระบบทุกอุปกรณ์ของผู้ดูแลคนนี้?')) return
    await forceLogoutAdmin(adminId)
    setLogoutNotice(true)
  }

  const handleSuspend = async () => {
    if (!detail) return
    if (!window.confirm(`ยืนยันการระงับบัญชีของ ${detail.firstName} ${detail.lastName}?`)) return
    await updateAdminStatus(adminId, 'inactive')
    navigate('/admins', { state: { toast: { type: 'success', message: 'ระงับบัญชีสำเร็จ' } } })
  }

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = '' // allow re-picking the same file later
    if (!file) return

    setAvatarError('')
    if (!file.type.startsWith('image/')) {
      setAvatarError('เลือกไฟล์รูปภาพเท่านั้น')
      return
    }
    if (file.size > MAX_AVATAR_BYTES) {
      setAvatarError('ไฟล์ต้องมีขนาดไม่เกิน 5MB')
      return
    }

    setAvatarUploading(true)
    try {
      const updated = await uploadAdminAvatar(adminId, file)
      setDetail(updated)
      syncSelfIfNeeded(updated)
    } catch (err) {
      const serverMessage = axios.isAxiosError(err) ? (err.response?.data as { message?: string })?.message : undefined
      setAvatarError(serverMessage ?? 'อัปโหลดรูปไม่สำเร็จ กรุณาลองใหม่')
    } finally {
      setAvatarUploading(false)
    }
  }

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-gray-400">กำลังโหลดข้อมูล...</div>
    )
  }

  if (status === 'not_found') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 text-sm text-gray-400">
        <p>ไม่พบผู้ดูแลที่ต้องการ</p>
        <Link to="/admins" className="text-rose-500 hover:underline">
          กลับไปหน้ารายการ
        </Link>
      </div>
    )
  }

  if (status === 'error' || !detail) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-rose-500">
        โหลดข้อมูลไม่สำเร็จ กรุณาลองใหม่
      </div>
    )
  }

  return (
    <main className="mx-auto max-w-4xl space-y-6 px-6 py-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">แก้ไขข้อมูลผู้ดูแล (Edit Admin)</h1>
        <p className="text-sm text-gray-400">แก้ไขข้อมูลและสิทธิ์การเข้าถึงของผู้ดูแลระบบ</p>
      </div>

      <form onSubmit={onSubmit} noValidate className="space-y-6 rounded-2xl border border-gray-100 bg-white p-6">
        <div>
          <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-800">
            <FiUser className="text-rose-500" />
            รูปโปรไฟล์
          </h2>
          <div className="flex items-center gap-4">
            <Avatar
              key={detail.avatarUrl ?? 'none'}
              url={detail.avatarUrl}
              initials={getInitials(detail.firstName)}
              size={64}
              className="text-lg"
            />
            <div>
              <p className="text-sm font-medium text-gray-800">
                {detail.firstName} {detail.lastName}
              </p>
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
              <button
                type="button"
                disabled={avatarUploading}
                onClick={() => avatarInputRef.current?.click()}
                className="mt-1 text-sm font-medium text-rose-500 hover:underline disabled:cursor-not-allowed disabled:opacity-60"
              >
                {avatarUploading ? 'กำลังอัปโหลด...' : 'เปลี่ยนรูป'}
              </button>
              {avatarError && <p className="mt-1 text-xs text-red-500">{avatarError}</p>}
            </div>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-6">
          <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-800">
            <FiUser className="text-rose-500" />
            ข้อมูลส่วนตัว
          </h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">ชื่อ</label>
                <input type="text" className={inputClass} {...register('firstName')} />
                {errors.firstName && <p className="mt-1 text-xs text-red-500">{errors.firstName.message}</p>}
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">นามสกุล</label>
                <input type="text" className={inputClass} {...register('lastName')} />
                {errors.lastName && <p className="mt-1 text-xs text-red-500">{errors.lastName.message}</p>}
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">อีเมล</label>
                <input type="email" className={inputClass} {...register('email')} />
                {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">เบอร์โทรศัพท์</label>
                <input type="text" className={inputClass} {...register('phone')} />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">ตำแหน่งงาน</label>
              <input type="text" className={inputClass} {...register('jobTitle')} />
            </div>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-6">
          <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-800">
            <FiShield className="text-rose-500" />
            บทบาทและการเข้าถึง
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">บทบาท</label>
              {canEditRole ? (
                <select className={inputClass} {...register('role')}>
                  {roleOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              ) : (
                <input type="text" disabled value={adminRoleMeta[detail.role].label} readOnly className={inputClass} />
              )}
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">สถานะบัญชี</label>
              <div className="flex items-center gap-3 py-2">
                <span className={`h-2 w-2 rounded-full ${active ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                <span className="text-sm text-gray-700">{active ? 'ใช้งานอยู่ (Active)' : 'ปิดใช้งาน (Inactive)'}</span>
                {canEditStatusAndLead && <Toggle checked={active} onChange={(value) => setValue('active', value)} />}
              </div>
            </div>
          </div>
          {canEditRole && (
            <div className="mt-4 flex items-center gap-3 rounded-xl bg-gray-50 px-3 py-2.5">
              <Toggle checked={isTeamLead} onChange={(value) => setValue('isTeamLead', value)} />
              <div>
                <p className="text-sm font-medium text-gray-700">หัวหน้าแผนก</p>
                <p className="text-xs text-gray-400">เห็นและแก้ไขบัญชีของทุกคนในแผนกเดียวกันได้ ไม่ใช่แค่บัญชีตัวเอง</p>
              </div>
            </div>
          )}
          {isSuperAdminEditor && (
            <button
              type="button"
              onClick={handleForceLogout}
              className="mt-3 flex items-center gap-1.5 rounded-xl border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
            >
              <FiSlash size={14} />
              บังคับออกจากระบบทุกอุปกรณ์
            </button>
          )}
          {logoutNotice && <p className="mt-1.5 text-xs text-emerald-600">บังคับออกจากระบบเรียบร้อยแล้ว</p>}
        </div>

        <div className="border-t border-gray-100 pt-6">
          <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-800">
            <FiShield className="text-rose-500" />
            แก้ไขรหัสผ่าน
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">รหัสผ่านใหม่</label>
              <input type="password" placeholder="เว้นว่างไว้หากไม่เปลี่ยนรหัสผ่าน" className={inputClass} {...register('password')} />
              {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">ยืนยันรหัสผ่านใหม่</label>
              <input type="password" className={inputClass} {...register('confirmPassword')} />
              {errors.confirmPassword && <p className="mt-1 text-xs text-red-500">{errors.confirmPassword.message}</p>}
            </div>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-6">
          <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-800">
            <FiLock className="text-rose-500" />
            ข้อมูลระบบ (อ่านอย่างเดียว)
          </h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 flex items-center gap-1 text-sm font-medium text-gray-700">
                  <FiLock size={12} className="text-gray-400" />
                  เข้าใช้งานล่าสุด
                </label>
                <div className={`flex items-center gap-1.5 ${inputClass}`}>
                  <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${isOnline(detail.lastActiveAt) ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                  {formatDateTime(detail.lastActiveAt)}
                </div>
              </div>
              <div>
                <label className="mb-1.5 flex items-center gap-1 text-sm font-medium text-gray-700">
                  <FiLock size={12} className="text-gray-400" />
                  วันที่สร้างบัญชี
                </label>
                <input type="text" disabled value={formatDateTime(detail.createdAt)} readOnly className={inputClass} />
              </div>
            </div>
            <div>
              <label className="mb-1.5 flex items-center gap-1 text-sm font-medium text-gray-700">
                <FiLock size={12} className="text-gray-400" />
                ผู้ที่สร้างบัญชีนี้
              </label>
              <input type="text" disabled value={detail.createdBy} readOnly className={inputClass} />
            </div>
            <div>
              <p className="mb-1.5 text-sm font-medium text-gray-700">ประวัติการเปลี่ยนบทบาท</p>
              {detail.roleHistory.length === 0 ? (
                <p className="rounded-xl bg-gray-50 px-3 py-2 text-xs text-gray-400">ยังไม่มีประวัติการเปลี่ยนบทบาท</p>
              ) : (
                <ul className="space-y-1 rounded-xl bg-gray-50 px-3 py-2">
                  {detail.roleHistory.map((entry, index) => (
                    <li key={index} className="flex items-start gap-1.5 text-xs text-gray-600">
                      <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-gray-400" />
                      {formatDateTime(entry.date)} - {entry.description}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div>
              <p className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-gray-700">
                <FiClock size={13} className="text-gray-400" />
                ประวัติการเข้าสู่ระบบ
                {detail.loginHistory.length > 0 && (
                  <span className="font-normal text-gray-400">({detail.loginHistory.length} รายการ)</span>
                )}
              </p>
              {detail.loginHistory.length === 0 ? (
                <p className="rounded-xl bg-gray-50 px-3 py-2 text-xs text-gray-400">ยังไม่มีประวัติการเข้าสู่ระบบ</p>
              ) : (
                <>
                  <ul className="space-y-1 rounded-xl bg-gray-50 px-3 py-2">
                    {(showAllLogins ? detail.loginHistory : detail.loginHistory.slice(0, 3)).map((entry, index) => (
                      <li key={index} className="flex items-start gap-1.5 text-xs text-gray-600">
                        <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-gray-400" />
                        {formatDateTime(entry.date)} - {parseUserAgent(entry.device)}
                      </li>
                    ))}
                  </ul>
                  {detail.loginHistory.length > 3 && (
                    <button
                      type="button"
                      onClick={() => setShowAllLogins((value) => !value)}
                      className="mt-1.5 text-xs font-medium text-rose-500 hover:underline"
                    >
                      {showAllLogins ? 'ย่อกลับ' : `ดูทั้งหมด (${detail.loginHistory.length} รายการ)`}
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-6">
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 rounded-xl bg-rose-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <FiSave size={16} />
              {isSubmitting ? 'กำลังบันทึก...' : 'บันทึกการเปลี่ยนแปลง'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/admins')}
              className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50"
            >
              ยกเลิก
            </button>
          </div>
          {canEditStatusAndLead && !isSelf && detail.role !== 'super_admin' && (
            <button
              type="button"
              onClick={handleSuspend}
              className="flex items-center gap-2 rounded-xl border border-rose-200 px-5 py-2.5 text-sm font-medium text-rose-500 hover:bg-rose-50"
            >
              <FiSlash size={16} />
              ระงับบัญชี
            </button>
          )}
        </div>
      </form>
    </main>
  )
}
