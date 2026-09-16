import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiChevronRight } from 'react-icons/fi';
import { Container } from '../components/ui/Container';
import { UpgradeHeroBanner } from '../components/upgrade/UpgradeHeroBanner';
import { UpgradeStepIndicator } from '../components/upgrade/UpgradeStepIndicator';
import { UpgradeSpecForm } from '../components/upgrade/UpgradeSpecForm';
import { UpgradeSidebar } from '../components/upgrade/UpgradeSidebar';
import { UpgradeArticles } from '../components/upgrade/UpgradeArticles';
import { ServiceBadges } from '../components/shared/ServiceBadges';
import { analyzeUpgradeSpec } from '../services/upgrade/aiService';
import type { UpgradeComponentKey, UpgradeProduct, UpgradeSelection } from '../types/upgrade';

/**
 * Step 1 of the upgrade-advisor flow — steps 2-5 (AI analysis, part recommendations,
 * compatibility check, cart summary) aren't built yet; this page just collects the
 * current-spec input and calls the (mocked) AI service, per the current scope.
 */
export function UpgradePcPage() {
  const [currentStep] = useState(1);
  const [selection, setSelection] = useState<UpgradeSelection>({});
  const [budget, setBudget] = useState('');
  const [usage, setUsage] = useState('');
  const [games, setGames] = useState('');
  const [aiStatus, setAiStatus] = useState<'idle' | 'loading' | 'ready'>('idle');
  const [aiMessage, setAiMessage] = useState<string | null>(null);

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

  // Placeholder for the real AI call — a teammate owns POST /api/upgrade/analyze.
  // Swapping analyzeUpgradeSpec's implementation for a real fetch later needs no
  // changes here, since the request/response shape is already fixed.
  const handleAnalyzeWithAI = async () => {
    setAiStatus('loading');
    setAiMessage(null);
    const response = await analyzeUpgradeSpec({ selected: selection, budget, usage, games });
    setAiStatus('ready');
    setAiMessage(response.message);
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
              aiStatus={aiStatus}
              aiMessage={aiMessage}
              onAnalyze={handleAnalyzeWithAI}
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
