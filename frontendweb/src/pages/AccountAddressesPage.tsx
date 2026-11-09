import { useEffect, useState } from 'react';
import { BsGeoAltFill } from 'react-icons/bs';
import { FiAlertCircle, FiCheckCircle, FiMapPin, FiPlus } from 'react-icons/fi';
import { AccountLayout } from '../components/account/AccountLayout';
import { AddressCard } from '../components/account/AddressCard';
import { AddressFormModal } from '../components/account/AddressFormModal';
import { ConfirmDeleteAddressDialog } from '../components/account/ConfirmDeleteAddressDialog';
import { RequireLogin } from '../components/account/RequireLogin';
import { ErrorState } from '../components/ui/ErrorState';
import { Skeleton } from '../components/ui/Skeleton';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { clearAddressError, deleteAddress, fetchAddresses, setDefaultAddress } from '../features/address/addressSlice';
import type { SavedAddress } from '../types/api';

/** "บัญชีของฉัน › ที่อยู่สำหรับจัดส่ง" — list, add, edit, delete and choose the default address. */
export function AccountAddressesPage() {
  return (
    <RequireLogin>
      <AddressesContent />
    </RequireLogin>
  );
}

type FormState = { open: false } | { open: true; address: SavedAddress | null };

function AddressesContent() {
  const dispatch = useAppDispatch();
  const { addresses, status, error, mutationStatus, mutationError } = useAppSelector((state) => state.address);
  const [form, setForm] = useState<FormState>({ open: false });
  const [pendingDelete, setPendingDelete] = useState<SavedAddress | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const busy = mutationStatus === 'loading';
  const dialogOpen = form.open || pendingDelete !== null;

  useEffect(() => {
    void dispatch(fetchAddresses());
  }, [dispatch]);

  // Success messages fade out on their own.
  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(null), 3500);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const openForm = (address: SavedAddress | null) => {
    setNotice(null);
    setForm({ open: true, address });
  };

  const handleSaved = (mode: 'create' | 'update') => {
    setForm({ open: false });
    setNotice(mode === 'create' ? 'เพิ่มที่อยู่เรียบร้อยแล้ว' : 'แก้ไขที่อยู่เรียบร้อยแล้ว');
  };

  const askDelete = (address: SavedAddress) => {
    setNotice(null);
    dispatch(clearAddressError());
    setPendingDelete(address);
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    const result = await dispatch(deleteAddress(pendingDelete.id));
    if (deleteAddress.fulfilled.match(result)) {
      setPendingDelete(null);
      setNotice('ลบที่อยู่เรียบร้อยแล้ว');
    }
  };

  const handleSetDefault = async (address: SavedAddress) => {
    if (address.isDefault) return;
    setNotice(null);
    const result = await dispatch(setDefaultAddress(address.id));
    if (setDefaultAddress.fulfilled.match(result)) setNotice('เปลี่ยนที่อยู่หลักเรียบร้อยแล้ว');
  };

  const renderBody = () => {
    if (status === 'failed') return <ErrorState message={error} onRetry={() => void dispatch(fetchAddresses({ force: true }))} />;
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
          <FiMapPin size={20} className="shrink-0 text-[#7D879C]" aria-hidden="true" />
          ยังไม่มีที่อยู่สำหรับจัดส่ง กดปุ่ม “เพิ่มที่อยู่” ด้านบนเพื่อเพิ่มที่อยู่แรกของคุณ
        </div>
      );
    }
    return (
      <div role="radiogroup" aria-label="เลือกที่อยู่หลัก" className="flex flex-col gap-4">
        {addresses.map((address) => (
          <AddressCard
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
      title="ที่อยู่สำหรับจัดส่ง"
      icon={BsGeoAltFill}
      description="จัดการที่อยู่สำหรับรับสินค้าของคุณ"
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
      {notice && (
        <p role="status" className="flex items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          <FiCheckCircle size={16} className="shrink-0" aria-hidden="true" />
          {notice}
        </p>
      )}

      {/* Errors from the radio (set default) — the form and delete dialogs show their own. */}
      {mutationError && !dialogOpen && (
        <p role="alert" className="flex items-center gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-brand">
          <FiAlertCircle size={16} className="shrink-0" aria-hidden="true" />
          {mutationError}
        </p>
      )}

      {renderBody()}

      <AddressFormModal
        open={form.open}
        address={form.open ? form.address : null}
        onClose={() => setForm({ open: false })}
        onSaved={handleSaved}
      />
      <ConfirmDeleteAddressDialog
        address={pendingDelete && { ...pendingDelete, name: pendingDelete.recipientName }}
        deleting={busy}
        error={pendingDelete ? mutationError : null}
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => void confirmDelete()}
      />
    </AccountLayout>
  );
}
