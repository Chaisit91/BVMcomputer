import { FiLock } from 'react-icons/fi'
import { StatusPage } from '../../components/status/StatusPage'

export function ForbiddenPage() {
  return (
    <StatusPage
      code="403"
      title="ไม่มีสิทธิ์เข้าถึงหน้านี้"
      message="บทบาทของคุณไม่สามารถเข้าถึงส่วนนี้ได้ ติดต่อผู้ดูแลระบบสูงสุดหากคิดว่าควรมีสิทธิ์เข้าถึง"
      icon={<FiLock size={28} />}
      actionLabel="กลับหน้าแดชบอร์ด"
      actionTo="/dashboard"
    />
  )
}
