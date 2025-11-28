'use client';

import { CVDScenarioGrid } from '@/components/cvd-scenario-grid';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 md:p-8">
      <div className="max-w-[1800px] mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            CVD Trading Strategy
          </h1>
          <p className="text-slate-400 text-lg mb-6">
            Complete Guide to Cumulative Volume Delta (CVD) Trading with Exact Entry, Target & Stop Loss
          </p>
          
          <div className="flex flex-wrap justify-center gap-4 text-sm mb-6">
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg px-4 py-2">
              <span className="text-green-400 font-semibold">🟢 CVD UP = Bullish</span>
            </div>
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-2">
              <span className="text-red-400 font-semibold">🔴 CVD DOWN = Bearish</span>
            </div>
            <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg px-4 py-2">
              <span className="text-orange-400 font-semibold">⚠️ CVD SIDEWAYS = Weak/Wait</span>
            </div>
          </div>
          
          {/* Chart Legend */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 max-w-4xl mx-auto mb-6">
            <h3 className="text-sm font-bold text-white mb-3">📊 How to Read the Charts:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="flex items-start gap-2">
                <span className="text-yellow-400 text-lg">⭐</span>
                <div>
                  <p className="text-white font-semibold">Star = Candlestick Pattern</p>
                  <p className="text-slate-400">Shows Hammer, Engulfing, Doji patterns</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-purple-400 text-lg">●</span>
                <div>
                  <p className="text-white font-semibold">Purple Dot = Market Structure</p>
                  <p className="text-slate-400">HH (Higher High), HL (Higher Low), LH (Lower High), LL (Lower Low)</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-blue-400 text-lg">▬</span>
                <div>
                  <p className="text-white font-semibold">Blue Line = Entry Point</p>
                  <p className="text-slate-400">Where to enter the trade</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-400 text-lg">▬</span>
                <div>
                  <p className="text-white font-semibold">Green Line = Target</p>
                  <p className="text-slate-400">Where to take profit</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-red-400 text-lg">▬</span>
                <div>
                  <p className="text-white font-semibold">Red Line = Stop Loss</p>
                  <p className="text-slate-400">Where to exit if wrong</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-slate-400 text-lg">🔵</span>
                <div>
                  <p className="text-white font-semibold">Blue Dot = Exact Entry Time</p>
                  <p className="text-slate-400">The exact candle to enter</p>
                </div>
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <p className="text-blue-300 font-bold text-sm mb-2">💡 ENTRY TIMING RULE (Most Important!):</p>
              <ul className="text-slate-300 text-xs space-y-1 list-disc list-inside">
                <li><strong>For BUY:</strong> Enter when CVD breaks its previous High (HH) OR when price breaks above range</li>
                <li><strong>For SELL:</strong> Enter when CVD breaks its previous Low (LL) OR when price breaks below range</li>
                <li><strong>For WAIT:</strong> Do nothing until you see clear structure break on BOTH charts</li>
              </ul>
            </div>
          </div>
        </div>

        <CVDScenarioGrid />
      </div>
    </main>
  );
}
