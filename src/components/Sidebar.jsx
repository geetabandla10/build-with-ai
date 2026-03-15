import React from 'react';
import { NavLink } from 'react-router-dom';
import { Layout, Bookmark, Youtube, Search, FileText, Menu, X } from 'lucide-react';
import './Sidebar.css';

import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const [isOpen, setIsOpen] = React.useState(true);
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
      <button className="sidebar-toggle" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>
      <div className={`sidebar glass ${isOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <Layout className="logo-icon" size={28} />
          <h1 className="gradient-text">AI Suite</h1>
        </div>
        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <span className="icon">{item.icon}</span>
              <span className="name">{item.name}</span>
            </NavLink>
          ))}
        </nav>

        {user && (
          <div className="sidebar-footer">
            <div className="user-profile">
              <img src={user.picture} alt={user.name} className="user-avatar" />
              <div className="user-info">
                <span className="user-name">{user.name}</span>
                <span className="user-email">{user.email}</span>
              </div>
            </div>
            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default Sidebar;
