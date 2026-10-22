import { useEffect, useState } from 'react';
import type { IconType } from 'react-icons';
import { FiArrowLeft, FiCheck, FiEye, FiList, FiLoader, FiX } from 'react-icons/fi';
import { formatTHB } from '../../lib/format';
import { generatePcPreview, type PcPreviewResponse } from '../../services/build/pcPreviewService';
import { getErrorMessage } from '../../api/apiError';
import type { StepId } from '../../pages/BuildCategoryPage';

export interface BuildCartPreviewItem {
  categoryId: StepId;
  categoryLabel: string;
  productId: string;
  icon: IconType;
  name: string;
  brand?: string;
  specLine: string;
  image?: string;
  unitPrice: number;
}

interface BuildCartPreviewModalProps {
  items: BuildCartPreviewItem[];
  onClose: () => void;
  onConfirm: () => void;
}

const VAT_RATE = 0.07;

/**
 * Confirmation popup for the Build PC page — opens when "สร้างชุดสเปคคอม" is clicked.
 * Single scroll region for the whole popup body (table header stays sticky within it);
 * read-only review (no remove/quantity editing) + AI preview mock flow. Once confirmed,
 * this is the only place that actually dispatches the items into the cart.
 */
export function BuildCartPreviewModal({ items, onClose, onConfirm }: BuildCartPreviewModalProps) {
  const [view, setView] = useState<'review' | 'loading' | 'result'>('review');
  const [previewResult, setPreviewResult] = useState<PcPreviewResponse | null>(null);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  useEffect(() => {
    if (view !== 'loading') return;
    let cancelled = false;
    generatePcPreview({
      parts: items.map((item) => ({
        category: item.categoryId,
        productId: item.productId,
        name: item.name,
        brand: item.brand,
        specLine: item.specLine,
        image: item.image,
      })),
    })
      .then((result) => {
        if (!cancelled) {
          setPreviewResult(result);
          setView('result');
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setPreviewResult({ status: 'error', message: getErrorMessage(error) });
          setView('result');
        }
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view]);

  const itemsTotal = items.reduce((sum, item) => sum + item.unitPrice, 0);
  // TODO(backend): no real promo/coupon engine yet — shown as ฿0 until one exists, rather
  // than fabricating a discount figure.
  const discount = 0;
  const netTotal = itemsTotal - discount;
  const beforeTax = netTotal / (1 + VAT_RATE);
  const vat = netTotal - beforeTax;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div
        className="flex max-h-[85vh] w-full max-w-[880px] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-slate-100 px-5 py-3.5">
          <div className="flex items-center gap-2">
            <FiList size={19} className="text-ink" aria-hidden="true" />
            <h2 className="text-base font-bold text-ink">รายการ</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="ปิดหน้าต่าง"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-ink"
          >
            <FiX size={20} aria-hidden="true" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-5 py-4">
          {view === 'loading' && (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
              <FiLoader size={32} className="animate-spin text-brand" aria-hidden="true" />
              <p className="text-base font-semibold text-ink">กำลังสร้างภาพ PC ของคุณ...</p>
              <p className="text-sm text-slate-400">AI กำลังประมวลผลจากชิ้นส่วนที่คุณเลือก</p>
            </div>
          )}

          {view === 'result' && (
            <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
              {previewResult?.imageUrl ? (
                <img
                  src={previewResult.imageUrl}
                  alt="ภาพจำลอง PC ที่ AI สร้างขึ้น"
                  className="h-56 w-auto rounded-lg object-contain"
                />
              ) : (
                <AiPcPreviewArt />
              )}
              {previewResult?.status === 'error' && (
                <p role="alert" className="text-sm text-red-500">
                  {previewResult.message}
                </p>
              )}
              <button
                type="button"
                onClick={() => setView('review')}
                className="flex items-center gap-1.5 text-sm font-semibold text-brand hover:text-brand-dark"
              >
                <FiArrowLeft size={14} aria-hidden="true" />
                กลับไปดูรายการ
              </button>
              <p className="max-w-md text-xs leading-relaxed text-slate-400">
                ภาพ Preview สร้างโดย AI ใช้เพื่อประกอบการตัดสินใจ รูปลักษณ์จริงของสินค้าอาจแตกต่างจากภาพจำลอง
              </p>
            </div>
          )}

          {view === 'review' &&
            (items.length === 0 ? (
              <p className="py-16 text-center text-sm text-slate-400">ไม่มีสินค้าในรายการ</p>
            ) : (
              <>
                <div>
                  <div className="sticky top-0 z-10 hidden rounded-lg bg-[#111827] px-4 py-3 text-xs font-semibold text-white sm:grid sm:grid-cols-[64px_1fr_70px_70px_110px] sm:items-center sm:gap-3">
                    <span>
                      สินค้า
                      <span className="block text-[11px] font-normal text-slate-400">Product</span>
                    </span>
                    <span>
                      รายละเอียด
                      <span className="block text-[11px] font-normal text-slate-400">Description</span>
                    </span>
                    <span className="text-center">
                      จำนวน
                      <span className="block text-[11px] font-normal text-slate-400">Quantity</span>
                    </span>
                    <span className="text-center">
                      ส่วนลด
                      <span className="block text-[11px] font-normal text-slate-400">Discount</span>
                    </span>
                    <span className="text-center">
                      ราคารวม
                      <span className="block text-[11px] font-normal text-slate-400">Total Amount</span>
                    </span>
                  </div>

                  <ul className="mt-2 flex flex-col gap-2">
                    {items.map((item) => {
                      const Icon = item.icon;
                      return (
                        <li
                          key={item.categoryId}
                          className="flex flex-col gap-2 rounded-md bg-[#F8F9FA] px-4 py-2.5 sm:grid sm:grid-cols-[64px_1fr_70px_70px_110px] sm:items-center sm:gap-3"
                        >
                          <div className="flex items-center gap-3 sm:contents">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-white p-1">
                              {item.image ? (
                                <img src={item.image} alt={item.name} className="h-full w-full object-contain" />
                              ) : (
                                <Icon size={20} className="text-slate-300" aria-hidden="true" />
                              )}
                            </div>

                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-bold text-brand">{item.categoryLabel}</p>
                              <p className="truncate text-sm font-semibold text-ink">{item.name}</p>
                              <p className="truncate text-xs text-slate-400">{item.specLine}</p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between gap-3 pl-[60px] sm:contents sm:pl-0">
                            <p className="text-sm font-medium text-ink sm:text-center">
                              <span className="text-slate-400 sm:hidden">จำนวน </span>1
                            </p>
                            <p className="text-sm text-slate-300 sm:text-center">
                              <span className="text-slate-400 sm:hidden">ส่วนลด </span>-
                            </p>
                            <p className="text-sm font-bold text-ink sm:text-center">{formatTHB(item.unitPrice)}</p>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>

                <div className="ml-auto mt-4 w-full rounded-[10px] border border-slate-200 bg-[#FAFAFA] p-4 sm:w-80">
                  <h3 className="text-sm font-bold text-ink">สรุปคำสั่งซื้อ</h3>
                  <p className="text-xs text-slate-400">รายการทั้งหมด {items.length} รายการ</p>

                  <div className="mt-2.5 flex flex-col gap-1.5 text-sm">
                    <div className="flex items-center justify-between text-slate-500">
                      <span>ราคารวมสินค้า</span>
                      <span>{formatTHB(itemsTotal)}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-500">
                      <span>ส่วนลด</span>
                      <span>{formatTHB(discount)}</span>
                    </div>
                    <div className="flex items-center justify-between border-t border-slate-200 pt-1.5 text-slate-500">
                      <span>ราคาก่อนภาษี</span>
                      <span>{formatTHB(beforeTax)}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-500">
                      <span>ภาษีมูลค่าเพิ่ม 7%</span>
                      <span>{formatTHB(vat)}</span>
                    </div>
                  </div>

                  <div className="mt-2.5 border-t border-slate-200 pt-2.5">
                    <p className="text-xs font-medium text-slate-500">จำนวนเงินรวมสุทธิ</p>
                    <p className="text-2xl font-extrabold text-brand">{formatTHB(netTotal)}</p>
                  </div>
                </div>
              </>
            ))}
        </div>

        <div className="shrink-0 border-t border-slate-100 px-5 py-4">
          <div className="flex flex-col gap-2.5 sm:flex-row">
            <button
              type="button"
              onClick={() => setView('loading')}
              disabled={items.length === 0}
              className="flex h-12 flex-1 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white text-sm font-semibold text-ink transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-300"
            >
              <FiEye size={17} aria-hidden="true" />
              Preview PC
            </button>

            <button
              type="button"
              onClick={onConfirm}
              disabled={items.length === 0}
              className="flex h-12 flex-1 items-center justify-center gap-2 rounded-lg bg-brand text-sm font-semibold text-white transition-colors hover:bg-brand-dark disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
            >
              <FiCheck size={18} aria-hidden="true" />
              ยืนยันการสั่งซื้อ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Mock "AI-generated" PC render — no real image-generation pipeline exists yet
 * (a teammate owns that, see services/build/pcPreviewService.ts), so this is a
 * drawn illustration, not an actual photo of the selected parts.
 */
function AiPcPreviewArt() {
  const accent = '#e2001a';
  return (
    <div className="flex h-56 w-40 flex-col items-center justify-end">
      <div
        className="relative flex h-48 w-32 flex-col items-center justify-end overflow-hidden rounded-lg border bg-gradient-to-b from-[#161b26] to-[#05060a] pb-3"
        style={{ borderColor: `${accent}4d` }}
      >
        <span
          className="absolute inset-y-2 left-2 w-1 rounded-full"
          style={{ background: accent, boxShadow: `0 0 8px ${accent}` }}
          aria-hidden="true"
        />
        <div className="flex flex-col items-center gap-2.5">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="h-6 w-6 rounded-full border-2"
              style={{ borderColor: accent, boxShadow: `0 0 10px 2px ${accent}` }}
              aria-hidden="true"
            />
          ))}
        </div>
      </div>
      <span className="mt-1.5 h-2 w-24 rounded-full opacity-70 blur-[3px]" style={{ background: accent }} aria-hidden="true" />
    </div>
  );
}
