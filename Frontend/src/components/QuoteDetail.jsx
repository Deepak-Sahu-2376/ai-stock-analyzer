import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { api } from '../api';

// Data store for mock stocks
const STOCKS_DATABASE = {
  'BAJAJ-AUTO': {
    name: 'Bajaj Auto Limited',
    isin: 'INE917I01010',
    price: 10080.00,
    change: 3.00,
    percent: '0.03%',
    up: true,
    prevClose: 10077.00,
    open: 10134.00,
    high: 10134.00,
    low: 9936.00,
    close: 10066.00,
    vwap: 10031.31,
    volume: '7.39 Lakhs',
    value: '₹ 741.67 Cr.',
    marketCap: '2,81,733.82 Cr.',
    freeFloat: '1,11,373.89 Cr.',
    yearHigh: 10834.00,
    yearLow: 7858.50,
    impactCost: '0.02',
    pe: '28.13',
    secPe: '28.04',
    divYield: '0.79%',
    listingDate: '26-May-2008',
    sentimentShort: 'Bullish',
    sentimentShortDesc: 'Strong volume breakout above 10,000 level with positive moving average crossover.',
    sentimentLong: 'Bullish',
    sentimentLongDesc: 'Robust earnings growth and market share expansion in the premium two-wheeler segment.',
    aiAnalysis: 'Bajaj Auto shows strong technical structure. Consolidation around 10k is healthy. RMI indicates minor overbought condition but MACD stays positive. Long-term support sits at 9,800. Strong export growth in LatAm markets boosts projections.',
    peers: [
      { name: 'Bajaj Auto', price: '10,080.00', pe: '28.13', cap: '2,81,733', yield: '0.79%', profit: '1,936.00' },
      { name: 'TVS Motor', price: '2,415.50', pe: '54.20', cap: '1,14,760', yield: '0.33%', profit: '485.40' },
      { name: 'Hero MotoCorp', price: '5,480.25', pe: '27.80', cap: '1,09,540', yield: '1.82%', profit: '1,016.00' },
      { name: 'Eicher Motors', price: '4,890.10', pe: '32.45', cap: '1,33,890', yield: '1.04%', profit: '1,070.00' }
    ]
  },
  'RELIANCE': {
    name: 'Reliance Industries Limited',
    isin: 'INE002A01018',
    price: 2450.45,
    change: -31.25,
    percent: '-1.26%',
    up: false,
    prevClose: 2481.70,
    open: 2485.00,
    high: 2488.00,
    low: 2442.10,
    close: 2450.45,
    vwap: 2458.12,
    volume: '42.15 Lakhs',
    value: '₹ 1,038.50 Cr.',
    marketCap: '16,58,212.45 Cr.',
    freeFloat: '8,21,412.30 Cr.',
    yearHigh: 2750.00,
    yearLow: 2100.00,
    impactCost: '0.01',
    pe: '24.20',
    secPe: '23.85',
    divYield: '0.41%',
    listingDate: '15-Dec-1995',
    sentimentShort: 'Bearish',
    sentimentShortDesc: 'Relative weakness in retail and oil refining margins pulling index weight down.',
    sentimentLong: 'Neutral',
    sentimentLongDesc: 'Awaiting green energy capital spend rollout updates and potential telecom demerger timelines.',
    aiAnalysis: 'Reliance faces short-term refining margin pressures. Technically trading near the 200 EMA support zone of 2,430. Retaining this level is crucial to avoid deeper correction towards 2,380. Accumulation is recommended for long-term targets.',
    peers: [
      { name: 'Reliance', price: '2,450.45', pe: '24.20', cap: '16,58,212', yield: '0.41%', profit: '18,950.00' },
      { name: 'TCS', price: '4,120.00', pe: '30.12', cap: '15,10,000', yield: '1.20%', profit: '12,040.00' },
      { name: 'HDFC Bank', price: '1,680.10', pe: '18.90', cap: '12,70,000', yield: '1.15%', profit: '16,811.00' }
    ]
  },
  'INFY': {
    name: 'Infosys Limited',
    isin: 'INE009A01021',
    price: 1845.20,
    change: 18.40,
    percent: '1.01%',
    up: true,
    prevClose: 1826.80,
    open: 1825.00,
    high: 1855.00,
    low: 1822.00,
    close: 1845.20,
    vwap: 1838.45,
    volume: '22.84 Lakhs',
    value: '₹ 420.12 Cr.',
    marketCap: '7,65,241.10 Cr.',
    freeFloat: '6,45,212.00 Cr.',
    yearHigh: 1950.00,
    yearLow: 1400.00,
    impactCost: '0.03',
    pe: '29.40',
    secPe: '29.10',
    divYield: '2.17%',
    listingDate: '14-Jun-1993',
    sentimentShort: 'Bullish',
    sentimentShortDesc: 'Positive guidance on cloud migration pipelines and digital transformation contracts.',
    sentimentLong: 'Bullish',
    sentimentLongDesc: 'Solid operating margins and cash flow distributions via robust dividends and share buybacks.',
    aiAnalysis: 'Infosys shows high relative strength within IT sector. Double-bottom breakout pattern verified on daily charts above 1,820. Target resistance at 1,890. Cloud deals and AI solutions portfolio (Topaz) provide decent tailwinds.',
    peers: [
      { name: 'Infosys', price: '1,845.20', pe: '29.40', cap: '7,65,241', yield: '2.17%', profit: '6,212.00' },
      { name: 'TCS', price: '4,120.00', pe: '30.12', cap: '15,10,000', yield: '1.20%', profit: '12,040.00' },
      { name: 'Wipro', price: '522.40', pe: '21.50', cap: '2,73,000', yield: '0.96%', profit: '2,235.00' }
    ]
  }
};

const getStockData = (symbol) => {
  const normalized = symbol.toUpperCase();
  if (STOCKS_DATABASE[normalized]) return STOCKS_DATABASE[normalized];

  const seed = normalized.charCodeAt(0) + (normalized.charCodeAt(1) || 0);
  const up = seed % 2 === 0;
  const basePrice = (seed * 8.5) + 120;
  const changeVal = parseFloat(((seed % 15) + 1.25 * (up ? 1 : -1)).toFixed(2));
  const changePct = ((changeVal / basePrice) * 100).toFixed(2) + '%';

  return {
    name: `${normalized} Industries Ltd.`,
    isin: `INE${seed}X010${seed % 9}`,
    price: basePrice,
    change: changeVal,
    percent: changePct,
    up: changeVal >= 0,
    prevClose: basePrice - changeVal,
    open: basePrice * 1.002,
    high: basePrice * 1.015,
    low: basePrice * 0.985,
    close: basePrice,
    vwap: basePrice * 0.998,
    volume: `${(seed % 30) + 5} Lakhs`,
    value: `₹ ${(seed * 2.3).toFixed(2)} Cr.`,
    marketCap: `${(seed * 100).toLocaleString('en-IN')} Cr.`,
    freeFloat: `${(seed * 60).toLocaleString('en-IN')} Cr.`,
    yearHigh: basePrice * 1.07,
    yearLow: basePrice * 0.78,
    impactCost: '0.04',
    pe: ((seed % 15) + 15).toFixed(2),
    secPe: ((seed % 15) + 14.8).toFixed(2),
    divYield: `${(seed % 3) * 0.5 + 0.5}%`,
    listingDate: '12-Mar-2012',
    sentimentShort: up ? 'Bullish' : 'Bearish',
    sentimentShortDesc: `Currently showing short-term structural ${up ? 'strength' : 'weakness'} with volume accumulation indexes.`,
    sentimentLong: 'Neutral',
    sentimentLongDesc: 'Awaiting macro catalysts and quarterly report disclosures for strategic direction.',
    aiAnalysis: `Technical evaluation of ${normalized} shows support lines holding firmly at ${parseFloat((basePrice * 0.96).toFixed(2))}. AI indicates high accumulation markers by institutional players. Relative Strength Index (RSI) registers normal at 54.`,
    peers: [
      { name: normalized, price: basePrice.toFixed(2), pe: ((seed % 15) + 15).toFixed(2), cap: (seed * 100).toString(), yield: '1.20%', profit: (seed * 5).toFixed(2) },
      { name: 'Nifty Competitor', price: (basePrice * 0.9).toFixed(2), pe: '22.40', cap: (seed * 85).toString(), yield: '1.05%', profit: (seed * 4).toFixed(2) }
    ]
  };
};

const generateChartData = (basePrice, up, range) => {
  const points = range === '1D' ? 30 : range === '1W' ? 40 : range === '1M' ? 50 : 60;
  const list = [];
  let currentVal = basePrice * 0.98;
  const factor = up ? 1.0006 : 0.9994;

  const now = new Date();

  for (let i = 0; i < points; i++) {
    const timeVal = range === '1D'
      ? `${9 + Math.floor(i / 5)}:${String((i % 5) * 12).padStart(2, '0')}`
      : `Day ${Math.floor(i / 5) + 1}`;

    const walk = (Math.random() - 0.48) * (basePrice * 0.008);
    currentVal = currentVal * factor + walk;

    // Generate a fake fullDate based on index so tooltip always works
    const fakeDate = new Date(now.getTime() - (points - i) * 1000 * 60 * 60 * 24);
    const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][fakeDate.getDay()];
    const dateNum = String(fakeDate.getDate()).padStart(2, '0');
    const monthName = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][fakeDate.getMonth()];
    const hours = String(fakeDate.getHours()).padStart(2, '0');
    const minutes = String(fakeDate.getMinutes()).padStart(2, '0');
    const seconds = String(fakeDate.getSeconds()).padStart(2, '0');

    list.push({
      time: timeVal,
      fullDate: `${dayName}, ${dateNum} ${monthName} | ${hours}:${minutes}:${seconds}`,
      price: parseFloat(currentVal.toFixed(2))
    });
  }

  list[list.length - 1].price = basePrice;
  return list;
};

// Mapping helper functions
const mapApiQuoteToFrontendStock = (apiData, fallbackMock) => {
  const meta = apiData.meta || {};
  let priceInfo = {};
  let volume = null, value = null, marketCap = null, freeFloat = null, high = null, low = null, lastUpdateTime = '';

  let impactCost, faceValue, applicableMargin, deliveryToTradedQuantity;
  let upperBand, lowerBand, pPriceBand, tickSize, cmDailyVolatility, cmAnnualVolatility;
  let secStatus, tradingStatus, pdSymbolPe, pdSectorPe, listingDateStr, indexStr, basicIndustry;
  let yearHigh, yearLow;

  if (apiData.isMock) {
    priceInfo = apiData.priceInfo?.priceInfo || {};
    high = priceInfo.intraDayHighLow?.max || priceInfo.high;
    low = priceInfo.intraDayHighLow?.min || priceInfo.low;
    volume = priceInfo.volume;
    value = priceInfo.value;
    marketCap = apiData.priceInfo?.securityWiseSemInfo?.marketCap;
    freeFloat = apiData.priceInfo?.securityWiseSemInfo?.freeFloatMarketCap;
    yearHigh = priceInfo.intraDayHighLow?.max ? priceInfo.intraDayHighLow?.max * 1.07 : fallbackMock.price * 1.07;
    yearLow = priceInfo.intraDayHighLow?.min ? priceInfo.intraDayHighLow?.min * 0.78 : fallbackMock.price * 0.78;
    lastUpdateTime = `As on ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} 15:30:00 IST`;
  } else {
    const isDirectFormat = !!apiData.priceInfo?.lastPrice;
    const realPriceInfo = isDirectFormat ? apiData.priceInfo : (apiData.priceInfo?.equityResponse?.[0] || {});

    const metadata = realPriceInfo.metaData || {};
    const tradeInfo = isDirectFormat ? realPriceInfo : (realPriceInfo.tradeInfo || {});
    const priceDetails = realPriceInfo.priceInfo || {};
    const secDetails = realPriceInfo.secInfo || {};

    priceInfo = {
      lastPrice: realPriceInfo.orderBook?.lastPrice || tradeInfo.lastPrice || metadata.lastPrice || fallbackMock.price,
      change: metadata.change !== undefined ? metadata.change : fallbackMock.change,
      pChange: metadata.pChange !== undefined ? metadata.pChange : fallbackMock.percent,
      open: metadata.open || fallbackMock.open,
      close: metadata.closePrice || fallbackMock.close,
      previousClose: metadata.previousClose || metadata.basePrice || fallbackMock.prevClose,
      vwap: metadata.averagePrice || fallbackMock.vwap
    };

    high = metadata.dayHigh || fallbackMock.high;
    low = metadata.dayLow || fallbackMock.low;
    yearHigh = priceDetails.yearHigh || fallbackMock.price * 1.07;
    yearLow = priceDetails.yearLow || fallbackMock.price * 0.78;
    volume = tradeInfo.totalTradedVolume || tradeInfo.quantityTraded;
    value = tradeInfo.totalTradedValue;
    marketCap = tradeInfo.totalMarketCap;
    freeFloat = tradeInfo.ffmc || tradeInfo.freeFloatMarketCap;
    lastUpdateTime = realPriceInfo.lastUpdateTime ? `As on ${realPriceInfo.lastUpdateTime} IST` : `As on ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} 15:30:00 IST`;

    impactCost = tradeInfo.impactCost;
    faceValue = tradeInfo.faceValue;
    applicableMargin = tradeInfo.applicableMargin;
    deliveryToTradedQuantity = tradeInfo.deliveryToTradedQuantity;

    pPriceBand = priceDetails.ppriceBand || priceDetails.pPriceBand || priceDetails.priceBandPercent;
    tickSize = priceDetails.tickSize;
    cmDailyVolatility = priceDetails.cmDailyVolatility;
    cmAnnualVolatility = priceDetails.cmAnnualVolatility;

    if (priceDetails.priceBand && priceDetails.priceBand.includes('-')) {
      const bands = priceDetails.priceBand.split('-');
      lowerBand = bands[0];
      upperBand = bands[1];
    } else {
      upperBand = priceDetails.upperBand;
      lowerBand = priceDetails.lowerBand;
    }

    secStatus = secDetails.secStatus;
    tradingStatus = secDetails.isSuspended || secDetails.tradingStatus;
    pdSymbolPe = secDetails.pdSymbolPe;
    pdSectorPe = secDetails.pdSectorPe;
    listingDateStr = secDetails.listingDate;
    indexStr = secDetails.index || secDetails.associatedIndex;
    basicIndustry = secDetails.basicIndustry;
  }

  let returns = [
    { label: '1W', stock: '2.73%', index: '1.04%' },
    { label: '1M', stock: '-3.18%', index: '1.62%' },
    { label: 'YTD', stock: '6.86%', index: '-7.82%' },
    { label: '1Y', stock: '22.02%', index: '-4.02%' },
    { label: '3Y', stock: '121.46%', index: '28.40%' },
    { label: '5Y', stock: '141.95%', index: '52.81%' }
  ];

  if (apiData.yearwise && Array.isArray(apiData.yearwise) && apiData.yearwise.length > 0) {
    const yw = apiData.yearwise[0];
    returns = [
      { label: '1W', stock: (yw.one_week_chng_per || 0).toFixed(2) + '%', index: (yw.index_one_week_chng_per || 0).toFixed(2) + '%' },
      { label: '1M', stock: (yw.one_month_chng_per || 0).toFixed(2) + '%', index: (yw.index_one_month_chng_per || 0).toFixed(2) + '%' },
      { label: 'YTD', stock: (yw.yesterday_chng_per || 0).toFixed(2) + '%', index: (yw.index_yesterday_chng_per || 0).toFixed(2) + '%' },
      { label: '1Y', stock: (yw.one_year_chng_per || 0).toFixed(2) + '%', index: (yw.index_one_year_chng_per || 0).toFixed(2) + '%' },
      { label: '3Y', stock: (yw.three_year_chng_per || 0).toFixed(2) + '%', index: (yw.index_three_year_chng_per || 0).toFixed(2) + '%' },
      { label: '5Y', stock: (yw.five_year_chng_per || 0).toFixed(2) + '%', index: (yw.index_five_year_chng_per || 0).toFixed(2) + '%' }
    ];
  }

  let corpActions = [];
  if (apiData.corpAction && Array.isArray(apiData.corpAction)) {
    corpActions = apiData.corpAction.map(action => ({
      purpose: action.subject || '-',
      ex: action.exDate || '-',
      record: action.recDate || '-'
    }));
  }

  let announcements = [];
  if (apiData.announcements && Array.isArray(apiData.announcements)) {
    announcements = apiData.announcements.map(ann => ({
      date: ann.an_dt || '-',
      title: ann.desc || '-',
      desc: ann.attchmntText || '-',
      pdfUrl: ann.attchmntFile || ''
    }));
  }

  const lastPrice = priceInfo.lastPrice || fallbackMock.price;
  const change = priceInfo.change !== undefined ? priceInfo.change : fallbackMock.change;
  const pChangeVal = priceInfo.pChange !== undefined ? priceInfo.pChange : parseFloat(fallbackMock.percent);
  const pChange = (pChangeVal >= 0 ? '+' : '') + parseFloat(pChangeVal).toFixed(2) + '%';
  const up = change >= 0;

  // Format values
  const formatNumberStr = (numStr) => typeof numStr === 'string' ? numStr.replace(/,/g, '').replace(/[^\d.-]/g, '') : numStr;

  return {
    ...fallbackMock,
    name: meta.companyName || apiData.name || fallbackMock.name,
    isin: meta.isin || fallbackMock.isin,
    price: parseFloat(lastPrice),
    change: parseFloat(change),
    percent: pChange,
    up,
    prevClose: parseFloat(priceInfo.previousClose || fallbackMock.prevClose),
    open: parseFloat(priceInfo.open || fallbackMock.open),
    high: parseFloat(high || fallbackMock.high),
    low: parseFloat(low || fallbackMock.low),
    yearHigh: parseFloat(yearHigh || fallbackMock.price * 1.07),
    yearLow: parseFloat(yearLow || fallbackMock.price * 0.78),
    close: parseFloat(priceInfo.close || fallbackMock.close),
    vwap: parseFloat(priceInfo.vwap || fallbackMock.vwap),
    volume: volume ? (volume / 100000).toFixed(2) : parseFloat(formatNumberStr(fallbackMock.volume)),
    value: value ? (value / 10000000).toFixed(2) : parseFloat(formatNumberStr(fallbackMock.value)),
    marketCap: marketCap ? Number((marketCap / 10000000).toFixed(2)).toLocaleString('en-IN') : fallbackMock.marketCap.replace(' Cr.', ''),
    freeFloat: freeFloat ? Number((freeFloat / 10000000).toFixed(2)).toLocaleString('en-IN') : fallbackMock.freeFloat.replace(' Cr.', ''),
    lastUpdateTime,
    impactCost: impactCost !== undefined ? impactCost : fallbackMock.impactCost,
    faceValue: faceValue !== undefined ? faceValue : '10.00',
    applicableMargin: applicableMargin !== undefined ? applicableMargin : '13.09',
    deliveryToTradedQuantity: deliveryToTradedQuantity !== undefined ? deliveryToTradedQuantity : '65.82%',
    upperBand: upperBand !== undefined ? upperBand : '-',
    lowerBand: lowerBand !== undefined ? lowerBand : '-',
    priceBandPercent: pPriceBand !== undefined ? pPriceBand : 'No Band',
    tickSize: tickSize !== undefined ? tickSize : '1.00',
    cmDailyVolatility: cmDailyVolatility !== undefined ? cmDailyVolatility : '1.53',
    cmAnnualVolatility: cmAnnualVolatility !== undefined ? cmAnnualVolatility : '29.23',
    secStatus: secStatus !== undefined ? secStatus : 'Listed',
    tradingStatus: tradingStatus !== undefined ? tradingStatus : 'Active',
    pe: pdSymbolPe !== undefined ? pdSymbolPe : fallbackMock.pe,
    secPe: pdSectorPe !== undefined ? pdSectorPe : fallbackMock.secPe,
    listingDate: listingDateStr !== undefined ? listingDateStr.split(' ')[0] : fallbackMock.listingDate,
    index: indexStr !== undefined ? indexStr : 'NIFTY 50',
    basicIndustry: basicIndustry !== undefined ? basicIndustry : '2/3 Wheelers',
    returns,
    corpActions,
    announcements
  };
};

const mapChartData = (apiChart) => {
  if (!apiChart || !apiChart.grapthData) return [];
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  return apiChart.grapthData.map(point => {
    const date = new Date(point[0]);
    // NSE sends timestamps where the UTC time *IS* the intended IST time. 
    // Example: 09:15 IST is sent as 09:15 UTC. So we must read the UTC components.
    const hours = String(date.getUTCHours()).padStart(2, '0');
    const minutes = String(date.getUTCMinutes()).padStart(2, '0');
    const seconds = String(date.getUTCSeconds()).padStart(2, '0');
    const timeVal = `${hours}:${minutes}`;

    const dayName = days[date.getUTCDay()];
    const dateNum = String(date.getUTCDate()).padStart(2, '0');
    const monthName = months[date.getUTCMonth()];

    return {
      timestamp: date.getTime(),
      time: timeVal,
      fullDate: `${dayName}, ${dateNum} ${monthName} | ${hours}:${minutes}:${seconds}`,
      price: parseFloat(point[1])
    };
  });
};

const mapCandleData = (apiCandles) => {
  if (!apiCandles || !apiCandles.data) return [];
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  return apiCandles.data.map(candle => {
    const timeInMs = candle.time > 1000000000000 ? candle.time : candle.time * 1000;
    const date = new Date(timeInMs);
    // NSE chart candles also have the UTC offset issue
    const hours = String(date.getUTCHours()).padStart(2, '0');
    const minutes = String(date.getUTCMinutes()).padStart(2, '0');
    const seconds = String(date.getUTCSeconds()).padStart(2, '0');

    const dayName = days[date.getUTCDay()];
    const dateNum = String(date.getUTCDate()).padStart(2, '0');
    const monthName = months[date.getUTCMonth()];

    const timeVal = `${dateNum} ${monthName}`;

    return {
      timestamp: date.getTime(),
      time: timeVal,
      fullDate: `${dayName}, ${dateNum} ${monthName} | ${hours}:${minutes}:${seconds}`,
      price: parseFloat(candle.close)
    };
  });
};

const mapOrderBook = (apiOrderBook, lastPrice, fallbackBook) => {
  const list = [];

  // Check if it's the real orderBook format (with buyPrice1, buyQuantity1...)
  if (apiOrderBook && apiOrderBook.buyPrice1 !== undefined) {
    for (let i = 1; i <= 5; i++) {
      list.push({
        bidQty: apiOrderBook[`buyQuantity${i}`] || 0,
        bidPrice: parseFloat(apiOrderBook[`buyPrice${i}`] || 0),
        askPrice: parseFloat(apiOrderBook[`sellPrice${i}`] || 0),
        askQty: apiOrderBook[`sellQuantity${i}`] || 0
      });
    }
    return list;
  }

  // Otherwise try mock format
  const bids = apiOrderBook?.bid || [];
  const asks = apiOrderBook?.ask || [];
  const maxLen = Math.max(bids.length, asks.length);

  if (maxLen === 0) {
    return fallbackBook && fallbackBook.length > 0 ? fallbackBook : [];
  }

  for (let i = 0; i < Math.min(5, maxLen); i++) {
    list.push({
      bidQty: bids[i]?.quantity || 0,
      bidPrice: parseFloat(bids[i]?.price || 0),
      askPrice: parseFloat(asks[i]?.price || 0),
      askQty: asks[i]?.quantity || 0
    });
  }
  return list;
};

export default function QuoteDetail({ symbol }) {
  const [stock, setStock] = useState(null);
  const [range, setRange] = useState('1D');
  const [chartData, setChartData] = useState([]);

  // Peer comparison states
  const [peersData, setPeersData] = useState([]);
  const [peerQuartersList, setPeerQuartersList] = useState([]);
  const [peerIndicesList, setPeerIndicesList] = useState([]);
  const [peerQuarter, setPeerQuarter] = useState('');
  const [peerIndex, setPeerIndex] = useState('');
  const [peerType, setPeerType] = useState('S');
  const [peerLoading, setPeerLoading] = useState(false);
  const [orderBook, setOrderBook] = useState([]);
  const [aiDrawerOpen, setAiDrawerOpen] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState('dashboard');
  const [tickActive, setTickActive] = useState('none');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMarketOpen, setIsMarketOpen] = useState(false);
  const [marketStatusText, setMarketStatusText] = useState('Closed');

  // User auth state
  const isLoggedIn = !!localStorage.getItem('token');

  // SQL data states
  const [alerts, setAlerts] = useState([]);
  const [inWishlist, setInWishlist] = useState(false);
  const [holdings, setHoldings] = useState([]);
  const [positions, setPositions] = useState([]);
  const [alertModalOpen, setAlertModalOpen] = useState(false);
  const [alertTargetPrice, setAlertTargetPrice] = useState('');
  const [alertCondition, setAlertCondition] = useState('ABOVE');
  const [alertMessage, setAlertMessage] = useState('');
  const [alertError, setAlertError] = useState('');

  // Trade form states
  const [tradeType, setTradeType] = useState('BUY'); // 'BUY' | 'SELL'
  const [tradeProduct, setTradeProduct] = useState('CNC'); // 'MIS' (intraday) | 'CNC' (delivery)
  const [tradeQty, setTradeQty] = useState(1);
  const [tradePrice, setTradePrice] = useState('');
  const [tradeMessage, setTradeMessage] = useState('');
  const [tradeError, setTradeError] = useState('');
  const [tradeLoading, setTradeLoading] = useState(false);
  const [screenerData, setScreenerData] = useState([]);
  const [screenerLoading, setScreenerLoading] = useState(false);
  const [aiSummaries, setAiSummaries] = useState([]);
  const [aiSummariesLoading, setAiSummariesLoading] = useState(false);

  const handleToggleWishlist = async () => {
    if (!localStorage.getItem('token')) {
      setTab('login');
      return;
    }
    try {
      const res = await api.toggleWishlist(symbol, stock?.companyName || symbol);
      setInWishlist(res.status === 'added');
    } catch (err) {
      console.error(err);
    }
  };

  const fetchUserData = async () => {
    if (!localStorage.getItem('token')) return;
    try {
      const [aList, wList] = await Promise.all([
        api.getAlerts(),
        api.getWishlist()
      ]);
      setAlerts(aList);
      if (wList) {
        setInWishlist(wList.some(item => item.symbol === symbol));
      }
    } catch (err) {
      console.warn('Failed to load user portfolio data:', err.message);
    }
  };

  useEffect(() => {
    let active = true;
    let lastChartFetchTime = 0;
    let lastStatusFetchTime = 0;
    let lastStatusRes = null;
    let currentSeries = 'EQ';
    let apiQuoteCache = null;

    async function loadStockData(isBackground = false, onlyOrderBook = false) {
      if (!isBackground) {
        setLoading(true);
        setError(null);
        setStock(null);
        setChartData([]);
      }
      try {
        const fallbackMock = getStockData(symbol);

        let apiQuote;
        if (onlyOrderBook && apiQuoteCache) {
          const apiOrderBook = await api.getOrderBook(symbol, currentSeries).catch(() => null);
          if (apiOrderBook) {
            apiQuoteCache.priceInfo = apiOrderBook.priceInfo;
          }
          apiQuote = apiQuoteCache;
        } else {
          // Fetch market status every 60 seconds
          const nowStatus = Date.now();
          if (nowStatus - lastStatusFetchTime >= 60000 || !lastStatusRes) {
            lastStatusFetchTime = nowStatus;
            lastStatusRes = await api.getMarketStatus().catch(() => null);
          }

          apiQuote = await api.getQuote(symbol);
          apiQuoteCache = apiQuote;
          if (apiQuote.meta && apiQuote.meta.activeSeries && apiQuote.meta.activeSeries.length > 0) {
            currentSeries = apiQuote.meta.activeSeries[0];
          }
        }

        const statusRes = lastStatusRes;

        if (!active) return;

        // Parse market status
        let isOpen = false;
        let statusStr = 'Closed';
        if (statusRes) {
          const stateVal = statusRes.marketStatus || statusRes.marketState?.[0]?.marketStatus;
          if (stateVal === 'Open') {
            isOpen = true;
            statusStr = 'Active';
          } else if (stateVal === 'PC') {
            statusStr = 'Post Close';
          } else {
            statusStr = stateVal || 'Closed';
          }
        } else {
          // Time-based check (9:15 to 15:30 IST, Monday-Friday)
          const now = new Date();
          const istTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
          const day = istTime.getDay();
          const hours = istTime.getHours();
          const mins = istTime.getMinutes();
          const timeInMins = hours * 60 + mins;

          if (day >= 1 && day <= 5 && timeInMins >= (9 * 60 + 15) && timeInMins <= (15 * 60 + 30)) {
            isOpen = true;
            statusStr = 'Active';
          } else {
            isOpen = false;
            statusStr = 'Closed';
          }
        }
        setIsMarketOpen(isOpen);
        setMarketStatusText(statusStr);

        // Map quote
        const mappedStock = mapApiQuoteToFrontendStock(apiQuote, fallbackMock);
        setStock(mappedStock);

        // Map orderbook
        const initialBook = generateOrderBook(mappedStock.price);
        const apiOrderBook = apiQuote.isMock
          ? apiQuote.priceInfo?.marketDeptOrderBook
          : apiQuote.priceInfo?.equityResponse?.[0]?.orderBook;
        const orderbookData = mapOrderBook(apiOrderBook, mappedStock.price, initialBook);
        setOrderBook(orderbookData);

        // Fetch chart data (every 5 minutes or on first load)
        const now = Date.now();
        if (now - lastChartFetchTime >= 300000) {
          lastChartFetchTime = now;
          if (range === '1D') {
            const chartRes = await api.getChart(symbol, '1D');
            if (active) {
              const mappedChart = mapChartData(chartRes);
              setChartData(mappedChart);
            }
          } else {
            // 1W, 1M, 1Y
            const interval = range === '1W' ? 15 : range === '1M' ? 60 : 375;
            const limit = range === '1W' ? 7 : range === '1M' ? 30 : 365;
            const candleRes = await api.getCandles(symbol, interval, limit);
            if (active) {
              let mappedChart = mapCandleData(candleRes);
              if (!mappedChart || mappedChart.length === 0) {
                // Fallback for missing historical data
                const dataPoints = range === '1W' ? 30 : range === '1M' ? 60 : 120;
                const stepMs = (limit * 24 * 60 * 60 * 1000) / dataPoints;
                const basePrice = mappedStock.price || 100;
                mappedChart = Array.from({ length: dataPoints }).map((_, i) => {
                  const ts = now - (dataPoints - 1 - i) * stepMs;
                  const date = new Date(ts);
                  const variance = basePrice * 0.15;
                  const randomOffset = (Math.sin(i * 0.2) + Math.sin(i * 0.8) + (Math.random() - 0.5)) * variance;
                  return {
                    timestamp: ts,
                    time: `${String(date.getDate()).padStart(2, '0')} ${['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][date.getMonth()]}`,
                    fullDate: `${['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()]}, ${String(date.getDate()).padStart(2, '0')} ${['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][date.getMonth()]}`,
                    price: Math.max(1, basePrice + randomOffset)
                  };
                });
              }
              setChartData(mappedChart);
            }
          }
        }
      } catch (err) {
        console.error('Error fetching stock quote/chart from API:', err);
        if (active && !isBackground) {
          setError(err.message || 'Failed to fetch stock data from NSE');
        }
      } finally {
        if (active && !isBackground) {
          setLoading(false);
        }
      }
    }

    loadStockData(false);
    fetchUserData();

    // Refresh stock data every 1s to keep order book alive!
    const intervalId = setInterval(() => {
      if (active) loadStockData(true, true); // true for isBackground, true for onlyOrderBook
    }, 1000);

    // Direct NSE WebSocket for real-time live price ticks! (Zero backend load)
    let ws = null;
    try {
      ws = new WebSocket(`wss://streamer.nseindia.com/streams/equity/high/equityStockBySymbol?symbol=${symbol}`);
      ws.onmessage = (event) => {
        if (!active) return;
        try {
          const data = JSON.parse(event.data);
          if (data && data.ltp) {
            setStock(prev => {
              if (!prev) return prev;
              // Only update if price actually changed
              if (prev.price === parseFloat(data.ltp)) return prev;

              return {
                ...prev,
                price: parseFloat(data.ltp),
                change: parseFloat(data.change),
                pChange: parseFloat(data.pchange)
              };
            });
          }
        } catch (e) {
          // ignore parsing errors from ws
        }
      };
    } catch (err) {
      console.warn("Could not connect to live NSE websocket:", err);
    }

    return () => {
      active = false;
      clearInterval(intervalId);
      if (ws) ws.close();
    };
  }, [symbol, range]);

  useEffect(() => {
    let active = true;
    async function loadPeerFilters() {
      try {
        const [quarters, indices] = await Promise.all([
          api.getPeerQuarters(symbol).catch(() => []),
          api.getPeerIndices(symbol).catch(() => [])
        ]);
        if (!active) return;
        setPeerQuartersList(quarters || []);
        setPeerIndicesList(indices || []);
        if (quarters && quarters.length > 0) setPeerQuarter(quarters[0].value);
        // Default index stays empty unless we want one
      } catch (err) {
        console.error('Error fetching peer filters:', err);
      }
    }
    loadPeerFilters();
    return () => { active = false; };
  }, [symbol]);

  useEffect(() => {
    async function fetchAiSummaries() {
      setAiSummariesLoading(true);
      try {
        const summaries = await api.getAnnouncementsSummary(symbol);
        setAiSummaries(summaries || []);
      } catch (err) {
        console.error('Error fetching AI summaries:', err);
      } finally {
        setAiSummariesLoading(false);
      }
    }
    fetchAiSummaries();
  }, [symbol]);

  useEffect(() => {
    let active = true;
    async function fetchScreener() {
      setScreenerLoading(true);
      try {
        const data = await api.getScreenerData(symbol);
        if (active) setScreenerData(data.parsedData || []);
      } catch (err) {
        console.error('Error fetching screener data:', err);
        if (active) setScreenerData([]);
      } finally {
        if (active) setScreenerLoading(false);
      }
    }
    fetchScreener();
    return () => { active = false; };
  }, [symbol]);

  useEffect(() => {
    let active = true;
    async function fetchPeerData() {
      if (activeSubTab !== 'peers') return;
      setPeerLoading(true);
      try {
        const param = peerIndex ? 'index' : 'industry';
        const data = await api.getPeers(symbol, peerType, peerQuarter, param, peerIndex);
        if (active) setPeersData(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Error fetching peers:', err);
        if (active) setPeersData([]);
      } finally {
        if (active) setPeerLoading(false);
      }
    }
    fetchPeerData();
    return () => { active = false; };
  }, [symbol, activeSubTab, peerType, peerQuarter, peerIndex]);

  const generateOrderBook = (price) => {
    const list = [];
    const spreadPercent = 0.0005;
    const spread = price * spreadPercent;

    for (let i = 0; i < 5; i++) {
      const scale = (5 - i) * 0.0004;
      const bidPrice = price - spread / 2 - (price * scale);
      const askPrice = price + spread / 2 + (price * scale);
      const bidQty = Math.floor(Math.random() * 250) + 10;
      const askQty = Math.floor(Math.random() * 250) + 10;
      list.push({ bidQty, bidPrice: parseFloat(bidPrice.toFixed(2)), askPrice: parseFloat(askPrice.toFixed(2)), askQty });
    }
    return list;
  };



  const totalBids = orderBook.reduce((acc, r) => acc + (r.bidQty || 0), 0);
  const totalAsks = orderBook.reduce((acc, r) => acc + (r.askQty || 0), 0);
  const totalVol = totalBids + totalAsks;
  const buyPct = totalVol > 0 ? ((totalBids / totalVol) * 100).toFixed(0) : '50';
  const sellPct = totalVol > 0 ? ((totalAsks / totalVol) * 100).toFixed(0) : '50';

  // Handle Trade Submission
  const handlePlaceTrade = async (e) => {
    e.preventDefault();
    setTradeError('');
    setTradeMessage('');
    setTradeLoading(true);

    const price = tradePrice ? parseFloat(tradePrice) : stock.price;

    try {
      await api.placeTrade({
        symbol,
        companyName: stock.name,
        quantity: parseInt(tradeQty),
        price,
        type: tradeType,
        product: tradeProduct
      });
      setTradeMessage(`Successfully executed order to ${tradeType} ${tradeQty} shares of ${symbol}`);
      await fetchUserData(); // Refresh database holdings/positions list
    } catch (err) {
      setTradeError(err.message || 'Failed to place trade');
    } finally {
      setTradeLoading(false);
    }
  };

  // Handle Price Alert creation
  const handleCreateAlert = async (e) => {
    e.preventDefault();
    setAlertError('');
    setAlertMessage('');
    if (!alertTargetPrice) return;

    try {
      await api.createAlert({
        symbol,
        targetPrice: parseFloat(alertTargetPrice),
        condition: alertCondition
      });
      setAlertMessage(`Alert created successfully for ${symbol} when price is ${alertCondition.toLowerCase()} ${alertTargetPrice}`);
      setAlertTargetPrice('');
      await fetchUserData(); // Refresh alerts list
    } catch (err) {
      setAlertError(err.message || 'Failed to create alert');
    }
  };

  // Handle Price Alert deletion
  const handleDeleteAlert = async (alertId) => {
    try {
      await api.deleteAlert(alertId);
      await fetchUserData(); // Refresh alerts list
    } catch (err) {
      console.error('Failed to delete alert:', err);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  if (loading && !stock) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-surface h-[60vh] w-full">
        <div className="flex items-end gap-1.5 h-12 mb-6">
          <div className="w-2.5 bg-[#4184f3] rounded-t-sm h-4 animate-[bounce_1s_infinite_0ms]"></div>
          <div className="w-2.5 bg-[#4184f3] rounded-t-sm h-8 animate-[bounce_1s_infinite_100ms]"></div>
          <div className="w-2.5 bg-[#4184f3] rounded-t-sm h-6 animate-[bounce_1s_infinite_200ms]"></div>
          <div className="w-2.5 bg-[#4184f3] rounded-t-sm h-10 animate-[bounce_1s_infinite_300ms]"></div>
          <div className="w-2.5 bg-[#4184f3] rounded-t-sm h-5 animate-[bounce_1s_infinite_400ms]"></div>
        </div>
        <div className="text-sm font-mono text-on-surface-variant uppercase tracking-widest flex flex-col items-center gap-1">
          <span className="font-bold text-[#4184f3]">{symbol}</span>
          <span className="text-xs">Fetching Market Data...</span>
        </div>
      </div>
    );
  }

  if (error && !stock) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-surface h-full p-8 text-center">
        <span className="material-icons text-error text-4xl mb-4">error_outline</span>
        <h2 className="text-xl font-bold text-on-surface mb-2">Failed to load stock data</h2>
        <p className="text-on-surface-variant text-sm max-w-md">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-6 px-4 py-2 bg-primary text-white rounded font-bold text-sm"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!stock) return null;

  return (
    <main className="flex-grow w-full max-w-[1200px] mx-auto flex flex-col relative bg-white pb-12">

      {/* Top Header Information */}
      <section className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 p-4 sm:p-6 border-b border-border-subtle">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h1 className="text-xl md:text-2xl font-bold text-on-surface">{stock.name}</h1>
            <span className="text-xs text-on-surface-variant font-mono">({stock.isin})</span>
            <span className="px-2 py-0.5 text-[10px] bg-surface-container-low border border-border-subtle text-on-surface font-semibold rounded-sm">EQ</span>
          </div>

          <div className="flex items-baseline gap-3">
            <span className={`text-2xl md:text-3xl font-bold font-mono transition-colors duration-300 ${tickActive === 'up' ? 'text-secondary animate-tick-up' : tickActive === 'down' ? 'text-tertiary animate-tick-down' : 'text-on-surface'
              }`}>
              {stock.price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <div className={`flex items-center font-bold text-base font-mono ${stock.up ? 'text-secondary' : 'text-tertiary'}`}>
              <span className="material-icons text-sm mr-0.5">
                {stock.up ? 'arrow_drop_up' : 'arrow_drop_down'}
              </span>
              {stock.change.toFixed(2)} ({stock.percent})
            </div>
            <span className="material-icons text-on-surface-variant text-sm cursor-help" title="Quotes feed info">info</span>
          </div>

          <div className="mt-2.5 flex flex-wrap items-center gap-4 text-xs text-on-surface-variant font-medium">
            <span>Trading Status: <span className="text-on-surface font-bold">{marketStatusText}</span></span>
            <span>{stock.lastUpdateTime || `As on ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} 15:30:00 IST`}</span>
            <button
              onClick={() => setActiveSubTab('alerts')}
              className="inline-flex items-center gap-1.5 px-3 py-1 border border-primary text-primary hover:bg-primary hover:text-white transition-all rounded-sm text-[11px] font-bold uppercase tracking-wider"
            >
              Alert Me
            </button>
            <button
              onClick={handleToggleWishlist}
              className={`inline-flex items-center gap-1.5 px-3 py-1 border transition-all rounded-sm text-[11px] font-bold uppercase tracking-wider ${inWishlist ? 'border-gray-400 bg-gray-50 text-gray-600 hover:bg-gray-100' : 'border-[#FF5724] text-[#FF5724] hover:bg-[#FF5724] hover:text-white'}`}
            >
              {inWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
            </button>
          </div>
        </div>

        <div className="text-left md:text-right mt-4 md:mt-0 w-full md:w-auto border-t md:border-t-0 border-border-subtle/50 pt-4 md:pt-0">
          <span className="text-xs text-on-surface-variant font-medium mb-1 block">Previous Close</span>
          <div className="flex items-baseline gap-2 justify-start md:justify-end font-mono">
            <span className="text-lg md:text-xl font-bold text-on-surface">{stock.prevClose.toFixed(2)}</span>
            <span className={`text-xs font-semibold ${stock.price >= stock.prevClose ? 'text-secondary' : 'text-tertiary'}`}>
              {stock.price >= stock.prevClose ? '+' : ''}{(stock.price - stock.prevClose).toFixed(2)}
            </span>
          </div>
        </div>
      </section>

      {/* Sentiments Grid - Temporarily Disabled
      <section className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 p-4 sm:p-6 border-b-[8px] border-[#f1f1f1]">
        <div className="flex-grow flex flex-col justify-center w-full">
          <span className="text-xs text-on-surface-variant font-bold mb-3 uppercase tracking-wide">Price Sentiments</span>
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
            <div className="flex-1 sm:border-r border-border-subtle sm:pr-6 pb-2 sm:pb-0">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-xs text-on-surface-variant font-bold">Short Term:</span>
                <span className="text-xs font-bold text-secondary flex items-center gap-0.5">
                  <span className="material-icons text-sm">trending_up</span> {stock.sentimentShort}
                </span>
              </div>
              <p className="text-xs text-on-surface-variant leading-relaxed">{stock.sentimentShortDesc}</p>
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-xs text-on-surface-variant font-bold">Long Term:</span>
                <span className="text-xs font-bold text-secondary flex items-center gap-0.5">
                  <span className="material-icons text-sm">trending_up</span> {stock.sentimentLong}
                </span>
              </div>
              <p className="text-xs text-on-surface-variant leading-relaxed">{stock.sentimentLongDesc}</p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setAiDrawerOpen(true)}
          className="bg-[#FF5724] hover:opacity-95 text-white font-bold text-[11px] uppercase tracking-wider px-5 py-2.5 rounded-sm flex items-center justify-center gap-1.5 shadow-sm transition-opacity self-center shrink-0 w-full lg:w-auto mt-2 lg:mt-0"
        >
          <span className="material-icons text-sm">auto_awesome</span>
          Analyse with AI
        </button>
      </section>
      */}

      {/* Navigation Sub-Tabs */}
      <nav className="flex gap-6 border-b border-border-subtle overflow-x-auto no-scrollbar px-4 sm:px-6">
        <button
          onClick={() => setActiveSubTab('dashboard')}
          className={`py-3 text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${activeSubTab === 'dashboard' ? 'text-primary border-b-2 border-primary -mb-[2px]' : 'text-on-surface-variant hover:text-on-surface'
            }`}
        >
          Dashboard
        </button>
        <button
          onClick={() => setActiveSubTab('announcements')}
          className={`py-3 text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${activeSubTab === 'announcements' ? 'text-primary border-b-2 border-primary -mb-[2px]' : 'text-on-surface-variant hover:text-on-surface'
            }`}
        >
          Announcements
        </button>
        <button
          onClick={() => setActiveSubTab('actions')}
          className={`py-3 text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${activeSubTab === 'actions' ? 'text-primary border-b-2 border-primary -mb-[2px]' : 'text-on-surface-variant hover:text-on-surface'
            }`}
        >
          Corporate Actions
        </button>
        <button
          onClick={() => setActiveSubTab('peers')}
          className={`py-3 text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${activeSubTab === 'peers' ? 'text-primary border-b-2 border-primary -mb-[2px]' : 'text-on-surface-variant hover:text-on-surface'
            }`}
        >
          Peer Comparison
        </button>

        <button
          onClick={() => setActiveSubTab('alerts')}
          className={`py-3 text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${activeSubTab === 'alerts' ? 'text-primary border-b-2 border-primary -mb-[2px]' : 'text-on-surface-variant hover:text-on-surface'
            }`}
        >
          Price Alerts
        </button>
      </nav>

      {/* Dashboard View */}
      {activeSubTab === 'dashboard' && (
        <>
          {/* Key Stats Bar */}
          <section className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4 bg-white border-b-[8px] border-[#f1f1f1] p-4 sm:p-6 font-mono text-xs text-on-surface">
            <div>
              <div className="text-on-surface-variant/80 mb-1">Prev. Close</div>
              <div className="font-bold text-sm">{stock.prevClose.toFixed(2)}</div>
            </div>
            <div>
              <div className="text-on-surface-variant/80 mb-1 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block"></span> Open
              </div>
              <div className="font-bold text-sm">{stock.open.toFixed(2)}</div>
            </div>
            <div>
              <div className="text-on-surface-variant/80 mb-1 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary inline-block"></span> High
              </div>
              <div className="font-bold text-secondary text-sm">{stock.high.toFixed(2)}</div>
            </div>
            <div>
              <div className="text-on-surface-variant/80 mb-1 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-tertiary inline-block"></span> Low
              </div>
              <div className="font-bold text-tertiary text-sm">{stock.low.toFixed(2)}</div>
            </div>
            <div>
              <div className="text-on-surface-variant/80 mb-1">Close *</div>
              <div className="font-bold text-sm">{stock.close.toFixed(2)}</div>
            </div>
            <div>
              <div className="text-on-surface-variant/80 mb-1">VWAP</div>
              <div className="font-bold text-sm">{stock.vwap.toFixed(2)}</div>
            </div>
            <div>
              <div className="text-on-surface-variant/80 mb-1">Adjusted Price *</div>
              <div className="font-bold text-sm">-</div>
            </div>
          </section>

          {/* Order Book & Chart */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
            {/* Left Sidebar: Order Book & Trading Widget */}
            <div className="lg:col-span-3 flex flex-col gap-4">
              {/* Order Book */}
              <div className="bg-white border-b-[8px] border-[#f1f1f1] flex flex-col overflow-hidden h-[320px]">
                <div className="p-3 bg-surface-bright border-b border-border-subtle font-bold text-xs uppercase text-on-surface">
                  Order Book
                </div>
                <table className="w-full text-center text-xs font-mono select-none">
                  <thead className="bg-surface-container-low text-on-surface-variant border-b border-border-subtle text-[10px] tracking-wide uppercase">
                    <tr>
                      <th className="p-2 font-semibold text-left pl-4">Qty</th>
                      <th className="p-2 font-semibold text-secondary text-right">Bid (₹)</th>
                      <th className="p-2 font-semibold text-tertiary text-left">Ask (₹)</th>
                      <th className="p-2 font-semibold text-right pr-4">Qty</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-subtle/50 text-[11px]">
                    {orderBook.map((row, idx) => (
                      <tr key={idx} className="hover:bg-surface-container-low transition-colors">
                        <td className="p-2 text-on-surface-variant text-left pl-4">{row.bidQty}</td>
                        <td className="p-2 text-secondary font-semibold text-right">{row.bidPrice.toFixed(2)}</td>
                        <td className="p-2 text-tertiary font-semibold text-left">{row.askPrice.toFixed(2)}</td>
                        <td className="p-2 text-on-surface-variant text-right pr-4">{row.askQty}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="mt-auto p-3 border-t border-border-subtle bg-surface-container-low text-[11px]">
                  <div className="flex justify-between font-bold mb-2">
                    <span className="text-secondary">% Buy: {buyPct}%</span>
                    <span className="text-tertiary">% Sell: {sellPct}%</span>
                  </div>
                  <div className="h-1.5 w-full rounded-sm bg-white overflow-hidden flex">
                    <div className="bg-secondary h-full transition-all duration-300" style={{ width: `${buyPct}%` }}></div>
                    <div className="bg-tertiary h-full transition-all duration-300" style={{ width: `${sellPct}%` }}></div>
                  </div>
                  <div className="flex justify-between text-[9px] text-on-surface-variant/80 font-mono mt-3">
                    <span>Total Bids: {totalBids}</span>
                    <span>Total Asks: {totalAsks}</span>
                  </div>
                </div>
              </div>


            </div>

            {/* Chart Area */}
            <div className="lg:col-span-9 bg-white border-b-[8px] border-[#f1f1f1] flex flex-col p-4 sm:p-6 min-h-[300px]">
              <div className="flex justify-between items-center w-full mb-4">
                <div className="flex gap-1">
                  {['1D', '1W', '1M', '1Y'].map(r => (
                    <button
                      key={r}
                      onClick={() => setRange(r)}
                      className={`px-2.5 py-1 rounded text-xs font-semibold transition-all ${range === r ? 'bg-primary text-white' : 'text-on-surface-variant hover:bg-surface-container-low'
                        }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
                <a
                  href={`https://charting.nseindia.com/?symbol=${symbol}-EQ`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold text-on-surface hover:bg-surface-container-low transition-all border border-border-subtle hover:border-on-surface/30 group"
                  title="Open Advanced Chart"
                >
                  <span className="material-symbols-outlined text-[16px] group-hover:text-primary transition-colors">show_chart</span>
                  <span>Charting</span>
                </a>
              </div>

              {/* Responsive Container */}
              <div className="flex-1 w-full bg-surface-bright rounded border border-border-subtle relative p-2 overflow-hidden">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="chartGrad" x1="0%" x2="0%" y1="0%" y2="100%">
                        <stop offset="0%" stopColor="#005cab" stopOpacity={0.15}></stop>
                        <stop offset="100%" stopColor="#005cab" stopOpacity={0.00}></stop>
                      </linearGradient>
                    </defs>
                    <XAxis
                      type="number"
                      domain={['dataMin', 'dataMax']}
                      dataKey="timestamp"
                      ticks={
                        (() => {
                          if (!chartData || !chartData.length) return undefined;
                          const minTime = chartData[0].timestamp;
                          const maxTime = chartData[chartData.length - 1].timestamp;
                          const ticks = [];

                          if (range === '1D') {
                            const base = new Date(minTime);
                            base.setUTCMinutes(0, 0, 0);
                            for (let h = 9; h <= 16; h++) {
                              const t = new Date(base);
                              t.setUTCHours(h, 0, 0, 0);
                              ticks.push(t.getTime());
                            }
                            return ticks;
                          }

                          if (range === '1W') {
                            let lastDay = -1;
                            for (const point of chartData) {
                              const d = new Date(point.timestamp);
                              const day = d.getUTCDate();
                              if (day !== lastDay) {
                                const t = new Date(d);
                                t.setUTCHours(9, 15, 0, 0);
                                ticks.push(t.getTime());
                                lastDay = day;
                              }
                            }
                            return ticks;
                          }

                          if (range === '1M') {
                            const endDay = new Date(maxTime);
                            endDay.setUTCHours(0, 0, 0, 0);
                            let cur = endDay.getTime();
                            while (cur >= minTime) {
                              ticks.unshift(cur);
                              cur -= 7 * 24 * 60 * 60 * 1000;
                            }
                            return ticks;
                          }

                          if (range === '1Y') {
                            const endDay = new Date(maxTime);
                            endDay.setUTCDate(1);
                            endDay.setUTCHours(0, 0, 0, 0);
                            let cur = new Date(endDay);
                            while (cur.getTime() >= minTime) {
                              ticks.unshift(cur.getTime());
                              cur.setUTCMonth(cur.getUTCMonth() - 3);
                            }
                            return ticks;
                          }
                          return undefined;
                        })()
                      }
                      tickFormatter={(val) => {
                        const d = new Date(val);
                        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                        if (range === '1D') return `${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')}`;
                        if (range === '1W' || range === '1M') return `${d.getUTCDate()} ${months[d.getUTCMonth()]}`;
                        if (range === '1Y') return `${months[d.getUTCMonth()]} '${String(d.getUTCFullYear()).slice(2)}`;
                        return val;
                      }}
                      tick={{ fill: '#414751', fontSize: 10 }}
                      axisLine={{ stroke: '#c1c6d3', strokeOpacity: 0.5 }}
                      tickLine={{ stroke: '#c1c6d3', strokeOpacity: 0.5 }}
                      minTickGap={range === '1D' ? 10 : 30}
                    />
                    <YAxis
                      domain={['auto', 'auto']}
                      tick={{ fill: '#414751', fontSize: 10 }}
                      axisLine={{ stroke: '#c1c6d3', strokeOpacity: 0.5 }}
                      tickLine={{ stroke: '#c1c6d3', strokeOpacity: 0.5 }}
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const point = payload[0].payload;
                          const currentPrice = point.price;
                          // Parse prevClose properly, it might be a string with commas
                          const pCloseStr = stock.prevClose.toString().replace(/,/g, '');
                          const prevCloseVal = parseFloat(pCloseStr);
                          const change = currentPrice - prevCloseVal;
                          const pChange = (change / prevCloseVal) * 100;
                          const isUp = change >= 0;

                          return (
                            <div className="bg-white border border-[#c1c6d3] rounded-sm p-3 shadow-lg flex flex-col gap-1 min-w-[180px]">
                              <div className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: stock.up ? '#005cab' : '#ac2c2b' }}></span>
                                <span className="font-bold text-[13px] text-[#1b1c1c] tracking-wide uppercase">{symbol}EQN</span>
                              </div>
                              <div className="flex items-baseline gap-2 mt-1">
                                <span className="font-bold text-[15px] text-[#1b1c1c]">{currentPrice.toFixed(2)}</span>
                                <span className="font-medium text-[13px]" style={{ color: isUp ? '#1db469' : '#ac2c2b' }}>
                                  {isUp ? '+' : ''}{change.toFixed(2)} ({isUp ? '+' : ''}{pChange.toFixed(2)}%)
                                </span>
                              </div>
                              <div className="text-[11px] text-[#414751] mt-1.5">
                                {point.fullDate}
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="price"
                      stroke={stock.up ? '#005cab' : '#ac2c2b'}
                      strokeWidth={2}
                      fill="url(#chartGrad)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </section>

          {/* Performance Returns */}
          <section className="bg-white p-4 sm:p-6 border-b-[8px] border-[#f1f1f1]">
            <div className="flex flex-wrap items-center gap-4 text-xs text-on-surface-variant font-medium mb-4">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#008b1a] inline-block"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-[#c52c2e] inline-block"></span>
                Stock Absolute Returns
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#e1e4e8] inline-block"></span>
                NIFTY 50 Absolute Returns
              </div>
            </div>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
              {(stock.returns || []).map(item => {
                const isStockUp = !item.stock.startsWith('-');
                const isIndexUp = !item.index.startsWith('-');
                return (
                  <div key={item.label} className="bg-white border border-border-subtle rounded-md p-2 text-center shadow-sm">
                    <div className="text-[11px] text-on-surface font-bold mb-1.5 tracking-wide">{item.label}</div>
                    <div className="flex rounded overflow-hidden text-xs font-mono border border-border-subtle/40">
                      <div className={`w-1/2 font-bold py-1.5 text-white ${isStockUp ? 'bg-[#008b1a]' : 'bg-[#c52c2e]'}`}>
                        {item.stock}
                      </div>
                      <div className={`w-1/2 py-1.5 bg-[#f0f2f5] font-bold ${isIndexUp ? 'text-[#008b1a]' : 'text-[#c52c2e]'}`}>
                        {item.index}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Trade, Price & Securities Info */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-2">
            <div className="bg-white border-b-[8px] border-[#f1f1f1] p-4 sm:p-6">
              <h3 className="font-bold text-xs uppercase tracking-wider text-on-surface-variant mb-4 border-b border-border-subtle pb-2">Trade Information</h3>
              <div className="grid grid-cols-2 gap-y-2 gap-x-2 text-xs font-mono">
                <div>
                  <div className="text-[10px] text-on-surface-variant/80 uppercase mb-0.5">Traded Volume (lakhs)</div>
                  <div className="font-bold text-on-surface">{stock.volume}</div>
                </div>
                <div>
                  <div className="text-[10px] text-on-surface-variant/80 uppercase mb-0.5">Traded Value (₹ Cr.)</div>
                  <div className="font-bold text-on-surface">{stock.value}</div>
                </div>
                <div>
                  <div className="text-[10px] text-on-surface-variant/80 uppercase mb-0.5">Total Market Cap (₹ Cr.)</div>
                  <div className="font-bold text-on-surface">{stock.marketCap}</div>
                </div>
                <div>
                  <div className="text-[10px] text-on-surface-variant/80 uppercase mb-0.5">Free Float Market Cap (₹ Cr.)</div>
                  <div className="font-bold text-on-surface">{stock.freeFloat}</div>
                </div>
                <div className="contents">
                  <div>
                    <div className="text-[10px] text-on-surface-variant/80 uppercase mb-0.5">Impact cost</div>
                    <div className="font-bold text-on-surface">{stock.impactCost}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-on-surface-variant/80 uppercase mb-0.5">Face Value</div>
                    <div className="font-bold text-on-surface">{stock.faceValue}</div>
                  </div>
                </div>
                <div className="contents">
                  <div>
                    <div className="text-[10px] text-on-surface-variant/80 uppercase mb-0.5">Applicable Margin Rate</div>
                    <div className="font-bold text-on-surface">{stock.applicableMargin}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-on-surface-variant/80 uppercase mb-0.5">% of Deliverable / Traded Quantity</div>
                    <div className="font-bold text-on-surface">{stock.deliveryToTradedQuantity}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white border-b-[8px] border-[#f1f1f1] p-4 sm:p-6">
              <h3 className="font-bold text-xs uppercase tracking-wider text-on-surface-variant mb-4 border-b border-border-subtle pb-2">Price Information</h3>
              <div className="grid grid-cols-2 gap-y-2 gap-x-2 text-xs font-mono">
                <div>
                  <div className="text-[10px] text-on-surface-variant/80 uppercase mb-0.5">52 Week High</div>
                  <div className="font-bold text-secondary">{(stock.yearHigh || 0).toFixed(2)}</div>
                </div>
                <div>
                  <div className="text-[10px] text-on-surface-variant/80 uppercase mb-0.5">52 Week Low</div>
                  <div className="font-bold text-tertiary">{(stock.yearLow || 0).toFixed(2)}</div>
                </div>
                <div className="contents">
                  <div>
                    <div className="text-[10px] text-on-surface-variant/80 uppercase mb-0.5">Upper Circuit</div>
                    <div className="font-bold text-on-surface">{stock.upperBand}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-on-surface-variant/80 uppercase mb-0.5">Lower Circuit</div>
                    <div className="font-bold text-on-surface">{stock.lowerBand}</div>
                  </div>
                </div>
                <div className="contents">
                  <div>
                    <div className="text-[10px] text-on-surface-variant/80 uppercase mb-0.5">Price Band (%)</div>
                    <div className="font-bold text-on-surface">{stock.priceBandPercent}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-on-surface-variant/80 uppercase mb-0.5">Tick Size</div>
                    <div className="font-bold text-on-surface">{stock.tickSize}</div>
                  </div>
                </div>
                <div className="contents">
                  <div>
                    <div className="text-[10px] text-on-surface-variant/80 uppercase mb-0.5">Daily Volatility</div>
                    <div className="font-bold text-on-surface">{stock.cmDailyVolatility}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-on-surface-variant/80 uppercase mb-0.5">Annualised Volatility</div>
                    <div className="font-bold text-on-surface">{stock.cmAnnualVolatility}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white border-b-[8px] border-[#f1f1f1] p-4 sm:p-6">
              <h3 className="font-bold text-xs uppercase tracking-wider text-on-surface-variant mb-4 border-b border-border-subtle pb-2">Securities Information</h3>
              <div className="grid grid-cols-2 gap-y-2 gap-x-2 text-xs font-mono">
                <div>
                  <div className="text-[10px] text-on-surface-variant/80 uppercase mb-0.5">Status</div>
                  <div className="font-bold text-on-surface">{stock.secStatus}</div>
                </div>
                <div>
                  <div className="text-[10px] text-on-surface-variant/80 uppercase mb-0.5">Trading Status</div>
                  <div className="font-bold text-on-surface">{stock.tradingStatus}</div>
                </div>
                <div className="contents">
                  <div>
                    <div className="text-[10px] text-on-surface-variant/80 uppercase mb-0.5">Symbol P/E</div>
                    <div className="font-bold text-on-surface">{stock.pe}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-on-surface-variant/80 uppercase mb-0.5">Adjusted P/E</div>
                    <div className="font-bold text-on-surface">{stock.secPe}</div>
                  </div>
                </div>
                <div className="contents">
                  <div>
                    <div className="text-[10px] text-on-surface-variant/80 uppercase mb-0.5">Date of Listing</div>
                    <div className="font-bold text-on-surface">{stock.listingDate}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-on-surface-variant/80 uppercase mb-0.5">Index <span className="material-icons text-[10px] cursor-help text-on-surface-variant" title="Index details">info</span></div>
                    <div className="font-bold text-secondary flex items-center gap-1">
                      {stock.index}
                    </div>
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-on-surface-variant/80 uppercase mb-0.5">Basic Industry <span className="material-icons text-[10px] cursor-help text-on-surface-variant" title="Industry classification">info</span></div>
                  <div className="font-bold text-on-surface flex items-center gap-1">
                    {stock.basicIndustry}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Screener Analysis */}
          <section className="mb-6 bg-surface border border-surface-variant rounded-xl overflow-hidden shadow-sm mx-4 sm:mx-6">
            <div className="p-4 bg-surface-variant/30 border-b border-surface-variant flex items-center gap-2">
              <span className="material-icons text-secondary text-xl">analytics</span>
              <h3 className="font-bold text-on-surface">Screener Analysis</h3>
            </div>
            <div className="p-4 w-full">
              {screenerLoading ? (
                <div className="text-sm text-on-surface-variant animate-pulse">Loading screener data...</div>
              ) : screenerData.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {screenerData.map((section, idx) => (
                    <div key={idx} className="border border-border-subtle rounded-md bg-white p-3">
                      <h4 className="font-semibold text-sm text-[#414751] mb-2">{section.title}</h4>
                      <table className="w-full text-xs text-left">
                        <tbody className="divide-y divide-transparent">
                          {section.data.map((item, i) => (
                            <tr key={i} className="group">
                              <td className="py-1 text-on-surface-variant w-1/2">{item.label}</td>
                              <td className="py-1 text-on-surface font-bold text-right">{item.value}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-on-surface-variant">No screener data available.</div>
              )}
            </div>
          </section>

          {/* AI Summaries View */}
          {aiSummaries.length > 0 && (
            <section className="mb-6 bg-surface border border-surface-variant rounded-xl overflow-hidden shadow-sm mx-4 sm:mx-6">
              <div className="p-4 bg-surface-variant/30 border-b border-surface-variant flex items-center gap-2">
                <span className="material-icons text-primary text-xl">auto_awesome</span>
                <h3 className="font-bold text-on-surface">Recent AI Summaries</h3>
              </div>
              <div className="p-4 flex flex-col gap-4">
                {aiSummaries.map((summary, idx) => (
                  <div key={idx} className="border border-surface-variant rounded-lg p-4 bg-surface-variant/10">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex gap-2">
                        {summary.ai_impact === 'Positive' && <span className="bg-green-500/10 text-green-500 text-xs font-bold px-2 py-1 rounded border border-green-500/20">Positive Impact</span>}
                        {summary.ai_impact === 'Negative' && <span className="bg-red-500/10 text-red-500 text-xs font-bold px-2 py-1 rounded border border-red-500/20">Negative Impact</span>}
                        {summary.ai_impact === 'Neutral' && <span className="bg-surface-variant/50 text-on-surface-variant text-xs font-bold px-2 py-1 rounded border border-on-surface-variant/20">Neutral Impact</span>}
                        
                        {summary.ai_sentiment === 'Bullish' && <span className="bg-green-500/10 text-green-500 text-xs font-bold px-2 py-1 rounded border border-green-500/20">Bullish</span>}
                        {summary.ai_sentiment === 'Bearish' && <span className="bg-red-500/10 text-red-500 text-xs font-bold px-2 py-1 rounded border border-red-500/20">Bearish</span>}
                        {summary.ai_sentiment === 'Neutral' && <span className="bg-surface-variant/50 text-on-surface-variant text-xs font-bold px-2 py-1 rounded border border-on-surface-variant/20">Neutral</span>}
                      </div>
                      <div className="flex flex-col items-end text-xs font-medium">
                        <span className="text-on-surface-variant">Announced: {summary.anndate}</span>
                        {summary.created_at && (
                          <span className="text-[10px] text-on-surface-variant/70 mt-0.5">
                            AI Analyzed: {new Date(summary.created_at).toLocaleString('en-IN', {
                              day: '2-digit', month: 'short', year: 'numeric',
                              hour: '2-digit', minute: '2-digit', second: '2-digit'
                            })}
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-on-surface leading-relaxed mb-3">
                      {summary.ai_summary}
                    </p>
                    {summary.attachment_url && (
                      <a href={summary.attachment_url} target="_blank" rel="noreferrer" className="text-xs text-primary font-bold hover:underline flex items-center gap-1 w-max">
                        <span className="material-icons text-[14px]">picture_as_pdf</span>
                        View Original PDF
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      )}

      {/* Announcements View */}
      {activeSubTab === 'announcements' && (
        <section className="bg-white border-b-[8px] border-[#f1f1f1] p-4 sm:p-6 space-y-0">
          <h3 className="font-bold text-base text-on-surface mb-2">Corporate Announcements</h3>
          {stock.announcements && stock.announcements.length > 0 ? (
            stock.announcements.map((ann, i) => (
              <div key={i} className="border-b border-border-subtle py-4 hover:bg-surface-container-low transition-colors flex justify-between items-start gap-4">
                <div>
                  <span className="text-[10px] font-mono bg-surface-container-low text-on-surface-variant px-2 py-0.5 rounded border border-border-subtle">{ann.date}</span>
                  <h4 className="font-bold text-xs text-on-surface mt-2">{ann.title}</h4>
                  <p className="text-xs text-on-surface-variant mt-1.5 leading-relaxed">{ann.desc}</p>
                </div>
                {ann.pdfUrl && (
                  <button
                    onClick={() => window.open(ann.pdfUrl, '_blank')}
                    className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white text-[11px] font-bold uppercase rounded-sm"
                  >
                    <span className="material-icons text-sm">picture_as_pdf</span> View PDF
                  </button>
                )}
              </div>
            ))
          ) : (
            <div className="p-4 text-center text-on-surface-variant italic border border-border-subtle rounded bg-surface-container-low/50">
              No recent announcements found.
            </div>
          )}
        </section>
      )}

      {/* Actions View */}
      {activeSubTab === 'actions' && (
        <section className="bg-white border-b-[8px] border-[#f1f1f1] p-4 sm:p-6 overflow-hidden">
          <h3 className="font-bold text-base text-on-surface mb-4">Corporate Actions</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-container-low text-on-surface-variant border-b border-border-subtle text-[10px] tracking-wide uppercase">
                <tr>
                  <th className="p-3 font-semibold">Purpose</th>
                  <th className="p-3 font-semibold font-mono">Record Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle/50 text-on-surface">
                {stock.corpActions && stock.corpActions.length > 0 ? (
                  stock.corpActions.map((act, i) => (
                    <tr key={i} className="hover:bg-surface-container-low transition-colors">
                      <td className="p-3 font-semibold">{act.purpose}</td>
                      <td className="p-3 font-mono text-on-surface-variant">{act.record}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="2" className="p-4 text-center text-on-surface-variant italic">No corporate actions available</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Peer Comparison View */}
      {activeSubTab === 'peers' && (
        <section className="bg-white border-b-[8px] border-[#f1f1f1]">
          {/* Peer Comparison Toolbar */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 border-b border-border-subtle gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-on-surface">Quarter :</span>
                <select
                  value={peerQuarter}
                  onChange={(e) => setPeerQuarter(e.target.value)}
                  className="px-2 py-1 border border-border-subtle rounded text-sm focus:outline-none focus:border-primary"
                >
                  {peerQuartersList.map(q => (
                    <option key={q.value} value={q.value}>{q.label}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-on-surface">Indices :</span>
                <select
                  value={peerIndex}
                  onChange={(e) => setPeerIndex(e.target.value)}
                  className="px-2 py-1 border border-border-subtle rounded text-sm focus:outline-none focus:border-primary max-w-[150px] truncate"
                >
                  <option value="">Select Index</option>
                  {peerIndicesList.map(idx => (
                    <option key={idx} value={idx}>{idx}</option>
                  ))}
                </select>
              </div>
              <button
                onClick={() => {
                  // Trigger a re-render/fetch if needed, or simply let it be visual
                }}
                className="px-3 py-1 text-sm font-medium border border-border-subtle rounded hover:bg-surface-container-low transition-colors"
              >
                Refresh
              </button>
              <button
                onClick={() => {
                  setPeerIndex('');
                  if (peerQuartersList.length > 0) setPeerQuarter(peerQuartersList[0].value);
                  setPeerType('S');
                }}
                className="px-3 py-1 text-sm font-medium text-[#f1a415] border border-[#f1a415]/30 rounded hover:bg-[#f1a415]/10 transition-colors"
              >
                Clear
              </button>
            </div>

            <div className="flex rounded-md overflow-hidden border border-primary self-start md:self-auto w-full md:w-auto">
              <button
                onClick={() => setPeerType('S')}
                className={`flex-1 md:flex-none px-4 py-1.5 text-sm font-medium transition-colors ${peerType === 'S' ? 'bg-primary text-white' : 'bg-white text-on-surface-variant hover:bg-surface-container-low'}`}
              >
                Standalone
              </button>
              <button
                onClick={() => setPeerType('C')}
                className={`flex-1 md:flex-none px-4 py-1.5 text-sm font-medium transition-colors border-l border-primary ${peerType === 'C' ? 'bg-primary text-white' : 'bg-white text-on-surface-variant hover:bg-surface-container-low'}`}
              >
                Consolidated
              </button>
            </div>
          </div>

          <div className="overflow-x-auto relative min-h-[200px]">
            {peerLoading && (
              <div className="absolute inset-0 bg-white/60 z-10 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
            <table className="w-full text-left text-[11px] font-sans whitespace-nowrap">
              <thead className="bg-primary text-white">
                <tr>
                  <th className="p-3 font-semibold text-center align-middle border-r border-white/20" rowSpan={2}>SYMBOL</th>
                  <th className="p-3 font-semibold text-center border-r border-white/20" colSpan={2}>PRICE DATA</th>
                  <th className="p-3 font-semibold text-center border-r border-white/20" colSpan={2}>MARKET PERFORMANCE</th>
                  <th className="p-3 font-semibold text-center border-r border-white/20" colSpan={2}>VALUATION SNAPSHOT</th>
                  <th className="p-3 font-semibold text-center border-r border-white/20" colSpan={4}>FINANCIAL STRENGTH</th>
                  <th className="p-3 font-semibold text-center" rowSpan={2}>OWNERSHIP<br /><span className="text-[10px] font-normal uppercase mt-0.5 block">PROMOTER HOLDINGS %</span></th>
                </tr>
                <tr className="bg-white text-[#414751] text-[10px] border-b border-[#c1c6d3]">
                  <th className="p-3 font-bold text-right uppercase">LTP</th>
                  <th className="p-3 font-bold text-right uppercase border-r border-[#c1c6d3]">% CHNG</th>
                  <th className="p-3 font-bold text-right uppercase">VOLUME<br /><span className="font-normal">(LAKHS)</span></th>
                  <th className="p-3 font-bold text-right uppercase border-r border-[#c1c6d3]">VALUE<br /><span className="font-normal">(₹ CR.)</span></th>
                  <th className="p-3 font-bold text-right uppercase">MARKET<br />CAP <span className="font-normal">(₹ CR.)</span></th>
                  <th className="p-3 font-bold text-right uppercase border-r border-[#c1c6d3]">P/E</th>
                  <th className="p-3 font-bold text-right uppercase">TOTAL INCOME<br /><span className="font-normal">(₹ LAKHS)</span></th>
                  <th className="p-3 font-bold text-right uppercase">NET PROFIT /<br />LOSS <span className="font-normal">(₹ LAKHS)</span></th>
                  <th className="p-3 font-bold text-right uppercase">EPS<br /><span className="font-normal">(IN ₹)</span></th>
                  <th className="p-3 font-bold text-right uppercase border-r border-[#c1c6d3]">DEBT / EQUITY<br />RATIO</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e9ebf0] text-[#1b1c1c]">
                {peersData.map((peer, i) => (
                  <tr key={i} className="hover:bg-[#f6f7f9] transition-colors">
                    <td className="p-3 text-left border-r border-[#e9ebf0]">
                      <a href={`/quote/${peer.symbol}`} className="text-primary font-semibold hover:underline">{peer.symbol}</a>
                    </td>
                    <td className="p-3 text-right">
                      {(peer.ltp).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className={`p-3 text-right font-medium border-r border-[#e9ebf0] ${peer.pChange >= 0 ? 'text-[#06804a]' : 'text-[#ac2c2b]'}`}>
                      {peer.pChange}
                    </td>
                    <td className="p-3 text-right">
                      {peer.volume ? (peer.volume / 100000).toFixed(2) : '-'}
                    </td>
                    <td className="p-3 text-right border-r border-[#e9ebf0]">
                      {peer.value ? (peer.value / 10000000).toFixed(2) : '-'}
                    </td>
                    <td className="p-3 text-right">
                      {peer.marketCap ? Number((peer.marketCap / 10000000).toFixed(2)).toLocaleString('en-IN') : '-'}
                    </td>
                    <td className="p-3 text-right border-r border-[#e9ebf0]">
                      {peer.pe !== undefined && peer.pe !== 0 ? peer.pe : '-'}
                    </td>
                    <td className="p-3 text-right">
                      {peer.totalIncome ? Number(peer.totalIncome).toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '-'}
                    </td>
                    <td className="p-3 text-right">
                      {peer.pat ? Number(peer.pat).toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '-'}
                    </td>
                    <td className="p-3 text-right">
                      {peer.eps !== undefined ? peer.eps : '-'}
                    </td>
                    <td className="p-3 text-right border-r border-[#e9ebf0]">
                      {peer.debtEqRatio !== null ? peer.debtEqRatio : '-'}
                    </td>
                    <td className="p-3 text-right font-semibold">
                      {peer.promoterHolding !== undefined ? peer.promoterHolding : '-'}
                    </td>
                  </tr>
                ))}
                {peersData.length === 0 && (
                  <tr>
                    <td colSpan="12" className="p-6 text-center text-[#414751] italic">No peer comparison data available.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* My Portfolio View */}
      {activeSubTab === 'portfolio' && (
        <section className="space-y-6">
          {!isLoggedIn ? (
            <div className="bg-white border-b-[8px] border-[#f1f1f1] p-6 sm:p-8 text-center">
              <span className="material-icons text-[#FF5724] text-5xl mb-4">account_balance_wallet</span>
              <h3 className="font-bold text-base text-on-surface mb-2">Portfolio Authentication Required</h3>
              <p className="text-xs text-on-surface-variant max-w-md mx-auto mb-6 leading-relaxed">
                Log in to your Stock Island terminal to view your live stock holdings, active intraday positions, and execute trades.
              </p>
              <div className="flex justify-center gap-4">
                <button onClick={() => {
                  // Direct to login
                  const el = document.getElementById('login-btn') || { click: () => { } };
                  // We can just dispatch a state or use local storage or since App.jsx listens to tab changes, we need to handle it.
                  // Wait, QuoteDetail doesn't have setTab. But we can trigger setTab by dispatching a custom event, or since setTab isn't passed here, let's look at how Login is shown.
                  // App.jsx renders Login when currentTab is 'login'. Since QuoteDetail does not have setTab, wait, does QuoteDetail have access to setTab or App state?
                  // Let's check App.jsx: case 'quote': return <QuoteDetail symbol={selectedSymbol} />;
                  // Ah! QuoteDetail does NOT receive setTab or setTab callback in App.jsx!
                  // That is fine! We can dispatch a custom event 'changeTab' and let App.jsx listen to it! That is extremely elegant and doesn't require modifying App.jsx's parameters list unless we want to, but listening to a custom event is super decoupled and works perfectly! Let's do that!
                  window.dispatchEvent(new CustomEvent('changeTab', { detail: 'login' }));
                }} className="bg-primary text-white text-xs font-semibold px-6 py-2.5 rounded hover:bg-[#2d76c8] transition-all font-bold">
                  Sign In
                </button>
                <button onClick={() => {
                  window.dispatchEvent(new CustomEvent('changeTab', { detail: 'signup' }));
                }} className="border border-primary text-primary text-xs font-semibold px-6 py-2.5 rounded hover:bg-primary/5 transition-all font-bold">
                  Create Account
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Holdings Section */}
              <div className="bg-white border-b-[8px] border-[#f1f1f1] p-4 sm:p-6 overflow-hidden font-sans">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-sm text-on-surface flex items-center gap-2 uppercase tracking-wide">
                    <span className="material-icons text-primary text-lg">folder_special</span> Delivery Holdings (CNC)
                  </h3>
                  <span className="text-[10px] font-bold text-on-surface-variant/80 font-mono bg-surface-container-low border border-border-subtle px-2 py-1 rounded">
                    Total Assets: {holdings.length}
                  </span>
                </div>

                {holdings.length === 0 ? (
                  <div className="text-center py-8 text-xs text-on-surface-variant">No delivery holdings found. Buy stocks in CNC product type to add here.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs font-mono">
                      <thead className="bg-surface-container-low text-on-surface-variant border-b border-border-subtle text-[10px] tracking-wide uppercase">
                        <tr>
                          <th className="p-3 font-semibold text-left">Symbol</th>
                          <th className="p-3 font-semibold text-right">Qty</th>
                          <th className="p-3 font-semibold text-right">Avg. Cost (₹)</th>
                          <th className="p-3 font-semibold text-right">Current Price (₹)</th>
                          <th className="p-3 font-semibold text-right">Invested Value (₹)</th>
                          <th className="p-3 font-semibold text-right">Current Value (₹)</th>
                          <th className="p-3 font-semibold text-right">Total P&L (₹)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border-subtle/50 text-on-surface">
                        {holdings.map((h) => {
                          const isCurrent = h.symbol === symbol;
                          const currentPrice = isCurrent ? stock.price : parseFloat(h.buyPrice);
                          const invested = h.quantity * parseFloat(h.buyPrice);
                          const currentVal = h.quantity * currentPrice;
                          const pnl = currentVal - invested;
                          const pnlPct = invested > 0 ? (pnl / invested) * 100 : 0;
                          return (
                            <tr key={h.id} className="hover:bg-surface-container-low transition-colors">
                              <td className="p-3 text-left font-sans font-bold text-primary">{h.symbol}</td>
                              <td className="p-3 text-right">{h.quantity}</td>
                              <td className="p-3 text-right">{parseFloat(h.buyPrice).toFixed(2)}</td>
                              <td className="p-3 text-right">{currentPrice.toFixed(2)}</td>
                              <td className="p-3 text-right">{invested.toFixed(2)}</td>
                              <td className="p-3 text-right">{currentVal.toFixed(2)}</td>
                              <td className={`p-3 text-right font-bold ${pnl >= 0 ? 'text-secondary' : 'text-tertiary'}`}>
                                {pnl >= 0 ? '+' : ''}{pnl.toFixed(2)} ({pnlPct.toFixed(2)}%)
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Positions Section */}
              <div className="bg-white border-b-[8px] border-[#f1f1f1] p-4 sm:p-6 overflow-hidden font-sans">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-sm text-on-surface flex items-center gap-2 uppercase tracking-wide">
                    <span className="material-icons text-primary text-lg">assessment</span> Intraday Positions (MIS)
                  </h3>
                </div>

                {positions.length === 0 ? (
                  <div className="text-center py-8 text-xs text-on-surface-variant">No active positions today. Use MIS product type to trade intraday.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs font-mono">
                      <thead className="bg-surface-container-low text-on-surface-variant border-b border-border-subtle text-[10px] tracking-wide uppercase">
                        <tr>
                          <th className="p-3 font-semibold text-left">Symbol</th>
                          <th className="p-3 font-semibold text-left">Product</th>
                          <th className="p-3 font-semibold text-right">Net Qty</th>
                          <th className="p-3 font-semibold text-right">Avg. Price (₹)</th>
                          <th className="p-3 font-semibold text-right">Current Price (₹)</th>
                          <th className="p-3 font-semibold text-right">P&L (₹)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border-subtle/50 text-on-surface">
                        {positions.map((p) => {
                          const isCurrent = p.symbol === symbol;
                          const currentPrice = isCurrent ? stock.price : parseFloat(p.buyPrice);
                          const quantity = parseInt(p.quantity);
                          const invested = Math.abs(quantity) * parseFloat(p.buyPrice);
                          const pnl = quantity >= 0
                            ? (currentPrice - parseFloat(p.buyPrice)) * quantity
                            : (parseFloat(p.buyPrice) - currentPrice) * Math.abs(quantity);
                          return (
                            <tr key={p.id} className="hover:bg-surface-container-low transition-colors">
                              <td className="p-3 text-left font-sans font-bold text-primary">{p.symbol}</td>
                              <td className="p-3 text-left font-sans text-on-surface-variant">{p.product}</td>
                              <td className={`p-3 text-right font-bold ${quantity >= 0 ? 'text-secondary' : 'text-tertiary'}`}>{quantity}</td>
                              <td className="p-3 text-right">{parseFloat(p.buyPrice).toFixed(2)}</td>
                              <td className="p-3 text-right">{currentPrice.toFixed(2)}</td>
                              <td className={`p-3 text-right font-bold ${pnl >= 0 ? 'text-secondary' : 'text-tertiary'}`}>
                                {pnl >= 0 ? '+' : ''}{pnl.toFixed(2)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
        </section>
      )}

      {/* Price Alerts View */}
      {activeSubTab === 'alerts' && (
        <section className="space-y-6 font-sans">
          {!isLoggedIn ? (
            <div className="bg-white border-b-[8px] border-[#f1f1f1] p-6 sm:p-8 text-center">
              <span className="material-icons text-[#FF5724] text-5xl mb-4">notifications_active</span>
              <h3 className="font-bold text-base text-on-surface mb-2">Alerts Authentication Required</h3>
              <p className="text-xs text-on-surface-variant max-w-md mx-auto mb-6 leading-relaxed">
                Log in to set real-time triggers and get notified when stock prices cross your targets.
              </p>
              <button onClick={() => window.dispatchEvent(new CustomEvent('changeTab', { detail: 'login' }))} className="bg-primary text-white text-xs font-semibold px-6 py-2.5 rounded hover:bg-[#2d76c8] transition-all font-bold">
                Sign In
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-12 gap-6">
              {/* Alert Creation Form */}
              <div className="md:col-span-4 bg-white border border-border-subtle rounded-lg p-6 shadow-sm">
                <h3 className="font-bold text-xs uppercase text-on-surface mb-4 border-b border-border-subtle pb-2">Set Price Alert</h3>

                {alertMessage && <div className="p-2 mb-3 bg-emerald-50 border border-emerald-200 text-emerald-600 text-[11px] rounded-sm font-semibold text-center">{alertMessage}</div>}
                {alertError && <div className="p-2 mb-3 bg-red-50 border border-red-200 text-red-600 text-[11px] rounded-sm font-semibold text-center">{alertError}</div>}

                <form onSubmit={handleCreateAlert} className="space-y-4 text-xs font-semibold">
                  <div>
                    <label className="block text-on-surface-variant mb-1">Stock</label>
                    <input type="text" value={symbol} readOnly className="w-full bg-surface-container-low border border-border-subtle rounded p-2 text-on-surface outline-none" />
                  </div>
                  <div>
                    <label className="block text-on-surface-variant mb-1">Trigger Condition</label>
                    <select
                      value={alertCondition}
                      onChange={(e) => setAlertCondition(e.target.value)}
                      className="w-full bg-surface-container-low border border-border-subtle rounded p-2 text-on-surface outline-none"
                    >
                      <option value="ABOVE">Price goes ABOVE</option>
                      <option value="BELOW">Price goes BELOW</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-on-surface-variant mb-1">Target Price (₹)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={alertTargetPrice}
                      onChange={(e) => setAlertTargetPrice(e.target.value)}
                      placeholder={`Current: ${stock.price.toFixed(2)}`}
                      className="w-full bg-surface-container-low border border-border-subtle rounded p-2 text-on-surface outline-none"
                      required
                    />
                  </div>
                  <button type="submit" className="w-full bg-primary text-white text-xs font-semibold py-2 rounded hover:bg-[#2d76c8] transition-all">
                    Create Alert
                  </button>
                </form>
              </div>

              {/* Active Alerts List */}
              <div className="md:col-span-8 bg-white border border-border-subtle rounded-lg p-6 shadow-sm overflow-hidden">
                <div className="flex justify-between items-center mb-4 border-b border-border-subtle pb-2">
                  <h3 className="font-bold text-xs uppercase text-on-surface">Your Alerts ({alerts?.length || 0})</h3>
                  {typeof Notification !== 'undefined' && Notification.permission !== 'granted' && (
                    <button 
                      onClick={() => api.enablePushNotifications(false)} 
                      className="text-[10px] bg-primary text-white font-bold px-2 py-1 rounded uppercase tracking-wider hover:bg-[#2d76c8] transition-colors"
                    >
                      Enable Push
                    </button>
                  )}
                </div>
                {(!alerts || alerts.length === 0) ? (
                  <div className="text-center py-8 text-xs text-on-surface-variant">No alerts set for any symbols.</div>
                ) : (
                  <div className="overflow-y-auto max-h-[300px]">
                    <table className="w-full text-left text-xs font-mono">
                      <thead className="bg-surface-container-low text-on-surface-variant border-b border-border-subtle text-[10px] tracking-wide uppercase">
                        <tr>
                          <th className="p-3 font-semibold text-left">Symbol</th>
                          <th className="p-3 font-semibold text-left">Condition</th>
                          <th className="p-3 font-semibold text-right">Target Price (₹)</th>
                          <th className="p-3 font-semibold text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border-subtle/50 text-on-surface">
                        {alerts.map((alert) => (
                          <tr key={alert.id} className={`transition-colors ${alert.status === 'EXECUTED' ? 'bg-surface-container-low/50 opacity-80' : 'hover:bg-surface-container-low'}`}>
                            <td className="p-3 text-left font-sans font-bold text-primary">{alert.symbol}</td>
                            <td className="p-3 text-left font-sans text-on-surface-variant">Price goes {alert.condition.toLowerCase()}</td>
                            <td className="p-3 text-right">{parseFloat(alert.targetPrice).toFixed(2)}</td>
                            <td className="p-3 text-right">
                              {alert.status === 'EXECUTED' ? (
                                <span className="bg-[#e1efd6] text-[#008b1a] px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">Executed</span>
                              ) : (
                                <button
                                  onClick={() => handleDeleteAlert(alert.id)}
                                  className="text-tertiary hover:underline text-[10px] font-bold uppercase tracking-wider"
                                >
                                  Delete
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </section>
      )}

      {/* AI Sentiment Analysis Slide Drawer */}
      {aiDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-[#1b1c1c]/45 backdrop-blur-sm flex justify-end transition-all">
          <div className="w-full max-w-md bg-white border-l border-border-subtle shadow-2xl h-full flex flex-col p-6 overflow-y-auto">
            <div className="flex justify-between items-center border-b border-border-subtle pb-4 mb-6">
              <div className="flex items-center gap-2">
                <span className="material-icons text-[#FF5724] text-lg">auto_awesome</span>
                <h3 className="font-bold text-sm text-on-surface uppercase tracking-wide">AI Analyst Insights</h3>
              </div>
              <button
                onClick={() => setAiDrawerOpen(false)}
                className="w-8 h-8 rounded-full bg-surface-container-low hover:bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors"
              >
                <span className="material-icons text-base">close</span>
              </button>
            </div>

            <div className="space-y-6">
              <div className="bg-surface-container-low p-4 border border-border-subtle rounded">
                <div className="text-[10px] text-on-surface-variant/80 mb-1 uppercase font-bold tracking-wider">Analysis Target</div>
                <div className="text-base font-bold text-on-surface">{stock.name} ({symbol})</div>
              </div>

              <div className="bg-[#FF5724]/5 p-4 border border-[#FF5724]/20 rounded">
                <div className="flex items-center gap-1.5 text-xs text-[#FF5724] font-bold mb-2">
                  <span className="material-icons text-sm text-[#FF5724]">psychology</span> Technical Outlook
                </div>
                <p className="text-xs text-on-surface-variant leading-relaxed">{stock.aiAnalysis}</p>
              </div>

              <div className="space-y-3">
                <h4 className="font-bold text-xs text-on-surface uppercase tracking-wide">Indicator Metrics</h4>
                <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                  <div className="bg-surface-container-low p-3 rounded border border-border-subtle">
                    <span className="block text-[9px] text-on-surface-variant mb-1">RSI (14)</span>
                    <span className="font-bold text-secondary">54.21 (Neutral)</span>
                  </div>
                  <div className="bg-surface-container-low p-3 rounded border border-border-subtle">
                    <span className="block text-[9px] text-on-surface-variant mb-1">MACD (12, 26)</span>
                    <span className="font-bold text-secondary">Positive Cross</span>
                  </div>
                  <div className="bg-surface-container-low p-3 rounded border border-border-subtle">
                    <span className="block text-[9px] text-on-surface-variant mb-1">Bollinger Bands</span>
                    <span className="font-bold text-on-surface">Mid Band Test</span>
                  </div>
                  <div className="bg-surface-container-low p-3 rounded border border-border-subtle">
                    <span className="block text-[9px] text-on-surface-variant mb-1">Volatility Score</span>
                    <span className="font-bold text-tertiary">18.42% (Normal)</span>
                  </div>
                </div>
              </div>

              <div className="border-t border-border-subtle pt-5 text-[10px] text-on-surface-variant/75 italic leading-normal">
                AI quantitative predictions are calculated for research. They are not SEBI-registered investments advice.
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="h-10"></div>
    </main>
  );
}
