'use client';

import { useEffect, useRef } from 'react';
import { createChart, CandlestickSeries, Time, createSeriesMarkers } from 'lightweight-charts';
import { CVDData } from '@/lib/cvd-scenarios';

interface CVDChartProps {
  data: CVDData[];
  color: 'green' | 'red' | 'orange';
}

export function CVDChart({ data, color }: CVDChartProps) {
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
      height: 180,
    });

    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#10b981',
      downColor: '#ef4444',
      borderUpColor: '#10b981',
      borderDownColor: '#ef4444',
      wickUpColor: '#10b981',
      wickDownColor: '#ef4444',
    });

    // Transform CVD data for lightweight-charts format
    const chartData = data.map((candle) => ({
      time: candle.time as Time,
      open: candle.open,
      high: candle.high,
      low: candle.low,
      close: candle.close,
    }));

    candlestickSeries.setData(chartData);

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
  }, [data]);

  return (
    <div className="relative">
      <div ref={chartContainerRef} className="w-full" />
    </div>
  );
}
