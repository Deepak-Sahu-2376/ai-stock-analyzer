import React, { useState, useEffect } from 'react';
import { api } from '../api';

export default function TopTicker() {
  const [niftyVal, setNiftyVal] = useState(24013.10);
  const [niftyChange, setNiftyChange] = useState(-154.20);
  const [niftyBankVal, setNiftyBankVal] = useState(51320.10);
  const [niftyBankChange, setNiftyBankChange] = useState(230.40);

  const loadIndexTicks = async () => {
    try {
      const indexRes = await api.getIndices();
      const indicesList = indexRes.data || [];
      
      const nifty = indicesList.find(idx => (idx.index || idx.indexName || '').toUpperCase() === 'NIFTY 50');
      const bank = indicesList.find(idx => (idx.index || idx.indexName || '').toUpperCase() === 'NIFTY BANK');
      
      if (nifty) {
        const val = parseFloat(nifty.last || nifty.lastPrice || 0);
        const prev = parseFloat(nifty.previousClose || 0);
        setNiftyVal(val);
        setNiftyChange(val - prev);
      }
      if (bank) {
        const val = parseFloat(bank.last || bank.lastPrice || 0);
        const prev = parseFloat(bank.previousClose || 0);
        setNiftyBankVal(val);
        setNiftyBankChange(val - prev);
      }
    } catch (err) {
      console.warn('Could not fetch index starting ticks:', err.message);
    }
  };

  useEffect(() => {
    let active = true;
    loadIndexTicks();
    
    // Polling for Nifty Bank and fallback indices every 1s
    const interval = setInterval(() => {
      if (active) loadIndexTicks();
    }, 1000); 

    // Direct WebSocket for NIFTY 50 and NIFTY BANK
    let wsNifty = null;
    let wsBank = null;
    
    try {
      wsNifty = new WebSocket('wss://streamer.nseindia.com/streams/indices/nifty50?index=Nifty%2050');
      wsNifty.onmessage = (event) => {
        if (!active) return;
        try {
          const data = JSON.parse(event.data);
          if (data && data.currentPrice) {
             setNiftyVal(parseFloat(data.currentPrice));
             setNiftyChange(parseFloat(data.change));
          }
        } catch(e) {}
      };

      wsBank = new WebSocket('wss://streamer.nseindia.com/streams/indices/high/secHmIndices');
      wsBank.onmessage = (event) => {
        if (!active) return;
        try {
          const data = JSON.parse(event.data);
          if (data && data.indexName === 'NIFTY BANK') {
             setNiftyBankVal(parseFloat(data.currentPrice));
             setNiftyBankChange(parseFloat(data.change));
          }
        } catch(e) {}
      };
    } catch (err) {}

    return () => {
      active = false;
      clearInterval(interval);
      if (wsNifty) wsNifty.close();
      if (wsBank) wsBank.close();
    };
  }, []);

  const renderTickerValue = (val, change) => {
    const isPositive = change >= 0;
    const colorClass = isPositive ? 'text-[#4caf50]' : 'text-[#f44336]';
    const percentChange = val - change !== 0 ? (change / (val - change)) * 100 : 0;
    
    return (
      <div className="flex gap-1 items-baseline font-mono tracking-tight whitespace-nowrap">
        <span className={`${colorClass} text-[11px] sm:text-sm md:text-base`}>
          {val.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
        <span className="text-on-surface-variant/70 text-[9px] sm:text-[10px] md:text-xs">
          {isPositive ? '+' : ''}{change.toFixed(2)} ({isPositive ? '+' : ''}{percentChange.toFixed(2)}%)
        </span>
      </div>
    );
  };

  return (
    <div className="order-1 md:order-2 w-full bg-surface-container-lowest border-b border-border-subtle shrink-0 overflow-hidden sticky top-0 md:top-[64px] z-40">
      {/* Mobile View */}
      <div className="flex md:hidden justify-between items-center px-4 py-2 w-full max-w-[1200px] mx-auto">
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wide">NIFTY 50</span>
          {renderTickerValue(niftyVal, niftyChange)}
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wide">NIFTY BANK</span>
          {renderTickerValue(niftyBankVal, niftyBankChange)}
        </div>
      </div>

      {/* Desktop View Marquee */}
      <div className="hidden md:flex items-center w-full relative h-[48px]">
        <div className="animate-marquee flex gap-16 items-center px-4" style={{ animationDuration: '30s' }}>
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wide">NIFTY 50</span>
            {renderTickerValue(niftyVal, niftyChange)}
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wide">NIFTY BANK</span>
            {renderTickerValue(niftyBankVal, niftyBankChange)}
          </div>
        </div>
      </div>
    </div>
  );
}
