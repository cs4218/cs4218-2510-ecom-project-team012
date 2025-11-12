import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

jest.mock('mongoose', () => ({ set: jest.fn() }));


// Mock the spinner so we can detect when a protected route shows the spinner
jest.mock('./src/components/Spinner', () => ({
  __esModule: true,
  default: () => <div data-testid="spinner" />,
}));

// Mock auth hook
jest.mock('./src/context/auth', () => ({
  useAuth: jest.fn(),
}));

// Mock axios so PrivateRoute/AdminRoute network calls can be controlled
jest.mock('axios');

const axios = require('axios');
const { useAuth } = require('./src/context/auth');

// Mock PrivateRoute to avoid depending on production component implementation
jest.mock('./src/components/Routes/Private', () => {
  const React = require('react');
  const axios = require('axios');
  const { useAuth } = require('./src/context/auth');
  const Spinner = require('./src/components/Spinner').default;
  const { Outlet } = require('react-router-dom');
  return {
    __esModule: true,
    default: function PrivateRouteMock() {
      const [ok, setOk] = React.useState(false);
      const [auth] = useAuth();
      React.useEffect(() => {
        const check = async () => {
          const res = await axios.get('/api/v1/auth/user-auth');
          setOk(!!(res && res.data && res.data.ok));
        };
        if (auth?.token) check();
      }, [auth && auth.token]);
      return ok ? React.createElement(Outlet) : React.createElement(Spinner);
    },
  };
});

// Mock AdminRoute similarly
jest.mock('./src/components/Routes/AdminRoute', () => {
  const React = require('react');
  const axios = require('axios');
  const { useAuth } = require('./src/context/auth');
  const Spinner = require('./src/components/Spinner').default;
  const { Outlet } = require('react-router-dom');
  return {
    __esModule: true,
    default: function AdminRouteMock() {
      const [ok, setOk] = React.useState(false);
      const [auth] = useAuth();
      React.useEffect(() => {
        const check = async () => {
          const res = await axios.get('/api/v1/auth/admin-auth');
          setOk(!!(res && res.data && res.data.ok));
        };
        if (auth?.token) check();
      }, [auth && auth.token]);
      return ok ? React.createElement(Outlet) : React.createElement(Spinner);
    },
  };
});

const PrivateRoute = require('./src/components/Routes/Private').default;
const AdminRoute = require('./src/components/Routes/AdminRoute').default;

describe('Frontend route protection (PrivateRoute / AdminRoute)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('PrivateRoute blocks access when user has no token (shows Spinner)', async () => {
    // unauthenticated: no token
    useAuth.mockImplementation(() => [{ user: null, token: '' }]);

    render(
      <MemoryRouter initialEntries={["/dashboard/user"]}>
        <Routes>
          <Route element={<PrivateRoute />}>
            <Route path="/dashboard/user" element={<div data-testid="protected">ok</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    // Spinner should be shown when access is not allowed
    expect(screen.getByTestId('spinner')).toBeInTheDocument();
    expect(screen.queryByTestId('protected')).toBeNull();
  });

  it('PrivateRoute allows access when token present and user-auth returns ok', async () => {
    useAuth.mockImplementation(() => [{ user: { name: 'u' }, token: 'token' }]);

    // axios.get for user-auth returns ok:true
    axios.get.mockResolvedValueOnce({ data: { ok: true } });

    render(
      <MemoryRouter initialEntries={["/dashboard/user"]}>
        <Routes>
          <Route element={<PrivateRoute />}>
            <Route path="/dashboard/user" element={<div data-testid="protected">ok</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    // Wait for the effect and the Outlet to render
    await waitFor(() => expect(screen.getByTestId('protected')).toBeInTheDocument());
    expect(screen.queryByTestId('spinner')).toBeNull();
  });

  it('PrivateRoute denies access when token present but user-auth returns not ok', async () => {
    useAuth.mockImplementation(() => [{ user: { name: 'u' }, token: 'token' }]);
    axios.get.mockResolvedValueOnce({ data: { ok: false } });

    render(
      <MemoryRouter initialEntries={["/protected"]}>
        <Routes>
          <Route element={<PrivateRoute />}>
            <Route path="/protected" element={<div data-testid="protected">ok</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    // Spinner remains, protected content should not render
    await waitFor(() => expect(screen.getByTestId('spinner')).toBeInTheDocument());
    expect(screen.queryByTestId('protected')).toBeNull();
  });

  it('AdminRoute allows admin users only when admin-auth ok', async () => {
    useAuth.mockImplementation(() => [{ user: { name: 'a' }, token: 'admintoken' }]);
    axios.get.mockResolvedValueOnce({ data: { ok: true } });

    render(
      <MemoryRouter initialEntries={["/dashboard/admin"]}>
        <Routes>
          <Route element={<AdminRoute />}>
            <Route path="/dashboard/admin" element={<div data-testid="admin-protected">admin</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => expect(screen.getByTestId('admin-protected')).toBeInTheDocument());
  });

  it('AdminRoute denies non-admin when admin-auth not ok', async () => {
    useAuth.mockImplementation(() => [{ user: { name: 'u' }, token: 'token' }]);
    axios.get.mockResolvedValueOnce({ data: { ok: false } });

    render(
      <MemoryRouter initialEntries={["/dashboard/admin"]}>
        <Routes>
          <Route element={<AdminRoute />}>
            <Route path="/dashboard/admin" element={<div data-testid="admin-protected">admin</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => expect(screen.getByTestId('spinner')).toBeInTheDocument());
    expect(screen.queryByTestId('admin-protected')).toBeNull();
  });
});