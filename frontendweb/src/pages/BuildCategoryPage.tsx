import { useMemo, useRef, useState } from 'react';
import { BsCpu, BsGpuCard, BsHdd, BsMemory, BsMotherboard, BsPlug, BsSnow2 } from 'react-icons/bs';
import { PiComputerTower } from 'react-icons/pi';
import { Container } from '../components/ui/Container';
import { BuildHeroBanner } from '../components/build/BuildHeroBanner';
import { BuildOptionCard } from '../components/build/BuildOptionCard';
import { BuildSummarySidebar, type BuildSummaryRow } from '../components/build/BuildSummarySidebar';
import { BuildCartPreviewModal, type BuildCartPreviewItem } from '../components/build/BuildCartPreviewModal';
import { ErrorState } from '../components/ui/ErrorState';
import { ProductGridSkeleton } from '../components/category/ProductGridSkeleton';
import { ProductPagination } from '../components/category/ProductPagination';
import { useAppDispatch } from '../app/hooks';
import { useCatalogs } from '../hooks/useCatalogs';
import { addToCart } from '../features/cart/cartSlice';
import type { CategoryIconKey } from '../types';
import type { CpuProduct } from '../data/cpuProducts';
import type { MotherboardProduct } from '../data/motherboardProducts';
import type { GpuProduct } from '../data/gpuProducts';
import type { RamProduct } from '../data/ramProducts';
import type { StorageProduct } from '../data/storageProducts';
import type { PsuProduct } from '../data/psuProducts';
import type { CaseProduct } from '../data/caseProducts';
import type { CoolingProduct } from '../data/coolingProducts';

export type StepId = 'cpu' | 'motherboard' | 'gpu' | 'ram' | 'storage' | 'psu' | 'case' | 'cooling';

// Module-level so useCatalogs gets a stable array and doesn't refetch on every render.
const BUILD_CATEGORIES = ['cpu', 'motherboard', 'gpu', 'ram', 'storage', 'psu', 'case', 'cooling'] as const satisfies readonly StepId[];

const PAGE_SIZE = 12;

export function BuildCategoryPage() {
  const dispatch = useAppDispatch();
  // All 8 part lists are fetched in parallel (Promise.all) the first time the page opens.
  const { catalogs, status: catalogStatus, error: catalogError, reload: reloadCatalogs } = useCatalogs(BUILD_CATEGORIES);
  const [activeStep, setActiveStep] = useState<StepId>('cpu');
  const [showCartPreview, setShowCartPreview] = useState(false);
  const [pageState, setPageState] = useState<{ step: StepId; page: number }>({ step: 'cpu', page: 1 });
  const sectionRef = useRef<HTMLElement>(null);

  const [selectedCpu, setSelectedCpu] = useState<CpuProduct | null>(null);
  const [selectedMotherboard, setSelectedMotherboard] = useState<MotherboardProduct | null>(null);
  const [selectedGpu, setSelectedGpu] = useState<GpuProduct | null>(null);
  const [selectedRam, setSelectedRam] = useState<RamProduct | null>(null);
  const [selectedStorage, setSelectedStorage] = useState<StorageProduct | null>(null);
  const [selectedPsu, setSelectedPsu] = useState<PsuProduct | null>(null);
  const [selectedCase, setSelectedCase] = useState<CaseProduct | null>(null);
  const [selectedCooling, setSelectedCooling] = useState<CoolingProduct | null>(null);

  const handleSelectCpu = (product: CpuProduct) => {
    setSelectedCpu(product);
    // Picking a new CPU can make the current motherboard/cooler socket-incompatible —
    // drop them right here rather than leaving a stale, invalid pick in the summary.
    setSelectedMotherboard((prev) => (prev && prev.socket === product.socket ? prev : null));
    setSelectedCooling((prev) => (prev && prev.socket === product.socket ? prev : null));
  };

  // Compatible motherboards/coolers are derived from the chosen CPU's socket — pure
  // derived data, so useMemo (not useEffect) is the right tool.
  const compatibleMotherboards = useMemo(
    () =>
      selectedCpu ? catalogs.motherboard.filter((m) => m.socket === selectedCpu.socket) : catalogs.motherboard,
    [selectedCpu, catalogs.motherboard],
  );
  const compatibleCoolers = useMemo(
    () => (selectedCpu ? catalogs.cooling.filter((c) => c.socket === selectedCpu.socket) : catalogs.cooling),
    [selectedCpu, catalogs.cooling],
  );

  const totalPrice =
    (selectedCpu?.price ?? 0) +
    (selectedMotherboard?.price ?? 0) +
    (selectedGpu?.price ?? 0) +
    (selectedRam?.price ?? 0) +
    (selectedStorage?.price ?? 0) +
    (selectedPsu?.price ?? 0) +
    (selectedCase?.price ?? 0) +
    (selectedCooling?.price ?? 0);

  const filledSteps = new Set<string>(
    (
      [
        selectedCpu && 'cpu',
        selectedMotherboard && 'motherboard',
        selectedGpu && 'gpu',
        selectedRam && 'ram',
        selectedStorage && 'storage',
        selectedPsu && 'psu',
        selectedCase && 'case',
        selectedCooling && 'cooling',
      ] as const
    ).filter((value): value is StepId => Boolean(value)),
  );

  const hasSelection = filledSteps.size > 0;

  const summaryRows: BuildSummaryRow[] = [
    { id: 'cpu', label: 'ซีพียู', icon: BsCpu, required: true, selectedName: selectedCpu?.name ?? null, price: selectedCpu?.price ?? 0 },
    { id: 'motherboard', label: 'เมนบอร์ด', icon: BsMotherboard, required: true, selectedName: selectedMotherboard?.name ?? null, price: selectedMotherboard?.price ?? 0 },
    { id: 'gpu', label: 'การ์ดจอ', icon: BsGpuCard, required: false, selectedName: selectedGpu?.name ?? null, price: selectedGpu?.price ?? 0 },
    { id: 'ram', label: 'แรม', icon: BsMemory, required: true, selectedName: selectedRam?.name ?? null, price: selectedRam?.price ?? 0 },
    { id: 'storage', label: 'สตอเรจ', icon: BsHdd, required: true, selectedName: selectedStorage?.name ?? null, price: selectedStorage?.price ?? 0 },
    { id: 'psu', label: 'พาวเวอร์ซัพพลาย', icon: BsPlug, required: true, selectedName: selectedPsu?.name ?? null, price: selectedPsu?.price ?? 0 },
    { id: 'case', label: 'เคส', icon: PiComputerTower, required: true, selectedName: selectedCase?.name ?? null, price: selectedCase?.price ?? 0 },
    { id: 'cooling', label: 'ชุดระบายความร้อน', icon: BsSnow2, required: false, selectedName: selectedCooling?.name ?? null, price: selectedCooling?.price ?? 0 },
  ];

  const handleReset = () => {
    setSelectedCpu(null);
    setSelectedMotherboard(null);
    setSelectedGpu(null);
    setSelectedRam(null);
    setSelectedStorage(null);
    setSelectedPsu(null);
    setSelectedCase(null);
    setSelectedCooling(null);
  };

  const cartPreviewItems: BuildCartPreviewItem[] = useMemo(() => {
    const items: BuildCartPreviewItem[] = [];
    if (selectedCpu) {
      items.push({
        categoryId: 'cpu',
        categoryLabel: 'CPU',
        productId: selectedCpu.id,
        icon: BsCpu,
        name: selectedCpu.name,
        brand: selectedCpu.brand,
        specLine: `${selectedCpu.cores}C/${selectedCpu.threads}T · ${selectedCpu.clock} · ${selectedCpu.socket}`,
        image: selectedCpu.imageUrl,
        unitPrice: selectedCpu.price,
      });
    }
    if (selectedMotherboard) {
      items.push({
        categoryId: 'motherboard',
        categoryLabel: 'Mainboard',
        productId: selectedMotherboard.id,
        icon: BsMotherboard,
        name: selectedMotherboard.name,
        brand: selectedMotherboard.brand,
        specLine: `${selectedMotherboard.chipset} · ${selectedMotherboard.socket} · ${selectedMotherboard.formFactor}`,
        image: selectedMotherboard.imageUrl,
        unitPrice: selectedMotherboard.price,
      });
    }
    if (selectedGpu) {
      items.push({
        categoryId: 'gpu',
        categoryLabel: 'VGA',
        productId: selectedGpu.id,
        icon: BsGpuCard,
        name: selectedGpu.name,
        brand: selectedGpu.brand,
        specLine: `${selectedGpu.memorySize} · ${selectedGpu.boostClock} · ${selectedGpu.model}`,
        image: selectedGpu.imageUrl,
        unitPrice: selectedGpu.price,
      });
    }
    if (selectedRam) {
      items.push({
        categoryId: 'ram',
        categoryLabel: 'RAM',
        productId: selectedRam.id,
        icon: BsMemory,
        name: selectedRam.name,
        brand: selectedRam.brand,
        specLine: `${selectedRam.capacity} · ${selectedRam.memoryType} · ${selectedRam.speed}`,
        image: selectedRam.imageUrl,
        unitPrice: selectedRam.price,
      });
    }
    if (selectedStorage) {
      items.push({
        categoryId: 'storage',
        categoryLabel: 'SSD',
        productId: selectedStorage.id,
        icon: BsHdd,
        name: selectedStorage.name,
        brand: selectedStorage.brand,
        specLine: `${selectedStorage.capacity} · ${selectedStorage.type} · ${selectedStorage.readSpeed}`,
        image: selectedStorage.imageUrl,
        unitPrice: selectedStorage.price,
      });
    }
    if (selectedPsu) {
      items.push({
        categoryId: 'psu',
        categoryLabel: 'Power Supply',
        productId: selectedPsu.id,
        icon: BsPlug,
        name: selectedPsu.name,
        brand: selectedPsu.brand,
        specLine: `${selectedPsu.wattage} · ${selectedPsu.certification} · ${selectedPsu.modular}`,
        image: selectedPsu.imageUrl,
        unitPrice: selectedPsu.price,
      });
    }
    if (selectedCase) {
      items.push({
        categoryId: 'case',
        categoryLabel: 'Case',
        productId: selectedCase.id,
        icon: PiComputerTower,
        name: selectedCase.name,
        brand: selectedCase.brand,
        specLine: `${selectedCase.formFactor} · ${selectedCase.sidePanel}`,
        image: selectedCase.imageUrl,
        unitPrice: selectedCase.price,
      });
    }
    if (selectedCooling) {
      items.push({
        categoryId: 'cooling',
        categoryLabel: 'CPU Cooler',
        productId: selectedCooling.id,
        icon: BsSnow2,
        name: selectedCooling.name,
        brand: selectedCooling.brand,
        specLine: `${selectedCooling.type} · ${selectedCooling.fanSize} · ${selectedCooling.socket}`,
        image: selectedCooling.imageUrl,
        unitPrice: selectedCooling.price,
      });
    }
    return items;
  }, [
    selectedCpu,
    selectedMotherboard,
    selectedGpu,
    selectedRam,
    selectedStorage,
    selectedPsu,
    selectedCase,
    selectedCooling,
  ]);

  const handleConfirmCartPreview = () => {
    const categoryMap: Record<StepId, CategoryIconKey> = {
      cpu: 'cpu',
      motherboard: 'motherboard',
      gpu: 'gpu',
      ram: 'ram',
      storage: 'storage',
      psu: 'psu',
      case: 'case',
      cooling: 'cooling',
    };
    cartPreviewItems.forEach((item) => {
      dispatch(
        addToCart({
          id: item.productId,
          name: item.name,
          slug: item.productId,
          price: item.unitPrice,
          category: categoryMap[item.categoryId],
          brand: item.brand,
          imageUrl: item.image,
          shortSpec: item.specLine,
        }),
      );
    });
    setShowCartPreview(false);
  };

  const renderStepOptions = () => {
    switch (activeStep) {
      case 'cpu':
        return catalogs.cpu.map((p) => (
          <BuildOptionCard
            key={p.id}
            icon={BsCpu}
            selected={selectedCpu?.id === p.id}
            onSelect={() => handleSelectCpu(p)}
            onRemove={() => setSelectedCpu(null)}
            item={{
              id: p.id,
              name: p.name,
              price: p.price,
              specLines: [`${p.cores}C/${p.threads}T`, p.clock, p.socket],
              badge: p.badge,
              inStock: p.inStock,
            }}
          />
        ));
      case 'motherboard':
        return compatibleMotherboards.map((p) => (
          <BuildOptionCard
            key={p.id}
            icon={BsMotherboard}
            selected={selectedMotherboard?.id === p.id}
            onSelect={() => setSelectedMotherboard(p)}
            onRemove={() => setSelectedMotherboard(null)}
            item={{
              id: p.id,
              name: p.name,
              price: p.price,
              specLines: [p.chipset, p.socket, p.formFactor],
              badge: p.badge,
              inStock: p.inStock,
            }}
          />
        ));
      case 'gpu':
        return catalogs.gpu.map((p) => (
          <BuildOptionCard
            key={p.id}
            icon={BsGpuCard}
            selected={selectedGpu?.id === p.id}
            onSelect={() => setSelectedGpu(p)}
            onRemove={() => setSelectedGpu(null)}
            item={{
              id: p.id,
              name: p.name,
              price: p.price,
              specLines: [p.memorySize, p.boostClock, p.model],
              badge: p.badge,
              inStock: p.inStock,
            }}
          />
        ));
      case 'ram':
        return catalogs.ram.map((p) => (
          <BuildOptionCard
            key={p.id}
            icon={BsMemory}
            selected={selectedRam?.id === p.id}
            onSelect={() => setSelectedRam(p)}
            onRemove={() => setSelectedRam(null)}
            item={{
              id: p.id,
              name: p.name,
              price: p.price,
              specLines: [p.capacity, p.memoryType, p.speed],
              badge: p.badge,
              inStock: p.inStock,
            }}
          />
        ));
      case 'storage':
        return catalogs.storage.map((p) => (
          <BuildOptionCard
            key={p.id}
            icon={BsHdd}
            selected={selectedStorage?.id === p.id}
            onSelect={() => setSelectedStorage(p)}
            onRemove={() => setSelectedStorage(null)}
            item={{
              id: p.id,
              name: p.name,
              price: p.price,
              specLines: [p.capacity, p.type, p.readSpeed],
              badge: p.badge,
              inStock: p.inStock,
            }}
          />
        ));
      case 'psu':
        return catalogs.psu.map((p) => (
          <BuildOptionCard
            key={p.id}
            icon={BsPlug}
            selected={selectedPsu?.id === p.id}
            onSelect={() => setSelectedPsu(p)}
            onRemove={() => setSelectedPsu(null)}
            item={{
              id: p.id,
              name: p.name,
              price: p.price,
              specLines: [p.wattage, p.certification, p.modular],
              badge: p.badge,
              inStock: p.inStock,
            }}
          />
        ));
      case 'case':
        return catalogs.case.map((p) => (
          <BuildOptionCard
            key={p.id}
            icon={PiComputerTower}
            selected={selectedCase?.id === p.id}
            onSelect={() => setSelectedCase(p)}
            onRemove={() => setSelectedCase(null)}
            item={{
              id: p.id,
              name: p.name,
              price: p.price,
              specLines: [p.formFactor, p.sidePanel],
              badge: p.badge,
              inStock: p.inStock,
            }}
          />
        ));
      case 'cooling':
        return compatibleCoolers.map((p) => (
          <BuildOptionCard
            key={p.id}
            icon={BsSnow2}
            selected={selectedCooling?.id === p.id}
            onSelect={() => setSelectedCooling(p)}
            onRemove={() => setSelectedCooling(null)}
            item={{
              id: p.id,
              name: p.name,
              price: p.price,
              specLines: [p.type, p.fanSize, p.socket],
              badge: p.badge,
              inStock: p.inStock,
            }}
          />
        ));
      default:
        return null;
    }
  };

  // Same 12-per-page pagination as the category pages. The page number is stored together with
  // the step it belongs to, so switching category starts back at page 1.
  const stepOptions = renderStepOptions() ?? [];
  const totalPages = Math.max(1, Math.ceil(stepOptions.length / PAGE_SIZE));
  const currentPage = Math.min(pageState.step === activeStep ? pageState.page : 1, totalPages);
  const pageOptions = stepOptions.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const handlePageChange = (next: number) => {
    setPageState({ step: activeStep, page: next });
    sectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <>
      <BuildHeroBanner />

      <section ref={sectionRef} className="scroll-mt-20 bg-slate-50 pb-16 pt-8">
        <Container>
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
            <BuildSummarySidebar
              rows={summaryRows}
              totalPrice={totalPrice}
              hasSelection={hasSelection}
              onEditStep={(id) => setActiveStep(id as StepId)}
              onAddAllToCart={() => setShowCartPreview(true)}
              onReset={handleReset}
            />

            <div className="min-w-0 flex-1">
              <div>
                {(activeStep === 'motherboard' || activeStep === 'cooling') && selectedCpu && (
                  <div className="mb-3 flex justify-end">
                    <span className="text-xs text-slate-400">กรองให้ตรง socket: {selectedCpu.socket}</span>
                  </div>
                )}

                {catalogStatus === 'failed' ? (
                  <ErrorState message={catalogError} onRetry={reloadCatalogs} />
                ) : catalogStatus !== 'succeeded' ? (
                  <ProductGridSkeleton />
                ) : (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">{pageOptions}</div>
                )}

                {catalogStatus === 'succeeded' && (
                  <ProductPagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    pageSize={PAGE_SIZE}
                    totalItems={stepOptions.length}
                    onPageChange={handlePageChange}
                  />
                )}
              </div>
            </div>
          </div>
        </Container>
      </section>


      {showCartPreview && (
        <BuildCartPreviewModal
          items={cartPreviewItems}
          onClose={() => setShowCartPreview(false)}
          onConfirm={handleConfirmCartPreview}
        />
      )}
    </>
  );
}
