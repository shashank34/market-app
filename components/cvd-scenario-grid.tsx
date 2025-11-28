'use client';

import { CVDScenarioCard } from './cvd-scenario-card';
import { scenarios } from '@/lib/cvd-scenarios';

export function CVDScenarioGrid() {
  // Group scenarios by CVD direction
  const cvdUpScenarios = scenarios.filter(s => s.cvdDirection === 'up');
  const cvdDownScenarios = scenarios.filter(s => s.cvdDirection === 'down');
  const cvdSidewaysScenarios = scenarios.filter(s => s.cvdDirection === 'sideways');

  return (
    <div className="space-y-8">
      {/* CVD UP ROW - All GREEN/BUY Scenarios */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className="h-1 w-12 bg-green-500 rounded"></div>
          <h2 className="text-2xl font-bold text-green-400">CVD UP (Bullish) 🟢</h2>
          <div className="h-1 flex-1 bg-green-500 rounded"></div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {cvdUpScenarios.map((scenario) => (
            <CVDScenarioCard key={scenario.id} scenario={scenario} />
          ))}
        </div>
      </div>

      {/* CVD DOWN ROW - All RED/SELL Scenarios */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className="h-1 w-12 bg-red-500 rounded"></div>
          <h2 className="text-2xl font-bold text-red-400">CVD DOWN (Bearish) 🔴</h2>
          <div className="h-1 flex-1 bg-red-500 rounded"></div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {cvdDownScenarios.map((scenario) => (
            <CVDScenarioCard key={scenario.id} scenario={scenario} />
          ))}
        </div>
      </div>

      {/* CVD SIDEWAYS ROW - All ORANGE/AVOID Scenarios */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className="h-1 w-12 bg-orange-500 rounded"></div>
          <h2 className="text-2xl font-bold text-orange-400">CVD SIDEWAYS (Weak) ⚠️</h2>
          <div className="h-1 flex-1 bg-orange-500 rounded"></div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {cvdSidewaysScenarios.map((scenario) => (
            <CVDScenarioCard key={scenario.id} scenario={scenario} />
          ))}
        </div>
      </div>
    </div>
  );
}
