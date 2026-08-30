import { useForm } from 'react-hook-form';
import { FiSearch } from 'react-icons/fi';
import { cn } from '../../lib/cn';

interface SearchFormValues {
  query: string;
}

export function SearchBar({ className }: { className?: string }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SearchFormValues>({ defaultValues: { query: '' } });

  const onSubmit = handleSubmit(({ query }) => {
    // TODO(backend): call the real search endpoint once it exists.
    console.info('search for:', query);
  });

  return (
    <form onSubmit={onSubmit} className={cn('w-full', className)} noValidate>
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
          {...register('query', { required: true, minLength: 2 })}
        />
      </div>
    </form>
  );
}
