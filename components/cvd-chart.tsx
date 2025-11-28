'use client';

import { useEffect, useRef } from 'react';
import { createChart, CandlestickSeries, Time, createSeriesMarkers } from 'lightweight-charts';
import { CVDData } from '@/lib/cvd-scenarios';

interface CVDChartProps {
  data: CVDData[];
  color: 'green' | 'red' | 'orange';
  entryTime?: number;
}

export function CVDChart({ data, color, entryTime }: CVDChartProps) {
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
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
      },
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

    // Add horizontal lines for key swing points
    const structurePoints = data.filter(candle => candle.isStructurePoint);
    structurePoints.forEach((point, index) => {
      const isHigh = point.structureLabel?.includes('H') && !point.structureLabel?.includes('L');
      const priceLevel = isHigh ? point.high : point.low;
      
      candlestickSeries.createPriceLine({
        price: priceLevel,
        color: '#a855f7',
        lineWidth: 1,
        lineStyle: 1, // Dotted
        axisLabelVisible: true,
        title: '',
      });
    });

    // Highlight the previous structure level that triggers entry
    if (entryTime !== undefined && entryTime > 0) {
      // Find the key structure point before entry
      const relevantStructure = structurePoints.filter(p => {
        const pIndex = data.indexOf(p);
        return pIndex < entryTime && pIndex > entryTime - 20;
      }).pop();
      
      if (relevantStructure) {
        const isHigh = relevantStructure.structureLabel?.includes('H');
        const triggerLevel = isHigh ? relevantStructure.high : relevantStructure.low;
        
        candlestickSeries.createPriceLine({
          price: triggerLevel,
          color: '#fb923c',
          lineWidth: 2,
          lineStyle: 0, // Solid
          axisLabelVisible: true,
          title: 'BREAKOUT',
        });
      }
    }

    // Add markers for patterns and structure points
    const markers = data
      .filter((candle) => candle.isStructurePoint)
      .map((candle) => ({
        time: candle.time as Time,
        position: 'belowBar' as any,
        color: '#a855f7',
        shape: 'circle' as any,
      }));
    
    // Add entry marker if entryTime is provided
    if (entryTime !== undefined && entryTime >= 0 && entryTime < data.length) {
      markers.push({
        time: data[entryTime].time as Time,
        position: 'belowBar' as any,
        color: '#3b82f6',
        shape: 'arrowUp' as any,
      });
    }
    
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
  }, [data, entryTime]);

  return (
    <div className="relative">
      <div ref={chartContainerRef} className="w-full" />
    </div>
  );
}
