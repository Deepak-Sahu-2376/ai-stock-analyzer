import React, { useState, useEffect, useRef } from 'react';
import { api, API_BASE_URL } from '../api';

export default function Home({ setTab, onSelectStock }) {
  const [query, setQuery] = useState('');
  const [searchFilter, setSearchFilter] = useState('all');
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [trending, setTrending] = useState([]);
  
  const headings = [
    "Search markets, stocks & more",
    "Discover new investment ideas",
    "Track your favorite companies",
    "Analyze real-time market data"
  ];
  const [headingIndex, setHeadingIndex] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const searchRef = useRef(null);

  // Typewriter effect
  useEffect(() => {
    let timer;
    const currentHeading = headings[headingIndex];
    
    if (isDeleting) {
      if (displayText.length === 0) {
        setIsDeleting(false);
        setHeadingIndex((prev) => (prev + 1) % headings.length);
      } else {
        timer = setTimeout(() => {
          setDisplayText(currentHeading.substring(0, displayText.length - 1));
        }, 40); // Slower, smoother delete
      }
    } else {
      if (displayText.length === currentHeading.length) {
        timer = setTimeout(() => setIsDeleting(true), 3000); // Pause when fully typed
      } else {
        // Fast, consistent speed for smooth flowing animation
        timer = setTimeout(() => {
          setDisplayText(currentHeading.substring(0, displayText.length + 1));
        }, 40); 
      }
    }
    
    return () => clearTimeout(timer);
  }, [displayText, isDeleting, headingIndex]);

  // Fetch dynamic trending stocks (top gainers from NIFTY 50)
  useEffect(() => {
    api.getHeatmapSymbols('Broad Market Indices', 'NIFTY 50')
      .then(res => {
        if (Array.isArray(res)) {
          const sorted = res.sort((a, b) => parseFloat(b.pChange || 0) - parseFloat(a.pChange || 0));
          setTrending(sorted.slice(0, 4));
        }
      })
      .catch(e => console.error("Failed to fetch trending stocks:", e));
  }, []);

  // Handle clicking outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowDropdown(false);
        setIsFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);



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

  // Handle mobile keyboard closing reliably using visualViewport
  useEffect(() => {
    let lastHeight = window.visualViewport ? window.visualViewport.height : window.innerHeight;
    
    const handleResize = () => {
      const currentHeight = window.visualViewport ? window.visualViewport.height : window.innerHeight;
      // If height increases significantly, keyboard closed
      if (currentHeight > lastHeight + 50) {
        if (document.activeElement && document.activeElement.tagName === 'INPUT') {
          document.activeElement.blur();
        }
        setIsFocused(false);
      }
      lastHeight = currentHeight;
    };

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleResize);
    } else {
      window.addEventListener('resize', handleResize);
    }

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleResize);
      } else {
        window.removeEventListener('resize', handleResize);
      }
    };
  }, []);

  return (
    <div className="flex-grow flex flex-col items-center justify-start px-4 relative">
      {/* Spacer to simulate centering and allow smooth transition to top */}
      <div className={`transition-all duration-500 ease-in-out w-full shrink-0 ${isFocused ? 'h-24 sm:h-28' : 'h-[15vh] sm:h-[20vh]'}`}></div>
      {/* Background Dots */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.04]" 
        style={{ 
          backgroundImage: 'radial-gradient(circle at center, #005cab 1px, transparent 1px)', 
          backgroundSize: '40px 40px' 
        }}
      ></div>

      <div className="w-full max-w-2xl text-center z-10 -mt-8">
        {/* Title */}
        <div className={`transition-all duration-500 ease-in-out overflow-hidden flex flex-col justify-end ${isFocused ? 'max-h-0 opacity-0 mb-0' : 'max-h-[160px] opacity-100 mb-8 sm:mb-16'}`}>
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold tracking-tight text-on-surface leading-tight min-h-[3em] sm:min-h-[2.5em] flex items-start justify-center text-center">
            <span>
              {headings[headingIndex].substring(0, displayText.length)}
              <span className="relative">
                 <span className="absolute animate-pulse font-light text-primary">|</span>
              </span>
              <span className="invisible">{headings[headingIndex].substring(displayText.length)}</span>
            </span>
          </h1>
        </div>

        {/* Search Bar */}
        <div ref={searchRef} className="relative w-full group">
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/80 text-[24px]">
              search
            </span>
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                if (e.target.value.length > 0) setShowDropdown(true);
                else setShowDropdown(false);
              }}
              onFocus={() => { 
                setIsFocused(true);
                if (query.length > 0) setShowDropdown(true);
              }}
              className="w-full h-12 pl-14 pr-14 rounded border border-border-subtle bg-white text-sm text-on-surface shadow-sm placeholder-on-surface-variant/50 focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all duration-300"
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
          <div className={`absolute top-full mt-2 w-full bg-white border border-border-subtle rounded-lg shadow-lg z-50 text-left overflow-hidden transition-all duration-300 ease-out origin-top ${showDropdown ? 'opacity-100 scale-100 translate-y-0 visible pointer-events-auto' : 'opacity-0 scale-95 -translate-y-2 invisible pointer-events-none'}`}>
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
                <ul className="max-h-56 sm:max-h-80 overflow-y-auto">
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
        </div>

        {/* Bottom Elements Wrapper */}
        <div className={`transition-all duration-500 ease-in-out overflow-hidden flex flex-col items-center w-full ${isFocused ? 'max-h-0 opacity-0 mt-0' : 'max-h-[500px] opacity-100 mt-6'}`}>
          {/* Suggested Tags */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <span className="text-xs text-on-surface-variant/60 mr-1 font-bold">Trending:</span>
          {trending.length > 0 ? trending.map((stock, i) => (
            <button
              key={stock.symbol}
              onClick={() => handleTagClick(stock.symbol)}
              className="px-3 py-1.5 rounded-sm border border-border-subtle bg-surface-bright hover:border-primary hover:text-primary text-xs text-on-surface-variant font-medium transition-all flex items-center gap-1.5"
            >
              <span className={`w-1.5 h-1.5 rounded-full ${parseFloat(stock.pChange) >= 0 ? 'bg-secondary' : 'bg-[#e53935]'}`}></span>
              {stock.symbol}
            </button>
          )) : (
            <div className="flex gap-3 animate-pulse">
               {Array.from({length: 4}).map((_, i) => (
                  <div key={i} className="h-7 w-20 bg-surface-container-low rounded-sm border border-border-subtle/50"></div>
               ))}
            </div>
          )}
        </div>
        </div>
      </div>

      {/* Golden Stocks Promo Card anchored at bottom */}
      <div className={`mt-auto mb-10 sm:mb-8 w-full flex justify-center transition-all duration-500 ease-in-out ${isFocused ? 'max-h-0 opacity-0 overflow-hidden invisible' : 'max-h-[150px] opacity-100 visible'}`}>
        <button
          onClick={() => setTab('screener')}
          className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-amber-500 to-orange-400 p-[1px] transition-all hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] w-full max-w-sm"
        >
          <div className="flex items-center gap-3 sm:gap-4 rounded-xl bg-white/95 px-4 py-3 backdrop-blur-sm transition-all group-hover:bg-white/90">
            <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-amber-100 text-amber-600 shrink-0">
              <span className="material-symbols-outlined text-[20px] sm:text-[24px]">stars</span>
            </div>
            <div className="text-left flex-grow">
              <h3 className="font-bold text-on-surface text-sm sm:text-base">Golden Stocks Screener</h3>
              <p className="text-[11px] sm:text-xs text-on-surface-variant mt-0.5">Discover fundamentally strong companies instantly</p>
            </div>
            <span className="material-symbols-outlined text-amber-500 group-hover:translate-x-1 transition-transform shrink-0">arrow_forward</span>
          </div>
        </button>
      </div>
    </div>
  );
}
