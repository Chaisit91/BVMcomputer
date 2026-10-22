import { Outlet } from 'react-router-dom';
import { SupportChat } from '../chat/SupportChat';

/**
 * Wraps every step of the PC-upgrade flow so the "ปรึกษาแอดมิน" chat stays available (and keeps
 * its conversation) as the customer moves between steps, without each page having to render it.
 */
export function UpgradeFlowLayout() {
  return (
    <>
      <Outlet />
      <SupportChat />
    </>
  );
}
