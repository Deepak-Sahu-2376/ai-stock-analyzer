import React, { useState, useEffect } from 'react';

export default function BottomNav({ currentTab, setTab }) {
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

  const navItems = [
    { id: 'home', label: 'Home', icon: 'home' },
    { id: 'markets', label: 'Markets', icon: 'show_chart' },
    { id: 'quote', label: 'Analyse', icon: 'analytics' },
    { id: 'blogs', label: 'Blogs', icon: 'article' },
    { id: user ? 'dashboard' : 'login', label: user ? 'Dashboard' : 'Sign In', icon: user ? 'dashboard' : 'person' }
  ];

  return (
    <div className="order-5 md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-border-subtle flex justify-around items-center h-16 z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
      {navItems.map((item) => {
        const isActive = currentTab === item.id || (item.id === 'login' && currentTab === 'signup');
        return (
          <button
            key={item.id}
            onClick={() => setTab(item.id)}
            className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${
              isActive ? 'text-primary' : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className={`material-icons ${isActive ? '' : 'material-icons-outlined'} text-[22px]`}>
              {item.icon}
            </span>
            <span className={`text-[9px] font-semibold tracking-wide ${isActive ? 'font-bold' : ''}`}>
              {item.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
