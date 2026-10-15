import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import History from './pages/History';
import Settings from './pages/Settings';
import { MOCK_PLAYLISTS, MOCK_BACKUP } from './mockData';

function App() {
  const [accessToken, setAccessToken] = useState(null);
  const [isDemo, setIsDemo] = useState(false);
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [progress, setProgress] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [fetchTrigger, setFetchTrigger] = useState(0);
  const [theme, setTheme] = useState(
    localStorage.getItem('theme') || 'system'
  );
  
  const [modalConfig, setModalConfig] = useState(null);

  const triggerModal = (config) => {
    setModalConfig(config);
  };

  const refetchPlaylists = () => {
    setFetchTrigger(prev => prev + 1);
  };

  const activateDemoMode = () => {
    setIsDemo(true);
    setAccessToken('demo-token');
    setPlaylists(MOCK_PLAYLISTS);
    localStorage.setItem('demoMode', 'true');
    if (!localStorage.getItem('lastSortBackup')) {
      localStorage.setItem('lastSortBackup', JSON.stringify(MOCK_BACKUP));
    }
  };

  const handleLogout = () => {
    setAccessToken(null);
    setIsDemo(false);
    localStorage.removeItem('demoMode');
    setPlaylists([]);
  };

  useEffect(() => {
    const isDemoRequested = new URLSearchParams(window.location.search).get('demo') === 'true' || localStorage.getItem('demoMode') === 'true';
    if (isDemoRequested) {
      activateDemoMode();
    }
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const applyTheme = () => {
      if (theme === 'light') {
        document.body.classList.add('light-theme');
      } else if (theme === 'dark') {
        document.body.classList.remove('light-theme');
      } else {
        if (mediaQuery.matches) {
          document.body.classList.remove('light-theme');
        } else {
          document.body.classList.add('light-theme');
        }
      }
    };

    applyTheme();
    localStorage.setItem('theme', theme);

    const handleSystemChange = () => {
      if (theme === 'system') {
        applyTheme();
      }
    };

    mediaQuery.addEventListener('change', handleSystemChange);
    return () => mediaQuery.removeEventListener('change', handleSystemChange);
  }, [theme]);

  // Fetch Playlists (Mocked if simulatorMode is active)
  useEffect(() => {
    if (!accessToken) {
      setPlaylists([]);
      return;
    }

    if (accessToken === 'demo-token') {
      setPlaylists(MOCK_PLAYLISTS);
      return;
    }

    const fetchPlaylists = async () => {
      setLoading(true);
      try {
        // Live API Fetch
        let allPlaylists = [];
        let pageToken = '';
        do {
          const response = await fetch(
            `https://www.googleapis.com/youtube/v3/playlists?part=snippet,contentDetails&mine=true&maxResults=50${pageToken ? '&pageToken=' + pageToken : ''}`,
            { headers: { Authorization: `Bearer ${accessToken}`, Accept: 'application/json' } }
          );
          const data = await response.json();
          if (data.items) allPlaylists = [...allPlaylists, ...data.items];
          pageToken = data.nextPageToken;
        } while (pageToken);

        const savedProtectedIds = JSON.parse(localStorage.getItem('protectedPlaylistIds')) || [];

        const formatted = allPlaylists.map(item => {
          const title = item.snippet.title;
          const description = item.snippet.description || '';
          const shouldIgnore = savedProtectedIds.includes(item.id);

          return {
            id: item.id,
            title: title,
            description: description,
            videos: item.contentDetails.itemCount,
            thumbnail: item.snippet.thumbnails?.medium?.url || '',
            ignore: shouldIgnore,
            publishedAt: item.snippet.publishedAt || ''
          };
        });
        setPlaylists(formatted);
      } catch (error) {
        console.error("Error fetching playlists:", error);
      }
      setLoading(false);
    };
    fetchPlaylists();
  }, [accessToken, fetchTrigger]);

  // Persist protected playlist IDs to localStorage
  useEffect(() => {
    if (playlists.length > 0) {
      const protectedIds = playlists.filter(p => p.ignore).map(p => p.id);
      localStorage.setItem('protectedPlaylistIds', JSON.stringify(protectedIds));
    }
  }, [playlists]);

  return (
    <div className="app-container">

      {/* Dynamic Unified Modal Backdrop */}
      {modalConfig && (
        <div className="modal-backdrop" onClick={() => { if (modalConfig.type !== 'prompt') setModalConfig(null); }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginBottom: '12px', color: 'var(--yt-spec-text-primary)' }}>{modalConfig.title}</h3>
            {modalConfig.message && (
              <p style={{ fontSize: '14px', color: 'var(--yt-spec-text-secondary)', marginBottom: '20px', lineHeight: '1.5', whiteSpace: 'pre-line' }}>
                {modalConfig.message}
              </p>
            )}
            
            {modalConfig.type === 'prompt' && (
              <input 
                type="text" 
                className="search-input" 
                placeholder={modalConfig.placeholder || ""}
                defaultValue={modalConfig.defaultValue || ""}
                id="modal-prompt-input"
                style={{ width: '100%', marginBottom: '20px', borderRadius: '4px', height: '36px' }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const currentConfig = modalConfig;
                    const val = document.getElementById('modal-prompt-input')?.value;
                    setModalConfig(null);
                    if (currentConfig.onConfirm) currentConfig.onConfirm(val);
                  }
                }}
              />
            )}
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              {modalConfig.type !== 'alert' && (
                <button 
                  className="btn-primary" 
                  style={{ backgroundColor: '#555' }}
                  onClick={() => {
                    const currentConfig = modalConfig;
                    setModalConfig(null);
                    if (currentConfig.onCancel) currentConfig.onCancel();
                  }}
                >
                  Cancel
                </button>
              )}
              <button 
                className="btn-primary"
                onClick={() => {
                  const currentConfig = modalConfig;
                  const val = currentConfig.type === 'prompt' 
                    ? document.getElementById('modal-prompt-input')?.value 
                    : null;
                  setModalConfig(null);
                  if (currentConfig.type === 'prompt') {
                    if (currentConfig.onConfirm) currentConfig.onConfirm(val);
                  } else {
                    if (currentConfig.onConfirm) currentConfig.onConfirm();
                  }
                }}
              >
                {modalConfig.confirmText || "OK"}
              </button>
            </div>
          </div>
        </div>
      )}

      <Header 
        onLogin={setAccessToken} 
        isLoggedIn={!!accessToken} 
        onLogout={handleLogout}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        isDemo={isDemo}
        onExploreDemo={activateDemoMode}
      />
      {(loading || isExecuting) && (
        <div className="loading-bar-container">
          <div className="loading-bar-active"></div>
        </div>
      )}
      <div className="main-layout">
        <Sidebar isLoggedIn={!!accessToken} />
        <main className="content-area">
          <Routes>
            <Route path="/" element={
              <Dashboard 
                accessToken={accessToken} 
                playlists={playlists}
                setPlaylists={setPlaylists}
                loading={loading}
                isExecuting={isExecuting}
                setIsExecuting={setIsExecuting}
                progress={progress}
                setProgress={setProgress}
                triggerModal={triggerModal}
                searchQuery={searchQuery}
                refetchPlaylists={refetchPlaylists}
              />
            } />
            <Route path="/history" element={
              accessToken ? (
                <History 
                  accessToken={accessToken} 
                  triggerModal={triggerModal} 
                  refetchPlaylists={refetchPlaylists} 
                  isExecuting={isExecuting}
                  setIsExecuting={setIsExecuting}
                  progress={progress}
                  setProgress={setProgress}
                />
              ) : <Navigate to="/" />
            } />
            <Route path="/settings" element={
              accessToken ? (
                <Settings 
                  theme={theme} 
                  setTheme={setTheme} 
                  accessToken={accessToken}
                  playlists={playlists}
                  setPlaylists={setPlaylists}
                  isExecuting={isExecuting}
                  setIsExecuting={setIsExecuting}
                  progress={progress}
                  setProgress={setProgress}
                  triggerModal={triggerModal}
                />
              ) : <Navigate to="/" />
            } />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default App;
