import React, { useState, useEffect, useRef, Suspense } from 'react';
import Navbar from './components/Navbar';
import BottomNav from './components/BottomNav';
import Footer from './components/Footer';
import TopTicker from './components/TopTicker';
import ScrollToTopButton from './components/ScrollToTopButton';
import { api } from './api';

const Home = React.lazy(() => import('./components/Home'));
const Markets = React.lazy(() => import('./components/Markets'));
const QuoteDetail = React.lazy(() => import('./components/QuoteDetail'));
const Login = React.lazy(() => import('./components/Login'));
const SignUp = React.lazy(() => import('./components/SignUp'));
const ForgotPassword = React.lazy(() => import('./components/ForgotPassword'));
const Dashboard = React.lazy(() => import('./components/Dashboard'));
const AdminDashboard = React.lazy(() => import('./components/AdminDashboard'));
const Blogs = React.lazy(() => import('./components/Blogs'));
const GoldenScreener = React.lazy(() => import('./components/GoldenScreener'));

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
    <div className="min-h-[100dvh] w-full overflow-x-hidden flex flex-col bg-white text-on-surface pb-16 md:pb-0">
      <Navbar 
        currentTab={currentTab} 
        setTab={setTab} 
        onSearchStock={handleSelectStock} 
      />
      <TopTicker />
      <div className="order-3 flex-1 flex flex-col relative">
        <Suspense fallback={<div className="flex-1 flex items-center justify-center p-8"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div></div>}>
          {currentTab === 'home' && (
            <div className="flex-1 flex flex-col">
              <Home setTab={setTab} onSelectStock={handleSelectStock} />
            </div>
          )}
          {currentTab === 'markets' && (
            <div className="flex-1 flex flex-col">
              <Markets onSelectStock={handleSelectStock} />
            </div>
          )}
          {currentTab === 'quote' && (
            <div className="flex-1 flex flex-col">
              <QuoteDetail key={selectedSymbol} symbol={selectedSymbol} />
            </div>
          )}
          {currentTab === 'blogs' && (
            <div className="flex-1 flex flex-col">
              <Blogs />
            </div>
          )}
          {currentTab === 'dashboard' && (
            <div className="flex-1 flex flex-col">
              <Dashboard setTab={setTab} onSelectStock={handleSelectStock} />
            </div>
          )}
          {currentTab === 'screener' && (
            <div className="flex-1 flex flex-col">
              <GoldenScreener onSelectStock={handleSelectStock} />
            </div>
          )}
          {currentTab === 'admin' && (
            <div className="flex-1 flex flex-col">
              <AdminDashboard setTab={setTab} />
            </div>
          )}
          {['login', 'signup', 'forgot_password'].includes(currentTab) && (
            <div className="flex-1 flex flex-col">
              {currentTab === 'login' && <Login setTab={setTab} />}
              {currentTab === 'signup' && <SignUp setTab={setTab} />}
              {currentTab === 'forgot_password' && <ForgotPassword setTab={setTab} />}
            </div>
          )}
        </Suspense>
      </div>
      {currentTab !== 'home' && <Footer setTab={setTab} />}
      <BottomNav currentTab={currentTab} setTab={setTab} />
      <ScrollToTopButton />
    </div>
  );
}

export default App;
