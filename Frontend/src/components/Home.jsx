import React, { useState, useEffect } from 'react';
import { api, API_BASE_URL } from '../api';

export default function Home({ setTab, onSelectStock }) {
  const [query, setQuery] = useState('');
  const [searchFilter, setSearchFilter] = useState('all');
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);



  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      onSelectStock(query.trim().toUpperCase());
      setShowDropdown(false);
    }
  };

  const handleTagClick = (symbol) => {
    onSelectStock(symbol);
    setShowDropdown(false);
  };

  // Debounced search fetch
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!query.trim()) {
        setSuggestions([]);
        setShowDropdown(false);
        return;
      }
      try {
        const response = await fetch(`${API_BASE_URL}/stocks/search?q=${query}&filter=${searchFilter}`);
        if (response.ok) {
          const data = await response.json();
          setSuggestions(data.data || []);
          setShowDropdown(true);
        }
      } catch (err) {
        console.error("Search error", err);
      }
    };
    
    const timeoutId = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timeoutId);
  }, [query, searchFilter]);

  return (
    <div className="flex-grow flex flex-col items-center justify-center px-4 relative min-h-[calc(100vh-8rem)]">
      {/* Background Dots */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.04]" 
        style={{ 
          backgroundImage: 'radial-gradient(circle at center, #005cab 1px, transparent 1px)', 
          backgroundSize: '40px 40px' 
        }}
      ></div>

      <div className="w-full max-w-2xl text-center space-y-6 z-10 -mt-8">
        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-on-surface leading-tight">
          Search markets, stocks &amp; more
        </h1>

        {/* Search Bar */}
        <div className="relative w-full group">
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/80 text-[24px]">
              search
            </span>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setShowDropdown(true)}
              onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
              className="w-full h-14 pl-14 pr-14 rounded border border-border-subtle bg-white text-sm text-on-surface shadow-sm placeholder-on-surface-variant/50 focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all duration-300"
              placeholder="Eg: INFY, Reliance, Nifty 50..."
              autoComplete="off"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-2">
              <button 
                type="button" 
                onClick={(e) => {
                  e.preventDefault();
                  setShowDropdown(!showDropdown);
                }}
                className="w-8 h-8 rounded flex items-center justify-center text-on-surface-variant hover:bg-surface-container-low transition-colors" 
                title="Search Filters"
              >
                <span className="material-symbols-outlined text-[20px]">tune</span>
              </button>
            </div>
          </form>

          {/* Autocomplete Dropdown */}
          {showDropdown && (
            <div className="absolute top-full mt-2 w-full bg-white border border-border-subtle rounded-lg shadow-lg z-50 text-left overflow-hidden">
              <div className="bg-surface-container-low px-4 py-2 border-b border-border-subtle flex gap-2 overflow-x-auto no-scrollbar scroll-smooth">
                {[
                  { id: 'all', label: 'All' },
                  { id: 'equity', label: 'Equity' },
                  { id: 'derivatives', label: 'Derivs' },
                  { id: 'etf', label: 'ETF' },
                  { id: 'others', label: 'Others' }
                ].map(opt => (
                  <button
                    key={opt.id}
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault(); // Prevents input from losing focus
                      setSearchFilter(opt.id);
                    }}
                    className={`text-xs font-semibold px-3 py-1.5 rounded-full whitespace-nowrap transition-all ${
                      searchFilter === opt.id
                        ? 'bg-primary text-white shadow-sm'
                        : 'text-on-surface-variant hover:text-on-surface hover:bg-white'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              {suggestions.length > 0 ? (
                <ul className="max-h-80 overflow-y-auto">
                {suggestions.map((item, idx) => (
                  <li 
                    key={idx} 
                    className="px-4 py-3 hover:bg-surface-container-low cursor-pointer border-b border-border-subtle/50 last:border-b-0 flex justify-between items-center group/item transition-colors"
                    onMouseDown={() => handleTagClick(item.symbol)}
                  >
                    <div>
                      <div className="font-semibold text-sm text-on-surface group-hover/item:text-primary transition-colors">{item.companyName}</div>
                      <span className="inline-block mt-1 text-[10px] border border-[#7d20a3] text-[#7d20a3] bg-[#7d20a3]/5 rounded-sm px-1.5 py-0.5 font-medium tracking-wide">
                        {item.segment || 'in equity'}
                      </span>
                    </div>
                    <div className="font-bold font-mono text-sm text-on-surface-variant group-hover/item:text-on-surface transition-colors">
                      {item.symbol}
                    </div>
                  </li>
                ))}
              </ul>
              ) : query.length > 0 ? (
                <div className="px-4 py-8 text-center text-sm text-on-surface-variant">
                  No matches found in {searchFilter}
                </div>
              ) : (
                <div className="px-4 py-6 text-center text-xs text-on-surface-variant/70">
                  Type to search {searchFilter}...
                </div>
              )}
            </div>
          )}
        </div>

        {/* Suggested Tags */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <span className="text-xs text-on-surface-variant/60 mr-1 font-bold">Trending:</span>
          
          <button
            onClick={() => handleTagClick('BAJAJ-AUTO')}
            className="px-3 py-1.5 rounded-sm border border-border-subtle bg-surface-bright hover:border-primary hover:text-primary text-xs text-on-surface-variant font-medium transition-all flex items-center gap-1.5"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
            BAJAJ-AUTO
          </button>

          <button
            onClick={() => handleTagClick('RELIANCE')}
            className="px-3 py-1.5 rounded-sm border border-border-subtle bg-surface-bright hover:border-primary hover:text-primary text-xs text-on-surface-variant font-medium transition-all flex items-center gap-1.5"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span>
            RELIANCE
          </button>

          <button
            onClick={() => handleTagClick('HDFCBANK')}
            className="px-3 py-1.5 rounded-sm border border-border-subtle bg-surface-bright hover:border-primary hover:text-primary text-xs text-on-surface-variant font-medium transition-all flex items-center gap-1.5"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
            HDFCBANK
          </button>

          <button
            onClick={() => handleTagClick('NIFTY50')}
            className="px-3 py-1.5 rounded-sm border border-border-subtle bg-surface-bright hover:border-primary hover:text-primary text-xs text-on-surface-variant font-medium transition-all flex items-center gap-1.5"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
            NIFTY50
          </button>
        </div>
      </div>
    </div>
  );
}
