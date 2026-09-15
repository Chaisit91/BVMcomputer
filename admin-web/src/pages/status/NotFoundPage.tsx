import { FiCompass } from 'react-icons/fi'
import { StatusPage } from '../../components/status/StatusPage'

export function NotFoundPage() {
  return (
    <StatusPage
      code="404"
      title="ไม่พบหน้าที่คุณค้นหา"
      message="ลิงก์นี้อาจถูกย้ายหรือไม่มีอยู่จริง ลองกลับไปที่หน้าแดชบอร์ดอีกครั้ง"
      icon={<FiCompass size={28} />}
      actionLabel="กลับหน้าแดชบอร์ด"
      actionTo="/dashboard"
    />
  )
}
