import React, { useState } from 'react';
import { Search, Video, User, LogOut } from 'lucide-react';

export default function Header({ onLogin, isLoggedIn, onLogout, searchQuery, setSearchQuery }) {
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogin = () => {
    const client = window.google.accounts.oauth2.initTokenClient({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
      scope: 'https://www.googleapis.com/auth/youtube https://www.googleapis.com/auth/youtube.readonly',
      callback: (response) => {
        if (response && response.access_token) {
          onLogin(response.access_token);
        }
      },
    });
    client.requestAccessToken();
  };

  const triggerLogout = () => {
    onLogout();
    setShowDropdown(false);
  };

  return (
    <header className="header">
      <div className="header-left">
        <div className="logo-container" style={{ marginLeft: '12px' }}>
          <Video size={28} color="var(--yt-spec-brand-button-background)" fill="var(--yt-spec-brand-button-background)" />
          <span>YT Playlist Organizer</span>
        </div>
      </div>
      
      {isLoggedIn && (
        <div className="search-container">
          <input 
            type="text" 
            className="search-input" 
            placeholder="Search playlists..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button className="search-button">
            <Search size={20} />
          </button>
        </div>
      )}

      <div className="header-right">
        {!isLoggedIn ? (
          <button className="btn-primary" onClick={handleLogin}>Sign in with Google</button>
        ) : (
          <div style={{ position: 'relative' }}>
            <button 
              onClick={() => setShowDropdown(!showDropdown)} 
              style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#4caf50', fontWeight: 'bold' }}
            >
              <span>Connected</span>
              <User size={24} color="#4caf50"/>
            </button>
            
            {showDropdown && (
              <div className="dropdown-menu">
                <button className="dropdown-item" onClick={triggerLogout} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#cc0000' }}>
                  <LogOut size={16} />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
