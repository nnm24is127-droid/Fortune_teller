import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { UserDashboardPage } from '../pages/UserDashboardPage';
import { AuthProvider } from '../context/AuthContext';
import { ToastProvider } from '../context/ToastContext';

describe('UserDashboardPage', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('renders dashboard loading and structure', () => {
    render(
      <BrowserRouter>
        <ToastProvider>
          <AuthProvider>
            <UserDashboardPage />
          </AuthProvider>
        </ToastProvider>
      </BrowserRouter>
    );

    expect(screen.getByText(/Total Readings/i)).toBeInTheDocument();
    expect(screen.getByText(/Account Tier/i)).toBeInTheDocument();
  });
});
