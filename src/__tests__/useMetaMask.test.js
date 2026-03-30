import { renderHook, act, waitFor } from '@testing-library/react';
import useMetaMask from '../hooks/useMetaMask';

// Valid Ethereum addresses for testing
const VALID_ADDRESS = '0x742d35cc6634c0532925a3b844bc454e4438f44e';
const ANOTHER_VALID_ADDRESS = '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984';

const createMockEthereum = (overrides = {}) => ({
  isMetaMask: true,
  request: jest.fn(),
  on: jest.fn(),
  removeListener: jest.fn(),
  ...overrides
});

beforeEach(() => {
  jest.clearAllMocks();
  delete window.ethereum;
});

afterEach(() => {
  delete window.ethereum;
});

// ─────────────────────────────────────────────
// 1. window.ethereum detection
// ─────────────────────────────────────────────
describe('MetaMask detection', () => {
  it('detects MetaMask as not installed when window.ethereum is absent', () => {
    const { result } = renderHook(() => useMetaMask());
    expect(result.current.isMetaMaskInstalled).toBe(false);
  });

  it('detects MetaMask as installed when window.ethereum.isMetaMask is true', async () => {
    const mockEthereum = createMockEthereum();
    mockEthereum.request.mockResolvedValue([]);
    window.ethereum = mockEthereum;

    const { result } = renderHook(() => useMetaMask());
    await waitFor(() => {
      expect(result.current.isMetaMaskInstalled).toBe(true);
    });
  });

  it('does not flag a non-MetaMask provider as MetaMask', () => {
    window.ethereum = { isMetaMask: false, request: jest.fn(), on: jest.fn(), removeListener: jest.fn() };
    const { result } = renderHook(() => useMetaMask());
    expect(result.current.isMetaMaskInstalled).toBe(false);
  });
});

// ─────────────────────────────────────────────
// 2. Successful wallet connection flow
// ─────────────────────────────────────────────
describe('Successful wallet connection', () => {
  it('connects and stores account and chainId', async () => {
    const mockEthereum = createMockEthereum();
    mockEthereum.request.mockImplementation(({ method }) => {
      if (method === 'eth_accounts') return Promise.resolve([]);
      if (method === 'eth_chainId') return Promise.resolve('0x1');
      if (method === 'eth_requestAccounts') return Promise.resolve([VALID_ADDRESS]);
      return Promise.resolve(null);
    });
    window.ethereum = mockEthereum;

    const { result } = renderHook(() => useMetaMask());

    await act(async () => {
      await result.current.connect();
    });

    expect(result.current.isConnected).toBe(true);
    expect(result.current.account).toBe(VALID_ADDRESS);
    expect(result.current.chainId).toBe('0x1');
    expect(result.current.error).toBeNull();
  });

  it('validates the returned address with ethers.js isAddress', async () => {
    const mockEthereum = createMockEthereum();
    mockEthereum.request.mockImplementation(({ method }) => {
      if (method === 'eth_accounts') return Promise.resolve([]);
      if (method === 'eth_chainId') return Promise.resolve('0x1');
      if (method === 'eth_requestAccounts') return Promise.resolve([VALID_ADDRESS]);
      return Promise.resolve(null);
    });
    window.ethereum = mockEthereum;

    const { result } = renderHook(() => useMetaMask());

    await act(async () => {
      await result.current.connect();
    });

    // If account is set, it passed ethers isAddress validation
    expect(result.current.account).toMatch(/^0x[0-9a-fA-F]{40}$/);
  });

  it('sets error and does not connect when returned address is invalid', async () => {
    const mockEthereum = createMockEthereum();
    mockEthereum.request.mockImplementation(({ method }) => {
      if (method === 'eth_accounts') return Promise.resolve([]);
      if (method === 'eth_chainId') return Promise.resolve('0x1');
      if (method === 'eth_requestAccounts') return Promise.resolve(['not-a-valid-address']);
      return Promise.resolve(null);
    });
    window.ethereum = mockEthereum;

    const { result } = renderHook(() => useMetaMask());

    await act(async () => {
      await result.current.connect();
    });

    expect(result.current.isConnected).toBe(false);
    expect(result.current.account).toBeNull();
    expect(result.current.error).toBeTruthy();
  });

  it('clears isConnecting after successful connection', async () => {
    const mockEthereum = createMockEthereum();
    mockEthereum.request.mockImplementation(({ method }) => {
      if (method === 'eth_accounts') return Promise.resolve([]);
      if (method === 'eth_chainId') return Promise.resolve('0x1');
      if (method === 'eth_requestAccounts') return Promise.resolve([VALID_ADDRESS]);
      return Promise.resolve(null);
    });
    window.ethereum = mockEthereum;

    const { result } = renderHook(() => useMetaMask());

    await act(async () => {
      await result.current.connect();
    });

    expect(result.current.isConnecting).toBe(false);
  });
});

// ─────────────────────────────────────────────
// 3. Error handling — user rejects request
// ─────────────────────────────────────────────
describe('User rejects MetaMask connection', () => {
  it('sets rejection error message on code 4001', async () => {
    const mockEthereum = createMockEthereum();
    mockEthereum.request.mockImplementation(({ method }) => {
      if (method === 'eth_accounts') return Promise.resolve([]);
      if (method === 'eth_requestAccounts') {
        const error = new Error('User rejected the request');
        error.code = 4001;
        return Promise.reject(error);
      }
      return Promise.resolve(null);
    });
    window.ethereum = mockEthereum;

    const { result } = renderHook(() => useMetaMask());

    await act(async () => {
      await result.current.connect();
    });

    expect(result.current.isConnected).toBe(false);
    expect(result.current.account).toBeNull();
    expect(result.current.error).toContain('rejected');
    expect(result.current.isConnecting).toBe(false);
  });
});

// ─────────────────────────────────────────────
// 4. MetaMask not installed
// ─────────────────────────────────────────────
describe('MetaMask not installed', () => {
  it('sets an install-prompt error when window.ethereum is undefined', async () => {
    const { result } = renderHook(() => useMetaMask());

    await act(async () => {
      await result.current.connect();
    });

    expect(result.current.isConnected).toBe(false);
    expect(result.current.error).toMatch(/not installed/i);
  });
});

// ─────────────────────────────────────────────
// 5. Account change detection
// ─────────────────────────────────────────────
describe('Account change detection', () => {
  it('updates account when MetaMask fires accountsChanged with new account', async () => {
    const listeners = {};
    const mockEthereum = createMockEthereum();
    mockEthereum.request.mockImplementation(({ method }) => {
      if (method === 'eth_accounts') return Promise.resolve([VALID_ADDRESS]);
      if (method === 'eth_chainId') return Promise.resolve('0x1');
      return Promise.resolve(null);
    });
    mockEthereum.on.mockImplementation((event, handler) => {
      listeners[event] = handler;
    });
    window.ethereum = mockEthereum;

    const { result } = renderHook(() => useMetaMask());

    await waitFor(() => expect(result.current.isConnected).toBe(true));

    act(() => {
      listeners['accountsChanged']([ANOTHER_VALID_ADDRESS]);
    });

    expect(result.current.account).toBe(ANOTHER_VALID_ADDRESS);
    expect(result.current.isConnected).toBe(true);
  });

  it('disconnects when accountsChanged fires with empty array', async () => {
    const listeners = {};
    const mockEthereum = createMockEthereum();
    mockEthereum.request.mockImplementation(({ method }) => {
      if (method === 'eth_accounts') return Promise.resolve([VALID_ADDRESS]);
      if (method === 'eth_chainId') return Promise.resolve('0x1');
      return Promise.resolve(null);
    });
    mockEthereum.on.mockImplementation((event, handler) => {
      listeners[event] = handler;
    });
    window.ethereum = mockEthereum;

    const { result } = renderHook(() => useMetaMask());
    await waitFor(() => expect(result.current.isConnected).toBe(true));

    act(() => {
      listeners['accountsChanged']([]);
    });

    expect(result.current.account).toBeNull();
    expect(result.current.isConnected).toBe(false);
  });
});

// ─────────────────────────────────────────────
// 6. Network / chain switch detection
// ─────────────────────────────────────────────
describe('Network switching detection', () => {
  it('registers a chainChanged listener on mount', async () => {
    const mockEthereum = createMockEthereum();
    mockEthereum.request.mockResolvedValue([]);
    window.ethereum = mockEthereum;

    renderHook(() => useMetaMask());

    await waitFor(() => {
      const registeredEvents = mockEthereum.on.mock.calls.map(([event]) => event);
      expect(registeredEvents).toContain('chainChanged');
    });
  });
});

// ─────────────────────────────────────────────
// 7. Wallet disconnect
// ─────────────────────────────────────────────
describe('Wallet disconnect', () => {
  it('clears account and connection state on disconnect()', async () => {
    const mockEthereum = createMockEthereum();
    mockEthereum.request.mockImplementation(({ method }) => {
      if (method === 'eth_accounts') return Promise.resolve([]);
      if (method === 'eth_chainId') return Promise.resolve('0x1');
      if (method === 'eth_requestAccounts') return Promise.resolve([VALID_ADDRESS]);
      return Promise.resolve(null);
    });
    window.ethereum = mockEthereum;

    const { result } = renderHook(() => useMetaMask());

    await act(async () => {
      await result.current.connect();
    });

    expect(result.current.isConnected).toBe(true);

    act(() => {
      result.current.disconnect();
    });

    expect(result.current.isConnected).toBe(false);
    expect(result.current.account).toBeNull();
    expect(result.current.chainId).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('registers a disconnect listener on mount', async () => {
    const mockEthereum = createMockEthereum();
    mockEthereum.request.mockResolvedValue([]);
    window.ethereum = mockEthereum;

    renderHook(() => useMetaMask());

    await waitFor(() => {
      const registeredEvents = mockEthereum.on.mock.calls.map(([event]) => event);
      expect(registeredEvents).toContain('disconnect');
    });
  });
});

// ─────────────────────────────────────────────
// 8. Connection state persistence on mount
// ─────────────────────────────────────────────
describe('Connection state persistence', () => {
  it('restores connected account from eth_accounts on mount', async () => {
    const mockEthereum = createMockEthereum();
    mockEthereum.request.mockImplementation(({ method }) => {
      if (method === 'eth_accounts') return Promise.resolve([VALID_ADDRESS]);
      if (method === 'eth_chainId') return Promise.resolve('0x89');
      return Promise.resolve(null);
    });
    window.ethereum = mockEthereum;

    const { result } = renderHook(() => useMetaMask());

    await waitFor(() => {
      expect(result.current.account).toBe(VALID_ADDRESS);
      expect(result.current.isConnected).toBe(true);
    });
  });

  it('stays disconnected when eth_accounts returns empty array', async () => {
    const mockEthereum = createMockEthereum();
    mockEthereum.request.mockImplementation(({ method }) => {
      if (method === 'eth_accounts') return Promise.resolve([]);
      if (method === 'eth_chainId') return Promise.resolve('0x1');
      return Promise.resolve(null);
    });
    window.ethereum = mockEthereum;

    const { result } = renderHook(() => useMetaMask());

    await waitFor(() => expect(result.current.isMetaMaskInstalled).toBe(true));
    expect(result.current.account).toBeNull();
    expect(result.current.isConnected).toBe(false);
  });
});

// ─────────────────────────────────────────────
// 9. Multiple connection attempts
// ─────────────────────────────────────────────
describe('Multiple connection attempts', () => {
  it('ignores a second connect() call while already connecting', async () => {
    const mockEthereum = createMockEthereum();
    let resolveFirst;
    mockEthereum.request.mockImplementation(({ method }) => {
      if (method === 'eth_accounts') return Promise.resolve([]);
      if (method === 'eth_requestAccounts')
        return new Promise((resolve) => { resolveFirst = () => resolve([VALID_ADDRESS]); });
      if (method === 'eth_chainId') return Promise.resolve('0x1');
      return Promise.resolve(null);
    });
    window.ethereum = mockEthereum;

    const { result } = renderHook(() => useMetaMask());

    // Start first connection (don't await yet)
    act(() => { result.current.connect(); });

    // Attempt second connection while first is pending
    await act(async () => { await result.current.connect(); });

    // eth_requestAccounts should only have been called once
    const requestCalls = mockEthereum.request.mock.calls.filter(
      ([{ method }]) => method === 'eth_requestAccounts'
    );
    expect(requestCalls.length).toBe(1);

    // Resolve the first pending request
    await act(async () => { resolveFirst(); });
  });

  it('allows a new connection attempt after disconnecting', async () => {
    const mockEthereum = createMockEthereum();
    mockEthereum.request.mockImplementation(({ method }) => {
      if (method === 'eth_accounts') return Promise.resolve([]);
      if (method === 'eth_chainId') return Promise.resolve('0x1');
      if (method === 'eth_requestAccounts') return Promise.resolve([VALID_ADDRESS]);
      return Promise.resolve(null);
    });
    window.ethereum = mockEthereum;

    const { result } = renderHook(() => useMetaMask());

    await act(async () => { await result.current.connect(); });
    expect(result.current.isConnected).toBe(true);

    act(() => { result.current.disconnect(); });
    expect(result.current.isConnected).toBe(false);

    await act(async () => { await result.current.connect(); });
    expect(result.current.isConnected).toBe(true);
    expect(result.current.account).toBe(VALID_ADDRESS);
  });
});

// ─────────────────────────────────────────────
// 10. Event listener cleanup
// ─────────────────────────────────────────────
describe('Event listener cleanup', () => {
  it('removes all listeners on unmount', async () => {
    const mockEthereum = createMockEthereum();
    mockEthereum.request.mockResolvedValue([]);
    window.ethereum = mockEthereum;

    const { unmount } = renderHook(() => useMetaMask());
    await waitFor(() => expect(mockEthereum.on).toHaveBeenCalled());

    unmount();

    const registeredEvents = mockEthereum.removeListener.mock.calls.map(([event]) => event);
    expect(registeredEvents).toContain('accountsChanged');
    expect(registeredEvents).toContain('chainChanged');
    expect(registeredEvents).toContain('disconnect');
  });
});
