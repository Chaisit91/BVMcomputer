import type { AdminCreateFormValues, AdminEditFormValues } from '../schemas/admin.schema'
import type { AdminAccount, AdminStatus, AdminSummary } from '../types/admin'

// ponytail: mock data stands in for the real endpoints until the backend ships;
// swap the body for an `api.get(...)` call later, callers don't change.
function mockDelay<T>(value: T, ms = 400): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

const admins: AdminAccount[] = [
  {
    id: '1',
    firstName: 'ธนกร',
    lastName: 'จันทร์ดี',
    email: 'thanakorn@bvm.com',
    phone: '081-111-2222',
    jobTitle: 'ผู้ดูแลระบบสูงสุด',
    role: 'super_admin',
    status: 'active',
    lastActiveAt: '30/08/2026 14:30',
    createdAt: '01/01/2026',
    createdBy: '- (บัญชีเริ่มต้นระบบ)',
    roleHistory: [],
    loginHistory: [{ date: '30/08/2026 14:30', device: 'Chrome, Windows' }],
    notes: '',
  },
  {
    id: '2',
    firstName: 'สมชาย',
    lastName: 'มีสุข',
    email: 'somchai@bvm.com',
    phone: '089-123-4567',
    jobTitle: 'ผู้จัดการคลัง',
    role: 'inventory_manager',
    status: 'active',
    lastActiveAt: '30/08/2026 10:15',
    createdAt: '15/01/2026',
    createdBy: 'ธนกร จันทร์ดี (Super Admin)',
    roleHistory: [
      { date: '15/01/2026', description: "ตั้งค่าเป็น 'พนักงานคลัง' โดย ธนกร จันทร์ดี" },
      { date: '20/03/2026', description: "เปลี่ยนเป็น 'ผู้จัดการคลัง' โดย ธนกร จันทร์ดี" },
    ],
    loginHistory: [
      { date: '30/08/2026 10:15', device: 'Chrome, Windows' },
      { date: '29/08/2026 09:30', device: 'Chrome, Windows' },
      { date: '28/08/2026 14:22', device: 'Safari, macOS' },
    ],
    notes: '',
  },
  {
    id: '3',
    firstName: 'วรรณา',
    lastName: 'สุขใจ',
    email: 'wanna@bvm.com',
    phone: '086-222-3333',
    jobTitle: 'ผู้จัดการคลัง',
    role: 'inventory_manager',
    status: 'active',
    lastActiveAt: '29/08/2026 16:45',
    createdAt: '10/02/2026',
    createdBy: 'ธนกร จันทร์ดี (Super Admin)',
    roleHistory: [],
    loginHistory: [],
    notes: '',
  },
  {
    id: '4',
    firstName: 'อนุชา',
    lastName: 'พงษ์ไทย',
    email: 'anucha@bvm.com',
    phone: '082-333-4444',
    jobTitle: 'พนักงานขาย',
    role: 'sales_staff',
    status: 'active',
    lastActiveAt: '30/08/2026 09:00',
    createdAt: '05/03/2026',
    createdBy: 'ธนกร จันทร์ดี (Super Admin)',
    roleHistory: [],
    loginHistory: [],
    notes: '',
  },
  {
    id: '5',
    firstName: 'พิมพ์ชนก',
    lastName: 'รักดี',
    email: 'pimchanok@bvm.com',
    phone: '083-444-5555',
    jobTitle: 'พนักงานขาย',
    role: 'sales_staff',
    status: 'active',
    lastActiveAt: '28/08/2026 11:20',
    createdAt: '12/04/2026',
    createdBy: 'ธนกร จันทร์ดี (Super Admin)',
    roleHistory: [],
    loginHistory: [],
    notes: '',
  },
  {
    id: '6',
    firstName: 'ธีรวัฒน์',
    lastName: 'แก้วมณี',
    email: 'teerawat@bvm.com',
    phone: '084-555-6666',
    jobTitle: 'ผู้ดูแลเนื้อหา',
    role: 'content_moderator',
    status: 'inactive',
    lastActiveAt: '15/08/2026 08:00',
    createdAt: '01/06/2026',
    createdBy: 'ธนกร จันทร์ดี (Super Admin)',
    roleHistory: [],
    loginHistory: [],
    notes: '',
  },
]

export function getAdminSummary(): Promise<AdminSummary> {
  return mockDelay({
    totalCount: admins.length,
    activeCount: admins.filter((a) => a.status === 'active').length,
    inactiveCount: admins.filter((a) => a.status === 'inactive').length,
  })
}

export function getAdmins(): Promise<AdminAccount[]> {
  return mockDelay(admins)
}

export function getAdminDetail(id: string): Promise<AdminAccount | null> {
  return mockDelay(admins.find((item) => item.id === id) ?? null)
}

export function saveAdmin(_id: string, _data: AdminEditFormValues): Promise<void> {
  return mockDelay(undefined)
}

export function createAdmin(_data: AdminCreateFormValues): Promise<{ id: string }> {
  return mockDelay({ id: String(admins.length + 1) })
}

export function updateAdminStatus(_id: string, _status: AdminStatus): Promise<void> {
  return mockDelay(undefined)
}

export function forceLogoutAdmin(_id: string): Promise<void> {
  return mockDelay(undefined)
}
