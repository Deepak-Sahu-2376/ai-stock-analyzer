import React, { useState, useEffect } from 'react';
import { api } from '../api';

const GoldenScreener = ({ onSelectStock }) => {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'cagr_1y', direction: 'asc' });

  const handleSort = (key) => {
    let direction = 'desc';
    if (sortConfig.key === key && sortConfig.direction === 'desc') {
      direction = 'asc';
    }
    setSortConfig({ key, direction });
  };

  const sortedStocks = React.useMemo(() => {
    let sortableStocks = [...stocks];
    sortableStocks.sort((a, b) => {
      if (sortConfig.key === 'symbol') {
        const valA = (a.symbol || '').toString().toLowerCase();
        const valB = (b.symbol || '').toString().toLowerCase();
        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      } else {
        const valA = Number(a[sortConfig.key]) || 0;
        const valB = Number(b[sortConfig.key]) || 0;
        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      }
    });
    return sortableStocks;
  }, [stocks, sortConfig]);

  const SortIcon = ({ columnKey }) => {
    if (sortConfig.key !== columnKey) {
      return <span className="material-icons text-[10px] text-on-surface-variant/30 ml-1">unfold_more</span>;
    }
    return (
      <span className="material-icons text-[12px] text-primary ml-1">
        {sortConfig.direction === 'asc' ? 'arrow_upward' : 'arrow_downward'}
      </span>
    );
  };

  useEffect(() => {
    const fetchGoldenStocks = async () => {
      try {
        setLoading(true);
        const data = await api.getGoldenStocks();
        setStocks(data);
      } catch (err) {
        setError(err.message || 'Failed to fetch golden stocks');
      } finally {
        setLoading(false);
      }
    };
    fetchGoldenStocks();
  }, []);

  return (
    <div className="flex-1 font-body-md text-on-surface bg-white pb-16">
      <div className="max-w-[1200px] mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center px-4 sm:px-6 py-4 border-b border-border-subtle">
          <div>
            <h1 className="text-xl md:text-2xl font-semibold tracking-tight text-[#444] mb-1 flex items-center gap-2">
              <span className="material-icons text-xl text-[#FFB300]">emoji_events</span>
              Golden Screener
            </h1>
            <p className="text-[11px] md:text-xs text-on-surface-variant">
              Stocks matching strict criteria: Positive Compounded Sales Growth, Profit Growth, and Return on Equity across all periods, but with negative recent stock price CAGR.
            </p>
          </div>
        </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : error ? (
        <div className="p-4 sm:p-6">
          <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded text-sm font-medium">
            {error}
          </div>
        </div>
      ) : stocks.length === 0 ? (
        <div className="p-12 text-center">
          <span className="material-icons text-4xl text-border-subtle mb-3">analytics</span>
          <h3 className="text-sm font-bold text-on-surface mb-1">No stocks found yet</h3>
          <p className="text-on-surface-variant text-xs max-w-sm mx-auto leading-relaxed">
            The background worker is currently scanning the market. This process is rate-limited to avoid blocking. Please check back later.
          </p>
        </div>
      ) : (
        <div className="px-4 sm:px-6 py-6">
          <div className="flex justify-end mb-2 sm:hidden">
            <span className="text-[10px] text-on-surface-variant flex items-center gap-1 bg-surface-container-low px-2 py-1 rounded-full border border-border-subtle">
              <span className="material-icons text-[12px]">swipe</span>
              Swipe left for more data
            </span>
          </div>
          <div className="bg-white border border-border-subtle rounded overflow-hidden">
            <div className="overflow-x-auto hide-scrollbar">
              <table className="w-full text-left border-collapse text-[11px] md:text-xs">
                <thead>
                  <tr className="bg-surface-container-low border-b border-border-subtle select-none">
                    <th onClick={() => handleSort('symbol')} className="py-3 px-4 font-semibold text-on-surface-variant uppercase tracking-wider whitespace-nowrap cursor-pointer hover:text-on-surface transition-colors">
                      <div className="flex items-center">Symbol <SortIcon columnKey="symbol" /></div>
                    </th>
                    <th onClick={() => handleSort('sales_growth_ttm')} className="py-3 px-4 font-semibold text-on-surface-variant uppercase tracking-wider whitespace-nowrap cursor-pointer hover:text-on-surface transition-colors">
                      <div className="flex items-center justify-end">TTM Sales Gr. <SortIcon columnKey="sales_growth_ttm" /></div>
                    </th>
                    <th onClick={() => handleSort('profit_growth_ttm')} className="py-3 px-4 font-semibold text-on-surface-variant uppercase tracking-wider whitespace-nowrap cursor-pointer hover:text-on-surface transition-colors">
                      <div className="flex items-center justify-end">TTM Profit Gr. <SortIcon columnKey="profit_growth_ttm" /></div>
                    </th>
                    <th onClick={() => handleSort('roe_1y')} className="py-3 px-4 font-semibold text-on-surface-variant uppercase tracking-wider whitespace-nowrap cursor-pointer hover:text-on-surface transition-colors">
                      <div className="flex items-center justify-end">1Y ROE <SortIcon columnKey="roe_1y" /></div>
                    </th>
                    <th onClick={() => handleSort('cagr_1y')} className="py-3 px-4 font-semibold text-on-surface-variant uppercase tracking-wider whitespace-nowrap cursor-pointer hover:text-on-surface transition-colors">
                      <div className="flex items-center justify-end">1Y CAGR <SortIcon columnKey="cagr_1y" /></div>
                    </th>
                  </tr>
                </thead>
              <tbody className="divide-y divide-border-subtle">
                {sortedStocks.map((stock) => (
                  <tr 
                    key={stock.symbol} 
                    className="hover:bg-surface-container-low transition-colors cursor-pointer"
                    onClick={() => onSelectStock(stock.symbol)}
                  >
                    <td className="py-3 px-4 font-bold text-primary truncate">
                      {stock.symbol}
                    </td>
                    <td className="py-3 px-4 text-on-surface font-mono font-medium text-right">
                      <span className="text-[#2e7d32]">{stock.sales_growth_ttm}%</span>
                    </td>
                    <td className="py-3 px-4 text-on-surface font-mono font-medium text-right">
                      <span className="text-[#2e7d32]">{stock.profit_growth_ttm}%</span>
                    </td>
                    <td className="py-3 px-4 text-on-surface font-mono font-medium text-right">
                      <span className="text-[#2e7d32]">{stock.roe_1y}%</span>
                    </td>
                    <td className="py-3 px-4 text-on-surface font-mono font-medium text-right">
                      <span className="text-[#d32f2f]">{stock.cagr_1y}%</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      )}
      </div>
    </div>
  );
};

export default GoldenScreener;
