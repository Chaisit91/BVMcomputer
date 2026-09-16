import type { IconType } from 'react-icons';
import { BsCpu, BsGpuCard, BsMemory } from 'react-icons/bs';
import { FiArrowRight } from 'react-icons/fi';
import { cn } from '../../lib/cn';

interface Article {
  id: string;
  icon: IconType;
  /** `\n` marks the line break used in the reference design (max 2 lines). */
  title: string;
  gradient: string;
  /** Real thumbnail photo, once the content/backend system provides one — falls back to a tinted dark tile when absent. */
  imageUrl?: string;
}

// TODO(backend): mock articles — swap for a real /api/articles?topic=upgrade endpoint once the content system exists.
const articles: Article[] = [
  { id: 'gpu-guide', icon: BsGpuCard, title: 'วิธีเลือกการ์ดจอ\nให้เหมาะกับการใช้งาน', gradient: 'from-[#2a0a0f] via-[#1a0709] to-black' },
  { id: 'cpu-guide', icon: BsCpu, title: 'เปรียบเทียบ CPU ยอดนิยม\nสำหรับเกมเมอร์', gradient: 'from-[#0a1a2a] via-[#071219] to-black' },
  { id: 'ram-guide', icon: BsMemory, title: 'เลือก RAM อย่างไร\nให้คุ้มค่าและแรงพอ', gradient: 'from-[#150a2a] via-[#0d0719] to-black' },
];

/** Bottom "further reading" row — mock content until the real article system exists. */
export function UpgradeArticles() {
  return (
    <div className="mt-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="h-6 w-1.5 rounded-full bg-brand" aria-hidden="true" />
          <h2 className="text-lg font-semibold text-ink sm:text-xl">บทความแนะนำสำหรับการอัปเกรด</h2>
        </div>
        <a href="#articles" className="flex shrink-0 items-center gap-1 text-sm font-medium text-brand hover:text-brand-dark">
          ดูทั้งหมด →
        </a>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {articles.map((article) => (
          <a
            key={article.id}
            href={`#article-${article.id}`}
            className="group relative block aspect-[2.1/1] overflow-hidden rounded-xl"
          >
            {article.imageUrl ? (
              <img
                src={article.imageUrl}
                alt=""
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <div className={cn('relative h-full w-full bg-gradient-to-br transition-transform duration-300 group-hover:scale-105', article.gradient)}>
                <article.icon size={96} className="absolute -bottom-4 -right-4 text-white/10" aria-hidden="true" />
              </div>
            )}

            <span
              className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/85 via-black/30 to-transparent"
              aria-hidden="true"
            />

            <h3 className="absolute bottom-4 left-4 right-14 line-clamp-2 whitespace-pre-line text-[19px] font-bold leading-[1.3] text-white">
              {article.title}
            </h3>

            <span className="absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-white text-ink shadow-md transition-transform duration-300 group-hover:scale-110">
              <FiArrowRight size={16} aria-hidden="true" />
            </span>
          </a>
        ))}
      </div>
    </div>
  );
}
