export const API_BASE_URL = '/api';

export const api = {

  getMarketStatus: async () => {
    const res = await fetch(`${API_BASE_URL}/stocks/market-status`);
    if (!res.ok) throw new Error('Failed to fetch market status');
    return res.json();
  },

  getOrderBook: async (symbol) => {
    const res = await fetch(`${API_BASE_URL}/stocks/orderbook/${encodeURIComponent(symbol)}`);
    if (!res.ok) throw new Error('Failed to fetch order book');
    return res.json();
  },

  getChart: async (symbol, period) => {
    const res = await fetch(`${API_BASE_URL}/stocks/chart/${encodeURIComponent(symbol)}?period=${period}`);
    if (!res.ok) throw new Error('Failed to fetch chart data');
    return res.json();
  },

  getCandles: async (symbol, interval, limit) => {
    const res = await fetch(`${API_BASE_URL}/stocks/candles/${encodeURIComponent(symbol)}?interval=${interval}&limit=${limit}`);
    if (!res.ok) throw new Error('Failed to fetch candle data');
    return res.json();
  },

  getPeerQuarters: async (symbol) => {
    const res = await fetch(`${API_BASE_URL}/stocks/peers/${encodeURIComponent(symbol)}/quarters`);
    if (!res.ok) throw new Error('Failed to fetch peer quarters');
    return res.json();
  },

  getPeerIndices: async (symbol) => {
    const res = await fetch(`${API_BASE_URL}/stocks/peers/${encodeURIComponent(symbol)}/indices`);
    if (!res.ok) throw new Error('Failed to fetch peer indices');
    return res.json();
  },

  getPeers: async (symbol, type, quarter, param, index) => {
    const qs = new URLSearchParams({ type, quarter, param, index }).toString();
    const res = await fetch(`${API_BASE_URL}/stocks/peers/${encodeURIComponent(symbol)}?${qs}`);
    if (!res.ok) throw new Error('Failed to fetch peers');
    return res.json();
  },

  placeTrade: async (tradeData) => {
    const res = await fetch(`${API_BASE_URL}/portfolio/trade`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(tradeData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to place trade');
    return data;
  },

  getAlerts: async () => {
    const res = await fetch(`${API_BASE_URL}/alerts`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    if (!res.ok) throw new Error('Failed to fetch alerts');
    return res.json();
  },

  getGiftNifty: async () => {
    const res = await fetch(`${API_BASE_URL}/stocks/giftnifty`);
    if (!res.ok) throw new Error('Failed to fetch giftnifty');
    return res.json();
  },

  // --- Auth ---
  signup: async (email, password, name, otp) => {
    const res = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name, otp })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Signup failed');
    return data;
  },
  
  login: async (email, password) => {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed');
    return data;
  },

  getCurrentUser: async () => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No token found');
    
    const res = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to get user');
    return data;
  },

  sendOtp: async (email) => {
    const res = await fetch(`${API_BASE_URL}/auth/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to send OTP');
    return data;
  },

  forgotPasswordOtp: async (email) => {
    const res = await fetch(`${API_BASE_URL}/auth/forgot-password-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to send OTP');
    return data;
  },

  resetPassword: async (email, otp, newPassword) => {
    const res = await fetch(`${API_BASE_URL}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp, newPassword })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to reset password');
    return data;
  },

  // --- Search / Lookup ---
  searchStocks: async (query) => {
    const res = await fetch(`${API_BASE_URL}/stocks/search?q=${encodeURIComponent(query)}`);
    if (!res.ok) throw new Error('Search failed');
    return res.json();
  },

  // --- Quote Details ---
  getQuote: async (symbol) => {
    const res = await fetch(`${API_BASE_URL}/stocks/quote/${encodeURIComponent(symbol)}`);
    if (!res.ok) throw new Error('Failed to fetch quote');
    return res.json();
  },

  // --- Real-time Indices Data ---
  getIndices: async (type) => {
    const res = await fetch(`${API_BASE_URL}/stocks/indices?type=${encodeURIComponent(type)}`);
    if (!res.ok) throw new Error('Failed to fetch indices');
    return res.json();
  },
  
  getHeatmapSymbols: async (type, indexName) => {
    const res = await fetch(`${API_BASE_URL}/stocks/heatmap-symbols?type=${encodeURIComponent(type)}&indices=${encodeURIComponent(indexName)}`);
    if (!res.ok) throw new Error('Failed to fetch heatmap symbols');
    return res.json();
  },

  // --- Alerts ---
  createAlert: async (alertData) => {
    const res = await fetch(`${API_BASE_URL}/alerts`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(alertData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to create alert');
    return data;
  },

  deleteAlert: async (alertId) => {
    const res = await fetch(`${API_BASE_URL}/alerts/${alertId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to delete alert');
    return data;
  },
  
  // Wishlist & Alerts (All)
  getWishlist: async () => {
    const res = await fetch(`${API_BASE_URL}/wishlist`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    if (!res.ok) {
      if (res.status === 401 || res.status === 403) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.dispatchEvent(new Event('authChange'));
        throw new Error('Session expired. Please log in again.');
      }
      throw new Error('Failed to fetch wishlist');
    }
    return res.json();
  },

  toggleWishlist: async (symbol) => {
    const res = await fetch(`${API_BASE_URL}/wishlist/toggle`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ symbol })
    });
    if (!res.ok) throw new Error('Failed to toggle wishlist');
    return res.json();
  },

  getAllAlerts: async () => {
    const res = await fetch(`${API_BASE_URL}/alerts/all`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    if (!res.ok) {
      if (res.status === 401 || res.status === 403) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.dispatchEvent(new Event('authChange'));
        throw new Error('Session expired. Please log in again.');
      }
      throw new Error('Failed to fetch alerts');
    }
    return res.json();
  },
  
  getAnnouncementSubjects: async (indexName) => {
    const res = await fetch(`${API_BASE_URL}/markets/announcements/subjects/${encodeURIComponent(indexName)}`);
    if (!res.ok) throw new Error('Failed to fetch announcement subjects');
    return res.json();
  },

  getAnnouncements: async (indexName, filters = {}) => {
    const params = new URLSearchParams();
    if (filters.symbol) params.append('symbol', filters.symbol);
    if (filters.subject) params.append('subject', filters.subject);
    if (filters.from_date) params.append('from_date', filters.from_date);
    if (filters.to_date) params.append('to_date', filters.to_date);
    
    const qs = params.toString();
    const url = `${API_BASE_URL}/markets/announcements/${encodeURIComponent(indexName)}${qs ? `?${qs}` : ''}`;
    
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch announcements');
    return res.json();
  },

  getAnnouncementsSummary: async (symbol) => {
    const res = await fetch(`${API_BASE_URL}/announcements/summary/${symbol}`);
    if (!res.ok) throw new Error('Failed to fetch AI summaries');
    return res.json();
  },

  // Push Notifications
  getVapidPublicKey: async () => {
    const res = await fetch(`${API_BASE_URL}/push/vapidPublicKey`);
    if (!res.ok) throw new Error('Failed to fetch VAPID key');
    return res.text();
  },
  
  subscribeToPushNotifications: async (subscription) => {
    const res = await fetch(`${API_BASE_URL}/push/subscribe`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}` 
      },
      body: JSON.stringify(subscription)
    });
    if (!res.ok) throw new Error('Failed to subscribe to push notifications');
    return res.json();
  },

  enablePushNotifications: async (silent = false) => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      if (!silent) alert('Push notifications are not supported by your browser.');
      return false;
    }
    try {
      let permission = Notification.permission;
      if (permission !== 'granted') {
        permission = await Notification.requestPermission();
      }
      
      if (permission === 'granted') {
        const swReg = await navigator.serviceWorker.register('/sw.js', { updateViaCache: 'none' });
        await swReg.update();
        const vapidPublicKey = await api.getVapidPublicKey();
        
        const urlBase64ToUint8Array = (base64String) => {
          const padding = '='.repeat((4 - base64String.length % 4) % 4);
          const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
          const rawData = window.atob(base64);
          const outputArray = new Uint8Array(rawData.length);
          for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
          }
          return outputArray;
        };
        
        const subscription = await swReg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
        });
        
        await api.subscribeToPushNotifications(subscription);
        if (!silent) alert('Push notifications enabled!');
        return true;
      } else {
        if (!silent) alert('Notification permission denied.');
        return false;
      }
    } catch (err) {
      console.error('Error enabling push notifications:', err);
      if (!silent) alert('Failed to enable push notifications.');
      return false;
    }
  },

  testPushNotification: async () => {
    const res = await fetch(`${API_BASE_URL}/push/test`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Failed to send test push notification');
    }
    return res.json();
  }
};
