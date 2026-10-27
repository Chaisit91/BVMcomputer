import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container } from '../components/ui/Container';
import { UpgradeHeroBanner } from '../components/upgrade/UpgradeHeroBanner';
import { UpgradeStepIndicator } from '../components/upgrade/UpgradeStepIndicator';
import { UpgradeSpecForm } from '../components/upgrade/UpgradeSpecForm';
import { UpgradeSidebar } from '../components/upgrade/UpgradeSidebar';
import { UpgradeArticles } from '../components/upgrade/UpgradeArticles';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { clearCurrentPart, setCurrentPart, setCurrentSpec, setUpgradeDetails } from '../features/upgrade/upgradeSlice';
import { getUnknownParts } from '../data/upgradeSpecFields';
import type { UpgradeComponentKey, UpgradeProduct } from '../types/upgrade';

/**
 * Step 1 of the upgrade-advisor flow — collects the customer's current spec, then
 * hands it to step 2 (choosing replacement parts) via the shared `upgrade` store slice.
 * Steps 3-5 (AI analysis, compatibility check, cart summary) aren't built yet.
 */
export function UpgradePcPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  // The form reads/writes the `upgrade` slice directly, so nothing typed is lost on navigation
  // and the support chat can offer to send it to an admin.
  const { currentSpec: selection, budget, usage, games } = useAppSelector((state) => state.upgrade);

  const [currentStep] = useState(1);

  const handleSelectComponent = (key: UpgradeComponentKey, product: UpgradeProduct) => {
    dispatch(setCurrentPart({ key, product }));
  };

  const handleClearComponent = (key: UpgradeComponentKey) => {
    dispatch(clearCurrentPart(key));
  };

  // Called by UpgradeSpecForm only after its validation passes.
  const handleSelectUpgradeParts = () => {
    dispatch(
      setCurrentSpec({
        currentSpec: selection,
        unknownParts: getUnknownParts(selection),
        budget,
        usage,
        games: games.trim(),
      }),
    );
    navigate('/upgrade-pc/select');
  };

  return (
    <>
      <section className="bg-slate-50 pb-16 pt-6">
        <Container>
          <UpgradeHeroBanner />
          <UpgradeStepIndicator currentStep={currentStep} />

          <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[1fr_320px]">
            <UpgradeSpecForm
              selection={selection}
              onSelectComponent={handleSelectComponent}
              onClearComponent={handleClearComponent}
              budget={budget}
              onBudgetChange={(value) => dispatch(setUpgradeDetails({ budget: value }))}
              usage={usage}
              onUsageChange={(value) => dispatch(setUpgradeDetails({ usage: value }))}
              games={games}
              onGamesChange={(value) => dispatch(setUpgradeDetails({ games: value }))}
              onSelectParts={handleSelectUpgradeParts}
            />

            <UpgradeSidebar />
          </div>

          <UpgradeArticles />
        </Container>
      </section>
    </>
  );
}
