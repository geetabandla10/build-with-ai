import React from 'react';
import { NavLink } from 'react-router-dom';
import { Layout, Bookmark, Youtube, Search, FileText, Menu, X } from 'lucide-react';
import './Sidebar.css';

import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ isMobileOpen, isDesktopCollapsed, setIsMobileOpen }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { name: 'Notes Saver', path: '/notes', icon: <Bookmark size={20} /> },
    { name: 'YouTube Summariser', path: '/youtube', icon: <Youtube size={20} /> },
    { name: 'Job Search', path: '/jobs', icon: <Search size={20} /> },
    { name: 'Resume Maker', path: '/resume', icon: <FileText size={20} /> },
  ];

  return (
    <>
      <div className={`sidebar glass ${isMobileOpen ? 'mobile-open' : ''} ${isDesktopCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <Layout className="logo-icon" size={28} />
          {!isDesktopCollapsed && <h1 className="gradient-text">AI Suite</h1>}
        </div>
        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => {
                if (window.innerWidth < 1024) {
                   setIsMobileOpen(false);
                }
              }}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              title={isDesktopCollapsed ? item.name : undefined}
            >
              <span className="icon">{item.icon}</span>
              {!isDesktopCollapsed && <span className="name">{item.name}</span>}
            </NavLink>
          ))}
        </nav>

        {user && (
          <div className="sidebar-footer">
            <div className="user-profile">
              <img src={user.picture} alt={user.name} className="user-avatar" />
              {!isDesktopCollapsed && (
                <div className="user-info">
                  <span className="user-name">{user.name}</span>
                  <span className="user-email">{user.email}</span>
                </div>
              )}
            </div>
            {!isDesktopCollapsed ? (
              <button className="logout-btn" onClick={handleLogout}>
                Logout
              </button>
            ) : (
              <button className="logout-btn collapsed" onClick={handleLogout} title="Logout">
                <span className="icon">⎋</span>
              </button>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default Sidebar;
