import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import MetaMaskConnect from '../components/MetaMaskConnect';
import NFTAnalytics from '../components/NFTAnalytics';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = user?.email?.charAt(0).toUpperCase() || '?';

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-brand">
          <span className="header-logo">🔮</span>
          <h1>NFT Analytics</h1>
          <div className="live-badge">
            <span className="live-dot" />
            Live
          </div>
        </div>
        <div className="header-right">
          <div className="user-badge">
            <div className="user-avatar">{initials}</div>
            <span className="user-email">{user?.email}</span>
          </div>
          <button className="logout-button" onClick={handleLogout}>
            Sign Out
          </button>
        </div>
      </header>
      <main className="dashboard-main">
        <div className="dashboard-grid">
          <div className="dashboard-section">
            <NFTAnalytics />
          </div>
          <div className="dashboard-section">
            <MetaMaskConnect />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
