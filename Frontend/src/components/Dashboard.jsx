import React, { useState, useEffect, useRef } from 'react';
import { api, API_BASE_URL } from '../api';
import AnnouncementsTable from './AnnouncementsTable';

export default function Dashboard({ setTab, onSelectStock }) {
  const [wishlist, setWishlist] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loadingAnnouncements, setLoadingAnnouncements] = useState(true);
  const [selectedAnnounceSymbol, setSelectedAnnounceSymbol] = useState('ALL');
  const [prices, setPrices] = useState({});
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [wList, aList] = await Promise.all([
        api.getWishlist(),
        api.getAllAlerts()
      ]);
      setWishlist(wList);
      setAlerts(aList);
      
      setLoadingAnnouncements(true);
      if (wList && wList.length > 0) {
        const annPromises = wList.map(item => 
          api.getAnnouncements('equities', { symbol: item.symbol }).catch(() => [])
        );
        Promise.all(annPromises).then(results => {
          let merged = [];
          results.forEach(res => {
            const dataArray = Array.isArray(res) ? res : res?.data ? res.data : [];
            merged = merged.concat(dataArray);
          });
          // Sort by date (format: "24-Jun-2026 13:12:52")
          merged.sort((a, b) => new Date(b.an_dt || 0) - new Date(a.an_dt || 0));
          
          // Deduplicate by desc or attchmntText just in case
          const unique = [];
          const seen = new Set();
          for (const item of merged) {
            const key = item.symbol + item.an_dt + item.desc;
            if (!seen.has(key)) {
              seen.add(key);
              unique.push(item);
            }
          }
          setAnnouncements(unique.slice(0, 10));
        }).finally(() => setLoadingAnnouncements(false));
      } else {
        setAnnouncements([]);
        setLoadingAnnouncements(false);
      }

      
      // Fetch live prices for wishlist
      if (wList.length > 0) {
        const pricePromises = wList.map(async (item) => {
          try {
            const quote = await api.getQuote(item.symbol);
            const symbolData = quote?.priceInfo;
            const realData = symbolData && symbolData.equityResponse ? symbolData.equityResponse[0] : symbolData;
            if (realData) {
              const lastPrice = realData.tradeInfo?.lastPrice || realData.metaData?.lastPrice || realData.orderBook?.lastPrice || realData.priceInfo?.lastPrice || realData.lastPrice;
              const pChange = realData.tradeInfo?.pChange || realData.metaData?.pChange || realData.orderBook?.pChange || realData.priceInfo?.pChange || realData.pChange || 0;
              
              if (lastPrice !== undefined && lastPrice !== null) {
                 return { symbol: item.symbol, price: lastPrice, pChange: pChange };
              }
            }
            return { symbol: item.symbol, price: null, pChange: null };
          } catch (e) {
            return { symbol: item.symbol, price: null, pChange: null };
          }
        });
        const priceResults = await Promise.all(pricePromises);
        const newPrices = {};
        priceResults.forEach(p => {
          if (p.price !== null) newPrices[p.symbol] = p;
        });
        setPrices(newPrices);
      }
    } catch (err) {
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {}
    }
    if (!localStorage.getItem('token')) {
      setTab('login');
      return;
    }
    fetchData();
    
    // Auto-subscribe if permission already granted
    if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      handleEnablePush(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.dispatchEvent(new Event('authChange'));
    setTab('home');
  };


  
  const wsRef = useRef(null);

  // Handle WebSocket connection
  useEffect(() => {
    if (wishlist.length === 0) return;

    // Connect to WebSocket Server
    const wsUrl = process.env.NODE_ENV === 'production' 
      ? `wss://${window.location.host}` 
      : 'ws://localhost:5000';
      
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('WebSocket connected');
      // Subscribe to wishlist symbols
      const symbols = wishlist.map(w => w.symbol);
      ws.send(JSON.stringify({ action: 'subscribe', symbols }));
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.action === 'price_update' && msg.data) {
          setPrices(prevPrices => {
            const nextPrices = { ...prevPrices };
            for (const [symbol, update] of Object.entries(msg.data)) {
              if (nextPrices[symbol] || wishlist.some(w => w.symbol === symbol)) {
                nextPrices[symbol] = {
                  ...nextPrices[symbol],
                  price: update.price,
                  pChange: update.pChange
                };
              }
            }
            return nextPrices;
          });
        }
      } catch (e) {
        console.error('Error parsing WebSocket message', e);
      }
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
    };

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [wishlist]);

  const handleRemoveWishlist = async (symbol) => {
    try {
      await api.toggleWishlist(symbol, symbol);
      setWishlist(wishlist.filter(item => item.symbol !== symbol));
    } catch (err) {
      console.error('Error removing from wishlist', err);
    }
  };

  const handleRemoveAlert = async (id) => {
    try {
      await api.deleteAlert(id);
      setAlerts(alerts.filter(item => item.id !== id));
    } catch (err) {
      console.error('Error deleting alert', err);
    }
  };

  const handleEnablePush = async (silent = false) => {
    await api.enablePushNotifications(silent);
  };

  const handleTestPush = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/push/test`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (!res.ok) {
        if (res.status === 404) {
          // No subscription found on backend. Force re-sync.
          await handleEnablePush(true);
          const retryRes = await fetch(`${API_BASE_URL}/push/test`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
          });
          if (!retryRes.ok) throw new Error('Failed to send test push even after re-syncing');
          alert('Test push notification sent!');
          return;
        }
        const data = await res.json();
        throw new Error(data.error || 'Failed to send test push notification');
      }
      alert('Test push notification sent!');
    } catch (err) {
      alert(err.message || 'Failed to send test push notification');
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex justify-center items-center bg-[#f5f5f5]/30">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 font-body-md text-on-surface bg-white">
      <div className="max-w-[1200px] mx-auto">

        <div className="pt-6 pb-4 px-4 sm:px-6 border-b border-border-subtle flex justify-between items-start">
          <div>
            <h1 className="text-xl md:text-2xl font-semibold tracking-tight text-[#444]">
              {user ? `Hi, ${user.name || user.email.split('@')[0]}` : 'My Dashboard'}
            </h1>
            <p className="text-[11px] md:text-xs text-on-surface-variant mt-1">Manage your wishlist and price alerts.</p>
          </div>
          <button 
            onClick={handleLogout}
            className="md:hidden text-xs text-[#FF5724] hover:text-[#e04e20] font-bold px-3 py-1.5 border border-[#FF5724] rounded-sm transition-all"
          >
            Sign Out
          </button>
        </div>


        {error && (
          <div className="m-4 p-3 bg-red-50 border border-red-100 text-red-600 rounded text-xs">
            {error}
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-0 lg:gap-8 border-b-[8px] border-[#f1f1f1]">
          {/* Wishlist Section */}
          <section className="flex flex-col border-b-[8px] lg:border-b-0 lg:border-r-[8px] border-[#f1f1f1]">
            <div className="flex items-center justify-between px-4 sm:px-6 py-3 bg-surface-container-lowest border-b border-border-subtle">
              <div className="flex items-center gap-2">
                <span className="material-icons text-[#2b6cb0] text-sm">bookmark</span>
                <h2 className="text-xs font-semibold text-[#444] uppercase tracking-wider">Wishlist <span className="text-gray-400 font-normal">({wishlist.length})</span></h2>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {wishlist.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <span className="material-icons text-3xl mb-2 opacity-50">bookmark_border</span>
                  <p className="text-xs">Your wishlist is empty</p>
                </div>
              ) : (
                <div className="flex flex-col">
                  {wishlist.map((item) => {
                    const priceData = prices[item.symbol];
                    const isPositive = priceData && priceData.pChange >= 0;
                    const priceColorClass = isPositive ? 'text-[#4caf50]' : 'text-[#df514c]';
                    
                    return (
                      <div key={item.id} className="flex justify-between items-center px-4 sm:px-6 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors group">
                        <div className="cursor-pointer flex-1" onClick={() => onSelectStock(item.symbol)}>
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium text-[#444] text-sm">{item.symbol}</h3>
                          </div>
                          <p className="text-[10px] text-gray-400 truncate w-32 sm:w-60 mt-0.5">{item.company_name}</p>
                        </div>
                        <div className="text-right mr-3 font-sans">
                          {priceData ? (
                            <>
                              <div className={`text-sm font-medium ${priceColorClass}`}>
                                {priceData.price.toFixed(2)}
                              </div>
                              <div className="text-[10px] text-gray-500 mt-0.5">
                                {isPositive ? '+' : ''}{priceData.pChange.toFixed(2)}%
                              </div>
                            </>
                          ) : (
                            <div className="text-[10px] text-gray-400 animate-pulse">Loading...</div>
                          )}
                        </div>
                        <button
                          onClick={() => handleRemoveWishlist(item.symbol)}
                          className="md:opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-[#df514c] rounded transition-all"
                          title="Remove"
                        >
                          <span className="material-icons text-[16px]">delete_outline</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </section>

          {/* Alerts Section */}
          <section className="flex flex-col">
            <div className="flex items-center justify-between px-4 sm:px-6 py-3 bg-surface-container-lowest border-b border-border-subtle">
              <div className="flex items-center gap-2">
                <span className="material-icons text-[#4caf50] text-sm">notifications</span>
                <h2 className="text-xs font-semibold text-[#444] uppercase tracking-wider">Alerts <span className="text-gray-400 font-normal">({alerts.length})</span></h2>
              </div>
              {typeof Notification !== 'undefined' && Notification.permission !== 'granted' ? (
                <button onClick={handleEnablePush} className="text-[10px] bg-primary text-white font-bold px-2 py-1 rounded uppercase tracking-wider hover:bg-[#2d76c8] transition-colors">
                  Enable Push
                </button>
              ) : (
                <button onClick={handleTestPush} className="text-[10px] bg-surface-container-high border border-border-subtle text-on-surface-variant font-bold px-2 py-1 rounded uppercase tracking-wider hover:bg-surface-container-highest transition-colors">
                  Test Push
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto">
              {alerts.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <span className="material-icons text-3xl mb-2 opacity-50">notifications_none</span>
                  <p className="text-xs">No active alerts</p>
                </div>
              ) : (
                <div className="flex flex-col">
                  {alerts.map((item) => (
                    <div key={item.id} className="flex justify-between items-center px-4 sm:px-6 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors group">
                      <div className="cursor-pointer flex-1" onClick={() => onSelectStock(item.symbol)}>
                        <h3 className="font-medium text-[#444] text-sm">{item.symbol}</h3>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className={`text-[10px] font-medium px-1 rounded ${item.condition?.toLowerCase() === 'above' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                            {item.condition?.toUpperCase() || ''}
                          </span>
                          <span className="text-[11px] text-gray-600 font-medium">₹{Number(item.target_price).toFixed(2)}</span>
                        </div>
                      </div>
                      <div className="text-right mr-3">
                        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${item.status === 'active' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-gray-100 text-gray-500'}`}>
                          {item.status?.toUpperCase() || ''}
                        </span>
                      </div>
                      <button
                        onClick={() => handleRemoveAlert(item.id)}
                        className="md:opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-[#df514c] rounded transition-all"
                        title="Delete"
                      >
                        <span className="material-icons text-[16px]">delete_outline</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Recent Announcements Section */}
        <section className="bg-white flex flex-col pb-8">
          
          <div className="flex items-center justify-between px-4 sm:px-6 py-3 bg-surface-container-lowest border-b border-border-subtle mb-4">
            <div className="flex items-center gap-2">
              <span className="material-icons text-[#422d7d] text-sm">campaign</span>
              <h2 className="text-xs font-semibold text-[#444] uppercase tracking-wider">Recent Equities Announcements</h2>
            </div>
            <button onClick={() => {
              setTab('markets');
              setTimeout(() => {
                window.dispatchEvent(new CustomEvent('setMarketsView', { detail: 'announcements' }));
              }, 50);
            }} className="text-xs text-primary font-bold flex items-center gap-1 group">
              <span className="group-hover:underline">View All</span> <span className="material-icons text-sm">arrow_forward</span>
            </button>
          </div>
          
          {wishlist.length > 0 && (
            <div className="px-4 sm:px-6 mb-4 flex gap-2 overflow-x-auto no-scrollbar pb-1">
              <button
                onClick={() => setSelectedAnnounceSymbol('ALL')}
                className={`px-3 py-1 text-[11px] font-bold uppercase tracking-wider rounded-full whitespace-nowrap transition-colors ${selectedAnnounceSymbol === 'ALL' ? 'bg-primary text-white' : 'bg-surface-container-low text-on-surface-variant hover:bg-border-subtle/50'}`}
              >
                All
              </button>
              {wishlist.map(w => (
                <button
                  key={w.symbol}
                  onClick={() => setSelectedAnnounceSymbol(w.symbol)}
                  className={`px-3 py-1 text-[11px] font-bold uppercase tracking-wider rounded-full whitespace-nowrap transition-colors ${selectedAnnounceSymbol === w.symbol ? 'bg-primary text-white' : 'bg-surface-container-low text-on-surface-variant hover:bg-border-subtle/50'}`}
                >
                  {w.symbol}
                </button>
              ))}
            </div>
          )}

          <AnnouncementsTable 
            data={selectedAnnounceSymbol === 'ALL' ? announcements : announcements.filter(a => a.symbol === selectedAnnounceSymbol)} 
            loading={loadingAnnouncements} 
            onSelectStock={onSelectStock} 
          />

        </section>

      </div>
    </div>
  );
}
