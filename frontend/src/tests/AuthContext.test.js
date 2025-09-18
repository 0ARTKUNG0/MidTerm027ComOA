import { renderHook, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '../context/AuthContext';

// Mock fetch
global.fetch = jest.fn();

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn()
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;

describe('AuthContext', () => {
  beforeEach(() => {
    fetch.mockClear();
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
    localStorageMock.removeItem.mockClear();
  });

  it('provides initial auth state', () => {
    localStorageMock.getItem.mockReturnValue(null);
    
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    expect(result.current.user).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(typeof result.current.login).toBe('function');
    expect(typeof result.current.register).toBe('function');
    expect(typeof result.current.logout).toBe('function');
  });

  it('initializes with token from localStorage', async () => {
    const mockToken = 'mock-token';
    const mockUser = {
      id: 1,
      fullName: 'Test User',
      email: 'test@example.com'
    };

    localStorageMock.getItem.mockReturnValue(mockToken);
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        user: mockUser
      })
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.loading).toBe(true);

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.loading).toBe(false);
  });

  it('handles successful login', async () => {
    const mockResponse = {
      success: true,
      token: 'new-token',
      user: {
        id: 1,
        fullName: 'Test User',
        email: 'test@example.com'
      }
    };

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    let loginResult;
    await act(async () => {
      loginResult = await result.current.login('test@example.com', 'password123');
    });

    expect(loginResult.success).toBe(true);
    expect(result.current.user).toEqual(mockResponse.user);
    expect(localStorageMock.setItem).toHaveBeenCalledWith('token', 'new-token');
  });

  it('handles failed login', async () => {
    const mockResponse = {
      success: false,
      message: 'Invalid credentials'
    };

    fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => mockResponse
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    let loginResult;
    await act(async () => {
      loginResult = await result.current.login('test@example.com', 'wrongpassword');
    });

    expect(loginResult.success).toBe(false);
    expect(loginResult.message).toBe('Invalid credentials');
    expect(result.current.user).toBeNull();
  });

  it('handles successful registration', async () => {
    const mockResponse = {
      success: true,
      message: 'User registered successfully',
      user: {
        id: 1,
        fullName: 'Test User',
        email: 'test@example.com'
      }
    };

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    let registerResult;
    await act(async () => {
      registerResult = await result.current.register('Test User', 'test@example.com', 'password123');
    });

    expect(registerResult.success).toBe(true);
    expect(registerResult.message).toBe('User registered successfully');
  });

  it('handles logout', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    act(() => {
      result.current.logout();
    });

    expect(result.current.user).toBeNull();
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('token');
  });

  it('handles network errors', async () => {
    fetch.mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useAuth(), { wrapper });

    let loginResult;
    await act(async () => {
      loginResult = await result.current.login('test@example.com', 'password123');
    });

    expect(loginResult.success).toBe(false);
    expect(loginResult.message).toBe('Network error occurred');
  });
});