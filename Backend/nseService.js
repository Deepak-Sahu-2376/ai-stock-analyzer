const axios = require('axios');
const { HttpsProxyAgent } = require('https-proxy-agent');

// In-memory cookie jar
let cookies = {};
let lastCookieFetchTime = 0;
const COOKIE_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes cache for cookies

const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

// Global HTTP/HTTPS agent for proxying NSE requests
let httpsAgent = undefined;
if (process.env.PROXY_URL) {
  console.log(`[Proxy] Configuring NSE Service to use proxy: ${process.env.PROXY_URL}`);
  httpsAgent = new HttpsProxyAgent(process.env.PROXY_URL);
}

const getHeaders = () => {
  const cookieStr = Object.keys(cookies)
    .map(key => `${key}=${cookies[key]}`)
    .join('; ');

  return {
    'User-Agent': USER_AGENT,
    'Accept': 'application/json, text/plain, */*',
    'Accept-Language': 'en-IN,en-GB;q=0.9,en-US;q=0.8,en;q=0.7',
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache',
    'Accept-Encoding': 'gzip, deflate, br',
    'Referer': 'https://www.nseindia.com/',
    'Origin': 'https://www.nseindia.com',
    'Cookie': cookieStr
  };
};

const initSession = async (force = false) => {
  const now = Date.now();
  if (!force && Object.keys(cookies).length > 0 && (now - lastCookieFetchTime < COOKIE_EXPIRY_MS)) {
    return;
  }

  // console.log('Initializing NSE India session, fetching cookies...');
  try {
    if (force) {
      cookies = {}; // Clear old cookies to prevent stale/polluted cookies from being sent
    }
    const response = await axios.get('https://www.nseindia.com/get-quote/equity?symbol=BAJAJ-AUTO', {
      headers: {
        'User-Agent': USER_AGENT,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9'
      },
      timeout: 10000,
      httpsAgent,
      proxy: false,
      validateStatus: () => true // Allow any status code since it might be 404
    });

    const setCookieHeaders = response.headers['set-cookie'];
    if (setCookieHeaders) {
      setCookieHeaders.forEach(cookieStr => {
        const firstPart = cookieStr.split(';')[0];
        const eqIdx = firstPart.indexOf('=');
        if (eqIdx !== -1) {
          const key = firstPart.substring(0, eqIdx).trim();
          const val = firstPart.substring(eqIdx + 1).trim();
          cookies[key] = val;
        }
      });
      // console.log(`Successfully fetched cookies: ${Object.keys(cookies).join(', ')}`);
      lastCookieFetchTime = Date.now();
    } else {
      console.warn('No cookies returned from NSE India get-quote page');
    }
  } catch (error) {
    console.error('Error initializing session cookies:', error.message);
    throw error;
  }
};

// Generic fetch wrapper with auto retry and cookie refreshing
const nseFetch = async (url, params = {}, retries = 2) => {
  await initSession();

  try {
    const response = await axios.get(url, {
      params,
      headers: getHeaders(),
      timeout: 10000,
      httpsAgent,
      proxy: false
    });
    return response.data;
  } catch (error) {
    const status = error.response ? error.response.status : null;
    console.warn(`NSE Fetch failed for ${url}. Status: ${status}. Retries remaining: ${retries}`);

    if ((status === 401 || status === 403 || !error.response) && retries > 0) {
      console.log('Session might have expired or connection failed. Refreshing cookies and retrying...');
      try {
        await initSession(true); // force refresh cookies
        return await nseFetch(url, params, retries - 1);
      } catch (retryError) {
        console.error('Retry failed:', retryError.message);
        throw retryError;
      }
    }
    throw error;
  }
};

// NSE India API client endpoints
const nseService = {
  // 1. Symbol Name and Company Name
  getSymbolName: async (symbol) => {
    const url = 'https://www.nseindia.com/api/NextApi/apiClient/GetQuoteApi';
    return await nseFetch(url, { functionName: 'getSymbolName', symbol });
  },

  // 2. Pre-Open Market Status
  getPreOpenMarketStatus: async () => {
    const url = 'https://www.nseindia.com/api/NextApi/apiClient/GetQuoteApi';
    return await nseFetch(url, { functionName: 'getPreOpenMarketStatus' });
  },

  // 3. Company Metadata
  getMetaData: async (symbol) => {
    const url = 'https://www.nseindia.com/api/NextApi/apiClient/GetQuoteApi';
    return await nseFetch(url, { functionName: 'getMetaData', symbol });
  },

  // 4. Symbol Data (Price detail, high/low, orderbook)
  getSymbolData: async (symbol, series = 'EQ') => {
    const url = 'https://www.nseindia.com/api/NextApi/apiClient/GetQuoteApi';
    return await nseFetch(url, {
      functionName: 'getSymbolData',
      marketType: 'N',
      series,
      symbol
    });
  },

  // 5. Symbol Chart Data (1D chart data)
  getSymbolChartData: async (symbol, days = '1D', series = 'EQ') => {
    const url = 'https://www.nseindia.com/api/NextApi/apiClient/GetQuoteApi';
    // Append series + 'N' if not already present, or use symbol as is.
    // NSE chart symbol usually requires 'series + N' at the end of the symbol name.
    const chartSymbol = symbol.endsWith(series + 'N') ? symbol : `${symbol}${series}N`;
    return await nseFetch(url, {
      functionName: 'getSymbolChartData',
      symbol: chartSymbol,
      days
    });
  },

  // 6. Change percentage (Yearwise data)
  getYearwiseData: async (symbol) => {
    const url = 'https://www.nseindia.com/api/NextApi/apiClient/GetQuoteApi';
    const chartSymbol = symbol.endsWith('EQN') ? symbol : `${symbol}EQN`;
    return await nseFetch(url, { functionName: 'getYearwiseData', symbol: chartSymbol });
  },

  // 7. Get Index List for symbol
  getIndexList: async (symbol) => {
    const url = 'https://www.nseindia.com/api/NextApi/apiClient/GetQuoteApi';
    return await nseFetch(url, { functionName: 'getIndexList', symbol });
  },

  // 8. Get Corporate Actions
  getCorpAction: async (symbol) => {
    const url = 'https://www.nseindia.com/api/NextApi/apiClient/GetQuoteApi';
    return await nseFetch(url, {
      functionName: 'getCorpAction',
      symbol,
      marketApiType: 'equities',
      noOfRecords: 3
    });
  },

  // 9. Get Corporate Announcements
  getCorporateAnnouncement: async (symbol) => {
    const url = 'https://www.nseindia.com/api/NextApi/apiClient/GetQuoteApi';

    const toDateObj = new Date();
    const fromDateObj = new Date();
    fromDateObj.setMonth(fromDateObj.getMonth() - 6);

    const formatDate = (date) => {
      const d = String(date.getDate()).padStart(2, '0');
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const y = date.getFullYear();
      return `${d}-${m}-${y}`;
    };

    return await nseFetch(url, {
      functionName: 'getCorporateAnnouncement',
      symbol,
      marketApiType: 'equities',
      subject: '',
      fromDate: formatDate(fromDateObj),
      toDate: formatDate(toDateObj)
    });
  },

  // 10. Get Peer Comparison Data
  getPeerComparisonData: async (symbol, options = {}) => {
    const url = 'https://www.nseindia.com/api/NextApi/apiClient/GetQuoteApi';
    return await nseFetch(url, {
      functionName: 'getPeerComparisonData',
      symbol,
      type: options.type || 'S',
      quarter: options.quarter || '',
      param: options.param || 'industry',
      index: options.index || ''
    });
  },

  getPeerComparisonQuaters: async (symbol) => {
    const url = 'https://www.nseindia.com/api/NextApi/apiClient/GetQuoteApi';
    return await nseFetch(url, {
      functionName: 'getPeerComparisonQuaters',
      symbol
    });
  },

  // 10. Global Search
  getSearchSymbol: async (symbol, filter = 'equity') => {
    // filter can be: 'equity', 'derivatives', 'etf', 'all', 'others'
    const url = `https://www.nseindia.com/api/NextApi/globalSearch/${filter}`;
    return await nseFetch(url, { symbol });
  },

  // 8. Get Index Data of all type (for heatmap and market stats)
  getIndexData: async (type = 'All') => {
    const url = 'https://www.nseindia.com/api/allIndices';
    const result = await nseFetch(url);
    if (type === 'All') return result;

    if (result && result.data) {
       const filtered = result.data.filter(idx => idx.key === type.toUpperCase());
       return { data: filtered };
    }
    return { data: [] };
  },

  // 9. Get Gift Nifty
  getGiftNifty: async () => {
    const url = 'https://www.nseindia.com/api/NextApi/apiClient';
    return await nseFetch(url, { functionName: 'getGiftNifty' });
  },

  // 9.5 Get Equity Stock Indices (e.g. NIFTY 50, NIFTY 500)
  getEquityStockIndices: async (indexName = 'NIFTY 500') => {
    const url = 'https://www.nseindia.com/api/equity-stockIndices';
    return await nseFetch(url, { index: indexName });
  },

  // Heatmap Symbols
  getHeatmapSymbols: async (type, indices) => {
    const url = 'https://www.nseindia.com/api/heatmap-symbols';
    return await nseFetch(url, { type, indices });
  },

  // 10. Get Candlestick dynamic info to resolve charting token
  getSymbolsDynamic: async (symbol, series = 'EQ') => {
    // For charting, symbol format is usually symbol + '-EQ' (e.g. BAJAJ-AUTO-EQ)
    const formattedSymbol = symbol.endsWith('-' + series) || symbol.includes(' ') ? symbol : `${symbol}-${series}`;
    const url = `https://charting.nseindia.com/v1/exchanges/symbolsDynamic`;
    
    try {
      const response = await axios.get(url, {
        params: { symbol: formattedSymbol, segment: '' },
        headers: {
          'User-Agent': USER_AGENT,
          'Accept': 'application/json, text/plain, */*',
          'Referer': `https://charting.nseindia.com/?symbol=${formattedSymbol}`
        },
        timeout: 10000,
        httpsAgent,
        proxy: false
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching symbolsDynamic for ${formattedSymbol}:`, error.message);
      throw error;
    }
  },

  // 11. Get Historical Candlestick Data
  getSymbolHistoricalData: async (symbol, timeInterval = 5, daysLimit = 30, series = 'EQ') => {
    try {
      // 1. Resolve token for the symbol
      const dynamicData = await nseService.getSymbolsDynamic(symbol, series);
      let token = '';
      let resolvedSymbol = symbol.endsWith('-' + series) || symbol.includes(' ') ? symbol : `${symbol}-${series}`;
      
      const items = dynamicData?.data || [];
      if (Array.isArray(items) && items.length > 0) {
        token = items[0].scripcode || items[0].token || '';
        resolvedSymbol = items[0].symbol || resolvedSymbol;
      }
      
      if (!token) {
        // Fallback token mappings for indices or standard stocks
        if (symbol === 'NIFTY 50') {
          token = '17940'; // Nifty 50 standard charting token
        } else if (symbol === 'NIFTY BANK') {
          token = '17941';
        } else {
          throw new Error(`Could not resolve charting token for symbol ${symbol}`);
        }
      }

      // Calculate timestamps (fromDate, toDate)
      // toDate is current epoch second
      const toDate = Math.floor(Date.now() / 1000);
      // fromDate is toDate minus daysLimit in seconds
      const fromDate = toDate - (daysLimit * 24 * 60 * 60);

      const url = 'https://charting.nseindia.com/v1/charts/symbolHistoricalData';
      
      const response = await axios.get(url, {
        params: {
          token,
          fromDate,
          toDate,
          symbol: resolvedSymbol,
          symbolType: symbol.includes('NIFTY') ? 'Index' : 'Equity',
          chartType: 'I', // Intraday/Historical
          timeInterval: timeInterval.toString()
        },
        headers: {
          'User-Agent': USER_AGENT,
          'Accept': 'application/json, text/plain, */*',
          'Referer': `https://charting.nseindia.com/?symbol=${resolvedSymbol}`
        },
        timeout: 10000,
        httpsAgent,
        proxy: false
      });

      return response.data;
    } catch (error) {
      console.error(`Error fetching historical charting data for ${symbol}:`, error.message);
      throw error;
    }
  }
};

nseService.getAllIndices = async () => { return await nseFetch("https://www.nseindia.com/api/allIndices"); }; 
nseService.getIndexAnnouncements = async (indexName, queryParams = {}) => {
    let url = `https://www.nseindia.com/api/corporate-announcements?index=${encodeURIComponent(indexName)}`;
    
    const params = new URLSearchParams();
    if (queryParams.symbol) params.append('symbol', queryParams.symbol);
    if (queryParams.subject) params.append('subject', queryParams.subject);
    if (queryParams.from_date) params.append('from_date', queryParams.from_date);
    if (queryParams.to_date) params.append('to_date', queryParams.to_date);
    
    const qs = params.toString();
    if (qs) url += `&${qs}`;
    
    return await nseFetch(url);
};

nseService.getAnnouncementSubjects = async (indexName) => {
    return await nseFetch(`https://www.nseindia.com/api/corporate-announcements-subject?index=${encodeURIComponent(indexName)}`);
};

module.exports = nseService;

