import React, { useState, useEffect, useRef } from 'react';
import Navbar from './components/Navbar';
import BottomNav from './components/BottomNav';
import Footer from './components/Footer';
import Home from './components/Home';
import Markets from './components/Markets';
import QuoteDetail from './components/QuoteDetail';
import Login from './components/Login';
import SignUp from './components/SignUp';
import ForgotPassword from './components/ForgotPassword';
import Dashboard from './components/Dashboard';
import AdminDashboard from './components/AdminDashboard';
import Blogs from './components/Blogs';
import GoldenScreener from './components/GoldenScreener';
import { api } from './api';

import TopTicker from './components/TopTicker';

import ScrollToTopButton from './components/ScrollToTopButton';

function App() {

  const getInitialTab = () => {
    const path = window.location.pathname;
    if (path.startsWith('/markets')) return 'markets';
    if (path.startsWith('/blogs')) return 'blogs';
    if (path.startsWith('/login')) return 'login';
    if (path.startsWith('/signup')) return 'signup';
    if (path.startsWith('/forgot_password')) return 'forgot_password';
    if (path.startsWith('/quote')) return 'quote';
    if (path.startsWith('/dashboard')) return 'dashboard';
    if (path.startsWith('/admin')) return 'admin';
    if (path.startsWith('/screener')) return 'screener';
    return 'home';
  };

  const getInitialSymbol = () => {
    const path = window.location.pathname;
    if (path.startsWith('/quote/')) {
      const parts = path.split('/');
      return decodeURIComponent(parts[2] || 'BAJAJ-AUTO');
    }
    return 'BAJAJ-AUTO';
  };

  const [currentTab, setTabState] = useState(getInitialTab());
  const [selectedSymbol, setSelectedSymbolState] = useState(getInitialSymbol());
  const [previousTab, setPreviousTab] = useState('home');

  const setTab = React.useCallback((tab) => {
    let newTab = tab;
    if (tab === 'PREVIOUS') {
      newTab = previousTab;
    } else {
      if (['login', 'signup', 'forgot_password'].includes(tab)) {
        if (!['login', 'signup', 'forgot_password'].includes(currentTab)) {
          setPreviousTab(currentTab);
        }
      }
    }

    setTabState(newTab);
    window.scrollTo(0, 0);
    if (newTab === 'quote') {
       window.history.pushState({}, '', `/quote/${encodeURIComponent(selectedSymbol)}`);
    } else if (newTab === 'home') {
       window.history.pushState({}, '', `/`);
    } else {
       window.history.pushState({}, '', `/${newTab}`);
    }
  }, [previousTab, currentTab, selectedSymbol]);

  const handleSelectStock = React.useCallback((symbol) => {
    setSelectedSymbolState(symbol);
    setTabState('quote');
    window.history.pushState({}, '', `/quote/${encodeURIComponent(symbol)}`);
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      setTabState(getInitialTab());
      setSelectedSymbolState(getInitialSymbol());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    const handleTabChange = (e) => {
      setTab(e.detail);
    };
    window.addEventListener('changeTab', handleTabChange);
    return () => {
      window.removeEventListener('changeTab', handleTabChange);
    };
  }, [selectedSymbol]);

  useEffect(() => {
    // Globally auto-subscribe to push notifications if permission was already granted
    if (typeof Notification !== 'undefined' && Notification.permission === 'granted' && localStorage.getItem('token')) {
      api.enablePushNotifications(true);
    }
    
    // Force Service Worker update to ensure latest version is running
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(regs => {
        for (let reg of regs) {
          reg.update();
        }
      });
    }
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentTab, selectedSymbol]);

  return (
    <div className="min-h-[100dvh] flex flex-col bg-white text-on-surface pb-16 md:pb-0">
      <Navbar 
        currentTab={currentTab} 
        setTab={setTab} 
        onSearchStock={handleSelectStock} 
      />
      <TopTicker />
      <div className="order-3 flex-1 flex flex-col relative">
        <div className={currentTab === 'home' ? 'flex-1 flex flex-col' : 'hidden'}>
          <Home setTab={setTab} onSelectStock={handleSelectStock} />
        </div>
        <div className={currentTab === 'markets' ? 'flex-1 flex flex-col' : 'hidden'}>
          <Markets onSelectStock={handleSelectStock} />
        </div>
        <div className={currentTab === 'quote' ? 'flex-1 flex flex-col' : 'hidden'}>
          <QuoteDetail symbol={selectedSymbol} />
        </div>
        <div className={currentTab === 'blogs' ? 'flex-1 flex flex-col' : 'hidden'}>
          <Blogs />
        </div>
        <div className={currentTab === 'dashboard' ? 'flex-1 flex flex-col' : 'hidden'}>
          {currentTab === 'dashboard' && <Dashboard setTab={setTab} onSelectStock={handleSelectStock} />}
        </div>
        <div className={currentTab === 'screener' ? 'flex-1 flex flex-col' : 'hidden'}>
          {currentTab === 'screener' && <GoldenScreener onSelectStock={handleSelectStock} />}
        </div>
        <div className={currentTab === 'admin' ? 'flex-1 flex flex-col' : 'hidden'}>
          {currentTab === 'admin' && <AdminDashboard setTab={setTab} />}
        </div>
        {['login', 'signup', 'forgot_password'].includes(currentTab) && (
          <div className="flex-1 flex flex-col">
            {currentTab === 'login' && <Login setTab={setTab} />}
            {currentTab === 'signup' && <SignUp setTab={setTab} />}
            {currentTab === 'forgot_password' && <ForgotPassword setTab={setTab} />}
          </div>
        )}
      </div>
      {currentTab !== 'home' && <Footer setTab={setTab} />}
      <BottomNav currentTab={currentTab} setTab={setTab} />
      <ScrollToTopButton />
    </div>
  );
}

export default App;
