import { useMemo, useState } from 'react';
import type { IconType } from 'react-icons';
import { BsCpu, BsGpuCard, BsHdd, BsMemory, BsMotherboard, BsPlug, BsSnow2 } from 'react-icons/bs';
import { PiComputerTower } from 'react-icons/pi';
import { Container } from '../components/ui/Container';
import { BuildHeroBanner } from '../components/build/BuildHeroBanner';
import { BuildOptionCard } from '../components/build/BuildOptionCard';
import { BuildSummarySidebar, type BuildSummaryRow } from '../components/build/BuildSummarySidebar';
import { BuildCartPreviewModal, type BuildCartPreviewItem } from '../components/build/BuildCartPreviewModal';
import { ServiceBadges } from '../components/shared/ServiceBadges';
import { useAppDispatch } from '../app/hooks';
import { addToCart } from '../features/cart/cartSlice';
import type { CategoryIconKey } from '../types';
import { cpuProducts, type CpuProduct } from '../data/cpuProducts';
import { motherboardProducts, type MotherboardProduct } from '../data/motherboardProducts';
import { gpuProducts, type GpuProduct } from '../data/gpuProducts';
import { ramProducts, type RamProduct } from '../data/ramProducts';
import { storageProducts, type StorageProduct } from '../data/storageProducts';
import { psuProducts, type PsuProduct } from '../data/psuProducts';
import { caseProducts, type CaseProduct } from '../data/caseProducts';
import { coolingProducts, type CoolingProduct } from '../data/coolingProducts';

export type StepId = 'cpu' | 'motherboard' | 'gpu' | 'ram' | 'storage' | 'psu' | 'case' | 'cooling';

interface StepMeta {
  id: StepId;
  label: string;
  icon: IconType;
  required: boolean;
}

const stepMeta: StepMeta[] = [
  { id: 'cpu', label: 'ซีพียู', icon: BsCpu, required: true },
  { id: 'motherboard', label: 'เมนบอร์ด', icon: BsMotherboard, required: true },
  { id: 'gpu', label: 'การ์ดจอ', icon: BsGpuCard, required: false },
  { id: 'ram', label: 'แรม', icon: BsMemory, required: true },
  { id: 'storage', label: 'สตอเรจ', icon: BsHdd, required: true },
  { id: 'psu', label: 'พาวเวอร์ซัพพลาย', icon: BsPlug, required: true },
  { id: 'case', label: 'เคส', icon: PiComputerTower, required: true },
  { id: 'cooling', label: 'ชุดระบายความร้อน', icon: BsSnow2, required: false },
];

export function BuildCategoryPage() {
  const dispatch = useAppDispatch();
  const [activeStep, setActiveStep] = useState<StepId>('cpu');
  const [showCartPreview, setShowCartPreview] = useState(false);

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
    () => (selectedCpu ? motherboardProducts.filter((m) => m.socket === selectedCpu.socket) : motherboardProducts),
    [selectedCpu],
  );
  const compatibleCoolers = useMemo(
    () => (selectedCpu ? coolingProducts.filter((c) => c.socket === selectedCpu.socket) : coolingProducts),
    [selectedCpu],
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
        return cpuProducts.map((p) => (
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
        return gpuProducts.map((p) => (
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
        return ramProducts.map((p) => (
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
        return storageProducts.map((p) => (
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
        return psuProducts.map((p) => (
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
        return caseProducts.map((p) => (
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

  const currentIndex = stepMeta.findIndex((step) => step.id === activeStep);

  const goToStep = (offset: number) => {
    const nextIndex = currentIndex + offset;
    if (nextIndex >= 0 && nextIndex < stepMeta.length) {
      setActiveStep(stepMeta[nextIndex].id as StepId);
    }
  };

  return (
    <>
      <BuildHeroBanner />

      <section className="bg-slate-50 py-8">
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

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">{renderStepOptions()}</div>

                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
                  <button
                    type="button"
                    onClick={() => goToStep(-1)}
                    disabled={currentIndex === 0}
                    className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    ก่อนหน้า
                  </button>
                  <button
                    type="button"
                    onClick={() => goToStep(1)}
                    disabled={currentIndex === stepMeta.length - 1}
                    className="rounded-full bg-brand px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-dark disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
                  >
                    ถัดไป
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <ServiceBadges />

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
