// 📁 admin-web/src/App.jsx

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material';
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
// MATERIAL UI THEME
// ============================================
const theme = createTheme({
  palette: {
    primary: {
      main: '#FF6B00',
      light: '#FF8C33',
      dark: '#CC5500',
    },
    secondary: {
      main: '#1A1A1A',
    },
    success: {
      main: '#4CAF50',
    },
    warning: {
      main: '#FF9800',
    },
    error: {
      main: '#D32F2F',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
        },
      },
    },
  },
});

// ============================================
// PRIVATE ROUTE GUARD
// ============================================
function PrivateRoute({ children }) {
  const token = localStorage.getItem('admin_token');
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
}

// ============================================
// MAIN APP
// ============================================
function App() {
  return (
    <ThemeProvider theme={theme}>
      {/* ✅ FIX: Added future flags to eliminate React Router warnings */}
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          
          {/* Protected Routes */}
          <Route 
            path="/" 
            element={
              <PrivateRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </PrivateRoute>
            } 
          />
          
          <Route 
            path="/live" 
            element={
              <PrivateRoute>
                <Layout>
                  <LiveDashboard />
                </Layout>
              </PrivateRoute>
            } 
          />
          
          <Route 
            path="/agents" 
            element={
              <PrivateRoute>
                <Layout>
                  <Agents />
                </Layout>
              </PrivateRoute>
            } 
          />
          
          <Route 
            path="/customers" 
            element={
              <PrivateRoute>
                <Layout>
                  <Customers />
                </Layout>
              </PrivateRoute>
            } 
          />
          
          <Route 
            path="/products" 
            element={
              <PrivateRoute>
                <Layout>
                  <Products />
                </Layout>
              </PrivateRoute>
            } 
          />
          
          <Route 
            path="/inventory" 
            element={
              <PrivateRoute>
                <Layout>
                  <Inventory />
                </Layout>
              </PrivateRoute>
            } 
          />
          
          <Route 
            path="/orders" 
            element={
              <PrivateRoute>
                <Layout>
                  <Orders />
                </Layout>
              </PrivateRoute>
            } 
          />
          
          <Route 
            path="/withdrawals" 
            element={
              <PrivateRoute>
                <Layout>
                  <Withdrawals />
                </Layout>
              </PrivateRoute>
            } 
          />
          
          <Route 
            path="/promotions" 
            element={
              <PrivateRoute>
                <Layout>
                  <Promotions />
                </Layout>
              </PrivateRoute>
            } 
          />
          
          <Route 
            path="/reports" 
            element={
              <PrivateRoute>
                <Layout>
                  <Reports />
                </Layout>
              </PrivateRoute>
            } 
          />
          
          <Route 
            path="/analytics" 
            element={
              <PrivateRoute>
                <Layout>
                  <Analytics />
                </Layout>
              </PrivateRoute>
            } 
          />
          
          <Route 
            path="/notifications" 
            element={
              <PrivateRoute>
                <Layout>
                  <Notifications />
                </Layout>
              </PrivateRoute>
            } 
          />
          
          <Route 
            path="/support" 
            element={
              <PrivateRoute>
                <Layout>
                  <Support />
                </Layout>
              </PrivateRoute>
            } 
          />
          
          <Route 
            path="/trash" 
            element={
              <PrivateRoute>
                <Layout>
                  <Trash />
                </Layout>
              </PrivateRoute>
            } 
          />
          
          <Route 
            path="/settings" 
            element={
              <PrivateRoute>
                <Layout>
                  <Settings />
                </Layout>
              </PrivateRoute>
            } 
          />

          {/* Catch-all route - redirect to dashboard */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;