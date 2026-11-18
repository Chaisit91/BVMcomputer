import { useState, type ReactNode } from 'react';
import type { IconType } from 'react-icons';
import { FiAlertCircle, FiEdit2, FiFileText, FiInfo, FiMapPin, FiPlus } from 'react-icons/fi';
import { cn } from '../../lib/cn';
import { formatAddress, formatPhone } from '../account/formatAddress';
import { CheckoutAddressModal } from './CheckoutAddressModal';
import { CheckoutTaxModal } from './CheckoutTaxModal';
import { MapPinIllustration, TaxDocumentIllustration } from './CheckoutIllustrations';
import type { CheckoutTaxInvoice, ShippingAddress } from '../../types/api';

interface ShippingInfoSectionProps {
  address: ShippingAddress | null;
  saveAddress: boolean;
  onAddressChange: (address: ShippingAddress, saveAddress: boolean) => void;
  taxRequested: boolean;
  onTaxRequestedChange: (requested: boolean) => void;
  taxInvoice: CheckoutTaxInvoice | null;
  onTaxInvoiceChange: (taxInvoice: CheckoutTaxInvoice) => void;
  /** Set after a submit attempt: which required piece is still missing. */
  missing: { address: boolean; taxInvoice: boolean };
}

/**
 * Checkout step 1 body: the shipping-address card, the "ขอใบกำกับภาษี" checkbox, and — only while
 * that box is ticked — the tax-invoice card beside it. Both cards collect their details in a modal and
 * keep them for this order only; nothing is saved to the account here.
 */
export function ShippingInfoSection({
  address,
  saveAddress,
  onAddressChange,
  taxRequested,
  onTaxRequestedChange,
  taxInvoice,
  onTaxInvoiceChange,
  missing,
}: ShippingInfoSectionProps) {
  const [modal, setModal] = useState<'address' | 'tax' | null>(null);
  const [showTaxNote, setShowTaxNote] = useState(false);

  return (
    <>
      <div className={cn('grid grid-cols-1 gap-4', taxRequested && 'md:grid-cols-2')}>
        <InfoCard icon={FiMapPin} title="ที่อยู่จัดส่งสินค้า" invalid={missing.address}>
          {address ? (
            <FilledDetails
              lines={[
                <span key="name" className="font-semibold text-ink">
                  {address.fullName} <span className="font-normal text-[#596579]">({formatPhone(address.phone)})</span>
                </span>,
                formatAddress({ ...address, addressLine: address.address }),
              ]}
              editLabel="แก้ไขที่อยู่"
              onEdit={() => setModal('address')}
            />
          ) : (
            <EmptyDetails
              illustration={<MapPinIllustration className="h-24 w-40" />}
              title="ยังไม่มีที่อยู่จัดส่ง"
              description="กรุณาเพิ่มที่อยู่สำหรับการจัดส่งสินค้า"
              actionLabel="เพิ่มที่อยู่จัดส่ง"
              onAction={() => setModal('address')}
              error={missing.address ? 'กรุณาเพิ่มที่อยู่จัดส่งก่อนยืนยันการสั่งซื้อ' : undefined}
            />
          )}
        </InfoCard>

        {taxRequested && (
          <InfoCard icon={FiFileText} title="ที่อยู่ออกใบกำกับภาษี" invalid={missing.taxInvoice}>
            {taxInvoice ? (
              <FilledDetails
                lines={[
                  <span key="name" className="font-semibold text-ink">
                    {taxInvoice.name}{' '}
                    <span className="font-normal text-[#596579]">({taxInvoice.payerType === 'company' ? 'นิติบุคคล' : 'บุคคลธรรมดา'})</span>
                  </span>,
                  `เลขประจำตัวผู้เสียภาษี ${taxInvoice.taxId}`,
                  formatAddress(taxInvoice),
                ]}
                editLabel="แก้ไขข้อมูล"
                onEdit={() => setModal('tax')}
              />
            ) : (
              <EmptyDetails
                illustration={<TaxDocumentIllustration className="h-24 w-40" />}
                title="ยังไม่มีข้อมูลใบกำกับภาษี"
                description="กรุณาเพิ่มข้อมูลสำหรับออกใบกำกับภาษี"
                actionLabel="เพิ่มข้อมูลใบกำกับภาษี"
                onAction={() => setModal('tax')}
                error={missing.taxInvoice ? 'กรุณาเพิ่มข้อมูลใบกำกับภาษี หรือยกเลิก “ขอใบกำกับภาษี”' : undefined}
              />
            )}
          </InfoCard>
        )}
      </div>

      <div className="mt-4">
        <div className="flex items-center gap-2">
          <label className="flex cursor-pointer items-center gap-2.5 text-sm font-medium text-[#2B3445]">
            <input
              type="checkbox"
              checked={taxRequested}
              onChange={(e) => onTaxRequestedChange(e.target.checked)}
              className="h-[18px] w-[18px] accent-brand"
            />
            ขอใบกำกับภาษี
          </label>
          <button
            type="button"
            onClick={() => setShowTaxNote((v) => !v)}
            aria-expanded={showTaxNote}
            aria-controls="tax-invoice-note"
            aria-label="ข้อมูลเกี่ยวกับใบกำกับภาษี"
            className="flex h-7 w-7 items-center justify-center rounded-full text-[#7D879C] transition-colors hover:bg-slate-100 hover:text-brand"
          >
            <FiInfo size={17} aria-hidden="true" />
          </button>
        </div>
        {showTaxNote && (
          <p id="tax-invoice-note" className="mt-1.5 text-xs text-[#596579]">
            ติ๊กเลือกเมื่อต้องการใบกำกับภาษีเต็มรูปแบบในนามบุคคลธรรมดาหรือนิติบุคคล แล้วกรอกข้อมูลผู้เสียภาษีในการ์ดที่แสดงขึ้นมา
          </p>
        )}
      </div>

      <CheckoutAddressModal
        open={modal === 'address'}
        address={address}
        saveAddress={saveAddress}
        onClose={() => setModal(null)}
        onSave={(next, save) => {
          onAddressChange(next, save);
          setModal(null);
        }}
      />
      <CheckoutTaxModal
        open={modal === 'tax'}
        taxInvoice={taxInvoice}
        onClose={() => setModal(null)}
        onSave={(next) => {
          onTaxInvoiceChange(next);
          setModal(null);
        }}
      />
    </>
  );
}

function InfoCard({ icon: Icon, title, invalid, children }: { icon: IconType; title: string; invalid: boolean; children: ReactNode }) {
  return (
    <section className={cn('flex min-w-0 flex-col rounded-2xl border bg-white p-5', invalid ? 'border-red-300' : 'border-slate-200')}>
      <h3 className="flex items-center gap-2 text-base font-bold text-ink">
        <Icon size={20} className="shrink-0 text-brand" aria-hidden="true" />
        {title}
      </h3>
      {children}
    </section>
  );
}

function EmptyDetails({
  illustration,
  title,
  description,
  actionLabel,
  onAction,
  error,
}: {
  illustration: ReactNode;
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
  error?: string;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-2 pb-2 pt-4 text-center">
      {illustration}
      <p className="mt-3 text-base font-bold text-ink">{title}</p>
      <p className="mt-1 text-sm text-[#596579]">{description}</p>
      <button
        type="button"
        onClick={onAction}
        className="mt-5 flex h-11 items-center justify-center gap-2 rounded-xl border border-brand bg-white px-6 text-sm font-semibold text-brand transition-colors hover:bg-red-50"
      >
        <FiPlus size={18} aria-hidden="true" />
        {actionLabel}
      </button>
      {error && (
        <p role="alert" className="mt-3 flex items-center gap-1.5 text-xs text-red-500">
          <FiAlertCircle size={13} className="shrink-0" aria-hidden="true" />
          {error}
        </p>
      )}
    </div>
  );
}

function FilledDetails({ lines, editLabel, onEdit }: { lines: ReactNode[]; editLabel: string; onEdit: () => void }) {
  return (
    <div className="mt-4 flex flex-1 flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex min-w-0 flex-col gap-1 text-sm text-[#2B3445]">
        {lines.map((line, index) => (
          <p key={index}>{line}</p>
        ))}
      </div>
      <button
        type="button"
        onClick={onEdit}
        className="flex h-10 shrink-0 items-center justify-center gap-1.5 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-[#2B3445] transition-colors hover:border-brand/40 hover:text-brand"
      >
        <FiEdit2 size={15} aria-hidden="true" />
        {editLabel}
      </button>
    </div>
  );
}
