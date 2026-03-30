import React from 'react';
import useMetaMask from '../hooks/useMetaMask';

const CHAIN_NAMES = {
  '0x1': 'Ethereum Mainnet',
  '0x5': 'Goerli Testnet',
  '0xaa36a7': 'Sepolia Testnet',
  '0x89': 'Polygon Mainnet',
  '0x13881': 'Mumbai Testnet'
};

const formatAddress = (address) =>
  address ? `${address.slice(0, 6)}...${address.slice(-4)}` : '';

const getChainName = (id) =>
  CHAIN_NAMES[id] || (id ? `Chain ${parseInt(id, 16)}` : 'Unknown');

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

  if (!isMetaMaskInstalled) {
    return (
      <div className="metamask-container">
        <h3>Wallet Connection</h3>
        <div className="metamask-card">
          <p style={{ color: '#a0aec0', marginBottom: '1rem' }}>
            MetaMask extension is not detected in your browser.
          </p>
          <a
            href="https://metamask.io/download/"
            target="_blank"
            rel="noopener noreferrer"
            className="install-button"
          >
            Install MetaMask
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="metamask-container">
      <h3>Wallet Connection</h3>
      <div className="metamask-card">
        {error && <div className="wallet-error">{error}</div>}
        {isConnected && account ? (
          <div className="wallet-connected">
            <span className="wallet-status connected">Connected</span>
            <div className="wallet-address">
              <span className="label">Address:</span>
              <span className="address" title={account}>
                {formatAddress(account)}
              </span>
            </div>
            {chainId && (
              <div className="wallet-chain">
                <span className="label">Network:</span>
                <span>{getChainName(chainId)}</span>
              </div>
            )}
            <button className="disconnect-button" onClick={disconnect}>
              Disconnect
            </button>
          </div>
        ) : (
          <div className="wallet-disconnected">
            <span className="wallet-status disconnected">Not Connected</span>
            <button
              className="connect-button"
              onClick={connect}
              disabled={isConnecting}
            >
              {isConnecting ? 'Connecting...' : 'Connect MetaMask'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MetaMaskConnect;
