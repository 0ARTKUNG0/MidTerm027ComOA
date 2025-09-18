import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import Dashboard from '../components/Dashboard';

// Mock fetch
global.fetch = jest.fn();

const MockedDashboard = () => (
  <BrowserRouter>
    <AuthProvider>
      <Dashboard />
    </AuthProvider>
  </BrowserRouter>
);

describe('Dashboard Component', () => {
  beforeEach(() => {
    fetch.mockClear();
    // Mock localStorage
    const localStorageMock = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn()
    };
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock
    });
  });

  it('renders dashboard with loading state initially', () => {
    render(<MockedDashboard />);
    expect(screen.getByText('Loading software...')).toBeInTheDocument();
  });

  it('fetches and displays software list', async () => {
    const mockSoftware = [
      {
        id: 1,
        name: 'Google Chrome',
        description: 'Fast, secure, and free web browser',
        size: '85MB',
        category: 'Browser',
        link: 'https://www.google.com/chrome/'
      },
      {
        id: 2,
        name: 'Mozilla Firefox',
        description: 'Open source web browser with privacy features',
        size: '62MB',
        category: 'Browser',
        link: 'https://www.mozilla.org/firefox/'
      }
    ];

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockSoftware
    });

    render(<MockedDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Google Chrome')).toBeInTheDocument();
      expect(screen.getByText('Mozilla Firefox')).toBeInTheDocument();
    });
  });

  it('filters software by category', async () => {
    const mockSoftware = [
      {
        id: 1,
        name: 'Google Chrome',
        description: 'Fast, secure, and free web browser',
        size: '85MB',
        category: 'Browser',
        link: 'https://www.google.com/chrome/'
      },
      {
        id: 3,
        name: 'VLC Media Player',
        description: 'Free and open source cross-platform multimedia player',
        size: '45MB',
        category: 'Media',
        link: 'https://www.videolan.org/vlc/'
      }
    ];

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockSoftware
    });

    render(<MockedDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Google Chrome')).toBeInTheDocument();
      expect(screen.getByText('VLC Media Player')).toBeInTheDocument();
    });

    // Click Browser category
    fireEvent.click(screen.getByText('Browser'));

    await waitFor(() => {
      expect(screen.getByText('Google Chrome')).toBeInTheDocument();
      expect(screen.queryByText('VLC Media Player')).not.toBeInTheDocument();
    });
  });

  it('filters software by search term', async () => {
    const mockSoftware = [
      {
        id: 1,
        name: 'Google Chrome',
        description: 'Fast, secure, and free web browser',
        size: '85MB',
        category: 'Browser',
        link: 'https://www.google.com/chrome/'
      },
      {
        id: 2,
        name: 'Mozilla Firefox',
        description: 'Open source web browser with privacy features',
        size: '62MB',
        category: 'Browser',
        link: 'https://www.mozilla.org/firefox/'
      }
    ];

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockSoftware
    });

    render(<MockedDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Google Chrome')).toBeInTheDocument();
      expect(screen.getByText('Mozilla Firefox')).toBeInTheDocument();
    });

    // Search for Chrome
    const searchInput = screen.getByPlaceholderText('Search software...');
    fireEvent.change(searchInput, { target: { value: 'Chrome' } });

    await waitFor(() => {
      expect(screen.getByText('Google Chrome')).toBeInTheDocument();
      expect(screen.queryByText('Mozilla Firefox')).not.toBeInTheDocument();
    });
  });

  it('handles download button click', async () => {
    const mockSoftware = [
      {
        id: 1,
        name: 'Google Chrome',
        description: 'Fast, secure, and free web browser',
        size: '85MB',
        category: 'Browser',
        link: 'https://www.google.com/chrome/'
      }
    ];

    // Mock token in localStorage
    window.localStorage.getItem.mockReturnValue('mock-token');

    // Mock software fetch
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockSoftware
    });

    // Mock download response
    fetch.mockResolvedValueOnce({
      ok: true,
      headers: {
        get: jest.fn().mockReturnValue('application/octet-stream')
      },
      blob: jest.fn().mockResolvedValue(new Blob(['mock file content']))
    });

    // Mock window.URL.createObjectURL
    window.URL.createObjectURL = jest.fn().mockReturnValue('mock-url');
    window.URL.revokeObjectURL = jest.fn();

    render(<MockedDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Google Chrome')).toBeInTheDocument();
    });

    // Click download button
    const downloadButton = screen.getByRole('button', { name: /download/i });
    fireEvent.click(downloadButton);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer mock-token'
        },
        body: JSON.stringify({ softwareIds: [1] })
      });
    });
  });
});