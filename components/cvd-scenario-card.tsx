'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Scenario } from '@/lib/cvd-scenarios';
import { CandlestickChart } from './candlestick-chart';
import { CVDChart } from './cvd-chart';
import { TrendingUp, TrendingDown, Target, ShieldAlert } from 'lucide-react';

interface CVDScenarioCardProps {
  scenario: Scenario;
}

// Simple trading rules for anyone to understand
function getSimpleRule(scenario: Scenario): string {
  const rules: Record<number, string> = {
    1: '✅ When BOTH Price AND CVD go UP together = STRONG BUY. Enter when CVD breaks previous high (HH).',
    2: '❌ Price UP but CVD DOWN = FAKE move! Sell when CVD makes lower high (LH) - reversal coming.',
    3: '⚠️ Price UP but CVD flat = WEAK. Small target only. Exit fast if CVD starts falling.',
    4: '✅ Price DOWN but CVD UP = Smart money buying the dip! BUY when CVD breaks previous high (HH).',
    5: '❌ BOTH Price AND CVD go DOWN = STRONG SELL. Enter when CVD breaks previous low (LL).',
    6: '⚠️ Price DOWN but CVD flat = WEAK selling. Small target. Watch for reversal.',
    7: '📌 Price SIDEWAYS but CVD UP = Accumulation! BUY when price breaks ABOVE the range.',
    8: '📌 Price SIDEWAYS but CVD DOWN = Distribution! SELL when price breaks BELOW the range.',
    9: '⏸️ BOTH flat = NO SIGNAL. Do NOT trade. Wait for clear direction on BOTH charts.'
  };
  return rules[scenario.id] || 'Follow the pattern!';
}

export function CVDScenarioCard({ scenario }: CVDScenarioCardProps) {
  const borderColor = 
    scenario.color === 'green' ? 'border-green-500/30' :
    scenario.color === 'red' ? 'border-red-500/30' :
    'border-orange-500/30';

  const bgColor = 
    scenario.color === 'green' ? 'bg-green-500/5' :
    scenario.color === 'red' ? 'bg-red-500/5' :
    'bg-orange-500/5';

  const actionColor = 
    scenario.color === 'green' ? 'bg-green-500 hover:bg-green-600' :
    scenario.color === 'red' ? 'bg-red-500 hover:bg-red-600' :
    'bg-orange-500 hover:bg-orange-600';

  const textColor = 
    scenario.color === 'green' ? 'text-green-400' :
    scenario.color === 'red' ? 'text-red-400' :
    'text-orange-400';

  return (
    <Card className={`${bgColor} ${borderColor} border-2 backdrop-blur-sm bg-slate-900/50`}>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start gap-2">
          <div>
            <CardTitle className="text-lg font-bold text-white mb-2">
              {scenario.title}
            </CardTitle>
            <p className={`text-xs font-semibold ${textColor}`}>
              {scenario.sentiment}
            </p>
          </div>
          <Badge className={`${actionColor} text-white font-bold px-3 py-1`}>
            {scenario.action}
          </Badge>
        </div>
        <p className="text-xs text-slate-400 mt-2">
          {scenario.description}
        </p>
        
        {/* Simple Trading Rule */}
        <div className="mt-3 p-2 bg-slate-800/70 rounded-lg border border-slate-700">
          <p className="text-[10px] font-semibold text-slate-300 mb-1">🎯 SIMPLE RULE:</p>
          <p className="text-xs text-slate-200">
            {getSimpleRule(scenario)}
          </p>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Price Chart */}
        <div>
          <h4 className="text-xs font-semibold text-slate-300 mb-2 flex items-center gap-2">
            📈 Price Action
          </h4>
          <CandlestickChart 
            data={scenario.priceData} 
            tradeSetup={scenario.tradeSetup}
            color={scenario.color}
          />
        </div>

        {/* CVD Chart */}
        <div>
          <h4 className="text-xs font-semibold text-slate-300 mb-2 flex items-center gap-2">
            📊 CVD (Volume Delta)
          </h4>
          <CVDChart 
            data={scenario.cvdData} 
            color={scenario.color}
          />
        </div>

        {/* Trade Setup Details */}
        {scenario.action !== 'WAIT' && (
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-700">
            <div className="bg-slate-800/50 rounded-lg p-2">
              <div className="flex items-center gap-1 mb-1">
                <TrendingUp className="w-3 h-3 text-blue-400" />
                <p className="text-[10px] text-slate-400 uppercase">Entry</p>
              </div>
              <p className="text-sm font-bold text-white">
                ${scenario.tradeSetup.entry.toFixed(2)}
              </p>
            </div>

            <div className="bg-slate-800/50 rounded-lg p-2">
              <div className="flex items-center gap-1 mb-1">
                <Target className="w-3 h-3 text-green-400" />
                <p className="text-[10px] text-slate-400 uppercase">Target</p>
              </div>
              <p className="text-sm font-bold text-green-400">
                ${scenario.tradeSetup.target.toFixed(2)}
              </p>
            </div>

            <div className="bg-slate-800/50 rounded-lg p-2">
              <div className="flex items-center gap-1 mb-1">
                <ShieldAlert className="w-3 h-3 text-red-400" />
                <p className="text-[10px] text-slate-400 uppercase">Stop Loss</p>
              </div>
              <p className="text-sm font-bold text-red-400">
                ${scenario.tradeSetup.stopLoss.toFixed(2)}
              </p>
            </div>

            <div className="bg-slate-800/50 rounded-lg p-2">
              <div className="flex items-center gap-1 mb-1">
                <TrendingDown className="w-3 h-3 text-purple-400" />
                <p className="text-[10px] text-slate-400 uppercase">R:R</p>
              </div>
              <p className="text-sm font-bold text-purple-400">
                {scenario.tradeSetup.riskReward}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
