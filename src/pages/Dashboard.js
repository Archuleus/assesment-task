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

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>NFT Analytics Dashboard</h1>
        <div className="header-right">
          <span className="user-email">{user?.email}</span>
          <button className="logout-button" onClick={handleLogout}>
            Logout
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
