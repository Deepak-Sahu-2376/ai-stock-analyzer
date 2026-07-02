import React, { useState, useEffect } from 'react';

export default function AdminDashboard({ setTab }) {
  const [activeAdminTab, setActiveAdminTab] = useState('ai');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState('');

  // Tab Data States
  const [aiSettings, setAiSettings] = useState({
    provider: 'gemini',
    gemini_key: '',
    ollama_url: 'http://localhost:11434',
    ollama_model: 'gpt-oss:20b-cloud'
  });
  const [aiStats, setAiStats] = useState([]);
  
  const [appSettings, setAppSettings] = useState({
    maintenance_mode: false,
    alerts_interval_min: 1,
    announcements_interval_min: 5,
    corp_action_interval_min: 10,
    summarize_all_announcements: false
  });

  const [users, setUsers] = useState([]);
  const [analytics, setAnalytics] = useState({
    aiSummaries: 0,
    activeAlerts: 0,
    topWishlisted: []
  });
  const [workerStatus, setWorkerStatus] = useState(null);

  const [broadcastData, setBroadcastData] = useState({ title: '', body: '' });

  useEffect(() => {
    fetchData(activeAdminTab);
    
    // Auto-refresh analytics and users every 10 seconds
    const interval = setInterval(() => {
      if (activeAdminTab === 'analytics' || activeAdminTab === 'users' || activeAdminTab === 'ai') {
        fetchData(activeAdminTab, true);
      }
    }, 10000);
    
    return () => clearInterval(interval);
  }, [activeAdminTab]);

  const authFetch = async (url, options = {}) => {
    const token = localStorage.getItem('token');
    if (!token) {
      setTab('login');
      throw new Error('Not logged in');
    }
    const headers = { 'Authorization': `Bearer ${token}`, ...options.headers };
    const res = await fetch(url, { ...options, headers });
    if (res.status === 401 || res.status === 403) {
      throw new Error('Unauthorized: Admin access required');
    }
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      throw new Error(d.error || 'Request failed');
    }
    return res.json();
  };

  const fetchData = async (tabName, silent = false) => {
    if (!silent) setLoading(true);
    if (!silent) setError(null);
    try {
      if (tabName === 'ai') {
        const data = await authFetch('/api/admin/settings');
        setAiSettings(data);
        const statsData = await authFetch('/api/admin/ai-stats');
        setAiStats(statsData);
      } else if (tabName === 'settings') {
        const data = await authFetch('/api/admin/app-settings');
        setAppSettings(data);
      } else if (tabName === 'users') {
        const data = await authFetch('/api/admin/users');
        setUsers(data);
      } else if (tabName === 'analytics') {
        const statData = await authFetch('/api/admin/analytics');
        const workerData = await authFetch('/api/admin/system/status');
        setAnalytics(statData);
        setWorkerStatus(workerData);
      }
    } catch (err) {
      if (err.message.includes('Unauthorized')) {
        setError(err.message);
      }
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const handleTestAI = async () => {
    try {
      showSuccess('Testing connection...');
      const data = await authFetch('/api/admin/ai/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(aiSettings)
      });
      showSuccess(`Success! AI replied: "${data.response}"`);
    } catch (err) { 
      setError(`Test Failed: ${err.message}`); 
    }
  };

  const handleSaveAI = async (e) => {
    e.preventDefault();
    try {
      await authFetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(aiSettings)
      });
      showSuccess('AI Settings saved');
    } catch (err) { setError(err.message); }
  };

  const handleSaveAppSettings = async (e) => {
    e.preventDefault();
    try {
      await authFetch('/api/admin/app-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(appSettings)
      });
      showSuccess('App Settings saved');
    } catch (err) { setError(err.message); }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await authFetch(`/api/admin/users/${userId}/role`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole })
      });
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
      showSuccess('User role updated');
    } catch (err) { setError(err.message); }
  };

  const handleBroadcast = async (e) => {
    e.preventDefault();
    try {
      await authFetch('/api/admin/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(broadcastData)
      });
      showSuccess('Broadcast sent successfully');
      setBroadcastData({ title: '', body: '' });
    } catch (err) { setError(err.message); }
  };

  const showSuccess = (msg) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(''), 3000);
  };

  if (error && error.includes('Unauthorized')) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#f8f9fa] pt-16 p-4">
        <div className="bg-white border border-gray-200 p-8 rounded shadow-sm max-w-sm w-full text-center">
          <span className="material-icons text-4xl text-gray-400 mb-3 block">lock</span>
          <h2 className="text-lg text-gray-800 font-medium mb-2">Access Denied</h2>
          <p className="text-sm text-gray-500 mb-6">{error}</p>
          <button onClick={() => setTab('home')} className="w-full bg-[#4184f3] hover:bg-[#3266c1] text-white py-2 px-4 rounded text-sm transition-colors">
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const renderSidebar = () => {
    const tabs = [
      { id: 'ai', label: 'AI Configuration', icon: 'smart_toy' },
      { id: 'settings', label: 'App Settings', icon: 'settings' },
      { id: 'users', label: 'Users', icon: 'people' },
      { id: 'analytics', label: 'Analytics', icon: 'insights' },
      { id: 'broadcast', label: 'Broadcast', icon: 'campaign' }
    ];
    return (
      <div className="w-full flex-shrink-0 flex flex-col gap-1 md:mr-6 mb-6 md:mb-0 md:sticky md:top-[100px]" style={{ maxWidth: window.innerWidth >= 768 ? '200px' : '100%' }}>
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveAdminTab(t.id)}
            className={`flex-shrink-0 flex items-center gap-2 px-3 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${activeAdminTab === t.id ? 'bg-[#f1f1f1] text-on-surface border-l-4 border-[#4184f3]' : 'bg-transparent text-on-surface-variant hover:bg-[#f9f9f9]'}`}
          >
            <span className="material-icons text-[16px]">{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="flex-1 bg-background pt-[72px] px-4 sm:px-6 pb-20 font-sans">
      <div className="max-w-5xl mx-auto mt-4">
        <h1 className="text-xl text-on-surface font-bold mb-6">Admin Panel</h1>
        
        <div className="flex flex-col md:flex-row items-start">
          {renderSidebar()}
          <div className="flex-1 w-full bg-white border-b-[8px] border-[#f1f1f1] relative min-h-[500px]">
          {loading && (
            <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
              <div className="animate-spin h-6 w-6 border-2 border-gray-300 border-t-[#4184f3] rounded-full"></div>
            </div>
          )}

          <div className="px-4 sm:px-6 py-4 border-b border-border-subtle flex justify-between items-center">
            <h2 className="font-bold text-xs uppercase tracking-wider text-on-surface-variant">
              {activeAdminTab === 'ai' ? 'AI Configuration' : activeAdminTab === 'settings' ? 'Application Settings' : activeAdminTab}
            </h2>
            {success && (
              <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded flex items-center gap-1 animate-fade-in">
                <span className="material-icons text-[14px]">check_circle</span>
                {success}
              </span>
            )}
          </div>

          <div className="p-4 sm:p-6">
            {error && !error.includes('Unauthorized') && (
              <div className="mb-6 p-3 bg-red-50 border border-red-100 text-red-600 rounded text-sm flex items-start gap-2">
                <span className="material-icons text-[18px] mt-0.5">error_outline</span>
                <span>{error}</span>
              </div>
            )}

            {/* AI CONFIGURATION TAB */}
            {activeAdminTab === 'ai' && (
              <form onSubmit={handleSaveAI} className="space-y-6">
                
                {/* Top Section: Provider Selection */}
                <div className="mb-6">
                  <h3 className="text-[10px] text-on-surface-variant/80 uppercase tracking-wide mb-3">Active AI Provider</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Gemini Option */}
                    <label className={`flex items-center space-x-4 p-4 border rounded-lg cursor-pointer transition-all ${aiSettings.provider === 'gemini' ? 'border-[#4184f3] bg-blue-50/50 shadow-sm' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
                      <div className="relative inline-flex items-center">
                        <input 
                          type="radio" 
                          name="ai_provider"
                          className="sr-only peer" 
                          checked={aiSettings.provider === 'gemini'}
                          onChange={() => setAiSettings({...aiSettings, provider: 'gemini'})}
                        />
                        <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#4184f3]"></div>
                      </div>
                      <div>
                        <span className={`flex items-center gap-1.5 text-sm font-bold ${aiSettings.provider === 'gemini' ? 'text-blue-900' : 'text-gray-800'}`}>
                          Google Gemini 
                          <span className="material-icons text-[14px] text-gray-400 cursor-help" title="Uses Google's Gemini models for all requests. Fastest option.">help_outline</span>
                        </span>
                        <span className="block text-xs text-gray-500 mt-0.5">Use Gemini strictly for all generation.</span>
                      </div>
                    </label>

                    {/* Ollama Option */}
                    <label className={`flex items-center space-x-4 p-4 border rounded-lg cursor-pointer transition-all ${aiSettings.provider === 'ollama' ? 'border-[#4184f3] bg-blue-50/50 shadow-sm' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
                      <div className="relative inline-flex items-center">
                        <input 
                          type="radio" 
                          name="ai_provider"
                          className="sr-only peer" 
                          checked={aiSettings.provider === 'ollama'}
                          onChange={() => setAiSettings({...aiSettings, provider: 'ollama'})}
                        />
                        <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#4184f3]"></div>
                      </div>
                      <div>
                        <span className={`flex items-center gap-1.5 text-sm font-bold ${aiSettings.provider === 'ollama' ? 'text-blue-900' : 'text-gray-800'}`}>
                          Ollama Only
                          <span className="material-icons text-[14px] text-gray-400 cursor-help" title="Sends all requests to your local Ollama server. Completely private and free.">help_outline</span>
                        </span>
                        <span className="block text-xs text-gray-500 mt-0.5">Run strictly on the first available Ollama URL.</span>
                      </div>
                    </label>

                    {/* Ollama Round Robin Option */}
                    <label className={`flex items-center space-x-4 p-4 border rounded-lg cursor-pointer transition-all ${aiSettings.provider === 'ollama_round_robin' ? 'border-[#4184f3] bg-blue-50/50 shadow-sm' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
                      <div className="relative inline-flex items-center">
                        <input 
                          type="radio" 
                          name="ai_provider"
                          className="sr-only peer" 
                          checked={aiSettings.provider === 'ollama_round_robin'}
                          onChange={() => setAiSettings({...aiSettings, provider: 'ollama_round_robin'})}
                        />
                        <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#4184f3]"></div>
                      </div>
                      <div>
                        <span className={`flex items-center gap-1.5 text-sm font-bold ${aiSettings.provider === 'ollama_round_robin' ? 'text-blue-900' : 'text-gray-800'}`}>
                          Ollama Round Robin
                          <span className="material-icons text-[14px] text-gray-400 cursor-help" title="Balances requests evenly across multiple local Ollama instances to increase throughput.">help_outline</span>
                        </span>
                        <span className="block text-xs text-gray-500 mt-0.5">Distribute load sequentially across Ollama instances.</span>
                      </div>
                    </label>

                    {/* Gemini + Ollama Round Robin Option */}
                    <label className={`flex items-center space-x-4 p-4 border rounded-lg cursor-pointer transition-all ${aiSettings.provider === 'gemini_ollama_round_robin' ? 'border-[#4184f3] bg-blue-50/50 shadow-sm' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
                      <div className="relative inline-flex items-center">
                        <input 
                          type="radio" 
                          name="ai_provider"
                          className="sr-only peer" 
                          checked={aiSettings.provider === 'gemini_ollama_round_robin'}
                          onChange={() => setAiSettings({...aiSettings, provider: 'gemini_ollama_round_robin'})}
                        />
                        <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#4184f3]"></div>
                      </div>
                      <div>
                        <span className={`flex items-center gap-1.5 text-sm font-bold ${aiSettings.provider === 'gemini_ollama_round_robin' ? 'text-blue-900' : 'text-gray-800'}`}>
                          Gemini + Ollama RR
                          <span className="material-icons text-[14px] text-gray-400 cursor-help" title="Uses Gemini first, then falls back to multiple Ollama instances in sequence. Maximum reliability.">help_outline</span>
                        </span>
                        <span className="block text-xs text-gray-500 mt-0.5">Distribute load sequentially across Gemini AND Ollama.</span>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Bottom Section: Configuration Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  
                  {/* Gemini Configuration Card */}
                  <div className={`border rounded p-5 transition-opacity duration-300 ${['gemini', 'gemini_ollama_round_robin'].includes(aiSettings.provider) ? 'border-blue-200 bg-white shadow-sm' : 'border-gray-200 bg-gray-50 opacity-60 grayscale'}`}>
                    <div className="flex items-center gap-2 mb-4">
                      <span className="material-icons text-blue-500">api</span>
                      <h3 className="font-bold text-xs uppercase tracking-wider text-on-surface-variant mb-4 border-b border-border-subtle pb-2">Gemini Configuration</h3>
                    </div>
                    
                    <div className="space-y-4">
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">API Keys</label>
                      
                      <div className="space-y-2 max-h-48 overflow-y-auto pr-1 hide-scrollbar">
                        {(aiSettings.gemini_keys || []).map((key, idx) => (
                          <div key={idx} className={`flex items-center justify-between p-3 border rounded transition-colors ${aiSettings.active_gemini_key === key ? 'border-blue-300 bg-blue-50' : 'border-gray-200 bg-white'}`}>
                            <label className="flex items-center space-x-3 cursor-pointer flex-1 min-w-0">
                              <input 
                                type="radio" 
                                name="active_gemini_key"
                                className="form-radio h-4 w-4 text-[#4184f3] flex-shrink-0"
                                checked={aiSettings.active_gemini_key === key}
                                onChange={() => ['gemini', 'gemini_ollama_round_robin'].includes(aiSettings.provider) && setAiSettings({...aiSettings, active_gemini_key: key})}
                                disabled={!['gemini', 'gemini_ollama_round_robin'].includes(aiSettings.provider)}
                              />
                              <span className="text-sm font-mono text-gray-700 truncate w-full">{key.substring(0, 15)}••••••••••••••••</span>
                            </label>
                            <button type="button" disabled={!['gemini', 'gemini_ollama_round_robin'].includes(aiSettings.provider)} onClick={() => setAiSettings({...aiSettings, gemini_keys: aiSettings.gemini_keys.filter(k => k !== key), active_gemini_key: aiSettings.active_gemini_key === key ? '' : aiSettings.active_gemini_key})} className="flex-shrink-0 ml-2 text-red-400 hover:text-red-600 disabled:opacity-50">
                              <span className="material-icons text-[18px]">delete</span>
                            </button>
                          </div>
                        ))}
                        {(!aiSettings.gemini_keys || aiSettings.gemini_keys.length === 0) && (
                          <div className="p-4 border border-dashed border-gray-300 rounded text-center text-sm text-gray-500">No API keys added.</div>
                        )}
                      </div>
                      
                      <div className="flex space-x-2 pt-2 border-t border-gray-100">
                        <input 
                          type="text" 
                          id="newGeminiKey"
                          placeholder="Paste new Gemini API Key..." 
                          className="flex-1 min-w-0 border border-gray-300 rounded px-3 py-1.5 text-xs focus:border-[#4184f3] focus:outline-none disabled:bg-gray-100" 
                          disabled={!['gemini', 'gemini_ollama_round_robin'].includes(aiSettings.provider)}
                        />
                        <button type="button" disabled={!['gemini', 'gemini_ollama_round_robin'].includes(aiSettings.provider)} onClick={() => {
                          const val = document.getElementById('newGeminiKey').value.trim();
                          if (val && !(aiSettings.gemini_keys || []).includes(val)) {
                            setAiSettings({
                              ...aiSettings, 
                              gemini_keys: [...(aiSettings.gemini_keys || []), val],
                              active_gemini_key: aiSettings.active_gemini_key || val
                            });
                            document.getElementById('newGeminiKey').value = '';
                          }
                        }} className="flex-shrink-0 bg-gray-800 hover:bg-black text-white py-2 px-4 rounded text-sm font-medium transition-colors disabled:bg-gray-400 disabled:text-gray-200">Add Key</button>
                      </div>
                    </div>
                  </div>

                  {/* Ollama Configuration Card */}
                  <div className={`border rounded p-5 transition-opacity duration-300 ${['ollama', 'ollama_round_robin', 'gemini_ollama_round_robin'].includes(aiSettings.provider) ? 'border-blue-200 bg-white shadow-sm' : 'border-gray-200 bg-gray-50 opacity-60 grayscale'}`}>
                    <div className="flex items-center gap-2 mb-4">
                      <span className="material-icons text-purple-600">dns</span>
                      <h3 className="font-bold text-xs uppercase tracking-wider text-on-surface-variant mb-4 border-b border-border-subtle pb-2">Ollama Configuration</h3>
                    </div>
                    
                    <div className="space-y-5">
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Ollama Base URL(s) - Comma Separated for Load Balancing</label>
                        <input type="text" value={aiSettings.ollama_url || ''} disabled={!['ollama', 'ollama_round_robin', 'gemini_ollama_round_robin'].includes(aiSettings.provider)} onChange={e => setAiSettings({...aiSettings, ollama_url: e.target.value})} placeholder="e.g. http://localhost:11434, http://localhost:11435" className="w-full border border-gray-300 rounded px-3 py-1.5 text-xs focus:border-[#4184f3] focus:outline-none disabled:bg-gray-100" />
                      </div>
                      
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Available Models</label>
                        
                        <div className="space-y-2 max-h-48 overflow-y-auto pr-1 hide-scrollbar">
                          {(aiSettings.ollama_models || []).map((model, idx) => (
                            <div key={idx} className={`flex items-center justify-between p-3 border rounded transition-colors ${aiSettings.active_ollama_model === model ? 'border-blue-300 bg-blue-50' : 'border-gray-200 bg-white'}`}>
                              <label className="flex items-center space-x-3 cursor-pointer flex-1 min-w-0">
                                <input 
                                  type="radio" 
                                  name="active_ollama_model"
                                  className="form-radio h-4 w-4 text-[#4184f3] flex-shrink-0"
                                  checked={aiSettings.active_ollama_model === model}
                                  onChange={() => ['ollama', 'ollama_round_robin', 'gemini_ollama_round_robin'].includes(aiSettings.provider) && setAiSettings({...aiSettings, active_ollama_model: model})}
                                  disabled={!['ollama', 'ollama_round_robin', 'gemini_ollama_round_robin'].includes(aiSettings.provider)}
                                />
                                <span className="text-sm font-medium text-gray-800 truncate w-full">{model}</span>
                              </label>
                              <button type="button" disabled={aiSettings.provider !== 'ollama'} onClick={() => setAiSettings({...aiSettings, ollama_models: aiSettings.ollama_models.filter(m => m !== model), active_ollama_model: aiSettings.active_ollama_model === model ? '' : aiSettings.active_ollama_model})} className="flex-shrink-0 ml-2 text-red-400 hover:text-red-600 disabled:opacity-50">
                                <span className="material-icons text-[18px]">delete</span>
                              </button>
                            </div>
                          ))}
                          {(!aiSettings.ollama_models || aiSettings.ollama_models.length === 0) && (
                            <div className="p-4 border border-dashed border-gray-300 rounded text-center text-sm text-gray-500">No models added.</div>
                          )}
                        </div>
                        
                        <div className="flex space-x-2 pt-3 mt-1 border-t border-gray-100">
                          <input 
                            type="text" 
                            id="newOllamaModel"
                            placeholder="e.g. llama3:8b" 
                            className="flex-1 min-w-0 border border-gray-300 rounded px-3 py-1.5 text-xs focus:border-[#4184f3] focus:outline-none disabled:bg-gray-100" 
                            disabled={aiSettings.provider !== 'ollama'}
                          />
                          <button type="button" disabled={aiSettings.provider !== 'ollama'} onClick={() => {
                            const val = document.getElementById('newOllamaModel').value.trim();
                            if (val && !(aiSettings.ollama_models || []).includes(val)) {
                              setAiSettings({
                                ...aiSettings, 
                                ollama_models: [...(aiSettings.ollama_models || []), val],
                                active_ollama_model: aiSettings.active_ollama_model || val
                              });
                              document.getElementById('newOllamaModel').value = '';
                            }
                          }} className="flex-shrink-0 bg-gray-800 hover:bg-black text-white py-2 px-4 rounded text-sm font-medium transition-colors disabled:bg-gray-400 disabled:text-gray-200">Add Model</button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Live AI Usage Tracker */}
                  <div className="mt-8 border border-green-200 bg-green-50 rounded-lg p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="material-icons text-green-600">bar_chart</span>
                      <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide">Live AI Usage Tracker</h3>
                      <button type="button" onClick={() => fetchData('ai', true)} className="ml-auto text-xs font-semibold text-green-700 bg-green-200 hover:bg-green-300 px-3 py-1.5 rounded transition-colors">
                        Refresh Stats
                      </button>
                    </div>
                    
                    {(!aiStats || aiStats.length === 0) ? (
                      <div className="text-sm text-gray-500 italic bg-white/50 p-4 rounded text-center border border-dashed border-green-200">No usage stats recorded yet.</div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {aiStats.map((stat, idx) => (
                          <div key={idx} className="bg-white border border-green-200 rounded p-4 shadow-sm flex items-center justify-between transition-transform hover:-translate-y-1 hover:shadow-md duration-200">
                            <div className="flex flex-col min-w-0 mr-4">
                              <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">Endpoint</span>
                              <span className="text-sm font-mono text-gray-800 truncate" title={stat.endpoint}>{stat.endpoint}</span>
                            </div>
                            <div className="flex flex-col items-end flex-shrink-0">
                              <span className="text-2xl font-bold text-green-600 leading-none">{stat.success_count}</span>
                              <span className="text-[10px] text-gray-400 font-medium uppercase mt-1">Requests</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                <div className="pt-4 flex justify-end gap-3 border-t border-gray-100 mt-6 pt-6">
                  <button type="button" onClick={handleTestAI} className="flex-shrink-0 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 py-2.5 px-6 rounded shadow-sm text-sm font-bold tracking-wide transition-colors">
                    Test Connection
                  </button>
                  <button type="submit" className="flex-shrink-0 bg-[#4184f3] hover:bg-blue-600 text-white py-2.5 px-8 rounded shadow-sm text-sm font-bold tracking-wide transition-colors">
                    Save AI Settings
                  </button>
                </div>
              </form>
            )}

            {/* APP SETTINGS TAB */}
            {activeAdminTab === 'settings' && (
              <form onSubmit={handleSaveAppSettings} className="space-y-6 max-w-xl">
                <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded">
                  <div>
                    <h3 className="text-sm font-medium text-gray-800">Maintenance Mode</h3>
                    <p className="text-xs text-gray-500 mt-1">Blocks non-admin users from accessing the API.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={appSettings.maintenance_mode} onChange={(e) => setAppSettings({...appSettings, maintenance_mode: e.target.checked})} />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded">
                  <div>
                    <h3 className="text-sm font-medium text-gray-800">Summarize All Announcements</h3>
                    <p className="text-xs text-gray-500 mt-1">If enabled, AI will summarize ALL corporate announcements, not just those in users' wishlists.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={appSettings.summarize_all_announcements || false} onChange={(e) => setAppSettings({...appSettings, summarize_all_announcements: e.target.checked})} />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#4184f3]"></div>
                  </label>
                </div>
                
                <div>
                  <h3 className="text-xs font-medium text-gray-500 uppercase mb-3">Worker Polling Intervals (Minutes)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Alerts</label>
                      <input type="number" min="1" max="60" value={appSettings.alerts_interval_min} onChange={(e) => setAppSettings({...appSettings, alerts_interval_min: parseInt(e.target.value)})} className="w-full border border-gray-300 rounded px-3 py-1.5 text-xs focus:border-[#4184f3] focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Announcements</label>
                      <input type="number" min="1" max="60" value={appSettings.announcements_interval_min} onChange={(e) => setAppSettings({...appSettings, announcements_interval_min: parseInt(e.target.value)})} className="w-full border border-gray-300 rounded px-3 py-1.5 text-xs focus:border-[#4184f3] focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Corp Actions</label>
                      <input type="number" min="1" max="60" value={appSettings.corp_action_interval_min} onChange={(e) => setAppSettings({...appSettings, corp_action_interval_min: parseInt(e.target.value)})} className="w-full border border-gray-300 rounded px-3 py-1.5 text-xs focus:border-[#4184f3] focus:outline-none" />
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">Intervals determine how often the server checks the NSE. Lower intervals mean faster updates but higher server load.</p>
                </div>

                <button type="submit" className="bg-[#4184f3] text-white py-2 px-6 rounded text-sm font-medium">Save App Settings</button>
              </form>
            )}

            {/* USERS TAB */}
            {activeAdminTab === 'users' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr>
                      <th className="border-b border-gray-200 py-2 px-4 text-xs font-medium text-gray-500 uppercase">ID</th>
                      <th className="border-b border-gray-200 py-2 px-4 text-xs font-medium text-gray-500 uppercase">Name</th>
                      <th className="border-b border-gray-200 py-2 px-4 text-xs font-medium text-gray-500 uppercase">Email</th>
                      <th className="border-b border-gray-200 py-2 px-4 text-xs font-medium text-gray-500 uppercase">Role</th>
                      <th className="border-b border-gray-200 py-2 px-4 text-xs font-medium text-gray-500 uppercase text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u.id} className="hover:bg-gray-50">
                        <td className="py-3 px-4 border-b border-gray-100 text-sm text-gray-800">{u.id}</td>
                        <td className="py-3 px-4 border-b border-gray-100 text-sm text-gray-800">{u.name || '-'}</td>
                        <td className="py-3 px-4 border-b border-gray-100 text-sm text-gray-800">{u.email}</td>
                        <td className="py-3 px-4 border-b border-gray-100 text-sm">
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="py-3 px-4 border-b border-gray-100 text-right">
                          <select 
                            value={u.role}
                            onChange={(e) => handleRoleChange(u.id, e.target.value)}
                            className="text-xs border border-gray-300 rounded px-2 py-1 bg-white focus:outline-none focus:border-[#4184f3]"
                          >
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* ANALYTICS TAB */}
            {activeAdminTab === 'analytics' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 border border-gray-200 p-4 rounded flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase mb-1">AI Summaries Generated</p>
                      <h3 className="text-2xl font-bold text-gray-800">{analytics.aiSummaries}</h3>
                    </div>
                    <span className="material-icons text-blue-500 text-3xl opacity-80">psychology</span>
                  </div>
                  <div className="bg-gray-50 border border-gray-200 p-4 rounded flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase mb-1">Active User Alerts</p>
                      <h3 className="text-2xl font-bold text-gray-800">{analytics.activeAlerts}</h3>
                    </div>
                    <span className="material-icons text-orange-500 text-3xl opacity-80">notifications_active</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-800 mb-3 border-b pb-2">Top Wishlisted Stocks</h3>
                    <div className="border border-gray-200 rounded">
                      {analytics.topWishlisted.map((item, i) => (
                        <div key={i} className={`flex justify-between items-center p-3 text-sm ${i !== analytics.topWishlisted.length - 1 ? 'border-b border-gray-100' : ''}`}>
                          <span className="font-medium text-gray-700">{item.symbol}</span>
                          <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs font-medium">{item.count} users</span>
                        </div>
                      ))}
                      {analytics.topWishlisted.length === 0 && <div className="p-4 text-sm text-gray-500 text-center">No data available</div>}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-800 mb-3 border-b pb-2">Background Workers</h3>
                    <div className="border border-gray-200 rounded overflow-hidden">
                      {workerStatus && Object.keys(workerStatus).map((key, i) => {
                        const worker = workerStatus[key];
                        return (
                          <div key={key} className={`flex justify-between items-center p-3 text-sm ${i !== 2 ? 'border-b border-gray-100' : ''}`}>
                            <div>
                              <span className="font-medium text-gray-700 capitalize block">{key}</span>
                              <span className="text-xs text-gray-500">Last run: {worker.lastRun ? new Date(worker.lastRun).toLocaleTimeString() : 'Never'}</span>
                            </div>
                            <span className={`px-2 py-0.5 rounded text-xs font-medium flex items-center gap-1 ${worker.status === 'running' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                              {worker.status === 'running' && <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>}
                              {worker.status}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* BROADCAST TAB */}
            {activeAdminTab === 'broadcast' && (
              <form onSubmit={handleBroadcast} className="space-y-4 max-w-lg">
                <div className="bg-blue-50 border border-blue-200 p-3 rounded mb-4">
                  <p className="text-sm text-blue-800">
                    <strong>Note:</strong> Sending a broadcast will dispatch a push notification to every user who has enabled them. Use sparingly!
                  </p>
                </div>
                <div>
                  <label className="block text-[10px] text-on-surface-variant/80 uppercase mb-1">Notification Title</label>
                  <input type="text" required value={broadcastData.title} onChange={e => setBroadcastData({...broadcastData, title: e.target.value})} placeholder="e.g. Market Closed Tomorrow" className="w-full border border-gray-300 rounded px-3 py-1.5 text-xs focus:border-[#4184f3] focus:outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] text-on-surface-variant/80 uppercase mb-1">Message Body</label>
                  <textarea required value={broadcastData.body} onChange={e => setBroadcastData({...broadcastData, body: e.target.value})} placeholder="Enter the message to send to all users..." rows={4} className="w-full border border-gray-300 rounded px-3 py-1.5 text-xs focus:border-[#4184f3] focus:outline-none"></textarea>
                </div>
                <button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white py-2 px-6 rounded text-sm font-medium flex items-center gap-2">
                  <span className="material-icons text-[18px]">send</span>
                  Send Broadcast
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}
