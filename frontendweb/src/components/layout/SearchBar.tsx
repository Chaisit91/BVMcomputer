import { useForm } from 'react-hook-form';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FiSearch } from 'react-icons/fi';
import { cn } from '../../lib/cn';

interface SearchFormValues {
  query: string;
}

export function SearchBar({ className }: { className?: string }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SearchFormValues>({ defaultValues: { query: searchParams.get('q') ?? '' } });

  // The search itself runs on /search (SearchPage), driven by ?q= — so results are linkable
  // and the browser's back button works.
  const onSubmit = handleSubmit(({ query }) => {
    navigate(`/search?q=${encodeURIComponent(query.trim())}`);
  });

  return (
    <form onSubmit={onSubmit} className={cn('w-full', className)} role="search" noValidate>
      <div
        className={cn(
          'flex items-center rounded-full border bg-white transition-colors',
          errors.query ? 'border-brand' : 'border-slate-200 focus-within:border-ink',
        )}
      >
        <button type="submit" aria-label="ค้นหา" className="pl-4 pr-2 text-slate-400 hover:text-ink">
          <FiSearch aria-hidden="true" />
        </button>
        <input
          type="search"
          placeholder="ค้นหาสินค้า"
          className="min-w-0 flex-1 bg-transparent py-2.5 pr-4 text-sm text-ink placeholder:text-slate-400 focus:outline-none"
          aria-label="ค้นหาสินค้า"
          {...register('query', { required: true, validate: (value) => value.trim().length >= 2 })}
        />
      </div>
    </form>
  );
}
