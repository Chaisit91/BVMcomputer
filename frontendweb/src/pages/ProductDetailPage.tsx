import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import type { IconType } from 'react-icons';
import {
  BsCpu,
  BsDeviceSsd,
  BsGpuCard,
  BsMemory,
  BsMotherboard,
  BsPcDisplay,
  BsPlug,
  BsShieldCheck,
  BsSnow2,
} from 'react-icons/bs';
import { PiComputerTower, PiLightningFill } from 'react-icons/pi';
import { FiChevronRight, FiHeart, FiMinus, FiPlus, FiRepeat, FiShare2, FiShoppingCart, FiStar } from 'react-icons/fi';
import { Container } from '../components/ui/Container';
import { ProductGallery } from '../components/product-detail/ProductGallery';
import { ProductSpecTable } from '../components/product-detail/ProductSpecTable';
import { RelatedProductsCarousel } from '../components/product-detail/RelatedProductsCarousel';
import { ServiceBadges } from '../components/shared/ServiceBadges';
import { useAppDispatch } from '../app/hooks';
import { addToCart } from '../features/cart/cartSlice';
import { formatTHB } from '../lib/format';
import { cn } from '../lib/cn';
import { getProductDetail, toCartCategoryKey, type ProductCategorySlug } from '../data/productLookup';

const categoryFallbackIcons: Record<ProductCategorySlug, IconType> = {
  cpu: BsCpu,
  gpu: BsGpuCard,
  motherboard: BsMotherboard,
  ram: BsMemory,
  storage: BsDeviceSsd,
  psu: BsPlug,
  case: PiComputerTower,
  cooling: BsSnow2,
  'desktop-pc': PiComputerTower,
  'pc-sets': BsPcDisplay,
};

const badgeStyle: Record<string, string> = {
  แนะนำ: 'bg-ink text-white',
  สินค้าขายดี: 'bg-brand text-white',
  ใหม่: 'bg-amber-400 text-ink',
};

const whyBuyChecklist = [
  'สินค้าของแท้ 100% จากผู้จัดจำหน่ายอย่างเป็นทางการ',
  'ประกันศูนย์ไทย',
  'มีทีมงานให้คำแนะนำก่อนและหลังการซื้อ',
  'ราคาดี คุ้มค่า',
  'ออกใบกำกับภาษีได้',
  'บริการจัดสเปคฟรี',
];

const faqItems = [
  { question: 'สินค้ามีประกันกี่ปี?', answer: 'สินค้าทุกชิ้นรับประกันศูนย์ไทยตามเงื่อนไขของแต่ละแบรนด์ ตรวจสอบระยะเวลาประกันได้ที่ตารางสเปคด้านบน' },
  { question: 'จัดส่งใช้เวลากี่วัน?', answer: 'จัดส่งทั่วประเทศภายใน 1-3 วันทำการ เมื่อสั่งซื้อครบ 5,000 บาทขึ้นไปส่งฟรี' },
  { question: 'เปลี่ยนหรือคืนสินค้าได้ไหม?', answer: 'เปลี่ยนสินค้าใหม่ได้ภายใน 7 วัน หากสินค้ามีปัญหาจากการผลิต หรือไม่ตรงตามที่สั่งซื้อ' },
  { question: 'ชำระเงินแบบไหนได้บ้าง?', answer: 'รองรับการชำระเงินผ่านระบบออนไลน์ที่ปลอดภัย ทั้งบัตรเครดิต/เดบิต และโอนผ่านธนาคาร' },
];

type TabId = 'specs' | 'reviews' | 'faq';

const tabs: { id: TabId; label: string }[] = [
  { id: 'specs', label: 'สเปคสินค้า' },
  { id: 'reviews', label: 'รีวิวจากลูกค้า' },
  { id: 'faq', label: 'คำถามที่พบบ่อย' },
];

export function ProductDetailPage() {
  const { category, id } = useParams<{ category: string; id: string }>();
  const dispatch = useAppDispatch();
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<TabId>('specs');
  const [isFavorite, setIsFavorite] = useState(false);

  const product = category && id ? getProductDetail(category, id) : null;

  if (!product) {
    return (
      <section className="bg-slate-50 py-20">
        <Container>
          <div className="rounded-xl border border-dashed border-slate-200 bg-white py-16 text-center text-sm text-slate-400">
            ไม่พบสินค้าที่คุณค้นหา
          </div>
        </Container>
      </section>
    );
  }

  const Icon = categoryFallbackIcons[product.categorySlug];

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i += 1) {
      dispatch(
        addToCart({
          id: product.id,
          name: product.name,
          slug: product.id,
          price: product.price,
          category: toCartCategoryKey(product.categorySlug),
          brand: product.brand,
          skuCode: product.skuCode,
          imageUrl: product.imageUrl,
        }),
      );
    }
  };

  return (
    <>
      <section className="bg-slate-50 py-6">
        <Container>
          {/* Breadcrumb */}
          <nav className="mb-4 flex items-center gap-1.5 text-xs text-slate-400">
            <Link to="/" className="hover:text-brand">
              หน้าแรก
            </Link>
            <FiChevronRight size={12} aria-hidden="true" />
            <Link to={product.categoryPath} className="hover:text-brand">
              {product.categoryLabel}
            </Link>
            <FiChevronRight size={12} aria-hidden="true" />
            <span className="truncate text-slate-500">{product.brand}</span>
            <FiChevronRight size={12} aria-hidden="true" />
            <span className="truncate text-ink">{product.name}</span>
          </nav>

          {/* Hero: gallery + info */}
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            <ProductGallery imageUrl={product.imageUrl} fallbackIcon={Icon} productName={product.name} />

            <div className="flex flex-col">
              <div className="flex flex-wrap items-center gap-2">
                {product.badge && (
                  <span
                    className={cn(
                      'rounded-md px-2.5 py-1 text-xs font-semibold leading-none',
                      badgeStyle[product.badge] ?? 'bg-ink text-white',
                    )}
                  >
                    {product.badge}
                  </span>
                )}
                <span className="flex items-center gap-1 rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-600">
                  <BsShieldCheck size={12} aria-hidden="true" />
                  ประกันศูนย์ไทย
                </span>
              </div>

              <h1 className="mt-3 text-2xl font-bold leading-snug text-ink sm:text-3xl">{product.name}</h1>

              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-500">
                <span>
                  แบรนด์: <span className="font-medium text-ink">{product.brand}</span>
                </span>
                <span className="text-slate-300">|</span>
                <span>รหัสสินค้า: {product.skuCode}</span>
              </div>

              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                <span className="flex items-center gap-1 text-amber-500">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <FiStar
                      key={index}
                      size={14}
                      aria-hidden="true"
                      className={index < Math.round(product.rating) ? 'fill-current' : 'text-slate-200'}
                    />
                  ))}
                </span>
                <span className="font-medium text-ink">{product.rating.toFixed(1)}</span>
                <span className="text-slate-400">({product.reviewCount} รีวิว)</span>
                <span className="text-slate-300">|</span>
                <span className="text-slate-400">ขายแล้ว {product.soldCount.toLocaleString('th-TH')} ชิ้น</span>
              </div>

              <div className="mt-3 flex items-center gap-4 text-sm text-slate-500">
                <button
                  type="button"
                  onClick={() => setIsFavorite((prev) => !prev)}
                  className={cn('flex items-center gap-1.5 transition-colors hover:text-brand', isFavorite && 'text-brand')}
                >
                  <FiHeart size={15} className={isFavorite ? 'fill-current' : ''} aria-hidden="true" />
                  เพิ่มในรายการโปรด
                </button>
                <button type="button" className="flex items-center gap-1.5 transition-colors hover:text-brand">
                  <FiRepeat size={15} aria-hidden="true" />
                  เปรียบเทียบ
                </button>
                <button type="button" className="flex items-center gap-1.5 transition-colors hover:text-brand">
                  <FiShare2 size={15} aria-hidden="true" />
                  แชร์
                </button>
              </div>

              <div className="mt-4 flex flex-wrap items-end gap-3 border-t border-slate-100 pt-4">
                <span className="text-3xl font-bold text-brand">{formatTHB(product.price)}</span>
                {product.originalPrice && (
                  <>
                    <span className="text-base text-slate-400 line-through">{formatTHB(product.originalPrice)}</span>
                    <span className="rounded-md bg-brand/10 px-2 py-1 text-xs font-semibold text-brand">
                      ประหยัด {formatTHB(product.originalPrice - product.price)}
                    </span>
                  </>
                )}
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-4">
                <div className="flex items-center rounded-full border border-slate-200">
                  <button
                    type="button"
                    aria-label="ลดจำนวน"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="flex h-10 w-10 items-center justify-center text-slate-500 transition-colors hover:bg-slate-50"
                  >
                    <FiMinus size={14} aria-hidden="true" />
                  </button>
                  <span className="w-10 text-center text-sm font-semibold text-ink">{quantity}</span>
                  <button
                    type="button"
                    aria-label="เพิ่มจำนวน"
                    onClick={() => setQuantity((q) => q + 1)}
                    className="flex h-10 w-10 items-center justify-center text-slate-500 transition-colors hover:bg-slate-50"
                  >
                    <FiPlus size={14} aria-hidden="true" />
                  </button>
                </div>

                <span
                  className={cn(
                    'flex items-center gap-1.5 text-sm font-medium',
                    product.inStock ? 'text-emerald-600' : 'text-slate-400',
                  )}
                >
                  <span className={cn('h-1.5 w-1.5 rounded-full', product.inStock ? 'bg-emerald-500' : 'bg-slate-300')} />
                  {product.inStock ? 'มีสินค้าในสต็อก (พร้อมจัดส่ง)' : 'สั่งจอง (สินค้าหมดชั่วคราว)'}
                </span>
              </div>

              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="flex flex-1 items-center justify-center gap-2 rounded-full border border-slate-200 py-3 text-sm font-semibold text-ink transition-colors hover:bg-slate-50"
                >
                  <FiShoppingCart size={16} aria-hidden="true" />
                  เพิ่มลงตะกร้า
                </button>
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="flex flex-1 items-center justify-center gap-2 rounded-full bg-brand py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
                >
                  <PiLightningFill size={18} aria-hidden="true" />
                  ซื้อเลย
                </button>
              </div>

              <div className="mt-5 flex flex-wrap gap-2 rounded-xl border border-slate-200 bg-slate-50 p-4">
                {product.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-brand px-3 py-1.5 text-xs font-bold text-white shadow-sm"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Product information tabs */}
      <section className="bg-slate-50 py-8">
        <Container>
          <div className="flex gap-1 overflow-x-auto border-b border-slate-200">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'shrink-0 whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium transition-colors',
                  activeTab === tab.id
                    ? 'border-brand text-brand'
                    : 'border-transparent text-slate-500 hover:text-ink',
                )}
              >
                {tab.label}
                {tab.id === 'reviews' && ` (${product.reviewCount})`}
              </button>
            ))}
          </div>

          <div className="mt-6">
            {activeTab === 'specs' && (
              <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[1fr_320px]">
                <ProductSpecTable rows={product.specRows} />

                <div className="rounded-xl border border-slate-200 bg-white p-5">
                  <h3 className="text-sm font-bold text-ink">ทำไมต้องซื้อกับเรา?</h3>
                  <ul className="mt-3 flex flex-col gap-2.5">
                    {whyBuyChecklist.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-sm text-slate-600">
                        <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                          <svg viewBox="0 0 12 12" className="h-2.5 w-2.5" fill="none" aria-hidden="true">
                            <path d="M2 6l2.5 2.5L10 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </span>
                        {item}
                      </li>
                    ))}
                  </ul>

                  <Link
                    to="/build"
                    className="mt-5 flex flex-col gap-1 rounded-lg bg-ink p-4 text-white transition-colors hover:bg-ink-light"
                  >
                    <span className="text-xs font-semibold uppercase tracking-wide text-brand">Build Better Together</span>
                    <span className="text-sm font-bold leading-snug">
                      เลือกชิ้นส่วนที่ใช่ ประกอบคอมในแบบคุณ
                    </span>
                    <span className="mt-1 text-xs font-medium text-slate-300">จัดสเปคเลย →</span>
                  </Link>
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="max-w-3xl rounded-xl border border-slate-200 bg-white p-6">
                <div className="flex items-center gap-3">
                  <span className="text-3xl font-bold text-ink">{product.rating.toFixed(1)}</span>
                  <div>
                    <span className="flex items-center gap-0.5 text-amber-500">
                      {Array.from({ length: 5 }).map((_, index) => (
                        <FiStar
                          key={index}
                          size={14}
                          aria-hidden="true"
                          className={index < Math.round(product.rating) ? 'fill-current' : 'text-slate-200'}
                        />
                      ))}
                    </span>
                    <p className="text-xs text-slate-400">จาก {product.reviewCount} รีวิว</p>
                  </div>
                </div>
                <p className="mt-4 text-sm text-slate-400">
                  ระบบแสดงรีวิวจากลูกค้าจริงกำลังจะเปิดให้ใช้งานเร็ว ๆ นี้ — ตอนนี้เป็นข้อมูลตัวอย่างสำหรับการออกแบบหน้าเท่านั้น
                </p>
              </div>
            )}

            {activeTab === 'faq' && (
              <div className="flex max-w-3xl flex-col gap-3">
                {faqItems.map((item) => (
                  <div key={item.question} className="rounded-xl border border-slate-200 bg-white p-4">
                    <p className="text-sm font-semibold text-ink">{item.question}</p>
                    <p className="mt-1 text-sm leading-relaxed text-slate-500">{item.answer}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Container>
      </section>

      {/* Related products */}
      <section className="bg-slate-50 pb-8">
        <Container>
          <h2 className="mb-4 text-lg font-bold text-ink">สินค้าที่เกี่ยวข้อง</h2>
          <RelatedProductsCarousel items={product.related} fallbackIcon={Icon} />
        </Container>
      </section>

      <ServiceBadges />
    </>
  );
}
