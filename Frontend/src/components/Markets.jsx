import React, { useState, useEffect } from 'react';
import { api } from '../api';
import AnnouncementsTable from './AnnouncementsTable';


class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, info: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    this.setState({ error, info });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', background: '#ffebee', color: '#c62828', borderRadius: '8px' }}>
          <h2>Something went wrong in Announcements</h2>
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: '12px' }}>{this.state.error && this.state.error.toString()}</pre>
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: '12px', marginTop: '10px' }}>{this.state.info && this.state.info.componentStack}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function Markets({ onSelectStock }) {
  const [activeTab, setActiveTab] = useState(() => sessionStorage.getItem('marketsActiveTab') || 'brdw');
  const [selectedIdx, setSelectedIdx] = useState(null);
  const [loading, setLoading] = useState(true);
  const [marketIndicesData, setMarketIndicesData] = useState({
    brdw: {},
    sec: {},
    thematic: {},
    strtgy: {}
  });

  const normalizeKey = (name) => name ? String(name).toUpperCase().replace(/\s+/g, '') : '';
  const [constituents, setConstituents] = useState([]);
  const [loadingConstituents, setLoadingConstituents] = useState(false);
  const [viewMode, setViewMode] = useState(() => sessionStorage.getItem('marketsViewMode') || 'heatmaps'); // 'heatmaps' | 'announcements' | 'orders'
  const [announcementsTab, setAnnouncementsTab] = useState(() => sessionStorage.getItem('marketsAnnouncementsTab') || 'equities');

  useEffect(() => {
    sessionStorage.setItem('marketsActiveTab', activeTab);
  }, [activeTab]);

  useEffect(() => {
    sessionStorage.setItem('marketsViewMode', viewMode);
  }, [viewMode]);

  useEffect(() => {
    sessionStorage.setItem('marketsAnnouncementsTab', announcementsTab);
  }, [announcementsTab]);
  const [announcementsData, setAnnouncementsData] = useState([]);
  const [loadingAnnouncements, setLoadingAnnouncements] = useState(false);
  const [orderAnnouncements, setOrderAnnouncements] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [goldenSymbols, setGoldenSymbols] = useState(new Set());
  
  // Announcements Filters
  const [filterSymbol, setFilterSymbol] = useState('');
  const [filterSubject, setFilterSubject] = useState('');
  const [subjectSuggestions, setSubjectSuggestions] = useState([]);
  const [datePeriod, setDatePeriod] = useState('Clear');
  const [customFromDate, setCustomFromDate] = useState('');
  const [customToDate, setCustomToDate] = useState('');

  useEffect(() => {
    const handleSetMarketsView = (e) => {
      if (e.detail) {
        setViewMode(e.detail);
      }
    };
    window.addEventListener('setMarketsView', handleSetMarketsView);
    return () => window.removeEventListener('setMarketsView', handleSetMarketsView);
  }, []);

  const fetchAnnouncements = () => {
    if (viewMode !== 'announcements') return;
    setLoadingAnnouncements(true);
    
    let from_date = '';
    let to_date = '';
    
    if (datePeriod !== 'Clear' && datePeriod !== 'Custom') {
        const toDateObj = new Date();
        const fromDateObj = new Date();
        if (datePeriod === '1D') fromDateObj.setDate(toDateObj.getDate() - 1);
        if (datePeriod === '1W') fromDateObj.setDate(toDateObj.getDate() - 7);
        if (datePeriod === '1M') fromDateObj.setMonth(toDateObj.getMonth() - 1);
        if (datePeriod === '3M') fromDateObj.setMonth(toDateObj.getMonth() - 3);
        if (datePeriod === '6M') fromDateObj.setMonth(toDateObj.getMonth() - 6);
        if (datePeriod === '1Y') fromDateObj.setFullYear(toDateObj.getFullYear() - 1);
        
        const formatDate = (date) => {
          const d = String(date.getDate()).padStart(2, '0');
          const m = String(date.getMonth() + 1).padStart(2, '0');
          const y = date.getFullYear();
          return `${d}-${m}-${y}`;
        };
        
        from_date = formatDate(fromDateObj);
        to_date = formatDate(toDateObj);
    } else if (datePeriod === 'Custom' && customFromDate && customToDate) {
        const formatCustomDate = (dateStr) => {
            if (!dateStr) return '';
            const [y, m, d] = dateStr.split('-');
            return `${d}-${m}-${y}`;
        };
        from_date = formatCustomDate(customFromDate);
        to_date = formatCustomDate(customToDate);
    }

    api.getAnnouncements(announcementsTab, {
        symbol: filterSymbol,
        subject: filterSubject,
        from_date,
        to_date
    })
      .then(res => {
        const dataArray = Array.isArray(res) ? res : (res && res.data ? res.data : []);
        setAnnouncementsData(dataArray);
      })
      .catch(e => {
        console.error('Failed to fetch announcements:', e);
        setAnnouncementsData([]);
      })
      .finally(() => setLoadingAnnouncements(false));
  };

  useEffect(() => {
    if (viewMode === 'announcements') {
      fetchAnnouncements();
    }
  }, [viewMode, announcementsTab]);

  useEffect(() => {
    if (viewMode === 'orders') {
      setLoadingOrders(true);
      Promise.all([
        api.getAllOrderAnnouncements(),
        api.getGoldenStocks().catch(() => [])
      ])
        .then(([ordersData, goldenData]) => {
          setOrderAnnouncements(Array.isArray(ordersData) ? ordersData : []);
          if (Array.isArray(goldenData)) {
            setGoldenSymbols(new Set(goldenData.map(g => g.symbol)));
          }
        })
        .catch(e => {
          console.error('Failed to fetch order announcements:', e);
          setOrderAnnouncements([]);
        })
        .finally(() => setLoadingOrders(false));
    }
  }, [viewMode]);

  useEffect(() => {
    if (viewMode === 'announcements') {
      api.getAnnouncementSubjects(announcementsTab)
        .then(res => {
          if (Array.isArray(res)) {
            setSubjectSuggestions(res.filter(s => s && s !== '-'));
          } else {
            setSubjectSuggestions([]);
          }
        })
        .catch(e => {
          console.error('Failed to fetch subjects:', e);
          setSubjectSuggestions([]);
        });
    }
  }, [viewMode, announcementsTab]);


  useEffect(() => {
    async function fetchConstituents() {
      if (!selectedIdx) return;
      setLoadingConstituents(true);
      try {
        let typeParam = 'Broad Market Indices';
        if (activeTab === 'sec') typeParam = 'Sectoral Indices';
        else if (activeTab === 'thematic') typeParam = 'Thematic Indices';
        else if (activeTab === 'strtgy') typeParam = 'Strategy Indices';

        const data = await api.getHeatmapSymbols(typeParam, selectedIdx);
        setConstituents(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error("Failed to fetch constituents:", e);
        setConstituents([]);
      } finally {
        setLoadingConstituents(false);
      }
    }
    fetchConstituents();
  }, [selectedIdx, activeTab]);

  // Live updates for constituents
  useEffect(() => {
    let active = true;
    let ws = null;

    if (selectedIdx && constituents.length > 0) {
      try {
        ws = new WebSocket(`wss://streamer.nseindia.com/streams/indices/high/${encodeURIComponent(selectedIdx)}`);
        ws.onmessage = (event) => {
          if (!active) return;
          try {
            const data = JSON.parse(event.data);
            if (data && data.symbol && data.ltp !== undefined) {
              setConstituents(prev => {
                const copy = [...prev];
                const index = copy.findIndex(c => c.symbol === data.symbol);
                if (index !== -1) {
                  // Only update if price actually changed
                  if (copy[index].lastPrice === data.ltp) return prev;
                  copy[index] = {
                    ...copy[index],
                    lastPrice: data.ltp,
                    change: data.change,
                    pChange: data.pchange
                  };
                  return copy;
                }
                return prev;
              });
            }
          } catch { /* ignore parsing errors */ }
        };
      } catch (e) {
        console.warn("Could not connect to constituents live WS:", e);
      }
    }

    return () => {
      active = false;
      if (ws) ws.close();
    };
  }, [selectedIdx, constituents.length > 0]);

  // Auto-select first index when tab changes or data loads
  useEffect(() => {
    const currentTabIndices = Object.values(marketIndicesData[activeTab] || {}).map(idx => idx.brdCstIndexName || idx.indexName);
    if (currentTabIndices.length > 0) {
      if (!selectedIdx || !currentTabIndices.includes(selectedIdx)) {
        // Find NIFTY 50 if available, otherwise just pick the first one
        if (currentTabIndices.includes('NIFTY 50')) {
          setSelectedIdx('NIFTY 50');
        } else {
          setSelectedIdx(currentTabIndices[0]);
        }
      }
    } else {
      setSelectedIdx(null);
    }
  }, [activeTab, marketIndicesData]);

  useEffect(() => {
    let active = true;
    let wsBrdw = null, wsSec = null, wsThematic = null, wsStrtgy = null;

    const connectWs = (type, path) => {
      const ws = new WebSocket(`wss://streamer.nseindia.com/streams/indices/high/${path}`);
      ws.onmessage = (event) => {
        if (!active) return;
        try {
          const data = JSON.parse(event.data);
          if (data && data.indexName && data.indexName !== 'HEARTBEAT') {
            const key = normalizeKey(data.indexName);
            setMarketIndicesData(prev => ({
              ...prev,
              [type]: {
                ...prev[type],
                [key]: {
                  ...(prev[type]?.[key] || {}),
                  ...data,
                  // Preserve the original name from REST if available for display
                  indexName: prev[type]?.[key]?.indexName || data.indexName
                }
              }
            }));
            setLoading(false);
          }
        } catch { /* empty */ }
      };
      return ws;
    };

    try {
      wsBrdw = connectWs('brdw', 'brdwIndices');
      wsSec = connectWs('sec', 'secHmIndices');
      wsThematic = connectWs('thematic', 'thematicHmIndices');
      wsStrtgy = connectWs('strtgy', 'strtgyHmIndices');
    } catch { /* empty */ }

    // Fetch initial data via REST for when market is closed / websocket only sends HEARTBEAT
    const types = [
      { id: 'brdw', param: 'Broad Market Indices' },
      { id: 'sec', param: 'Sectoral Indices' },
      { id: 'thematic', param: 'Thematic Indices' },
      { id: 'strtgy', param: 'Strategy Indices' }
    ];
    
    types.forEach(t => {
      api.getIndices(t.param).then(res => {
        if (res && res.data) {
          const map = {};
          res.data.forEach(idx => {
            const rawName = idx.index || idx.indexName || idx.indexSymbol;
            if (rawName) {
              const key = normalizeKey(rawName);
              map[key] = {
                ...idx,
                indexName: rawName,
                currentPrice: idx.last || idx.lastPrice,
                perChange: idx.percChange || idx.percentChange || idx.pChange,
                change: idx.change || idx.variation
              };
            }
          });
          setMarketIndicesData(prev => ({
            ...prev,
            [t.id]: { ...map, ...prev[t.id] }
          }));
          setLoading(false);
        }
      }).catch(() => {});
    });

    return () => {
      active = false;
      if (wsBrdw) wsBrdw.close();
      if (wsSec) wsSec.close();
      if (wsThematic) wsThematic.close();
      if (wsStrtgy) wsStrtgy.close();
    };
  }, []);



  return (
    <div className="flex-1 font-body-md text-on-surface bg-white">
      <div className="max-w-[1200px] mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center px-4 sm:px-6 py-4 border-b border-border-subtle">
          <div>
            <h1 className="text-xl md:text-2xl font-semibold tracking-tight text-[#444] mb-1">Markets Overview</h1>
            <p className="text-[11px] md:text-xs text-on-surface-variant">Track performance and find opportunities.</p>
          </div>
          
          <div className="flex w-full sm:w-auto bg-surface-container-low p-1 rounded border border-border-subtle mt-4 sm:mt-0 overflow-x-auto hide-scrollbar">
          <button 
            onClick={() => setViewMode('heatmaps')}
            className={`flex-1 sm:flex-none whitespace-nowrap px-4 py-2 text-sm font-semibold rounded-md transition-colors ${viewMode === 'heatmaps' ? 'bg-primary text-white shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`}
          >
            Heatmaps
          </button>
          <button 
            onClick={() => setViewMode('announcements')}
            className={`flex-1 sm:flex-none whitespace-nowrap px-4 py-2 text-sm font-semibold rounded-md transition-colors ${viewMode === 'announcements' ? 'bg-primary text-white shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`}
          >
            Announcements
          </button>
          <button 
            onClick={() => setViewMode('orders')}
            className={`flex-1 sm:flex-none whitespace-nowrap px-4 py-2 text-sm font-semibold rounded-md transition-colors ${viewMode === 'orders' ? 'bg-primary text-white shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`}
          >
            Order Book
          </button>
        </div>
      </div>


      {viewMode === 'heatmaps' && (<>
      {/* Heatmaps Section */}
        <div className="bg-white border-b border-border-subtle mb-4">
          <div className="flex overflow-x-auto hide-scrollbar border-b border-border-subtle px-4 sm:px-6 py-2 gap-4 md:gap-6 text-xs md:text-sm">
          {[
            { id: 'brdw', label: 'Broad Market Indices' },
            { id: 'sec', label: 'Sectoral Indices' },
            { id: 'thematic', label: 'Thematic Indices' },
            { id: 'strtgy', label: 'Strategy Indices' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-2 md:pb-3 whitespace-nowrap font-semibold transition-all ${
                activeTab === tab.id 
                  ? 'text-tertiary border-b-2 border-tertiary -mb-[1px]' 
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Heatmap Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 p-4 sm:p-6">
          {Object.keys(marketIndicesData[activeTab] || {}).length === 0 ? (
            Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="rounded-sm p-2 flex flex-col justify-between min-h-[60px] bg-surface-container-low animate-pulse border border-border-subtle/50">
                <div className="h-3 w-3/4 bg-border-subtle rounded mb-1"></div>
                <div className="flex justify-between items-end mt-1">
                  <div className="h-3 w-1/2 bg-border-subtle rounded"></div>
                  <div className="h-3 w-1/4 bg-border-subtle rounded"></div>
                </div>
              </div>
            ))
          ) : Object.values(marketIndicesData[activeTab] || {})
            .sort((a, b) => {
              const perChangeA = parseFloat(a.perChange) || parseFloat(a.percentChange) || parseFloat(a.pChange) || 0;
              const perChangeB = parseFloat(b.perChange) || parseFloat(b.percentChange) || parseFloat(b.pChange) || 0;
              return perChangeB - perChangeA;
            })
            .map((idx) => {
            const indexName = idx.brdCstIndexName || idx.indexName;
            const isSelected = selectedIdx === indexName;
            const perChange = parseFloat(idx.perChange) || 0;
            const currentPrice = parseFloat(idx.currentPrice) || 0;
            
            // Determine dynamic color based on percentage change magnitude
            let bgColorClass = 'bg-surface-container';
            let textColorClass = 'text-on-surface';
            let subtitleColorClass = 'text-on-surface-variant';
            
            if (perChange > 0) {
              if (perChange > 1) bgColorClass = 'bg-[#1b5e20]'; // dark green
              else if (perChange > 0.5) bgColorClass = 'bg-[#2e7d32]';
              else bgColorClass = 'bg-[#4caf50]'; // light green
              textColorClass = 'text-white';
              subtitleColorClass = 'text-white/80';
            } else if (perChange < 0) {
              if (perChange < -1) bgColorClass = 'bg-[#b71c1c]'; // dark red
              else if (perChange < -0.5) bgColorClass = 'bg-[#d32f2f]';
              else bgColorClass = 'bg-[#f44336]'; // light red
              textColorClass = 'text-white';
              subtitleColorClass = 'text-white/80';
            }

            return (
              <div
                key={indexName}
                onClick={() => setSelectedIdx(indexName)}
                className={`cursor-pointer rounded-sm p-2 flex flex-col justify-between min-h-[60px] transition-all duration-150 ${bgColorClass} ${isSelected ? 'ring-2 ring-primary ring-offset-2 ring-offset-white' : 'hover:scale-[1.03]'}`}
              >
                <div className={`text-[11px] font-bold tracking-wide truncate uppercase ${textColorClass}`}>
                  {indexName}
                </div>
                <div className="flex justify-between items-end mt-1 font-mono text-[11px] font-semibold opacity-95">
                  <span className={textColorClass}>{currentPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  <span className={subtitleColorClass}>{perChange > 0 ? '+' : ''}{perChange.toFixed(2)}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Constituents Heatmap */}
      {selectedIdx && (
        <div className="bg-white border-b border-border-subtle px-4 sm:px-6 py-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-base md:text-lg font-bold text-on-surface">
              {selectedIdx} - Constituents Heatmap
            </h2>
          </div>

          {/* Constituents Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
            {loadingConstituents ? (
              Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="rounded-sm p-2 flex flex-col justify-between min-h-[60px] bg-surface-container-low animate-pulse border border-border-subtle/50">
                  <div className="h-3 w-3/4 bg-border-subtle rounded mb-1"></div>
                  <div className="flex justify-between items-end mt-1">
                    <div className="h-3 w-1/2 bg-border-subtle rounded"></div>
                    <div className="h-3 w-1/4 bg-border-subtle rounded"></div>
                  </div>
                </div>
              ))
            ) : constituents.length > 0 ? (() => {
              const selectedIdxData = marketIndicesData[activeTab]?.[normalizeKey(selectedIdx)];
              const idxPerChange = selectedIdxData ? (parseFloat(selectedIdxData.perChange) || parseFloat(selectedIdxData.percentChange) || parseFloat(selectedIdxData.pChange) || 0) : 0;
              const isNegativeIdx = idxPerChange < 0;
              
              return [...constituents].sort((a, b) => {
                const perChangeA = parseFloat(a.pChange) || 0;
                const perChangeB = parseFloat(b.pChange) || 0;
                return isNegativeIdx ? perChangeA - perChangeB : perChangeB - perChangeA;
              }).map((stock) => {
            const perChange = parseFloat(stock.pChange) || 0;
            const currentPrice = parseFloat(stock.lastPrice) || 0;
            
            let bgColorClass = 'bg-surface-container';
            let textColorClass = 'text-on-surface';
            let subtitleColorClass = 'text-on-surface-variant';
            
            if (perChange > 0) {
              if (perChange > 1) bgColorClass = 'bg-[#1b5e20]'; 
              else if (perChange > 0.5) bgColorClass = 'bg-[#2e7d32]';
              else bgColorClass = 'bg-[#4caf50]'; 
              textColorClass = 'text-white';
              subtitleColorClass = 'text-white/80';
            } else if (perChange < 0) {
              if (perChange < -1) bgColorClass = 'bg-[#b71c1c]'; 
              else if (perChange < -0.5) bgColorClass = 'bg-[#d32f2f]';
              else bgColorClass = 'bg-[#f44336]'; 
              textColorClass = 'text-white';
              subtitleColorClass = 'text-white/80';
            }

            return (
              <div
                key={stock.symbol}
                onClick={() => onSelectStock(stock.symbol)}
                className={`cursor-pointer rounded-sm p-2 flex flex-col justify-between min-h-[60px] transition-all duration-150 hover:scale-[1.03] ${bgColorClass}`}
              >
                <div className={`text-[11px] font-bold truncate tracking-wide uppercase ${textColorClass}`}>
                  {stock.symbol}
                </div>
                <div className="flex justify-between items-end mt-1 font-mono text-[11px] font-semibold opacity-95">
                  <span className={textColorClass}>{currentPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  <span className={subtitleColorClass}>{perChange > 0 ? '+' : ''}{perChange.toFixed(2)}%</span>
                </div>
              </div>
            );
          })})() : (
            <div className="col-span-full text-center text-sm text-on-surface-variant py-8">No constituents found for {selectedIdx}.</div>
          )}
        </div>
      </div>
      )}
    </>
      )}


      {/* Announcements Section */}
      {viewMode === 'announcements' && (
        <div className="bg-white border-b border-border-subtle mb-8">
          <div className="flex overflow-x-auto hide-scrollbar border-b border-border-subtle px-4 sm:px-6 py-2 gap-4 md:gap-6 text-xs md:text-sm">
            {[
              { id: 'equities', label: 'Equity' },
              { id: 'sme', label: 'SME' },
              { id: 'debt', label: 'Debt' },
              { id: 'mf', label: 'MF' },
              { id: 'invitsreits', label: 'REIT/InvIT' },
              { id: 'municipalBond', label: 'Municipal Bond' },
              { id: 'sse', label: 'SSE' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setAnnouncementsTab(tab.id)}
                className={`pb-2 md:pb-3 font-semibold whitespace-nowrap transition-all ${
                  announcementsTab === tab.id 
                    ? 'text-tertiary border-b-2 border-tertiary -mb-[1px]' 
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Filters */}
          <div className="flex flex-col gap-3 md:gap-4 px-4 sm:px-6 py-4 bg-white border-b border-border-subtle">
            <div className="flex flex-col md:flex-row gap-3">
              <input
                type="text"
                placeholder="Company Name or Symbol"
                value={filterSymbol}
                onChange={(e) => setFilterSymbol(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchAnnouncements()}
                className="border border-border-subtle rounded px-3 py-1.5 text-xs md:text-sm flex-1 outline-none focus:border-tertiary focus:ring-1 focus:ring-tertiary transition-all"
              />
              <input
                type="text"
                placeholder="Search by Keyword"
                list="subject-suggestions"
                value={filterSubject}
                onChange={(e) => setFilterSubject(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchAnnouncements()}
                className="border border-border-subtle rounded px-3 py-1.5 text-xs md:text-sm flex-1 outline-none focus:border-tertiary focus:ring-1 focus:ring-tertiary transition-all"
              />
              <datalist id="subject-suggestions">
                {subjectSuggestions.map((subject, idx) => (
                  <option key={idx} value={subject} />
                ))}
              </datalist>
            </div>
            
            <div className="flex flex-wrap items-center gap-2">
              {['1D', '1W', '1M', '3M', '6M', '1Y', 'Custom', 'Clear'].map(period => (
                <button
                  key={period}
                  onClick={() => setDatePeriod(period)}
                  className={`px-3 md:px-4 py-1 rounded-full text-[10px] md:text-xs font-semibold tracking-wide transition-colors border ${
                    datePeriod === period
                      ? 'bg-[#3b2c6e] text-white border-[#3b2c6e]'
                      : 'bg-surface-container-low text-on-surface-variant border-transparent hover:bg-surface-container hover:text-on-surface'
                  }`}
                >
                  {period}
                </button>
              ))}
            </div>

            {datePeriod === 'Custom' && (
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-6 mt-1 p-2 bg-white border border-border-subtle rounded text-xs md:text-sm">
                <div className="flex items-center gap-2">
                  <label className="font-semibold text-on-surface-variant">From</label>
                  <input
                    type="date"
                    value={customFromDate}
                    onChange={(e) => setCustomFromDate(e.target.value)}
                    className="border border-border-subtle rounded px-2 py-1 outline-none focus:border-tertiary"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label className="font-semibold text-on-surface-variant">To</label>
                  <input
                    type="date"
                    value={customToDate}
                    onChange={(e) => setCustomToDate(e.target.value)}
                    className="border border-border-subtle rounded px-2 py-1 outline-none focus:border-tertiary"
                  />
                </div>
              </div>
            )}
            
            <div className="flex justify-end items-center gap-4 mt-1">
              <button 
                onClick={() => {
                  setFilterSymbol('');
                  setFilterSubject('');
                  setDatePeriod('Clear');
                  setCustomFromDate('');
                  setCustomToDate('');
                }}
                className="text-[#bd3737] hover:text-[#8a2626] text-xs md:text-sm font-bold transition-colors"
              >
                Clear Form
              </button>
              <button 
                onClick={fetchAnnouncements}
                className="bg-[#3b2c6e] text-white px-5 md:px-8 py-1.5 md:py-2 rounded text-xs md:text-sm font-semibold hover:bg-[#2a1f4d] shadow-sm transition-colors"
              >
                Search / Refresh
              </button>
            </div>
          </div>

          {/* Announcements Table */}
          <ErrorBoundary>
            <AnnouncementsTable 
              data={announcementsData} 
              loading={loadingAnnouncements} 
              onSelectStock={onSelectStock} 
            />
          </ErrorBoundary>
        </div>
      )}

      {/* Order Book AI Summaries View */}
      {viewMode === 'orders' && (
        <div className="bg-white border-b border-border-subtle mb-8 px-4 sm:px-6 py-6">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <span className="material-icons text-[#fbc02d] text-xl">emoji_events</span>
            Recent Order Book (AI Summarized)
          </h3>
          {loadingOrders ? (
            <div className="animate-pulse space-y-3">
              <div className="h-20 bg-surface-container-low rounded border border-border-subtle"></div>
              <div className="h-20 bg-surface-container-low rounded border border-border-subtle"></div>
            </div>
          ) : orderAnnouncements.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {orderAnnouncements.map((order, idx) => {
                const isGolden = goldenSymbols.has(order.symbol);
                return (
                <div 
                  key={idx} 
                  className={`p-4 rounded-md border shadow-sm hover:shadow-md transition-shadow cursor-pointer flex flex-col justify-between ${
                    isGolden 
                      ? 'bg-gradient-to-br from-[#fffcf2] to-[#fff8e1] border-[#fbc02d]' 
                      : 'bg-surface-container-low border-border-subtle'
                  }`}
                  onClick={() => onSelectStock(order.symbol)}
                >
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <span className={`font-bold hover:underline uppercase text-sm flex items-center gap-1 ${isGolden ? 'text-[#b8860b]' : 'text-[#3b2c6e]'}`}>
                        {order.symbol}
                        {isGolden && <span className="material-icons text-[#fbc02d] text-sm">star</span>}
                      </span>
                      <span className="text-xs text-on-surface-variant font-mono">
                        {order.anndate 
                          ? new Date(order.anndate).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) 
                          : new Date(order.created_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                      </span>
                    </div>
                    <p className="text-sm text-on-surface mb-3 line-clamp-3 leading-relaxed">{order.ai_summary}</p>
                  </div>
                  {order.order_value_cr > 0 && (
                    <div className="flex gap-2 self-start">
                      <div className="bg-[#e8f5e9] text-[#2e7d32] px-2 py-1 rounded text-xs font-semibold">
                        Value: ₹{order.order_value_cr} Cr
                      </div>
                      {order.order_to_mcap_percent && (
                        <div className="bg-[#e3f2fd] text-[#1565c0] px-2 py-1 rounded text-xs font-semibold">
                          {order.order_to_mcap_percent}% of Mcap
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )})}
            </div>
          ) : (
            <div className="text-sm text-on-surface-variant py-8 text-center">No recent order book found.</div>
          )}
        </div>
      )}
      </div>
    </div>
  );
}
