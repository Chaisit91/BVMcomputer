import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiChevronRight } from 'react-icons/fi';
import { Container } from '../components/ui/Container';
import { UpgradeHeroBanner } from '../components/upgrade/UpgradeHeroBanner';
import { UpgradeStepIndicator } from '../components/upgrade/UpgradeStepIndicator';
import { UpgradeSpecForm } from '../components/upgrade/UpgradeSpecForm';
import { UpgradeSidebar } from '../components/upgrade/UpgradeSidebar';
import { UpgradeArticles } from '../components/upgrade/UpgradeArticles';
import { ServiceBadges } from '../components/shared/ServiceBadges';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { setCurrentSpec } from '../features/upgrade/upgradeSlice';
import type { UpgradeComponentKey, UpgradeProduct, UpgradeSelection } from '../types/upgrade';

/**
 * Step 1 of the upgrade-advisor flow — collects the customer's current spec, then
 * hands it to step 2 (choosing replacement parts) via the shared `upgrade` store slice.
 * Steps 3-5 (AI analysis, compatibility check, cart summary) aren't built yet.
 */
export function UpgradePcPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const stored = useAppSelector((state) => state.upgrade);

  const [currentStep] = useState(1);
  // Seeded from the store so coming back from step 2 doesn't wipe what was typed.
  const [selection, setSelection] = useState<UpgradeSelection>(stored.currentSpec);
  const [budget, setBudget] = useState(stored.budget);
  const [usage, setUsage] = useState(stored.usage);
  const [games, setGames] = useState(stored.games);

  const handleSelectComponent = (key: UpgradeComponentKey, product: UpgradeProduct) => {
    setSelection((prev) => ({ ...prev, [key]: product }));
  };

  const handleClearComponent = (key: UpgradeComponentKey) => {
    setSelection((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const handleSelectUpgradeParts = () => {
    dispatch(setCurrentSpec({ currentSpec: selection, budget, usage, games }));
    navigate('/upgrade-pc/select');
  };

  return (
    <>
      <section className="bg-slate-50 pb-0 pt-6">
        <Container>
          <nav className="mb-4 flex items-center gap-1.5 text-xs text-slate-400">
            <Link to="/" className="hover:text-brand">
              หน้าแรก
            </Link>
            <FiChevronRight size={12} aria-hidden="true" />
            <span className="text-slate-500">อัปเกรดคอมเก่า</span>
          </nav>

          <UpgradeHeroBanner />
          <UpgradeStepIndicator currentStep={currentStep} />

          <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[1fr_320px]">
            <UpgradeSpecForm
              selection={selection}
              onSelectComponent={handleSelectComponent}
              onClearComponent={handleClearComponent}
              budget={budget}
              onBudgetChange={setBudget}
              usage={usage}
              onUsageChange={setUsage}
              games={games}
              onGamesChange={setGames}
              onSelectParts={handleSelectUpgradeParts}
            />

            <UpgradeSidebar />
          </div>

          <UpgradeArticles />
        </Container>
      </section>

      <ServiceBadges />
    </>
  );
}
