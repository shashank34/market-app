export interface CandleData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  pattern?: string; // Pattern name like 'engulfing', 'hammer', 'doji'
  isStructurePoint?: boolean; // Marks HH, HL, LH, LL
  structureLabel?: string; // 'HH', 'HL', 'LH', 'LL'
}

export interface CVDData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  pattern?: string;
  isStructurePoint?: boolean;
  structureLabel?: string;
}

export interface TradeSetup {
  entry: number;
  target: number;
  stopLoss: number;
  entryTime: number;
  riskReward: string;
}

export interface Scenario {
  id: number;
  title: string;
  priceDirection: 'up' | 'down' | 'sideways';
  cvdDirection: 'up' | 'down' | 'sideways';
  action: 'BUY' | 'SELL' | 'CAREFUL' | 'PREPARE BUY' | 'PREPARE SELL' | 'WAIT';
  sentiment: 'VERY BULLISH' | 'BULLISH DIVERGENCE' | 'VERY BEARISH' | 'BEARISH DIVERGENCE' | 'ACCUMULATION' | 'DISTRIBUTION' | 'WEAK' | 'NO SIGNAL';
  color: 'green' | 'red' | 'orange';
  description: string;
  priceData: CandleData[];
  cvdData: CVDData[];
  tradeSetup: TradeSetup;
}

// Simple seeded random for consistent data across server and client
function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

// Create specific candlestick patterns
function createBullishEngulfing(prevClose: number, seed: number): { open: number; high: number; low: number; close: number; pattern: string } {
  const open = prevClose - seededRandom(seed) * 1.5 - 0.5;
  const close = open + seededRandom(seed + 1) * 4 + 3; // Bigger body
  const high = close + seededRandom(seed + 2) * 0.8 + 0.3;
  const low = open - seededRandom(seed + 3) * 0.8 - 0.3;
  return { open, high, low, close, pattern: 'Bullish Engulfing' };
}

function createBearishEngulfing(prevClose: number, seed: number): { open: number; high: number; low: number; close: number; pattern: string } {
  const open = prevClose + seededRandom(seed) * 1.5 + 0.5;
  const close = open - seededRandom(seed + 1) * 4 - 3; // Bigger body
  const high = open + seededRandom(seed + 2) * 0.8 + 0.3;
  const low = close - seededRandom(seed + 3) * 0.8 - 0.3;
  return { open, high, low, close, pattern: 'Bearish Engulfing' };
}

function createHammer(prevClose: number, seed: number): { open: number; high: number; low: number; close: number; pattern: string } {
  const open = prevClose - seededRandom(seed) * 0.8;
  const close = open + seededRandom(seed + 1) * 1.2 + 0.8; // Small body
  const low = open - seededRandom(seed + 2) * 4 - 2; // Long lower wick
  const high = close + seededRandom(seed + 3) * 0.4;
  return { open, high, low, close, pattern: 'Hammer' };
}

function createInvertedHammer(prevClose: number, seed: number): { open: number; high: number; low: number; close: number; pattern: string } {
  const open = prevClose + seededRandom(seed) * 0.8;
  const close = open - seededRandom(seed + 1) * 1.2 - 0.8; // Small body
  const high = open + seededRandom(seed + 2) * 4 + 2; // Long upper wick
  const low = close - seededRandom(seed + 3) * 0.4;
  return { open, high, low, close, pattern: 'Inverted Hammer' };
}

function createDoji(prevClose: number, seed: number): { open: number; high: number; low: number; close: number; pattern: string } {
  const open = prevClose;
  const close = open + (seededRandom(seed) - 0.5) * 0.3; // Very small body
  const high = open + seededRandom(seed + 1) * 2 + 1; // Long wicks both sides
  const low = open - seededRandom(seed + 2) * 2 - 1;
  return { open, high, low, close, pattern: 'Doji' };
}

// Generate price data with clear market structure
function generatePriceData(pattern: 'uptrend' | 'downtrend' | 'sideways', seed: number): CandleData[] {
  const data: CandleData[] = [];
  let seedCounter = seed;
  
  if (pattern === 'uptrend') {
    // UPTREND: Clear Higher Highs and Higher Lows
    let price = 95;
    const swings = [
      { type: 'HL', at: 3, low: 95 },
      { type: 'HH', at: 7, high: 108 },
      { type: 'HL', at: 11, low: 102 },
      { type: 'HH', at: 15, high: 118 },
      { type: 'HL', at: 19, low: 112 },
      { type: 'HH', at: 23, high: 128 }
    ];
    
    for (let i = 0; i < 25; i++) {
      const swing = swings.find(s => s.at === i);
      let candle: any;
      let isStructurePoint = false;
      let structureLabel: string | undefined;
      
      if (swing?.type === 'HL' && swing.low !== undefined) {
        // Hammer at swing low
        candle = createHammer(swing.low + 2, seedCounter);
        price = candle.close;
        isStructurePoint = true;
        structureLabel = 'HL';
      } else if (swing?.type === 'HH' && swing.high !== undefined) {
        // Bullish engulfing at swing high
        candle = createBullishEngulfing(price, seedCounter);
        candle.high = swing.high;
        candle.close = swing.high - 1;
        price = candle.close;
        isStructurePoint = true;
        structureLabel = 'HH';
      } else {
        // Regular candles moving toward next swing
        const nextSwing = swings.find(s => s.at > i);
        const targetPrice = nextSwing ? (nextSwing.type === 'HH' ? ((nextSwing.high ?? price) - 3) : ((nextSwing.low ?? price) + 3)) : price;
        const step = (targetPrice - price) / (nextSwing ? nextSwing.at - i : 1);
        
        const isBullish = step > 0 ? seededRandom(seedCounter++) > 0.25 : seededRandom(seedCounter++) < 0.25;
        const open = price;
        const bodySize = Math.abs(step) * seededRandom(seedCounter++) * 2 + 1.2; // Bigger bodies
        const close = isBullish ? open + bodySize : open - bodySize * 0.4;
        
        candle = {
          open,
          close,
          high: Math.max(open, close) + seededRandom(seedCounter++) * 1.5 + 0.5,
          low: Math.min(open, close) - seededRandom(seedCounter++) * 1.2 - 0.4,
          pattern: undefined
        };
        price = close;
      }
      
      seedCounter += 10;
      data.push({
        time: i,
        open: parseFloat(candle.open.toFixed(2)),
        high: parseFloat(candle.high.toFixed(2)),
        low: parseFloat(candle.low.toFixed(2)),
        close: parseFloat(candle.close.toFixed(2)),
        volume: seededRandom(seedCounter++) * 1000 + 500,
        pattern: candle.pattern,
        isStructurePoint,
        structureLabel
      });
    }
  } else if (pattern === 'downtrend') {
    // DOWNTREND: Clear Lower Highs and Lower Lows
    let price = 100;
    const swings = [
      { type: 'LH', at: 3, high: 100 },
      { type: 'LL', at: 7, low: 88 },
      { type: 'LH', at: 11, high: 94 },
      { type: 'LL', at: 15, low: 78 },
      { type: 'LH', at: 19, high: 84 },
      { type: 'LL', at: 23, low: 70 }
    ];
    
    for (let i = 0; i < 25; i++) {
      const swing = swings.find(s => s.at === i);
      let candle: any;
      let isStructurePoint = false;
      let structureLabel: string | undefined;
      
      if (swing?.type === 'LH' && swing.high !== undefined) {
        // Inverted hammer at swing high
        candle = createInvertedHammer(swing.high - 2, seedCounter);
        price = candle.close;
        isStructurePoint = true;
        structureLabel = 'LH';
      } else if (swing?.type === 'LL' && swing.low !== undefined) {
        // Bearish engulfing at swing low
        candle = createBearishEngulfing(price, seedCounter);
        candle.low = swing.low;
        candle.close = swing.low + 1;
        price = candle.close;
        isStructurePoint = true;
        structureLabel = 'LL';
      } else {
        // Regular candles
        const nextSwing = swings.find(s => s.at > i);
        const targetPrice = nextSwing ? (nextSwing.type === 'LL' ? ((nextSwing.low ?? price) + 3) : ((nextSwing.high ?? price) - 3)) : price;
        const step = (targetPrice - price) / (nextSwing ? nextSwing.at - i : 1);
        
        const isBearish = step < 0 ? seededRandom(seedCounter++) > 0.25 : seededRandom(seedCounter++) < 0.25;
        const open = price;
        const bodySize = Math.abs(step) * seededRandom(seedCounter++) * 2 + 1.2; // Bigger bodies
        const close = isBearish ? open - bodySize : open + bodySize * 0.4;
        
        candle = {
          open,
          close,
          high: Math.max(open, close) + seededRandom(seedCounter++) * 1.2 + 0.4,
          low: Math.min(open, close) - seededRandom(seedCounter++) * 1.5 - 0.5,
          pattern: undefined
        };
        price = close;
      }
      
      seedCounter += 10;
      data.push({
        time: i,
        open: parseFloat(candle.open.toFixed(2)),
        high: parseFloat(candle.high.toFixed(2)),
        low: parseFloat(candle.low.toFixed(2)),
        close: parseFloat(candle.close.toFixed(2)),
        volume: seededRandom(seedCounter++) * 1000 + 500,
        pattern: candle.pattern,
        isStructurePoint,
        structureLabel
      });
    }
  } else {
    // SIDEWAYS: Range-bound with clear support/resistance and continuous flow
    const rangeHigh = 105;
    const rangeLow = 95;
    const rangeMid = 100;
    let price = rangeMid;
    
    for (let i = 0; i < 25; i++) {
      let candle: any;
      let isStructurePoint = false;
      let structureLabel: string | undefined;
      
      // Bounce at support
      if (i === 5 || i === 13 || i === 21) {
        candle = createHammer(rangeLow + 1, seedCounter);
        candle.low = rangeLow;
        candle.close = rangeLow + 2;
        price = candle.close;
        isStructurePoint = true;
        structureLabel = 'Support';
      }
      // Rejection at resistance
      else if (i === 9 || i === 17) {
        candle = createInvertedHammer(rangeHigh - 1, seedCounter);
        candle.high = rangeHigh;
        candle.close = rangeHigh - 2;
        price = candle.close;
        isStructurePoint = true;
        structureLabel = 'Resistance';
      }
      // Doji at mid-range
      else if (i === 3 || i === 11 || i === 19) {
        candle = createDoji(price, seedCounter);
        candle.open = price;
        candle.close = price + (seededRandom(seedCounter) - 0.5) * 0.5;
        price = candle.close;
      }
      // Regular candles oscillating - flow from previous close
      else {
        // Determine if we're heading toward support or resistance
        const distToHigh = rangeHigh - price;
        const distToLow = price - rangeLow;
        const goingUp = distToLow < distToHigh ? seededRandom(seedCounter++) > 0.3 : seededRandom(seedCounter++) < 0.3;
        
        const bodySize = seededRandom(seedCounter++) * 1.8 + 0.8;
        const open = price;
        const close = goingUp ? 
          Math.min(rangeHigh - 0.5, open + bodySize) : 
          Math.max(rangeLow + 0.5, open - bodySize);
        
        candle = {
          open,
          close,
          high: Math.min(rangeHigh, Math.max(open, close) + seededRandom(seedCounter++) * 1.5 + 0.5),
          low: Math.max(rangeLow, Math.min(open, close) - seededRandom(seedCounter++) * 1.5 - 0.5),
          pattern: undefined
        };
        price = close;
      }
      
      seedCounter += 10;
      data.push({
        time: i,
        open: parseFloat(candle.open.toFixed(2)),
        high: parseFloat(candle.high.toFixed(2)),
        low: parseFloat(candle.low.toFixed(2)),
        close: parseFloat(candle.close.toFixed(2)),
        volume: seededRandom(seedCounter++) * 1000 + 500,
        pattern: candle.pattern,
        isStructurePoint,
        structureLabel
      });
    }
  }
  
  return data;
}

// Generate CVD data as candlesticks with structure
function generateCVDData(pattern: 'up' | 'down' | 'sideways', seed: number): CVDData[] {
  const data: CVDData[] = [];
  let seedCounter = seed;
  
  if (pattern === 'up') {
    // CVD UPTREND: Gradual accumulation with realistic small candles
    let cvdValue = -50;
    const swings = [
      { type: 'HL', at: 5, low: -30 },
      { type: 'HH', at: 10, high: 80 },
      { type: 'HL', at: 15, low: 50 },
      { type: 'HH', at: 20, high: 150 },
      { type: 'HL', at: 23, low: 120 }
    ];
    
    for (let i = 0; i < 25; i++) {
      const swing = swings.find(s => s.at === i);
      let candle: any;
      let isStructurePoint = false;
      let structureLabel: string | undefined;
      
      if (swing?.type === 'HL' && swing.low !== undefined) {
        // Small pullback
        const bodySize = seededRandom(seedCounter++) * 8 + 5;
        candle = {
          open: cvdValue,
          close: swing.low + 3,
          high: cvdValue + seededRandom(seedCounter++) * 6 + 2,
          low: swing.low,
          pattern: 'Hammer'
        };
        cvdValue = candle.close;
        isStructurePoint = true;
        structureLabel = 'HL';
      } else if (swing?.type === 'HH' && swing.high !== undefined) {
        // Small breakout
        const bodySize = seededRandom(seedCounter++) * 10 + 8;
        candle = {
          open: cvdValue,
          close: swing.high - 2,
          high: swing.high,
          low: cvdValue - seededRandom(seedCounter++) * 5 - 2,
          pattern: undefined
        };
        cvdValue = candle.close;
        isStructurePoint = true;
        structureLabel = 'HH';
      } else {
        // Small realistic CVD candles
        const nextSwing = swings.find(s => s.at > i);
        const target = nextSwing ? (nextSwing.type === 'HH' ? (nextSwing.high ?? cvdValue) - 10 : (nextSwing.low ?? cvdValue) + 5) : cvdValue + 8;
        const step = (target - cvdValue) / (nextSwing ? nextSwing.at - i : 1);
        
        const isBullish = seededRandom(seedCounter++) > 0.35;
        const bodySize = seededRandom(seedCounter++) * 12 + 4;
        
        candle = {
          open: cvdValue,
          close: isBullish ? cvdValue + bodySize : cvdValue - bodySize * 0.4,
          high: 0,
          low: 0,
          pattern: undefined
        };
        candle.high = Math.max(candle.open, candle.close) + seededRandom(seedCounter++) * 8 + 2;
        candle.low = Math.min(candle.open, candle.close) - seededRandom(seedCounter++) * 8 - 2;
        cvdValue = candle.close;
      }
      
      seedCounter += 10;
      data.push({
        time: i,
        open: parseFloat(candle.open.toFixed(2)),
        high: parseFloat(candle.high.toFixed(2)),
        low: parseFloat(candle.low.toFixed(2)),
        close: parseFloat(candle.close.toFixed(2)),
        pattern: candle.pattern,
        isStructurePoint,
        structureLabel
      });
    }
  } else if (pattern === 'down') {
    // CVD DOWNTREND: Gradual distribution with realistic small candles
    let cvdValue = 50;
    const swings = [
      { type: 'LH', at: 5, high: 30 },
      { type: 'LL', at: 10, low: -80 },
      { type: 'LH', at: 15, high: -50 },
      { type: 'LL', at: 20, low: -150 },
      { type: 'LH', at: 23, high: -120 }
    ];
    
    for (let i = 0; i < 25; i++) {
      const swing = swings.find(s => s.at === i);
      let candle: any;
      let isStructurePoint = false;
      let structureLabel: string | undefined;
      
      if (swing?.type === 'LH' && swing.high !== undefined) {
        // Small rally rejection
        const bodySize = seededRandom(seedCounter++) * 8 + 5;
        candle = {
          open: cvdValue,
          close: swing.high - 3,
          high: swing.high,
          low: cvdValue - seededRandom(seedCounter++) * 6 - 2,
          pattern: 'Inverted Hammer'
        };
        cvdValue = candle.close;
        isStructurePoint = true;
        structureLabel = 'LH';
      } else if (swing?.type === 'LL' && swing.low !== undefined) {
        // Small breakdown
        const bodySize = seededRandom(seedCounter++) * 10 + 8;
        candle = {
          open: cvdValue,
          close: swing.low + 2,
          high: cvdValue + seededRandom(seedCounter++) * 5 + 2,
          low: swing.low,
          pattern: undefined
        };
        cvdValue = candle.close;
        isStructurePoint = true;
        structureLabel = 'LL';
      } else {
        // Small realistic CVD candles
        const nextSwing = swings.find(s => s.at > i);
        const target = nextSwing ? (nextSwing.type === 'LL' ? (nextSwing.low ?? cvdValue) + 10 : (nextSwing.high ?? cvdValue) - 5) : cvdValue - 8;
        const step = (target - cvdValue) / (nextSwing ? nextSwing.at - i : 1);
        
        const isBearish = seededRandom(seedCounter++) > 0.35;
        const bodySize = seededRandom(seedCounter++) * 12 + 4;
        
        candle = {
          open: cvdValue,
          close: isBearish ? cvdValue - bodySize : cvdValue + bodySize * 0.4,
          high: 0,
          low: 0,
          pattern: undefined
        };
        candle.high = Math.max(candle.open, candle.close) + seededRandom(seedCounter++) * 8 + 2;
        candle.low = Math.min(candle.open, candle.close) - seededRandom(seedCounter++) * 8 - 2;
        cvdValue = candle.close;
      }
      
      seedCounter += 10;
      data.push({
        time: i,
        open: parseFloat(candle.open.toFixed(2)),
        high: parseFloat(candle.high.toFixed(2)),
        low: parseFloat(candle.low.toFixed(2)),
        close: parseFloat(candle.close.toFixed(2)),
        pattern: candle.pattern,
        isStructurePoint,
        structureLabel
      });
    }
  } else {
    // CVD SIDEWAYS: Small choppy oscillations around zero with continuous flow
    let cvdValue = 0;
    const rangeHigh = 40;
    const rangeLow = -40;
    
    for (let i = 0; i < 25; i++) {
      let candle: any;
      let isStructurePoint = false;
      let structureLabel: string | undefined;
      
      // Realistic small oscillating candles
      if (i % 9 === 0) {
        // Small doji
        candle = {
          open: cvdValue,
          close: cvdValue + (seededRandom(seedCounter) - 0.5) * 2,
          high: 0,
          low: 0,
          pattern: 'Doji'
        };
        candle.high = Math.max(candle.open, candle.close) + seededRandom(seedCounter + 1) * 8 + 3;
        candle.low = Math.min(candle.open, candle.close) - seededRandom(seedCounter + 2) * 8 - 3;
        cvdValue = candle.close;
      } else if (i % 13 === 0) {
        // Small hammer
        candle = {
          open: cvdValue,
          close: cvdValue + 4,
          high: cvdValue + 7,
          low: cvdValue - 12,
          pattern: 'Hammer'
        };
        cvdValue = candle.close;
      } else {
        // Keep values within range and flow from previous
        const distToHigh = rangeHigh - cvdValue;
        const distToLow = cvdValue - rangeLow;
        const goingUp = distToLow < distToHigh ? seededRandom(seedCounter++) > 0.4 : seededRandom(seedCounter++) < 0.4;
        
        const bodySize = seededRandom(seedCounter++) * 7 + 3;
        
        candle = {
          open: cvdValue,
          close: goingUp ? 
            Math.min(rangeHigh - 2, cvdValue + bodySize) : 
            Math.max(rangeLow + 2, cvdValue - bodySize),
          high: 0,
          low: 0,
          pattern: undefined
        };
        candle.high = Math.max(candle.open, candle.close) + seededRandom(seedCounter++) * 6 + 2;
        candle.low = Math.min(candle.open, candle.close) - seededRandom(seedCounter++) * 6 - 2;
        cvdValue = candle.close;
      }
      
      seedCounter += 10;
      data.push({
        time: i,
        open: parseFloat(candle.open.toFixed(2)),
        high: parseFloat(candle.high.toFixed(2)),
        low: parseFloat(candle.low.toFixed(2)),
        close: parseFloat(candle.close.toFixed(2)),
        pattern: candle.pattern,
        isStructurePoint,
        structureLabel
      });
    }
  }
  
  return data;
}

// Scenario 1: Price UP + CVD UP = VERY BULLISH - BUY
const scenario1PriceData = generatePriceData('uptrend', 1000);
const scenario1CVDData = generateCVDData('up', 2000);
const scenario1: Scenario = {
  id: 1,
  title: 'Price UP + CVD UP',
  priceDirection: 'up',
  cvdDirection: 'up',
  action: 'BUY',
  sentiment: 'VERY BULLISH',
  color: 'green',
  description: 'Strong bullish confirmation. Both price and volume show buying pressure. High probability long setup.',
  priceData: scenario1PriceData,
  cvdData: scenario1CVDData,
  tradeSetup: {
    entry: scenario1PriceData[15].close,
    target: scenario1PriceData[15].close * 1.06,
    stopLoss: scenario1PriceData[15].close * 0.98,
    entryTime: 15,
    riskReward: '1:3'
  }
};

// Scenario 2: Price UP + CVD DOWN = BEARISH DIVERGENCE - SELL
const scenario2PriceData = generatePriceData('uptrend', 3000);
const scenario2CVDData = generateCVDData('down', 4000);
const scenario2: Scenario = {
  id: 2,
  title: 'Price UP + CVD DOWN',
  priceDirection: 'up',
  cvdDirection: 'down',
  action: 'SELL',
  sentiment: 'BEARISH DIVERGENCE',
  color: 'red',
  description: 'Price rising but volume declining. Weak buyers, potential reversal. Short at resistance.',
  priceData: scenario2PriceData,
  cvdData: scenario2CVDData,
  tradeSetup: {
    entry: scenario2PriceData[15].close,
    target: scenario2PriceData[15].close * 0.94,
    stopLoss: scenario2PriceData[15].close * 1.02,
    entryTime: 15,
    riskReward: '1:3'
  }
};

// Scenario 3: Price UP + CVD SIDEWAYS = WEAK - CAREFUL
const scenario3PriceData = generatePriceData('uptrend', 5000);
const scenario3CVDData = generateCVDData('sideways', 6000);
const scenario3: Scenario = {
  id: 3,
  title: 'Price UP + CVD SIDEWAYS',
  priceDirection: 'up',
  cvdDirection: 'sideways',
  action: 'CAREFUL',
  sentiment: 'WEAK',
  color: 'orange',
  description: 'Price rising without volume support. Unsustainable move. Wait for confirmation or avoid.',
  priceData: scenario3PriceData,
  cvdData: scenario3CVDData,
  tradeSetup: {
    entry: scenario3PriceData[15].close,
    target: scenario3PriceData[15].close * 1.03,
    stopLoss: scenario3PriceData[15].close * 0.99,
    entryTime: 15,
    riskReward: '1:1.5'
  }
};

// Scenario 4: Price DOWN + CVD UP = BULLISH DIVERGENCE - BUY
const scenario4PriceData = generatePriceData('downtrend', 7000);
const scenario4CVDData = generateCVDData('up', 8000);
const scenario4: Scenario = {
  id: 4,
  title: 'Price DOWN + CVD UP',
  priceDirection: 'down',
  cvdDirection: 'up',
  action: 'BUY',
  sentiment: 'BULLISH DIVERGENCE',
  color: 'green',
  description: 'Price falling but buyers accumulating. Reversal setup. Buy at support with tight stop.',
  priceData: scenario4PriceData,
  cvdData: scenario4CVDData,
  tradeSetup: {
    entry: scenario4PriceData[15].close,
    target: scenario4PriceData[15].close * 1.07,
    stopLoss: scenario4PriceData[15].close * 0.97,
    entryTime: 15,
    riskReward: '1:3.5'
  }
};

// Scenario 5: Price DOWN + CVD DOWN = VERY BEARISH - SELL
const scenario5PriceData = generatePriceData('downtrend', 9000);
const scenario5CVDData = generateCVDData('down', 10000);
const scenario5: Scenario = {
  id: 5,
  title: 'Price DOWN + CVD DOWN',
  priceDirection: 'down',
  cvdDirection: 'down',
  action: 'SELL',
  sentiment: 'VERY BEARISH',
  color: 'red',
  description: 'Strong bearish confirmation. Both price and volume show selling pressure. High probability short.',
  priceData: scenario5PriceData,
  cvdData: scenario5CVDData,
  tradeSetup: {
    entry: scenario5PriceData[15].close,
    target: scenario5PriceData[15].close * 0.93,
    stopLoss: scenario5PriceData[15].close * 1.02,
    entryTime: 15,
    riskReward: '1:3.5'
  }
};

// Scenario 6: Price DOWN + CVD SIDEWAYS = WEAK - CAREFUL
const scenario6PriceData = generatePriceData('downtrend', 11000);
const scenario6CVDData = generateCVDData('sideways', 12000);
const scenario6: Scenario = {
  id: 6,
  title: 'Price DOWN + CVD SIDEWAYS',
  priceDirection: 'down',
  cvdDirection: 'sideways',
  action: 'CAREFUL',
  sentiment: 'WEAK',
  color: 'orange',
  description: 'Price falling without volume confirmation. Weak sellers. Wait for clear direction.',
  priceData: scenario6PriceData,
  cvdData: scenario6CVDData,
  tradeSetup: {
    entry: scenario6PriceData[15].close,
    target: scenario6PriceData[15].close * 0.97,
    stopLoss: scenario6PriceData[15].close * 1.01,
    entryTime: 15,
    riskReward: '1:1.5'
  }
};

// Scenario 7: Price SIDEWAYS + CVD UP = ACCUMULATION - PREPARE BUY
const scenario7PriceData = generatePriceData('sideways', 13000);
const scenario7CVDData = generateCVDData('up', 14000);
const scenario7: Scenario = {
  id: 7,
  title: 'Price SIDEWAYS + CVD UP',
  priceDirection: 'sideways',
  cvdDirection: 'up',
  action: 'PREPARE BUY',
  sentiment: 'ACCUMULATION',
  color: 'green',
  description: 'Smart money accumulating. Price consolidating while buyers load up. Buy breakout above range.',
  priceData: scenario7PriceData,
  cvdData: scenario7CVDData,
  tradeSetup: {
    entry: Math.max(...scenario7PriceData.slice(10).map(c => c.high)) + 0.5,
    target: (Math.max(...scenario7PriceData.slice(10).map(c => c.high)) + 0.5) * 1.05,
    stopLoss: Math.min(...scenario7PriceData.slice(10).map(c => c.low)) - 0.5,
    entryTime: 16,
    riskReward: '1:2.5'
  }
};

// Scenario 8: Price SIDEWAYS + CVD DOWN = DISTRIBUTION - PREPARE SELL
const scenario8PriceData = generatePriceData('sideways', 15000);
const scenario8CVDData = generateCVDData('down', 16000);
const scenario8: Scenario = {
  id: 8,
  title: 'Price SIDEWAYS + CVD DOWN',
  priceDirection: 'sideways',
  cvdDirection: 'down',
  action: 'PREPARE SELL',
  sentiment: 'DISTRIBUTION',
  color: 'red',
  description: 'Smart money distributing. Price consolidating while sellers unload. Sell breakdown below range.',
  priceData: scenario8PriceData,
  cvdData: scenario8CVDData,
  tradeSetup: {
    entry: Math.min(...scenario8PriceData.slice(10).map(c => c.low)) - 0.5,
    target: (Math.min(...scenario8PriceData.slice(10).map(c => c.low)) - 0.5) * 0.95,
    stopLoss: Math.max(...scenario8PriceData.slice(10).map(c => c.high)) + 0.5,
    entryTime: 16,
    riskReward: '1:2.5'
  }
};

// Scenario 9: Price SIDEWAYS + CVD SIDEWAYS = NO SIGNAL - WAIT
const scenario9PriceData = generatePriceData('sideways', 17000);
const scenario9CVDData = generateCVDData('sideways', 18000);
const scenario9: Scenario = {
  id: 9,
  title: 'Price SIDEWAYS + CVD SIDEWAYS',
  priceDirection: 'sideways',
  cvdDirection: 'sideways',
  action: 'WAIT',
  sentiment: 'NO SIGNAL',
  color: 'orange',
  description: 'No clear direction in price or volume. Market indecision. Stay out until clear signal emerges.',
  priceData: scenario9PriceData,
  cvdData: scenario9CVDData,
  tradeSetup: {
    entry: 0,
    target: 0,
    stopLoss: 0,
    entryTime: 0,
    riskReward: 'N/A'
  }
};

export const scenarios: Scenario[] = [
  scenario1,
  scenario4,
  scenario7,
  scenario2,
  scenario5,
  scenario8,
  scenario3,
  scenario6,
  scenario9
];
