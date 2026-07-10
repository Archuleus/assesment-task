import React, { useState, useEffect } from 'react';
import { tokenAPI } from '../services/api';

const getRank = (total) => {
  if (total === 0) return { trophy: '🪨', label: 'Rank', name: 'No Data' };
  if (total < 3)  return { trophy: '🥉', label: 'Rank', name: 'Bronze Collector' };
  if (total < 6)  return { trophy: '🥈', label: 'Rank', name: 'Silver Collector' };
  if (total < 10) return { trophy: '🥇', label: 'Rank', name: 'Gold Collector' };
  return           { trophy: '💎', label: 'Rank', name: 'Diamond Whale' };
};

const NFTAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    tokenAPI
      .getNFTAnalytics()
      .then((response) => setAnalytics(response.data.data))
      .catch((err) =>
        setError(err.response?.data?.message || 'Failed to load NFT analytics')
      )
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="analytics-loading">
        <div className="spinner" />
        <span>Loading analytics…</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-message">
        <span>⚠️</span>
        <span>{error}</span>
      </div>
    );
  }

  const total   = analytics?.totalNFTs ?? 0;
  const wallets = analytics?.walletAddresses ?? [];
  const rank    = getRank(total);

  return (
    <div className="analytics-container">
      <div className="section-header">
        <span className="tag tag-purple">On-chain</span>
      </div>

      <div className="analytics-stats">
        <div className="stat-card">
          <span className="stat-icon">🖼️</span>
          <div className="stat-value">{total}</div>
          <div className="stat-label">Total NFTs</div>
        </div>
        <div className="stat-card">
          <span className="stat-icon">👛</span>
          <div className="stat-value">{wallets.length}</div>
          <div className="stat-label">Unique Wallets</div>
        </div>
      </div>

      <div className="rank-banner">
        <span className="rank-trophy">{rank.trophy}</span>
        <div className="rank-info">
          <div className="rank-label">{rank.label}</div>
          <div className="rank-name">{rank.name}</div>
        </div>
      </div>

      {wallets.length > 0 && (
        <div className="wallet-list">
          <div className="wallet-list-header">
            <h4>Wallet Addresses</h4>
            <span className="wallet-count-badge">{wallets.length}</span>
          </div>
          <ul>
            {wallets.map((addr, index) => (
              <li key={index} className="wallet-item">
                <span className="wallet-index">#{index + 1}</span>
                <span className="wallet-address-full">{addr}</span>
                <span className="wallet-valid-dot" title="Valid Ethereum address" />
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default NFTAnalytics;
