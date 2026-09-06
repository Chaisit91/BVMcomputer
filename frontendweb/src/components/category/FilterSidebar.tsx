import { useState, type ReactNode } from 'react';
import { FiChevronDown, FiChevronRight, FiGrid, FiList } from 'react-icons/fi';
import { cpuSeriesOptions, cpuSocketOptions, type CpuFilterState } from '../../data/cpuProducts';

export type CategoryView = 'grid' | 'list';
export type CategorySort = 'popular' | 'price-asc' | 'price-desc';

function toggle<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
}

function Checkbox({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <label className="flex cursor-pointer items-center gap-2 py-1.5 text-sm text-ink">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 rounded border-slate-300 text-brand focus:ring-brand"
      />
      {label}
    </label>
  );
}

/** Collapsible filter section — starts open or closed per `defaultOpen`. */
function CollapsibleSection({
  title,
  defaultOpen = false,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-t border-slate-100 py-1">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between py-2 text-sm font-semibold text-ink"
      >
        {title}
        {open ? (
          <FiChevronDown size={14} className="text-slate-400" aria-hidden="true" />
        ) : (
          <FiChevronRight size={14} className="text-slate-400" aria-hidden="true" />
        )}
      </button>
      {open && <div className="pb-2">{children}</div>}
    </div>
  );
}

function PriceRangeSlider({
  min,
  max,
  low,
  high,
  onChange,
}: {
  min: number;
  max: number;
  low: number;
  high: number;
  onChange: (low: number, high: number) => void;
}) {
  const lowPercent = ((low - min) / (max - min)) * 100;
  const highPercent = ((high - min) / (max - min)) * 100;

  return (
    <div className="relative h-5">
      <div className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-slate-100" />
      <div
        className="absolute top-1/2 h-1 -translate-y-1/2 rounded-full bg-brand"
        style={{ left: `${lowPercent}%`, right: `${100 - highPercent}%` }}
      />
      <input
        type="range"
        min={min}
        max={max}
        value={low}
        onChange={(e) => onChange(Math.min(Number(e.target.value), high), high)}
        className="range-thumb absolute inset-x-0 top-1/2 w-full -translate-y-1/2"
      />
      <input
        type="range"
        min={min}
        max={max}
        value={high}
        onChange={(e) => onChange(low, Math.max(Number(e.target.value), low))}
        className="range-thumb absolute inset-x-0 top-1/2 w-full -translate-y-1/2"
      />
    </div>
  );
}

interface FilterSidebarProps {
  title: string;
  count: number;
  sort: CategorySort;
  onSortChange: (value: CategorySort) => void;
  view: CategoryView;
  onViewChange: (value: CategoryView) => void;
  priceCeiling: number;
  filters: CpuFilterState;
  onChange: (next: CpuFilterState) => void;
  onClear: () => void;
}

export function FilterSidebar({
  title,
  count,
  sort,
  onSortChange,
  view,
  onViewChange,
  priceCeiling,
  filters,
  onChange,
  onClear,
}: FilterSidebarProps) {
  return (
    <aside className="flex w-full shrink-0 flex-col gap-4 lg:w-72">
      {/* Title + count + sort + view toggle */}
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold text-ink">{title}</h1>
          <span className="text-xs text-slate-400">จำนวน {count} รายการ</span>
        </div>

        <label className="mt-3 flex items-center gap-2 text-sm text-slate-500">
          เรียงตาม:
          <select
            value={sort}
            onChange={(e) => onSortChange(e.target.value as CategorySort)}
            className="flex-1 rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-ink focus:outline-none"
          >
            <option value="popular">ยอดนิยม</option>
            <option value="price-asc">ราคาต่ำ-สูง</option>
            <option value="price-desc">ราคาสูง-ต่ำ</option>
          </select>
        </label>

        <div className="mt-3 flex items-center gap-2 text-sm text-slate-500">
          View:
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="มุมมองตาราง"
              aria-pressed={view === 'grid'}
              onClick={() => onViewChange('grid')}
              className={`flex h-8 w-8 items-center justify-center rounded-lg border transition-colors ${
                view === 'grid' ? 'border-brand bg-brand/10 text-brand' : 'border-slate-200 text-[#2B3445] hover:bg-slate-50'
              }`}
            >
              <FiGrid size={15} aria-hidden="true" />
            </button>
            <button
              type="button"
              aria-label="มุมมองรายการ"
              aria-pressed={view === 'list'}
              onClick={() => onViewChange('list')}
              className={`flex h-8 w-8 items-center justify-center rounded-lg border transition-colors ${
                view === 'list' ? 'border-brand bg-brand/10 text-brand' : 'border-slate-200 text-[#2B3445] hover:bg-slate-50'
              }`}
            >
              <FiList size={15} aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <div>
          <h3 className="mb-1 text-sm font-semibold text-ink">เลือกการแสดงสินค้า</h3>
          <div className="flex flex-wrap gap-x-4">
            <Checkbox
              label="มีในสต็อก"
              checked={filters.stock.includes('in')}
              onChange={() => onChange({ ...filters, stock: toggle(filters.stock, 'in') })}
            />
            <Checkbox
              label="ไม่มีในสต็อก"
              checked={filters.stock.includes('preorder')}
              onChange={() => onChange({ ...filters, stock: toggle(filters.stock, 'preorder') })}
            />
          </div>
        </div>

        <div className="mt-3 border-t border-slate-100 pt-3">
          <h3 className="mb-2 text-sm font-semibold text-ink">ช่วงราคา</h3>
          <div className="flex items-center gap-2 text-sm">
            <input
              type="number"
              min={0}
              max={filters.maxPrice}
              value={filters.minPrice}
              onChange={(e) => onChange({ ...filters, minPrice: Number(e.target.value) || 0 })}
              className="w-full min-w-0 rounded-lg border border-slate-200 px-2.5 py-1.5 text-ink focus:outline-none"
            />
            <span className="shrink-0 text-slate-300">–</span>
            <input
              type="number"
              min={filters.minPrice}
              max={priceCeiling}
              value={filters.maxPrice}
              onChange={(e) => onChange({ ...filters, maxPrice: Number(e.target.value) || priceCeiling })}
              className="w-full min-w-0 rounded-lg border border-slate-200 px-2.5 py-1.5 text-ink focus:outline-none"
            />
          </div>
          <div className="mt-3 px-1">
            <PriceRangeSlider
              min={0}
              max={priceCeiling}
              low={filters.minPrice}
              high={filters.maxPrice}
              onChange={(low, high) => onChange({ ...filters, minPrice: low, maxPrice: high })}
            />
          </div>
        </div>

        <CollapsibleSection title="Brand" defaultOpen>
          <Checkbox
            label="AMD"
            checked={filters.brands.includes('AMD')}
            onChange={() => onChange({ ...filters, brands: toggle(filters.brands, 'AMD') })}
          />
          <Checkbox
            label="INTEL"
            checked={filters.brands.includes('Intel')}
            onChange={() => onChange({ ...filters, brands: toggle(filters.brands, 'Intel') })}
          />
        </CollapsibleSection>

        <CollapsibleSection title="Processor Number">
          {cpuSeriesOptions.map((series) => (
            <Checkbox
              key={series}
              label={series}
              checked={filters.series.includes(series)}
              onChange={() => onChange({ ...filters, series: toggle(filters.series, series) })}
            />
          ))}
        </CollapsibleSection>

        <CollapsibleSection title="Socket Type">
          {cpuSocketOptions.map((socket) => (
            <Checkbox
              key={socket}
              label={socket}
              checked={filters.sockets.includes(socket)}
              onChange={() => onChange({ ...filters, sockets: toggle(filters.sockets, socket) })}
            />
          ))}
        </CollapsibleSection>

        <button
          type="button"
          onClick={onClear}
          className="mt-3 w-full rounded-lg border border-slate-200 py-2.5 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-50 hover:text-ink"
        >
          ล้างตัวกรอง
        </button>
      </div>
    </aside>
  );
}
