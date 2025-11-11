import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { useAuth } from '../../client/src/context/auth';
import AdminDashboard from '../../client/src/pages/Admin/AdminDashboard';
import Dashboard from '../../client/src/pages/user/Dashboard';
import Orders from '../../client/src/pages/user/Orders';
import Profile from '../../client/src/pages/user/Profile';

// Mock the auth context
jest.mock('../../client/src/context/auth', () => ({
  useAuth: jest.fn()
}));

// Mock navigate function
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));

describe('Frontend Authentication Security Tests', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    mockNavigate.mockClear();
  });

  describe('Protected Pages Access Tests', () => {
    it('should redirect from AdminDashboard when not authenticated', () => {
      // Mock unauthenticated state
      useAuth.mockImplementation(() => [{ user: null, token: '' }]);

      render(
        <BrowserRouter>
          <AdminDashboard />
        </BrowserRouter>
      );

      // Expect navigation to login page
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });

    it('should redirect from UserDashboard when not authenticated', () => {
      // Mock unauthenticated state
      useAuth.mockImplementation(() => [{ user: null, token: '' }]);

      render(
        <BrowserRouter>
          <Dashboard />
        </BrowserRouter>
      );

      // Expect navigation to login page
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });

    it('should redirect from Orders page when not authenticated', () => {
      // Mock unauthenticated state
      useAuth.mockImplementation(() => [{ user: null, token: '' }]);

      render(
        <BrowserRouter>
          <Orders />
        </BrowserRouter>
      );

      // Expect navigation to login page
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });

    it('should redirect from Profile page when not authenticated', () => {
      // Mock unauthenticated state
      useAuth.mockImplementation(() => [{ user: null, token: '' }]);

      render(
        <BrowserRouter>
          <Profile />
        </BrowserRouter>
      );

      // Expect navigation to login page
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });

    it('should redirect non-admin users from AdminDashboard', () => {
      // Mock authenticated but non-admin user
      useAuth.mockImplementation(() => [{
        user: { role: 0 }, // Regular user role
        token: 'some-token'
      }]);

      render(
        <BrowserRouter>
          <AdminDashboard />
        </BrowserRouter>
      );

      // Expect navigation to home page
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  describe('Public Pages Access Tests', () => {
    it('should allow access to Home page without authentication', () => {
      // Mock unauthenticated state
      useAuth.mockImplementation(() => [{ user: null, token: '' }]);

      render(
        <BrowserRouter>
          <Home />
        </BrowserRouter>
      );

      // Expect no navigation redirect
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('should allow access to Login page without authentication', () => {
      // Mock unauthenticated state
      useAuth.mockImplementation(() => [{ user: null, token: '' }]);

      render(
        <BrowserRouter>
          <Login />
        </BrowserRouter>
      );

      // Expect no navigation redirect
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('should allow access to Register page without authentication', () => {
      // Mock unauthenticated state
      useAuth.mockImplementation(() => [{ user: null, token: '' }]);

      render(
        <BrowserRouter>
          <Register />
        </BrowserRouter>
      );

      // Expect no navigation redirect
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });
});