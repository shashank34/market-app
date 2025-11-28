'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Scenario } from '@/lib/cvd-scenarios';
import { CandlestickChart } from './candlestick-chart';
import { CVDChart } from './cvd-chart';
import { TrendingUp, TrendingDown, Target, ShieldAlert, Clock } from 'lucide-react';

interface CVDScenarioCardProps {
  scenario: Scenario;
}

// Simple trading rules for anyone to understand
function getSimpleRule(scenario: Scenario): string {
  const rules: Record<number, string> = {
    1: '✅ LOOK: Price going UP + CVD going UP (both green candles). ENTRY: When CVD breaks above purple line (previous high).',
    2: '❌ LOOK: Price going UP BUT CVD going DOWN (CVD red candles). Fake move! ENTRY: When CVD fails to break high and turns down.',
    3: '⚠️ LOOK: Price UP but CVD sideways (mixed colors, no clear direction). Weak! Small trade only.',
    4: '✅ LOOK: Price DOWN but CVD UP (opposite directions = DIVERGENCE!). Smart money buying. ENTRY: When CVD breaks above purple line.',
    5: '❌ LOOK: Price DOWN + CVD DOWN (both red candles). Strong selling! ENTRY: When CVD breaks below purple line (previous low).',
    6: '⚠️ LOOK: Price DOWN but CVD flat (no clear trend). Weak sell. Small trade.',
    7: '📌 LOOK: Price stuck in range BUT CVD climbing (green candles). Buyers loading! ENTRY: When price breaks above range.',
    8: '📌 LOOK: Price stuck in range BUT CVD falling (red candles). Sellers unloading! ENTRY: When price breaks below range.',
    9: '⏸️ LOOK: Both price and CVD choppy (no clear pattern). NO TRADE! Wait for clear direction.'
  };
  return rules[scenario.id] || 'Follow the pattern!';
}

// Format entry time from timestamp
function formatEntryTime(scenario: Scenario): string {
  if (scenario.action === 'WAIT' || scenario.tradeSetup.entryTime < 0) {
    return 'N/A';
  }
  const candle = scenario.priceData[scenario.tradeSetup.entryTime];
  const date = new Date(candle.time * 1000);
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'UTC' });
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
          <p className="text-[10px] font-semibold text-slate-300 mb-1">🎯 TRADING RULE:</p>
          <p className="text-xs text-slate-200">
            {getSimpleRule(scenario)}
          </p>
        </div>
        
        {/* Visual Guide */}
        <div className="mt-2 p-2 bg-blue-500/10 rounded-lg border border-blue-500/30">
          <p className="text-[10px] font-semibold text-blue-300 mb-1">👁️ HOW TO READ:</p>
          <div className="text-[10px] text-slate-300 space-y-1">
            <p>• <span className="text-green-400">Green candles</span> = Buying pressure (CVD rising)</p>
            <p>• <span className="text-red-400">Red candles</span> = Selling pressure (CVD falling)</p>
            <p>• <span className="text-purple-400">Purple dots</span> = Key swing points</p>
            <p>• <span className="text-orange-400">Orange line</span> = Breakout level for entry</p>
            <p>• <span className="text-blue-400">Blue arrow</span> = Entry point</p>
          </div>
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
            entryTime={scenario.tradeSetup.entryTime}
          />
        </div>

        {/* Trade Setup Details */}
        {scenario.action !== 'WAIT' && (
          <div className="pt-2 border-t border-slate-700">
            {/* Entry Time Display */}
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 mb-3">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Clock className="w-4 h-4 text-blue-400" />
                <p className="text-xs text-blue-300 font-semibold uppercase">Entry Time</p>
              </div>
              <p className="text-center text-lg font-bold text-blue-400">
                {formatEntryTime(scenario)}
              </p>
              <p className="text-center text-[10px] text-slate-400 mt-1">
                Candle #{scenario.tradeSetup.entryTime} (5-min chart)
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
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
          </div>
        )}
      </CardContent>
    </Card>
  );
}
