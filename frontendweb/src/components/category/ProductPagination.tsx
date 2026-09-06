import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

interface ProductPaginationProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
}

type PageToken = number | 'ellipsis';

/** First, last, current ± 1, with an ellipsis filling any gap — the usual compact pattern. */
function buildPageTokens(current: number, total: number): PageToken[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const tokens: PageToken[] = [1];
  if (current > 3) tokens.push('ellipsis');

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let page = start; page <= end; page += 1) tokens.push(page);

  if (current < total - 2) tokens.push('ellipsis');
  tokens.push(total);
  return tokens;
}

export function ProductPagination({ currentPage, totalPages, pageSize, totalItems, onPageChange }: ProductPaginationProps) {
  if (totalItems === 0) return null;

  const rangeStart = (currentPage - 1) * pageSize + 1;
  const rangeEnd = Math.min(currentPage * pageSize, totalItems);
  const tokens = buildPageTokens(currentPage, totalPages);

  return (
    <div className="mt-6 flex flex-col items-center justify-between gap-3 sm:flex-row">
      <p className="text-xs text-slate-400">
        แสดง {rangeStart} - {rangeEnd} จาก {totalItems} รายการ
      </p>

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          aria-label="หน้าก่อนหน้า"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-slate-500 transition-colors hover:bg-slate-100 disabled:pointer-events-none disabled:opacity-40"
        >
          <FiChevronLeft size={15} aria-hidden="true" />
        </button>

        {tokens.map((token, index) =>
          token === 'ellipsis' ? (
            <span key={`ellipsis-${index}`} className="px-1 text-sm text-slate-400">
              ...
            </span>
          ) : (
            <button
              key={token}
              type="button"
              aria-label={`หน้า ${token}`}
              aria-current={token === currentPage ? 'page' : undefined}
              onClick={() => onPageChange(token)}
              className={
                token === currentPage
                  ? 'flex h-8 w-8 items-center justify-center rounded-full bg-brand text-sm font-semibold text-white'
                  : 'flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100'
              }
            >
              {token}
            </button>
          ),
        )}

        <button
          type="button"
          aria-label="หน้าถัดไป"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-slate-500 transition-colors hover:bg-slate-100 disabled:pointer-events-none disabled:opacity-40"
        >
          <FiChevronRight size={15} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
