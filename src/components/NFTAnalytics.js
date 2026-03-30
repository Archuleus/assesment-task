import React, { useState, useEffect } from 'react';
import { tokenAPI } from '../services/api';

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

  if (loading) return <div className="loading">Loading NFT Analytics...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="analytics-container">
      <h3>NFT Analytics</h3>
      <div className="analytics-stats">
        <div className="stat-card">
          <div className="stat-value">{analytics?.totalNFTs ?? 0}</div>
          <div className="stat-label">Total NFTs</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{analytics?.walletAddresses?.length ?? 0}</div>
          <div className="stat-label">Unique Wallets</div>
        </div>
      </div>
      {analytics?.walletAddresses?.length > 0 && (
        <div className="wallet-list">
          <h4>Wallet Addresses</h4>
          <ul>
            {analytics.walletAddresses.map((addr, index) => (
              <li key={index} className="wallet-item">
                <span className="wallet-address-full">{addr}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default NFTAnalytics;
