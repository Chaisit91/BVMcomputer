import { FiShoppingCart } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import type { CategoryProductMap, ProductCategorySlug } from '../../data/catalog';
import { formatTHB } from '../../lib/format';
import { FavoriteButton } from '../ui/FavoriteButton';
import { PriceTag } from '../ui/PriceTag';
import { categoryBadgeStyle } from './categoryBadge';
import { categoryConfigs, type CategoryConfig } from './categoryConfigs';
import { useAddCategoryProductToCart } from './useAddCategoryProductToCart';

interface CategoryProductCardProps<K extends ProductCategorySlug> {
  slug: K;
  product: CategoryProductMap[K];
}

/** Grid card for any category's product — per-category spec lines and icon come from categoryConfigs. */
export function CategoryProductCard<K extends ProductCategorySlug>({ slug, product }: CategoryProductCardProps<K>) {
  const config: CategoryConfig<K> = categoryConfigs[slug];
  const Icon = config.icon;
  const handleAddToCart = useAddCategoryProductToCart(product, config.cartCategory);

  return (
    <Link
      to={`/product/${slug}/${product.id}`}
      className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white transition-shadow hover:shadow-card"
    >
      <div className="relative flex aspect-square items-center justify-center bg-slate-50 p-3">
        <FavoriteButton category={slug} productId={product.id} productName={product.name} />
        {product.badge && (
          <span
            className={`absolute left-2 top-2 rounded-md px-2 py-1 text-[11px] font-semibold leading-none shadow-sm ${categoryBadgeStyle[product.badge]}`}
          >
            {product.badge}
          </span>
        )}
        {product.imageUrl ? (
          <img src={product.imageUrl} alt={product.name} className="h-full w-full object-contain" />
        ) : (
          <Icon size={56} className="text-slate-300" aria-hidden="true" />
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-3">
        <h3 className="line-clamp-2 min-h-[2.5rem] text-sm font-medium text-ink">{product.name}</h3>
        <p className="text-xs text-slate-400">{config.cardSpec(product)}</p>
        <p className="text-[11px] text-slate-400">{config.cardMeta(product)}</p>

        <div className="mt-auto flex items-center justify-between gap-2 pt-1">
          {config.originalPrice ? (
            <PriceTag price={product.price} originalPrice={config.originalPrice(product)} size="sm" />
          ) : (
            <span className="text-base font-bold text-brand">{formatTHB(product.price)}</span>
          )}
          <button
            type="button"
            onClick={handleAddToCart}
            aria-label={`เพิ่ม ${product.name} ลงตะกร้า`}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand text-white transition-colors hover:bg-brand-dark"
          >
            <FiShoppingCart size={16} aria-hidden="true" />
          </button>
        </div>
      </div>
    </Link>
  );
}
