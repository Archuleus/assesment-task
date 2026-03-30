import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { isAddress } from 'ethers';
import MetaMaskConnect from '../components/MetaMaskConnect';

const VALID_ADDRESS = '0x742d35cc6634c0532925a3b844bc454e4438f44e';

// Mock the useMetaMask hook so we can control its output per test
jest.mock('../hooks/useMetaMask');
import useMetaMask from '../hooks/useMetaMask';

const defaultHookState = {
  account: null,
  isConnected: false,
  isConnecting: false,
  error: null,
  chainId: null,
  isMetaMaskInstalled: true,
  connect: jest.fn(),
  disconnect: jest.fn()
};

beforeEach(() => {
  jest.clearAllMocks();
  useMetaMask.mockReturnValue({ ...defaultHookState });
});

// ─────────────────────────────────────────────
// 1. window.ethereum detection — UI layer
// ─────────────────────────────────────────────
describe('MetaMask detection UI', () => {
  it('shows install prompt when MetaMask is not installed', () => {
    useMetaMask.mockReturnValue({ ...defaultHookState, isMetaMaskInstalled: false });
    render(<MetaMaskConnect />);
    expect(screen.getByText(/install metamask/i)).toBeInTheDocument();
  });

  it('shows connect button when MetaMask is installed but not connected', () => {
    render(<MetaMaskConnect />);
    expect(screen.getByRole('button', { name: /connect metamask/i })).toBeInTheDocument();
  });
});

// ─────────────────────────────────────────────
// 2. Successful wallet connection flow — UI
// ─────────────────────────────────────────────
describe('Successful wallet connection UI', () => {
  it('calls connect() when user clicks the connect button', () => {
    const connect = jest.fn();
    useMetaMask.mockReturnValue({ ...defaultHookState, connect });

    render(<MetaMaskConnect />);
    fireEvent.click(screen.getByRole('button', { name: /connect metamask/i }));
    expect(connect).toHaveBeenCalledTimes(1);
  });

  it('shows connected status and truncated address after connection', () => {
    useMetaMask.mockReturnValue({
      ...defaultHookState,
      account: VALID_ADDRESS,
      isConnected: true,
      chainId: '0x1'
    });

    render(<MetaMaskConnect />);
    expect(screen.getByText('Connected')).toBeInTheDocument();
    expect(screen.getByTitle(VALID_ADDRESS)).toBeInTheDocument();
  });

  it('displays the correct network name for mainnet', () => {
    useMetaMask.mockReturnValue({
      ...defaultHookState,
      account: VALID_ADDRESS,
      isConnected: true,
      chainId: '0x1'
    });

    render(<MetaMaskConnect />);
    expect(screen.getByText(/ethereum mainnet/i)).toBeInTheDocument();
  });

  it('shows connecting state while request is pending', () => {
    useMetaMask.mockReturnValue({ ...defaultHookState, isConnecting: true });
    render(<MetaMaskConnect />);
    expect(screen.getByRole('button', { name: /connecting/i })).toBeDisabled();
  });
});

// ─────────────────────────────────────────────
// 3. Error handling scenarios — UI
// ─────────────────────────────────────────────
describe('Error handling UI', () => {
  it('displays an error message when error state is set', () => {
    const errorMsg = 'Connection rejected. You declined the MetaMask request.';
    useMetaMask.mockReturnValue({ ...defaultHookState, error: errorMsg });

    render(<MetaMaskConnect />);
    expect(screen.getByText(errorMsg)).toBeInTheDocument();
  });

  it('shows install link when MetaMask is not installed', () => {
    useMetaMask.mockReturnValue({ ...defaultHookState, isMetaMaskInstalled: false });
    render(<MetaMaskConnect />);
    const link = screen.getByRole('link', { name: /install metamask/i });
    expect(link).toHaveAttribute('href', 'https://metamask.io/download/');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });
});

// ─────────────────────────────────────────────
// 4. Wallet disconnect UI
// ─────────────────────────────────────────────
describe('Wallet disconnect UI', () => {
  it('shows disconnect button when connected', () => {
    useMetaMask.mockReturnValue({
      ...defaultHookState,
      account: VALID_ADDRESS,
      isConnected: true
    });
    render(<MetaMaskConnect />);
    expect(screen.getByRole('button', { name: /disconnect/i })).toBeInTheDocument();
  });

  it('calls disconnect() when disconnect button is clicked', () => {
    const disconnect = jest.fn();
    useMetaMask.mockReturnValue({
      ...defaultHookState,
      account: VALID_ADDRESS,
      isConnected: true,
      disconnect
    });

    render(<MetaMaskConnect />);
    fireEvent.click(screen.getByRole('button', { name: /disconnect/i }));
    expect(disconnect).toHaveBeenCalledTimes(1);
  });

  it('does not show connect button when already connected', () => {
    useMetaMask.mockReturnValue({
      ...defaultHookState,
      account: VALID_ADDRESS,
      isConnected: true
    });
    render(<MetaMaskConnect />);
    expect(screen.queryByRole('button', { name: /connect metamask/i })).not.toBeInTheDocument();
  });
});

// ─────────────────────────────────────────────
// 5. Wallet address format validation (ethers.js)
// ─────────────────────────────────────────────
describe('Wallet address validation via ethers.js isAddress', () => {
  it('confirms VALID_ADDRESS passes ethers isAddress()', () => {
    expect(isAddress(VALID_ADDRESS)).toBe(true);
  });

  it('rejects an address that is too short', () => {
    expect(isAddress('0x742d35')).toBe(false);
  });

  it('rejects a plaintext string', () => {
    expect(isAddress('not-an-address')).toBe(false);
  });

  it('rejects an empty string', () => {
    expect(isAddress('')).toBe(false);
  });

  it('rejects null', () => {
    expect(isAddress(null)).toBe(false);
  });

  it('accepts a checksummed address', () => {
    // EIP-55 checksum address
    expect(isAddress('0x742d35Cc6634C0532925a3b844Bc454e4438f44e')).toBe(true);
  });

  it('accepts all known seed wallet addresses', () => {
    const seedAddresses = [
      '0x742d35cc6634c0532925a3b844bc454e4438f44e',
      '0x8ba1f109551bd432803012645ac1136cc46b35c6',
      '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
      '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984'
    ];
    seedAddresses.forEach((addr) => {
      expect(isAddress(addr)).toBe(true);
    });
  });
});

// ─────────────────────────────────────────────
// 6. Chain / network display
// ─────────────────────────────────────────────
describe('Chain display', () => {
  const cases = [
    { chainId: '0x1', label: 'Ethereum Mainnet' },
    { chainId: '0x89', label: 'Polygon Mainnet' },
    { chainId: '0xaa36a7', label: 'Sepolia Testnet' }
  ];

  cases.forEach(({ chainId, label }) => {
    it(`shows "${label}" for chainId ${chainId}`, () => {
      useMetaMask.mockReturnValue({
        ...defaultHookState,
        account: VALID_ADDRESS,
        isConnected: true,
        chainId
      });
      render(<MetaMaskConnect />);
      expect(screen.getByText(label)).toBeInTheDocument();
    });
  });

  it('shows a numeric fallback for unknown chains', () => {
    useMetaMask.mockReturnValue({
      ...defaultHookState,
      account: VALID_ADDRESS,
      isConnected: true,
      chainId: '0x7a69'
    });
    render(<MetaMaskConnect />);
    // 0x7a69 = 31337
    expect(screen.getByText(/chain 31337/i)).toBeInTheDocument();
  });
});
