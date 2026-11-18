import { Link } from 'react-router-dom';
import { FiBookOpen } from 'react-icons/fi';
import { InfoPageLayout } from '../components/layout/InfoPageLayout';
import { EmptyState } from '../components/ui/EmptyState';

/**
 * "บทความ" — news, tips and know-how.
 * TODO(backend): no article content/CMS yet. Load the list here (e.g. GET /articles) and render
 * cards; until then the page says so honestly instead of showing made-up articles.
 */
export function ArticlesPage() {
  return (
    <InfoPageLayout title="บทความ" icon={FiBookOpen} description="ข่าวสาร เทคนิค และความรู้เกี่ยวกับคอมพิวเตอร์">
      <EmptyState
        icon={FiBookOpen}
        title="ยังไม่มีบทความในขณะนี้"
        description="บทความ ข่าวสาร และเทคนิคเกี่ยวกับคอมพิวเตอร์จะแสดงที่นี่เร็ว ๆ นี้"
        action={
          <Link
            to="/"
            className="inline-flex h-11 items-center rounded-full bg-brand px-6 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
          >
            กลับหน้าแรก
          </Link>
        }
      />
    </InfoPageLayout>
  );
}
