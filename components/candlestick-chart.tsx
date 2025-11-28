'use client';

import { useEffect, useRef } from 'react';
import { createChart, CandlestickSeries, Time, createSeriesMarkers } from 'lightweight-charts';
import { CandleData, TradeSetup } from '@/lib/cvd-scenarios';

interface CandlestickChartProps {
  data: CandleData[];
  tradeSetup: TradeSetup;
  color: 'green' | 'red' | 'orange';
}

export function CandlestickChart({ data, tradeSetup, color }: CandlestickChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { color: '#0f172a' },
        textColor: '#94a3b8',
      },
      grid: {
        vertLines: { color: '#334155' },
        horzLines: { color: '#334155' },
      },
      width: chartContainerRef.current.clientWidth,
      height: 250,
    });

    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#10b981',
      downColor: '#ef4444',
      borderUpColor: '#10b981',
      borderDownColor: '#ef4444',
      wickUpColor: '#10b981',
      wickDownColor: '#ef4444',
    });

    // Transform data for lightweight-charts format
    const chartData = data.map((candle) => ({
      time: candle.time as Time,
      open: candle.open,
      high: candle.high,
      low: candle.low,
      close: candle.close,
    }));

    candlestickSeries.setData(chartData);

    // Add price lines for entry, target, stop loss
    if (tradeSetup.entry > 0) {
      candlestickSeries.createPriceLine({
        price: tradeSetup.entry,
        color: '#3b82f6',
        lineWidth: 2,
        lineStyle: 2, // Dashed
        axisLabelVisible: true,
        title: 'ENTRY',
      });

      candlestickSeries.createPriceLine({
        price: tradeSetup.target,
        color: '#10b981',
        lineWidth: 2,
        lineStyle: 2,
        axisLabelVisible: true,
        title: 'TARGET',
      });

      candlestickSeries.createPriceLine({
        price: tradeSetup.stopLoss,
        color: '#ef4444',
        lineWidth: 2,
        lineStyle: 2,
        axisLabelVisible: true,
        title: 'STOP',
      });
    }

    // Add markers for patterns and structure points (no text labels)
    const markers = data
      .filter((candle) => candle.pattern || candle.isStructurePoint)
      .map((candle) => ({
        time: candle.time as Time,
        position: (candle.pattern ? 'aboveBar' : 'belowBar') as any,
        color: candle.pattern ? '#fbbf24' : '#a855f7',
        shape: 'circle' as any,
      }));
    
    // v5 API: Create markers primitive instead of calling setMarkers on series
    createSeriesMarkers(candlestickSeries, markers);

    chart.timeScale().fitContent();

    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [data, tradeSetup]);

  return (
    <div className="relative">
      <div ref={chartContainerRef} className="w-full" />
    </div>
  );
}
