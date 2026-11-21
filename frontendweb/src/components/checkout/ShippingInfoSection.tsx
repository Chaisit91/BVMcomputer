import { useState, type ReactNode } from 'react';
import * as Tooltip from '@radix-ui/react-tooltip';
import type { IconType } from 'react-icons';
import { FiAlertCircle, FiEdit2, FiFileText, FiInfo, FiMapPin, FiPlus, FiRefreshCw } from 'react-icons/fi';
import { cn } from '../../lib/cn';
import { formatAddress, formatPhone } from '../account/formatAddress';
import { Skeleton } from '../ui/Skeleton';
import { CheckoutAddressModal } from './CheckoutAddressModal';
import { CheckoutTaxModal } from './CheckoutTaxModal';
import { MapPinIllustration, TaxDocumentIllustration } from './CheckoutIllustrations';
import { SavedAddressPicker, type PickerOption } from './SavedAddressPicker';
import type { CheckoutTaxInvoice, RequestStatus, SavedAddress, ShippingAddress, TaxAddress } from '../../types/api';

/** One of the signed-in customer's saved lists (from the account's own address slices). */
interface SavedList<T> {
  items: T[];
  status: RequestStatus;
  error: string | null;
  onRetry: () => void;
  /** The one used for this order (falls back to the account default) — null when the list is empty. */
  selected: T | null;
  /** Choose another saved one for this order only; the account default stays as it is. */
  onSelect: (id: string) => void;
}

/**
 * Signed-in customers: addresses come from the account. Adding one goes to the account page
 * (its own modal), which then brings the customer back here with the new one selected.
 */
export interface AccountAddressBook {
  addresses: SavedList<SavedAddress>;
  taxAddresses: SavedList<TaxAddress>;
  onAdd: (kind: 'address' | 'tax') => void;
}

const shippingLines = (address: SavedAddress): ReactNode[] => [
  <span key="name" className="font-semibold text-ink">
    {address.recipientName} <span className="font-normal text-[#596579]">({formatPhone(address.phone)})</span>
  </span>,
  formatAddress(address),
];

const taxLines = (tax: CheckoutTaxInvoice): ReactNode[] => [
  <span key="name" className="font-semibold text-ink">
    {tax.name} <span className="font-normal text-[#596579]">({tax.payerType === 'company' ? 'นิติบุคคล' : 'บุคคลธรรมดา'})</span>
  </span>,
  `เลขประจำตัวผู้เสียภาษี ${tax.taxId}`,
  formatAddress(tax),
];

/**
 * Card row layout (from md up; phones always stack full width).
 * - One card with saved details: the column is only as wide as its content (never wider than the
 *   row; long addresses still wrap), so the pencil sits next to the text, not at the far edge.
 *   A single empty-state card keeps the full width it always had.
 * - Two cards side by side: one shared height only when both show saved details (similar amounts
 *   of text). If either still shows its taller empty state, each keeps its own content height.
 */
const cardGridClass = (taxRequested: boolean, shippingFilled: boolean, taxFilled: boolean) =>
  cn(
    'grid grid-cols-1 gap-4',
    !taxRequested && shippingFilled && 'md:grid-cols-[fit-content(100%)]',
    taxRequested && 'md:grid-cols-2',
    taxRequested && !(shippingFilled && taxFilled) && 'md:items-start',
  );

const toOptions =<T extends { id: string; isDefault: boolean }>(items: T[], lines: (item: T) => ReactNode[]): PickerOption[] =>
  items.map((item) => ({ id: item.id, isDefault: item.isDefault, lines: lines(item) }));

interface ShippingInfoSectionProps {
  /** Present for signed-in customers — then the guest props below (address / taxInvoice and their handlers) are unused. */
  account?: AccountAddressBook;
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
 * that box is ticked — the tax-invoice card beside it.
 * - Signed in (`account`): both cards show the customer's saved account addresses; adding one goes to
 *   the account page, and "เปลี่ยน" picks another saved one for this order.
 * - Guest: both cards collect their details in a modal and keep them for this order only.
 */
export function ShippingInfoSection({
  account,
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

  const addressEmpty = (
    <EmptyDetails
      illustration={<MapPinIllustration className="h-24 w-40" />}
      title="ยังไม่มีที่อยู่จัดส่ง"
      description="กรุณาเพิ่มที่อยู่สำหรับการจัดส่งสินค้า"
      actionLabel="เพิ่มที่อยู่จัดส่ง"
      onAction={() => (account ? account.onAdd('address') : setModal('address'))}
      error={missing.address ? 'กรุณาเพิ่มที่อยู่จัดส่งก่อนยืนยันการสั่งซื้อ' : undefined}
    />
  );
  const taxEmpty = (
    <EmptyDetails
      illustration={<TaxDocumentIllustration className="h-24 w-40" />}
      title="ยังไม่มีข้อมูลใบกำกับภาษี"
      description="กรุณาเพิ่มข้อมูลสำหรับออกใบกำกับภาษี"
      actionLabel="เพิ่มข้อมูลใบกำกับภาษี"
      onAction={() => (account ? account.onAdd('tax') : setModal('tax'))}
      error={missing.taxInvoice ? 'กรุณาเพิ่มข้อมูลใบกำกับภาษี หรือยกเลิก “ขอใบกำกับภาษี”' : undefined}
    />
  );

  if (account) {
    const { addresses, taxAddresses } = account;
    return (
      <>
        <div className={cardGridClass(taxRequested, Boolean(addresses.selected), Boolean(taxAddresses.selected))}>
          {/* The pencil sits in the card header, and only once there's a saved one to change. */}
          <InfoCard
            icon={FiMapPin}
            title="ที่อยู่จัดส่งสินค้า"
            invalid={missing.address}
            action={addresses.selected && <EditIconButton label="เปลี่ยนที่อยู่" onClick={() => setModal('address')} />}
          >
            <SavedListBody list={addresses} empty={addressEmpty} lines={shippingLines} />
          </InfoCard>

          {taxRequested && (
            <InfoCard
              icon={FiFileText}
              title="ที่อยู่ออกใบกำกับภาษี"
              invalid={missing.taxInvoice}
              action={taxAddresses.selected && <EditIconButton label="เปลี่ยนที่อยู่" onClick={() => setModal('tax')} />}
            >
              <SavedListBody list={taxAddresses} empty={taxEmpty} lines={taxLines} />
            </InfoCard>
          )}
        </div>

        <TaxRequestToggle
          taxRequested={taxRequested}
          onTaxRequestedChange={onTaxRequestedChange}
          showTaxNote={showTaxNote}
          onToggleNote={() => setShowTaxNote((v) => !v)}
        />

        {modal === 'address' && (
          <SavedAddressPicker
            icon={FiMapPin}
            title="เลือกที่อยู่จัดส่ง"
            description="เลือกที่อยู่สำหรับคำสั่งซื้อนี้ (ไม่เปลี่ยนที่อยู่หลักในบัญชี)"
            options={toOptions(addresses.items, shippingLines)}
            selectedId={addresses.selected?.id ?? null}
            onSelect={(id) => {
              addresses.onSelect(id);
              setModal(null);
            }}
            onAddNew={() => account.onAdd('address')}
            addNewLabel="เพิ่มที่อยู่จัดส่งใหม่"
            onClose={() => setModal(null)}
          />
        )}
        {modal === 'tax' && (
          <SavedAddressPicker
            icon={FiFileText}
            title="เลือกข้อมูลใบกำกับภาษี"
            description="เลือกข้อมูลสำหรับออกใบกำกับภาษีของคำสั่งซื้อนี้ (ไม่เปลี่ยนค่าหลักในบัญชี)"
            options={toOptions(taxAddresses.items, taxLines)}
            selectedId={taxAddresses.selected?.id ?? null}
            onSelect={(id) => {
              taxAddresses.onSelect(id);
              setModal(null);
            }}
            onAddNew={() => account.onAdd('tax')}
            addNewLabel="เพิ่มข้อมูลใบกำกับภาษีใหม่"
            onClose={() => setModal(null)}
          />
        )}
      </>
    );
  }

  return (
    <>
      <div className={cardGridClass(taxRequested, Boolean(address), Boolean(taxInvoice))}>
        <InfoCard
          icon={FiMapPin}
          title="ที่อยู่จัดส่งสินค้า"
          invalid={missing.address}
          action={address && <EditIconButton label="แก้ไขที่อยู่" onClick={() => setModal('address')} />}
        >
          {address ? (
            <FilledDetails
              lines={[
                <span key="name" className="font-semibold text-ink">
                  {address.fullName} <span className="font-normal text-[#596579]">({formatPhone(address.phone)})</span>
                </span>,
                formatAddress({ ...address, addressLine: address.address }),
              ]}
            />
          ) : (
            addressEmpty
          )}
        </InfoCard>

        {taxRequested && (
          <InfoCard
            icon={FiFileText}
            title="ที่อยู่ออกใบกำกับภาษี"
            invalid={missing.taxInvoice}
            action={taxInvoice && <EditIconButton label="แก้ไขข้อมูล" onClick={() => setModal('tax')} />}
          >
            {taxInvoice ? <FilledDetails lines={taxLines(taxInvoice)} /> : taxEmpty}
          </InfoCard>
        )}
      </div>

      <TaxRequestToggle
        taxRequested={taxRequested}
        onTaxRequestedChange={onTaxRequestedChange}
        showTaxNote={showTaxNote}
        onToggleNote={() => setShowTaxNote((v) => !v)}
      />

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

/** Card body for a saved account list: loading → error → selected one → empty state. ("เปลี่ยนที่อยู่" lives in the card header.) */
function SavedListBody<T>({ list, empty, lines }: { list: SavedList<T>; empty: ReactNode; lines: (item: T) => ReactNode[] }) {
  // Already-loaded items stay on screen during a background refresh.
  if (list.items.length === 0 && (list.status === 'idle' || list.status === 'loading')) {
    return (
      <div className="mt-4 flex flex-col gap-2" aria-busy="true">
        <Skeleton className="h-4 w-2/3 rounded" />
        <Skeleton className="h-4 w-full rounded" />
      </div>
    );
  }
  if (list.items.length === 0 && list.status === 'failed') {
    return (
      <div className="mt-4 flex flex-col items-start gap-2 text-sm">
        <p role="alert" className="flex items-center gap-1.5 text-red-500">
          <FiAlertCircle size={14} className="shrink-0" aria-hidden="true" />
          {list.error ?? 'โหลดข้อมูลไม่สำเร็จ'}
        </p>
        <button
          type="button"
          onClick={list.onRetry}
          className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-[#2B3445] hover:border-brand/40 hover:text-brand"
        >
          <FiRefreshCw size={13} aria-hidden="true" />
          ลองใหม่
        </button>
      </div>
    );
  }
  if (list.selected) return <FilledDetails lines={lines(list.selected)} />;
  return <>{empty}</>;
}

/**
 * Pencil-only header action (no frame, no background): navy, red on hover/focus, with a tooltip.
 * `label` is both the tooltip and the accessible name, since there's no visible text.
 */
function EditIconButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <Tooltip.Provider delayDuration={150}>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <button
            type="button"
            onClick={onClick}
            aria-label={label}
            // 36px hit area for touch; -my/-mr keep the header row at the title's height and the
            // glyph lined up with the card's right padding.
            className="-my-1.5 -mr-2 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[#2B3445] outline-none transition-colors hover:text-brand focus-visible:text-brand focus-visible:ring-2 focus-visible:ring-brand/30"
          >
            <FiEdit2 size={19} aria-hidden="true" />
          </button>
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            side="top"
            sideOffset={4}
            className="z-50 rounded-md bg-ink px-2.5 py-1.5 text-xs font-medium text-white shadow-card"
          >
            {label}
            <Tooltip.Arrow className="fill-ink" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
}

function TaxRequestToggle({
  taxRequested,
  onTaxRequestedChange,
  showTaxNote,
  onToggleNote,
}: {
  taxRequested: boolean;
  onTaxRequestedChange: (requested: boolean) => void;
  showTaxNote: boolean;
  onToggleNote: () => void;
}) {
  return (
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
          onClick={onToggleNote}
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
  );
}

function InfoCard({
  icon: Icon,
  title,
  invalid,
  action,
  children,
}: {
  icon: IconType;
  title: string;
  invalid: boolean;
  /** Optional button on the right of the title row. */
  action?: ReactNode;
  children: ReactNode;
}) {
  const heading = (
    <h3 className="flex items-center gap-2 text-base font-bold text-ink">
      <Icon size={20} className="shrink-0 text-brand" aria-hidden="true" />
      {title}
    </h3>
  );
  return (
    // Height follows the content; side by side, the grid row stretches both cards to the taller one.
    <section className={cn('flex min-w-0 flex-col rounded-2xl border bg-white p-4', invalid ? 'border-red-300' : 'border-slate-200')}>
      {action ? (
        <div className="flex items-center justify-between gap-3">
          {heading}
          {action}
        </div>
      ) : (
        heading
      )}
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

/** Filled card body — just the saved details; the edit pencil lives in the card header. */
function FilledDetails({ lines }: { lines: ReactNode[] }) {
  return (
    <div className="mt-3 flex min-w-0 flex-col gap-1 text-sm text-[#2B3445]">
      {lines.map((line, index) => (
        <p key={index} className="break-words">
          {line}
        </p>
      ))}
    </div>
  );
}
