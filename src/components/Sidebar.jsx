import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, History as HistoryIcon, Settings as SettingsIcon } from 'lucide-react';

export default function Sidebar({ isLoggedIn }) {
  const location = useLocation();
  const isActive = (path) => location.pathname === path ? ' active' : '';

  return (
    <aside className="sidebar">
      <Link to="/" className={`sidebar-item${isActive('/')}`}>
        <Home size={20} />
        <span>Dashboard</span>
      </Link>
      
      {isLoggedIn && (
        <>
          <div style={{ margin: '12px 0', borderBottom: '1px solid var(--yt-spec-border-color)' }}></div>
          <Link to="/history" className={`sidebar-item${isActive('/history')}`}>
            <HistoryIcon size={20} />
            <span>History (Backup)</span>
          </Link>
          <Link to="/settings" className={`sidebar-item${isActive('/settings')}`}>
            <SettingsIcon size={20} />
            <span>Settings</span>
          </Link>
        </>
      )}
    </aside>
  );
}
