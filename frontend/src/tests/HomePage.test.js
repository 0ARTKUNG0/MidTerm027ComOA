import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import HomePage from '../components/HomePage';

// Mock fetch
global.fetch = jest.fn();

const MockedHomePage = () => (
  <BrowserRouter>
    <AuthProvider>
      <HomePage />
    </AuthProvider>
  </BrowserRouter>
);

describe('HomePage Component', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  it('renders homepage with main content', () => {
    render(<MockedHomePage />);
    
    expect(screen.getByText('Software Download Manager')).toBeInTheDocument();
    expect(screen.getByText('Find and download your favorite software')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /get started/i })).toBeInTheDocument();
  });

  it('renders navigation links', () => {
    render(<MockedHomePage />);
    
    expect(screen.getByRole('link', { name: /login/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /register/i })).toBeInTheDocument();
  });

  it('displays software categories', async () => {
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

    render(<MockedHomePage />);

    // Should display categories based on software data
    expect(screen.getByText('Browse by Category')).toBeInTheDocument();
  });

  it('handles navigation to login page', () => {
    render(<MockedHomePage />);
    
    const loginLink = screen.getByRole('link', { name: /login/i });
    expect(loginLink).toHaveAttribute('href', '/login');
  });

  it('handles navigation to register page', () => {
    render(<MockedHomePage />);
    
    const registerLink = screen.getByRole('link', { name: /register/i });
    expect(registerLink).toHaveAttribute('href', '/register');
  });
});