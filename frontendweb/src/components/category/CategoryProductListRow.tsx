import { FiShoppingCart } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import type { CategoryProductMap, ProductCategorySlug } from '../../data/catalog';
import { formatTHB } from '../../lib/format';
import { FavoriteButton } from '../ui/FavoriteButton';
import { PriceTag } from '../ui/PriceTag';
import { SpecChip } from '../ui/SpecChip';
import { categoryBadgeStyle } from './categoryBadge';
import { categoryConfigs, type CategoryConfig } from './categoryConfigs';
import { useAddCategoryProductToCart } from './useAddCategoryProductToCart';

interface CategoryProductListRowProps<K extends ProductCategorySlug> {
  slug: K;
  product: CategoryProductMap[K];
}

/** Horizontal row layout for the product list view (as opposed to the card grid). */
export function CategoryProductListRow<K extends ProductCategorySlug>({ slug, product }: CategoryProductListRowProps<K>) {
  const config: CategoryConfig<K> = categoryConfigs[slug];
  const Icon = config.icon;
  const handleAddToCart = useAddCategoryProductToCart(product, config.cartCategory);

  return (
    <Link
      to={`/product/${slug}/${product.id}`}
      className="relative flex min-h-[132px] items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-card"
    >
      <FavoriteButton category={slug} productId={product.id} productName={product.name} />

      <div className="relative flex h-28 w-28 shrink-0 items-center justify-center rounded-lg bg-slate-50 p-2">
        {product.badge && (
          <span
            className={`absolute -left-1 -top-1 rounded-md px-1.5 py-0.5 text-[10px] font-semibold leading-none shadow-sm ${categoryBadgeStyle[product.badge]}`}
          >
            {product.badge}
          </span>
        )}
        {product.imageUrl ? (
          <img src={product.imageUrl} alt={product.name} className="h-full w-full object-contain" />
        ) : (
          <Icon size={44} className="text-slate-300" aria-hidden="true" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <h3 className="line-clamp-1 text-base font-bold text-ink sm:text-lg">{product.name}</h3>
        <p className="mt-1 text-xs text-slate-400">{config.rowMeta(product)}</p>
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {config.rowChips(product).map((chip, index) => (
            <SpecChip key={index} icon={chip.icon} label={chip.label} />
          ))}
        </div>
      </div>

      {/* Lower-right, offset (mb) up from the flex row's bottom edge — pinned by
          self-end so it stays put regardless of the product name's length, and
          kept well clear of the wishlist button above it. */}
      <div className="mb-2.5 flex shrink-0 items-center gap-3 self-end">
        {config.originalPrice ? (
          <PriceTag price={product.price} originalPrice={config.originalPrice(product)} size="lg" />
        ) : (
          <span className="whitespace-nowrap text-lg font-bold text-brand">{formatTHB(product.price)}</span>
        )}
        <button
          type="button"
          onClick={handleAddToCart}
          aria-label={`เพิ่ม ${product.name} ลงตะกร้า`}
          className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-lg bg-brand text-white transition-colors hover:bg-brand-dark"
        >
          <FiShoppingCart size={15} aria-hidden="true" />
        </button>
      </div>
    </Link>
  );
}
