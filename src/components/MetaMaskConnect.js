import React from 'react';
import useMetaMask from '../hooks/useMetaMask';

const CHAIN_NAMES = {
  '0x1':      { label: 'Ethereum Mainnet', cls: 'mainnet' },
  '0x5':      { label: 'Goerli Testnet',   cls: 'testnet' },
  '0xaa36a7': { label: 'Sepolia Testnet',  cls: 'testnet' },
  '0x89':     { label: 'Polygon Mainnet',  cls: 'polygon' },
  '0x13881':  { label: 'Mumbai Testnet',   cls: 'testnet' }
};

const formatAddress = (address) =>
  address ? `${address.slice(0, 6)}...${address.slice(-4)}` : '';

const getChain = (id) =>
  CHAIN_NAMES[id] || { label: id ? `Chain ${parseInt(id, 16)}` : 'Unknown', cls: 'unknown' };

const MetaMaskConnect = () => {
  const {
    account,
    isConnected,
    isConnecting,
    error,
    chainId,
    isMetaMaskInstalled,
    connect,
    disconnect
  } = useMetaMask();

  const chain = getChain(chainId);

  return (
    <div className="metamask-container">
      <div className="section-header">
        <div className="section-title">
          <div className="mm-section-icon">🦊</div>
          <h3>Wallet Connection</h3>
        </div>
        {isConnected
          ? <span className="tag tag-green">Active</span>
          : <span className="tag tag-orange">Idle</span>
        }
      </div>

      {!isMetaMaskInstalled ? (
        <div className="mm-install-card">
          <div className="mm-install-icon">🦊</div>
          <div>
            <h4>MetaMask Required</h4>
            <p>Install the MetaMask extension to connect your wallet and access Web3 features.</p>
          </div>
          <a
            href="https://metamask.io/download/"
            target="_blank"
            rel="noopener noreferrer"
            className="install-button"
          >
            Install MetaMask
          </a>
        </div>
      ) : (
        <div className="metamask-card">
          {error && (
            <div className="wallet-error">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {isConnecting ? (
            <div className="mm-connecting">
              <div className="connecting-ring">🦊</div>
              <div>
                <strong>Awaiting confirmation…</strong>
                <p>Check MetaMask and approve the connection request.</p>
              </div>
              <button className="connect-button" disabled>
                <span className="connect-button-icon">⏳</span>
                Connecting...
              </button>
            </div>
          ) : isConnected && account ? (
            <div className="mm-connected">
              <div className="mm-connected-header">
                <div className="mm-fox-connected">🦊</div>
                <div className="mm-connected-info">
                  <div className="mm-connected-title">
                    <span className="wallet-status connected">
                      <span className="status-dot" />
                      Connected
                    </span>
                  </div>
                  <div className="mm-address-row">
                    <span className="mm-address-label">Addr:</span>
                    <span className="mm-address-value" title={account}>
                      {formatAddress(account)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mm-details">
                <div className="mm-detail-row">
                  <span className="mm-detail-label">Full Address</span>
                  <span className="mm-detail-value" style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.7rem' }}>
                    {formatAddress(account)}
                  </span>
                </div>
                <div className="mm-detail-row">
                  <span className="mm-detail-label">Network</span>
                  <span className={`mm-network-badge ${chain.cls}`}>
                    <span aria-hidden="true">
                      {chain.cls === 'mainnet' && '⬡ '}
                      {chain.cls === 'polygon' && '⬡ '}
                      {chain.cls === 'testnet' && '🧪 '}
                      {chain.cls === 'unknown' && '❓ '}
                    </span>
                    <span>{chain.label}</span>
                  </span>
                </div>
                <div className="mm-detail-row">
                  <span className="mm-detail-label">Validation</span>
                  <span className="tag tag-green" style={{ fontSize: '0.68rem' }}>✓ ethers.isAddress</span>
                </div>
              </div>

              <div className="achievement-banner">
                <span className="achievement-icon">🏆</span>
                <div className="achievement-text">
                  <div className="achievement-title">Achievement Unlocked</div>
                  <div className="achievement-desc">Web3 Explorer — Wallet Connected</div>
                </div>
              </div>

              <button className="disconnect-button" onClick={disconnect}>
                ⏏ Disconnect Wallet
              </button>
            </div>
          ) : (
            <div className="mm-disconnected">
              <div className="mm-fox-idle">🦊</div>
              <div className="mm-disconnected-text">
                <h4>Ready to Connect</h4>
                <p>Connect your MetaMask wallet to access Web3 features and manage your NFTs.</p>
              </div>
              <button className="connect-button" onClick={connect} disabled={isConnecting}>
                <span className="connect-button-icon">🔗</span>
                Connect MetaMask
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MetaMaskConnect;
