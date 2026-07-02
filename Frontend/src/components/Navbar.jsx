import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../api';

export default function Navbar({ currentTab, setTab, onSearchStock }) {
  const [searchVal, setSearchVal] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);

  const checkAuth = () => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        setUser(null);
      }
    } else {
      setUser(null);
    }
  };

  useEffect(() => {
    checkAuth();
    window.addEventListener('authChange', checkAuth);
    window.addEventListener('storage', checkAuth);
    return () => {
      window.removeEventListener('authChange', checkAuth);
      window.removeEventListener('storage', checkAuth);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    window.dispatchEvent(new Event('authChange'));
    setTab('home');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchVal.trim()) {
      onSearchStock(searchVal.trim().toUpperCase());
      setSearchVal('');
      setShowDropdown(false);
    }
  };

  const handleTagClick = (symbol) => {
    onSearchStock(symbol);
    setSearchVal('');
    setShowDropdown(false);
  };

  // Debounced search fetch
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!searchVal.trim()) {
        setSuggestions([]);
        setShowDropdown(false);
        return;
      }
      try {
        const response = await fetch(`${API_BASE_URL}/stocks/search?q=${searchVal}`);
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
  }, [searchVal]);

  return (
    <header className={`order-2 md:order-1 h-14 sm:h-16 px-4 sm:px-6 bg-white border-b border-border-subtle justify-between items-center shrink-0 w-full sticky top-0 z-50 gap-4 sm:gap-8 ${['home', 'dashboard', 'blogs'].includes(currentTab) ? 'hidden sm:flex' : 'flex'}`}>
      <div className="hidden sm:flex items-center gap-2.5 cursor-pointer shrink-0" onClick={() => setTab('home')}>
        {/* Brand Logo (Orange styled) */}
        <img 
          alt="Stock Island Logo" 
          className="h-6 sm:h-7 w-auto object-contain"
          src="/Stock_Island.svg"
        />
        <span className="hidden sm:block font-bold text-base text-[#1b1c1c] tracking-tight hover:text-primary transition-colors">
          Stock Island
        </span>
      </div>
      
      {/* Navigation Links (Desktop Only) */}
      <nav className="hidden md:flex gap-6 h-full items-center mr-auto">
        <button
          onClick={() => setTab('home')}
          className={`font-medium py-5 text-xs uppercase tracking-wider transition-all hover:text-primary ${
            currentTab === 'home' 
              ? 'text-primary border-b-2 border-primary font-bold' 
              : 'text-on-surface-variant'
          }`}
        >
          Home
        </button>
        <button
          onClick={() => setTab('markets')}
          className={`font-medium py-5 text-xs uppercase tracking-wider transition-all hover:text-primary ${
            currentTab === 'markets' 
              ? 'text-primary border-b-2 border-primary font-bold' 
              : 'text-on-surface-variant'
          }`}
        >
          Markets
        </button>
        <button
          onClick={() => setTab('quote')}
          className={`font-medium py-5 text-xs uppercase tracking-wider transition-all hover:text-primary ${
            currentTab === 'quote' 
              ? 'text-primary border-b-2 border-primary font-bold' 
              : 'text-on-surface-variant'
          }`}
        >
          Analyse
        </button>
        <button
          onClick={() => setTab('blogs')}
          className={`font-medium py-5 text-xs uppercase tracking-wider transition-all hover:text-primary ${
            currentTab === 'blogs' 
              ? 'text-primary border-b-2 border-primary font-bold' 
              : 'text-on-surface-variant'
          }`}
        >
          Blogs
        </button>
        {user && (
          <button
            onClick={() => setTab('dashboard')}
            className={`font-medium py-5 text-xs uppercase tracking-wider transition-all hover:text-primary ${
              currentTab === 'dashboard' 
                ? 'text-primary border-b-2 border-primary font-bold' 
                : 'text-on-surface-variant'
            }`}
          >
            Dashboard
          </button>
        )}
      </nav>

      {/* Quick Search & Auth */}
      <div className="flex items-center gap-4 flex-1 sm:flex-none justify-end">
        {/* Quick Search */}
        {!['home', 'dashboard', 'blogs'].includes(currentTab) && (
          <div className="relative w-full sm:w-auto flex-1 sm:flex-none">
            <form onSubmit={handleSubmit} className="relative w-full">
              <span className="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-outline text-xs">
                search
              </span>
              <input
                type="text"
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
                onFocus={() => { if(suggestions.length > 0) setShowDropdown(true); }}
                onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                className="bg-surface-container-low border border-border-subtle rounded text-xs text-on-surface pl-8 pr-4 py-2 sm:py-1.5 focus:ring-1 focus:ring-primary focus:border-primary w-full sm:w-64 placeholder-outline transition-all outline-none"
                placeholder="Search markets..."
                autoComplete="off"
              />
            </form>

            {/* Autocomplete Dropdown */}
            {showDropdown && suggestions.length > 0 && (
              <div className="absolute top-full left-0 sm:left-auto sm:right-0 mt-2 w-full sm:w-72 bg-white border border-border-subtle rounded shadow-lg z-50 text-left overflow-hidden">
                <ul className="max-h-80 overflow-y-auto">
                  {suggestions.map((item, idx) => (
                    <li 
                      key={idx} 
                      className="px-3 py-2 hover:bg-surface-container-low cursor-pointer border-b border-border-subtle/50 last:border-b-0 flex justify-between items-center group/item transition-colors"
                      onMouseDown={() => handleTagClick(item.symbol)}
                    >
                      <div className="truncate pr-2">
                        <div className="font-semibold text-[11px] text-on-surface group-hover/item:text-primary transition-colors truncate">{item.companyName}</div>
                        <span className="inline-block mt-0.5 text-[9px] border border-[#7d20a3] text-[#7d20a3] bg-[#7d20a3]/5 rounded-sm px-1 py-[1px] font-medium tracking-wide">
                          {item.segment || 'in equity'}
                        </span>
                      </div>
                      <div className="font-bold font-mono text-[11px] text-on-surface-variant group-hover/item:text-on-surface transition-colors shrink-0">
                        {item.symbol}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Notifications and Profile */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-on-surface bg-[#f0f0f0] border border-border-subtle px-2.5 py-1.5 rounded-sm">
                Hi, {user.name || user.email.split('@')[0]}
              </span>
              <button 
                onClick={handleLogout} 
                className="text-xs text-[#FF5724] hover:text-[#e04e20] font-semibold px-2 py-1.5 transition-all"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <>
              <button 
                onClick={() => setTab('login')} 
                className="text-xs text-on-surface-variant hover:text-primary font-semibold px-2 py-1.5 transition-all"
              >
                Sign In
              </button>
              <button 
                onClick={() => setTab('signup')} 
                className="bg-primary text-white text-xs font-semibold px-4 py-2 rounded hover:bg-[#2d76c8] transition-all"
              >
                Get Started
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
