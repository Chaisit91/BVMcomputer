import { useEffect, useState } from 'react';
import { BsGeoAltFill } from 'react-icons/bs';
import { FiAlertCircle, FiCheckCircle, FiFileText, FiInfo, FiPlus } from 'react-icons/fi';
import { AccountLayout } from '../components/account/AccountLayout';
import { ConfirmDeleteAddressDialog } from '../components/account/ConfirmDeleteAddressDialog';
import { RequireLogin } from '../components/account/RequireLogin';
import { TaxAddressCard } from '../components/account/TaxAddressCard';
import { TaxAddressFormModal } from '../components/account/TaxAddressFormModal';
import { ErrorState } from '../components/ui/ErrorState';
import { Skeleton } from '../components/ui/Skeleton';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import {
  clearTaxAddressError,
  deleteTaxAddress,
  fetchTaxAddresses,
  setDefaultTaxAddress,
} from '../features/taxAddress/taxAddressSlice';
import type { TaxAddress } from '../types/api';

/** "บัญชีของฉัน › ที่อยู่สำหรับออกใบกำกับภาษี" — list, add, edit, delete and choose the default. */
export function AccountTaxAddressesPage() {
  return (
    <RequireLogin>
      <TaxAddressesContent />
    </RequireLogin>
  );
}

type FormState = { open: false } | { open: true; address: TaxAddress | null };

function TaxAddressesContent() {
  const dispatch = useAppDispatch();
  const { addresses, status, error, source, mutationStatus, mutationError } = useAppSelector((state) => state.taxAddress);
  const [form, setForm] = useState<FormState>({ open: false });
  const [pendingDelete, setPendingDelete] = useState<TaxAddress | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const busy = mutationStatus === 'loading';
  const dialogOpen = form.open || pendingDelete !== null;

  useEffect(() => {
    void dispatch(fetchTaxAddresses());
  }, [dispatch]);

  // Success messages fade out on their own.
  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(null), 3500);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const openForm = (address: TaxAddress | null) => {
    setNotice(null);
    setForm({ open: true, address });
  };

  const handleSaved = (mode: 'create' | 'update') => {
    setForm({ open: false });
    setNotice(mode === 'create' ? 'เพิ่มที่อยู่สำหรับออกใบกำกับภาษีเรียบร้อยแล้ว' : 'แก้ไขที่อยู่สำหรับออกใบกำกับภาษีเรียบร้อยแล้ว');
  };

  const askDelete = (address: TaxAddress) => {
    setNotice(null);
    dispatch(clearTaxAddressError());
    setPendingDelete(address);
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    const result = await dispatch(deleteTaxAddress(pendingDelete.id));
    if (deleteTaxAddress.fulfilled.match(result)) {
      setPendingDelete(null);
      setNotice('ลบที่อยู่เรียบร้อยแล้ว');
    }
  };

  const handleSetDefault = async (address: TaxAddress) => {
    if (address.isDefault) return;
    setNotice(null);
    const result = await dispatch(setDefaultTaxAddress(address.id));
    if (setDefaultTaxAddress.fulfilled.match(result)) setNotice('เปลี่ยนที่อยู่หลักเรียบร้อยแล้ว');
  };

  const renderBody = () => {
    if (status === 'failed') return <ErrorState message={error} onRetry={() => void dispatch(fetchTaxAddresses({ force: true }))} />;
    if (status === 'idle' || status === 'loading') {
      return (
        <div className="flex flex-col gap-4">
          <Skeleton className="h-[120px] rounded-2xl" />
          <Skeleton className="h-[120px] rounded-2xl" />
        </div>
      );
    }
    if (addresses.length === 0) {
      return (
        <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white px-5 py-6 text-sm text-slate-500 shadow-card">
          <FiFileText size={20} className="shrink-0 text-[#7D879C]" aria-hidden="true" />
          ยังไม่มีที่อยู่สำหรับออกใบกำกับภาษี กดปุ่ม “เพิ่มที่อยู่” ด้านบนเพื่อเพิ่มที่อยู่แรกของคุณ
        </div>
      );
    }
    return (
      <div role="radiogroup" aria-label="เลือกที่อยู่หลักสำหรับออกใบกำกับภาษี" className="flex flex-col gap-4">
        {addresses.map((address) => (
          <TaxAddressCard
            key={address.id}
            address={address}
            busy={busy}
            onSetDefault={() => void handleSetDefault(address)}
            onEdit={() => openForm(address)}
            onDelete={() => askDelete(address)}
          />
        ))}
      </div>
    );
  };

  return (
    <AccountLayout
      title="ที่อยู่สำหรับออกใบกำกับภาษี"
      icon={BsGeoAltFill}
      description="จัดการข้อมูลที่อยู่สำหรับออกใบกำกับภาษีและใบเสร็จรับเงินของคุณ"
      actions={
        <button
          type="button"
          onClick={() => openForm(null)}
          disabled={busy || status !== 'succeeded'}
          className="flex h-11 shrink-0 items-center gap-2 rounded-xl bg-brand px-5 text-sm font-semibold text-white transition-colors hover:bg-brand-dark disabled:opacity-60"
        >
          <FiPlus size={18} aria-hidden="true" />
          เพิ่มที่อยู่
        </button>
      }
    >
      <p className="flex items-start gap-2.5 rounded-xl border border-sky-100 bg-sky-50 px-4 py-3 text-sm text-[#2B3445]">
        <FiInfo size={17} className="mt-0.5 shrink-0 text-sky-600" aria-hidden="true" />
        <span>
          <span className="font-bold text-ink">หมายเหตุ:</span> ใช้สำหรับออกใบกำกับภาษีในนามบุคคลธรรมดาหรือนิติบุคคล
          กรุณาตรวจสอบข้อมูลให้ถูกต้องก่อนบันทึก
        </span>
      </p>

      {notice && (
        <p role="status" className="flex items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          <FiCheckCircle size={16} className="shrink-0" aria-hidden="true" />
          {notice}
          {source === 'demo' && <span className="text-emerald-600/80">(บันทึกไว้ในเบราว์เซอร์นี้)</span>}
        </p>
      )}

      {/* Errors from the radio (set default) — the form and delete dialogs show their own. */}
      {mutationError && !dialogOpen && (
        <p role="alert" className="flex items-center gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-brand">
          <FiAlertCircle size={16} className="shrink-0" aria-hidden="true" />
          {mutationError}
        </p>
      )}

      {source === 'demo' && (
        <p className="flex items-center gap-2 rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          <FiInfo size={16} className="shrink-0" aria-hidden="true" />
          โหมดทดลอง: ยังไม่ได้เชื่อมต่อระบบ ที่อยู่บันทึกไว้ในเบราว์เซอร์นี้เท่านั้น
        </p>
      )}

      {renderBody()}

      <TaxAddressFormModal
        open={form.open}
        address={form.open ? form.address : null}
        isFirst={addresses.length === 0}
        onClose={() => setForm({ open: false })}
        onSaved={handleSaved}
      />
      <ConfirmDeleteAddressDialog
        address={pendingDelete}
        deleting={busy}
        error={pendingDelete ? mutationError : null}
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => void confirmDelete()}
      />
    </AccountLayout>
  );
}
