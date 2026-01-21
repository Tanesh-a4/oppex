import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import Login from '../pages/Login';
import { AuthProvider } from '../context/AuthContext';

// Mock the API
vi.mock('../services/api', () => ({
  getMe: vi.fn().mockRejectedValue(new Error('Not authenticated')),
  login: vi.fn(),
  logout: vi.fn(),
}));

const renderWithProviders = (component) => {
  return render(
    <BrowserRouter>
      <AuthProvider>{component}</AuthProvider>
    </BrowserRouter>
  );
};

describe('Login Page', () => {
  it('renders login form', async () => {
    renderWithProviders(<Login />);

    // Wait for loading to complete
    await screen.findByRole('heading', { name: /login/i });

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  it('has link to signup page', async () => {
    renderWithProviders(<Login />);

    await screen.findByRole('heading', { name: /login/i });

    expect(screen.getByText(/sign up/i)).toHaveAttribute('href', '/signup');
  });
});
