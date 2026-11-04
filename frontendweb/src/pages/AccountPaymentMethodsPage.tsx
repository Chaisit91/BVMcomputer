import { useEffect, useState } from 'react';
import { BsCreditCard2FrontFill } from 'react-icons/bs';
import { FiAlertCircle, FiCheckCircle, FiCreditCard, FiInfo, FiPlus } from 'react-icons/fi';
import { AccountLayout } from '../components/account/AccountLayout';
import { AddCardModal } from '../components/account/AddCardModal';
import { ConfirmDeleteCardDialog } from '../components/account/ConfirmDeleteCardDialog';
import { PaymentMethodCard } from '../components/account/PaymentMethodCard';
import { RequireLogin } from '../components/account/RequireLogin';
import { ErrorState } from '../components/ui/ErrorState';
import { Skeleton } from '../components/ui/Skeleton';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import {
  clearPaymentMethodError,
  deletePaymentMethod,
  fetchPaymentMethods,
  setDefaultPaymentMethod,
} from '../features/paymentMethod/paymentMethodSlice';
import type { PaymentMethod } from '../types/api';

/** "บัญชีของฉัน › ช่องทางชำระเงิน" — saved cards: add, delete and choose the default. */
export function AccountPaymentMethodsPage() {
  return (
    <RequireLogin>
      <PaymentMethodsContent />
    </RequireLogin>
  );
}

function PaymentMethodsContent() {
  const dispatch = useAppDispatch();
  const { methods, status, error, source, mutationStatus, mutationError } = useAppSelector((state) => state.paymentMethod);
  const [adding, setAdding] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<PaymentMethod | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const busy = mutationStatus === 'loading';
  const dialogOpen = adding || pendingDelete !== null;

  useEffect(() => {
    void dispatch(fetchPaymentMethods());
  }, [dispatch]);

  // Success messages fade out on their own.
  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(null), 3500);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const openAdd = () => {
    setNotice(null);
    setAdding(true);
  };

  const askDelete = (method: PaymentMethod) => {
    setNotice(null);
    dispatch(clearPaymentMethodError());
    setPendingDelete(method);
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    const result = await dispatch(deletePaymentMethod(pendingDelete.id));
    if (deletePaymentMethod.fulfilled.match(result)) {
      setPendingDelete(null);
      setNotice('ลบบัตรเรียบร้อยแล้ว');
    }
  };

  const handleSetDefault = async (method: PaymentMethod) => {
    if (method.isDefault) return;
    setNotice(null);
    const result = await dispatch(setDefaultPaymentMethod(method.id));
    if (setDefaultPaymentMethod.fulfilled.match(result)) setNotice('เปลี่ยนบัตรเริ่มต้นเรียบร้อยแล้ว');
  };

  const renderBody = () => {
    if (status === 'failed') return <ErrorState message={error} onRetry={() => void dispatch(fetchPaymentMethods({ force: true }))} />;
    if (status === 'idle' || status === 'loading') {
      return (
        <div className="flex flex-col gap-4">
          <Skeleton className="h-[104px] rounded-2xl" />
          <Skeleton className="h-[104px] rounded-2xl" />
        </div>
      );
    }
    if (methods.length === 0) {
      return (
        <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white px-5 py-6 text-sm text-slate-500 shadow-card">
          <FiCreditCard size={20} className="shrink-0 text-[#7D879C]" aria-hidden="true" />
          ยังไม่มีบัตรที่บันทึกไว้ กดปุ่ม “เพิ่มบัตร” ด้านบนเพื่อเพิ่มบัตรใบแรกของคุณ
        </div>
      );
    }
    return (
      <div role="radiogroup" aria-label="เลือกบัตรเริ่มต้น" className="flex flex-col gap-4">
        {methods.map((method) => (
          <PaymentMethodCard
            key={method.id}
            method={method}
            busy={busy}
            onSetDefault={() => void handleSetDefault(method)}
            onDelete={() => askDelete(method)}
          />
        ))}
      </div>
    );
  };

  return (
    <AccountLayout
      title="ช่องทางชำระเงิน"
      icon={BsCreditCard2FrontFill}
      description="จัดการบัตรเครดิต / เดบิตที่ใช้ในการชำระเงิน"
      actions={
        <button
          type="button"
          onClick={openAdd}
          disabled={busy || status !== 'succeeded'}
          className="flex h-11 shrink-0 items-center gap-2 rounded-xl bg-brand px-5 text-sm font-semibold text-white transition-colors hover:bg-brand-dark disabled:opacity-60"
        >
          <FiPlus size={18} aria-hidden="true" />
          เพิ่มบัตร
        </button>
      }
    >
      <p className="flex items-start gap-2.5 rounded-xl border border-sky-100 bg-sky-50 px-4 py-3 text-sm text-[#2B3445]">
        <FiInfo size={17} className="mt-0.5 shrink-0 text-sky-600" aria-hidden="true" />
        <span>
          <span className="font-bold text-ink">หมายเหตุ:</span> MAXCOM ไม่จัดเก็บหมายเลขบัตรเต็มและรหัส CVV
          ระบบบันทึกเพียง 4 หลักท้ายของบัตรเพื่อให้คุณเลือกใช้ได้สะดวก
        </span>
      </p>

      {notice && (
        <p role="status" className="flex items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          <FiCheckCircle size={16} className="shrink-0" aria-hidden="true" />
          {notice}
          {source === 'demo' && <span className="text-emerald-600/80">(บันทึกไว้ในเบราว์เซอร์นี้)</span>}
        </p>
      )}

      {/* Errors from the radio (set default) — the add and delete dialogs show their own. */}
      {mutationError && !dialogOpen && (
        <p role="alert" className="flex items-center gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-brand">
          <FiAlertCircle size={16} className="shrink-0" aria-hidden="true" />
          {mutationError}
        </p>
      )}

      {source === 'demo' && (
        <p className="flex items-center gap-2 rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          <FiInfo size={16} className="shrink-0" aria-hidden="true" />
          โหมดทดลอง: ยังไม่ได้เชื่อมต่อระบบชำระเงิน บัตรที่เพิ่มใช้ชำระเงินจริงไม่ได้ และบันทึกไว้ในเบราว์เซอร์นี้เท่านั้น
        </p>
      )}

      {renderBody()}

      <AddCardModal
        open={adding}
        isFirst={methods.length === 0}
        demo={source === 'demo'}
        onClose={() => setAdding(false)}
        onSaved={() => {
          setAdding(false);
          setNotice('เพิ่มบัตรเรียบร้อยแล้ว');
        }}
      />
      <ConfirmDeleteCardDialog
        method={pendingDelete}
        deleting={busy}
        error={pendingDelete ? mutationError : null}
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => void confirmDelete()}
      />
    </AccountLayout>
  );
}
