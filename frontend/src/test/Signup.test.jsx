import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import Signup from '../pages/Signup';
import { AuthProvider } from '../context/AuthContext';

// Mock the API
vi.mock('../services/api', () => ({
  getMe: vi.fn().mockRejectedValue(new Error('Not authenticated')),
  signup: vi.fn(),
}));

const renderWithProviders = (component) => {
  return render(
    <BrowserRouter>
      <AuthProvider>{component}</AuthProvider>
    </BrowserRouter>
  );
};

describe('Signup Page', () => {
  it('renders signup form', async () => {
    renderWithProviders(<Signup />);

    await screen.findByRole('heading', { name: /create account/i });

    expect(screen.getByLabelText(/^email$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument();
  });

  it('has link to login page', async () => {
    renderWithProviders(<Signup />);

    await screen.findByRole('heading', { name: /create account/i });

    expect(screen.getByText(/login/i)).toHaveAttribute('href', '/login');
  });
});
