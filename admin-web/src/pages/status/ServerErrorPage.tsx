import { FiAlertTriangle } from 'react-icons/fi'
import { StatusPage } from '../../components/status/StatusPage'

export function ServerErrorPage() {
  return (
    <StatusPage
      code="500"
      title="เกิดข้อผิดพลาดบางอย่าง"
      message="ระบบขัดข้องชั่วคราว ลองโหลดหน้านี้ใหม่อีกครั้ง หากยังไม่หายให้แจ้งผู้ดูแลระบบ"
      icon={<FiAlertTriangle size={28} />}
      actionLabel="โหลดหน้าใหม่"
      onAction={() => window.location.reload()}
    />
  )
}
