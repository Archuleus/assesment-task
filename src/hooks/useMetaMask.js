import { useState, useEffect, useCallback } from 'react';
import { isAddress } from 'ethers';

const useMetaMask = () => {
  const [account, setAccount] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [isMetaMaskInstalled, setIsMetaMaskInstalled] = useState(false);

  useEffect(() => {
    const installed =
      typeof window !== 'undefined' &&
      typeof window.ethereum !== 'undefined' &&
      window.ethereum.isMetaMask === true;
    setIsMetaMaskInstalled(installed);

    if (!installed) return;

    // Restore previously connected account
    window.ethereum
      .request({ method: 'eth_accounts' })
      .then((accounts) => {
        if (accounts.length > 0 && isAddress(accounts[0])) {
          setAccount(accounts[0]);
          setIsConnected(true);
        }
      })
      .catch(() => {});

    window.ethereum
      .request({ method: 'eth_chainId' })
      .then((id) => setChainId(id))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = (accounts) => {
      if (accounts.length === 0) {
        setAccount(null);
        setIsConnected(false);
        setError(null);
      } else if (isAddress(accounts[0])) {
        setAccount(accounts[0]);
        setIsConnected(true);
        setError(null);
      }
    };

    const handleChainChanged = (id) => {
      setChainId(id);
      // MetaMask recommends reloading on chain change
      window.location.reload();
    };

    const handleDisconnect = () => {
      setAccount(null);
      setIsConnected(false);
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);
    window.ethereum.on('disconnect', handleDisconnect);

    return () => {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum.removeListener('chainChanged', handleChainChanged);
      window.ethereum.removeListener('disconnect', handleDisconnect);
    };
  }, []);

  const connect = useCallback(async () => {
    if (!window.ethereum) {
      setError('MetaMask is not installed. Please install the MetaMask extension.');
      return;
    }

    if (isConnecting) return;

    setIsConnecting(true);
    setError(null);

    try {
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });

      if (accounts.length > 0 && isAddress(accounts[0])) {
        const id = await window.ethereum.request({ method: 'eth_chainId' });
        setAccount(accounts[0]);
        setIsConnected(true);
        setChainId(id);
      } else {
        setError('No valid wallet address returned from MetaMask.');
      }
    } catch (err) {
      if (err.code === 4001) {
        setError('Connection rejected. You declined the MetaMask request.');
      } else if (err.code === -32002) {
        setError('MetaMask request already pending. Please open MetaMask.');
      } else {
        setError(err.message || 'Failed to connect to MetaMask.');
      }
    } finally {
      setIsConnecting(false);
    }
  }, [isConnecting]);

  const disconnect = useCallback(() => {
    setAccount(null);
    setIsConnected(false);
    setError(null);
    setChainId(null);
  }, []);

  return {
    account,
    isConnected,
    isConnecting,
    error,
    chainId,
    isMetaMaskInstalled,
    connect,
    disconnect
  };
};

export default useMetaMask;
