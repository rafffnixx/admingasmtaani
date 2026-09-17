// 📁 admin-web/src/App.jsx

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';

import theme from './theme';
import Layout from './components/Layout/Layout';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import LiveDashboard from './pages/LiveDashboard';
import Agents from './pages/Agents';
import Customers from './pages/Customers';
import Products from './pages/Products';
import Orders from './pages/Orders';
import Withdrawals from './pages/Withdrawals';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import Reports from './pages/Reports';
import Inventory from './pages/Inventory';
import Promotions from './pages/Promotions';
import Support from './pages/Support';
import Notifications from './pages/Notifications';
import Trash from './pages/Trash';

// ============================================
// PRIVATE ROUTE GUARD
// ============================================
// Requires:
//   1. admin_token in localStorage
//   2. admin_user present with user_type === 'admin'
// If either is missing, redirect to /login.
// ============================================
function RequireAdmin() {
  const token = localStorage.getItem('admin_token');
  const rawUser = localStorage.getItem('admin_user');

  if (!token || !rawUser) {
    return <Navigate to="/login" replace />;
  }

  let user;
  try {
    user = JSON.parse(rawUser);
  } catch {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    return <Navigate to="/login" replace />;
  }

  if (!user || user.user_type !== 'admin') {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

// ============================================
// MAIN APP
// ============================================
function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <Routes>
          {/* Public */}
          <Route path="/login" element={<Login />} />

          {/* Protected — all wrapped by RequireAdmin + Layout */}
          <Route element={<RequireAdmin />}>
            <Route element={<Layout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/live" element={<LiveDashboard />} />
              <Route path="/agents" element={<Agents />} />
              <Route path="/customers" element={<Customers />} />
              <Route path="/products" element={<Products />} />
              <Route path="/inventory" element={<Inventory />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/withdrawals" element={<Withdrawals />} />
              <Route path="/promotions" element={<Promotions />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/support" element={<Support />} />
              <Route path="/trash" element={<Trash />} />
              <Route path="/settings" element={<Settings />} />
            </Route>
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;