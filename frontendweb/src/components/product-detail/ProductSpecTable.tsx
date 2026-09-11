import { cn } from '../../lib/cn';
import type { SpecRow } from '../../data/productLookup';

export function ProductSpecTable({ rows }: { rows: SpecRow[] }) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200">
      <table className="w-full border-collapse text-sm">
        <tbody>
          {rows.map((row, index) => {
            const isLast = index === rows.length - 1;
            return (
              <tr key={row.label} className={index % 2 === 1 ? 'bg-slate-50' : 'bg-white'}>
                <th
                  scope="row"
                  className={cn(
                    'w-1/3 px-4 py-3 text-left font-medium text-slate-500',
                    !isLast && 'border-b border-slate-100',
                  )}
                >
                  {row.label}
                </th>
                <td className={cn('px-4 py-3 text-ink', !isLast && 'border-b border-slate-100')}>{row.value}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
