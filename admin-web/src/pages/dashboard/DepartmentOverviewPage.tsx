import type { ReactNode } from 'react'
import { FiBox, FiImage, FiShoppingCart } from 'react-icons/fi'
import { useAppSelector } from '../../store/hooks'
import type { AdminRole } from '../../types/admin'

type DepartmentRole = Exclude<AdminRole, 'super_admin'>

const DEPARTMENT_INFO: Record<DepartmentRole, { title: string; tagline: string; icon: ReactNode; color: string; duties: string[] }> = {
  inventory_manager: {
    title: 'ฝ่ายคลังสินค้า',
    tagline: 'ดูแลสินค้าทุกหมวดที่ร้านขาย ตั้งแต่ชิ้นส่วนคอมไปจนถึงคอมประกอบสำเร็จ',
    icon: <FiBox size={28} />,
    color: 'bg-blue-50 text-blue-600',
    duties: [
      'เพิ่ม/แก้ไข/ลบสินค้าทุกหมวด: ซีพียู, การ์ดจอ, เมนบอร์ด, แรม, สตอเรจ, พาวเวอร์ซัพพลาย, เคส, ชุดระบายความร้อน',
      'จัดการคอมตั้งโต๊ะสำเร็จรูป, โปรโมชั่นเซ็ต, จัดสเปคคอม, งานอัพเกรดคอม',
      'อัปเดตราคาและจำนวนสต็อกให้ตรงกับของจริง',
      'อัปโหลดรูปสินค้า',
    ],
  },
  sales_staff: {
    title: 'ฝ่ายคำสั่งซื้อและบริการลูกค้า',
    tagline: 'ดูแลคำสั่งซื้อของลูกค้าตั้งแต่สั่งจนถึงมือ พร้อมดูแลบัญชีลูกค้า',
    icon: <FiShoppingCart size={28} />,
    color: 'bg-emerald-50 text-emerald-600',
    duties: [
      'ดูและอัปเดตสถานะคำสั่งซื้อ (รอดำเนินการ → เตรียมสินค้า → จัดส่ง → สำเร็จ/ยกเลิก)',
      'ใส่เลขพัสดุ ตรวจสลิปโอนเงินที่ลูกค้าอัปโหลด',
      'ดูข้อมูลลูกค้าและประวัติการสั่งซื้อ',
      'ปรับสถานะบัญชีลูกค้า (active/inactive/suspended)',
    ],
  },
  content_moderator: {
    title: 'ฝ่ายเนื้อหาและโปรโมชั่น',
    tagline: 'ดูแลแบนเนอร์และโปรโมชั่นที่แสดงหน้าร้าน',
    icon: <FiImage size={28} />,
    color: 'bg-amber-50 text-amber-600',
    duties: [
      'เพิ่ม/แก้ไข/ลบแบนเนอร์หน้าร้าน',
      'กำหนดช่วงเวลาที่แบนเนอร์แต่ละอันแสดงผล',
      'เปิด/ปิดการแสดงแบนเนอร์ได้เอง',
    ],
  },
}

export function DepartmentOverviewPage() {
  const currentUser = useAppSelector((state) => state.auth.user)
  const role = currentUser?.role
  if (!role || role === 'super_admin') return null
  const info = DEPARTMENT_INFO[role]

  return (
    <main className="mx-auto max-w-4xl space-y-6 px-6 py-10">
      <div className="flex items-center gap-4">
        <span className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${info.color}`}>{info.icon}</span>
        <div>
          <h1 className="text-xl font-bold text-gray-900">{info.title}</h1>
          <p className="text-sm text-gray-400">{info.tagline}</p>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-6">
        <h2 className="mb-4 text-sm font-semibold text-gray-800">หน้าที่และความรับผิดชอบ</h2>
        <ul className="space-y-3">
          {info.duties.map((duty) => (
            <li key={duty} className="flex items-start gap-3 text-sm text-gray-600">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-rose-400" />
              {duty}
            </li>
          ))}
        </ul>
      </div>

      {currentUser?.isTeamLead && (
        <div className="rounded-2xl border border-gray-100 bg-white p-6">
          <h2 className="mb-2 text-sm font-semibold text-gray-800">ในฐานะหัวหน้าแผนก</h2>
          <p className="text-sm text-gray-600">
            คุณเห็นและแก้ไขข้อมูลทั่วไป (ชื่อ, เบอร์โทร, ตำแหน่งงาน, สถานะ) ของทุกคนในแผนกนี้ได้ที่เมนู{' '}
            <span className="font-medium text-gray-800">ผู้ดูแลระบบ</span> — ยกเว้นอีเมล/รหัสผ่านของผู้อื่น และบัญชีของหัวหน้าแผนกคนอื่น ซึ่งแก้ไขได้เฉพาะเจ้าของบัญชีหรือผู้ดูแลระบบสูงสุดเท่านั้น
          </p>
        </div>
      )}
    </main>
  )
}
