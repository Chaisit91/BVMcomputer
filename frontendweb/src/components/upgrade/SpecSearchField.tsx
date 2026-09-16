import { useEffect, useRef, useState } from 'react';
import type { IconType } from 'react-icons';
import { FiSearch, FiX } from 'react-icons/fi';
import { searchUpgradeProducts } from '../../services/upgrade/productSearchService';
import type { UpgradeComponentKey, UpgradeProduct } from '../../types/upgrade';

interface SpecSearchFieldProps {
  component: UpgradeComponentKey;
  label: string;
  placeholder: string;
  icon: IconType;
  value: UpgradeProduct | null;
  onSelect: (product: UpgradeProduct) => void;
  onClear: () => void;
}

/**
 * Search + autocomplete field for one spec category — not a plain dropdown.
 * Typing filters the real product catalog for that category; picking a result
 * swaps the field into a "selected product" card (thumbnail, brand, SKU, key specs).
 */
export function SpecSearchField({ component, label, placeholder, icon: Icon, value, onSelect, onClear }: SpecSearchFieldProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<UpgradeProduct[]>([]);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    searchUpgradeProducts(component, query).then((items) => {
      if (!cancelled) setResults(items);
    });
    return () => {
      cancelled = true;
    };
  }, [component, query, open]);

  useEffect(() => {
    if (!open) return;
    const onClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [open]);

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-slate-500">{label}</span>

      {value ? (
        <div className="flex items-center gap-3 rounded-lg border border-brand/30 bg-red-50 px-3 py-2">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-white p-1.5">
            {value.image ? (
              <img src={value.image} alt={value.name} className="h-full w-full rounded-lg object-contain" />
            ) : (
              <Icon size={24} className="text-slate-300" aria-hidden="true" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-ink">{value.name}</p>
            <p className="truncate text-xs text-slate-400">
              {value.brand} · SKU: {value.sku}
            </p>
          </div>
          <button
            type="button"
            aria-label={`เปลี่ยน${label}`}
            onClick={onClear}
            className="shrink-0 text-slate-400 transition-colors hover:text-brand"
          >
            <FiX size={16} aria-hidden="true" />
          </button>
        </div>
      ) : (
        <div ref={containerRef} className="relative">
          <div className="flex h-11 items-center rounded-lg border border-slate-200 px-3 focus-within:border-brand">
            <FiSearch size={15} className="shrink-0 text-slate-400" aria-hidden="true" />
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setOpen(true);
              }}
              onFocus={() => setOpen(true)}
              placeholder={placeholder}
              className="h-full w-full min-w-0 bg-transparent px-2 text-sm text-ink outline-none placeholder:text-slate-400"
            />
          </div>

          {open && results.length > 0 && (
            <div
              role="listbox"
              className="absolute left-0 right-0 top-full z-20 mt-1 max-h-64 overflow-y-auto rounded-lg border border-slate-200 bg-white p-1.5 shadow-card"
            >
              {results.map((item) => (
                <button
                  key={item.productId}
                  type="button"
                  role="option"
                  aria-selected={false}
                  onClick={() => {
                    onSelect(item);
                    setQuery('');
                    setOpen(false);
                  }}
                  className="flex w-full flex-col items-start gap-0.5 rounded-md px-2.5 py-2 text-left transition-colors hover:bg-slate-50"
                >
                  <p className="truncate text-sm text-ink">{item.name}</p>
                  <p className="truncate text-[11px] text-slate-400">{item.specifications.join(' · ')}</p>
                </button>
              ))}
            </div>
          )}

          {open && query.trim() && results.length === 0 && (
            <div className="absolute left-0 right-0 top-full z-20 mt-1 rounded-lg border border-slate-200 bg-white p-3 text-center text-xs text-slate-400 shadow-card">
              ไม่พบสินค้าที่ตรงกับ "{query}"
            </div>
          )}
        </div>
      )}
    </div>
  );
}
