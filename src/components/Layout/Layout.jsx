// 📁 admin-web/src/components/Layout.jsx
import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  Typography,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Avatar,
  Divider,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Storefront as StoreIcon,
  Inventory2 as ProductIcon,
  ReceiptLong as OrderIcon,
  Paid as WithdrawIcon,
  BarChart as AnalyticsIcon,
  Settings as SettingsIcon,
  SupportAgent as SupportIcon,
  Logout as LogoutIcon,
  Menu as MenuIcon,
} from '@mui/icons-material';
import { Colors } from '../../utils/colors';

const DRAWER_WIDTH = 240;

const nav = [
  { label: 'Dashboard', path: '/', icon: <DashboardIcon /> },
  { label: 'Customers', path: '/customers', icon: <PeopleIcon /> },
  { label: 'Agents', path: '/agents', icon: <StoreIcon /> },
  { label: 'Products', path: '/products', icon: <ProductIcon /> },
  { label: 'Orders', path: '/orders', icon: <OrderIcon /> },
  { label: 'Withdrawals', path: '/withdrawals', icon: <WithdrawIcon /> },
  { label: 'Analytics', path: '/analytics', icon: <AnalyticsIcon /> },
  { label: 'Support', path: '/support', icon: <SupportIcon /> },
  { label: 'Settings', path: '/settings', icon: <SettingsIcon /> },
];

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem('admin_user') || '{}');
    } catch {
      return {};
    }
  })();

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    navigate('/login', { replace: true });
  };

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Toolbar sx={{ gap: 1.5 }}>
        <Avatar
          sx={{
            bgcolor: Colors.primary,
            width: 36,
            height: 36,
            boxShadow: Colors.shadow.sm,
          }}
        >
          G
        </Avatar>
        <Typography variant="subtitle1" fontWeight={700}>
          Gas Mtaani
        </Typography>
      </Toolbar>
      <Divider />
      <List sx={{ flex: 1, py: 1 }}>
        {nav.map((item) => {
          const selected =
            item.path === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(item.path);
          return (
            <ListItemButton
              key={item.path}
              component={Link}
              to={item.path}
              selected={selected}
              onClick={() => setMobileOpen(false)}
            >
              <ListItemIcon sx={{ minWidth: 36 }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          );
        })}
      </List>
      <Divider />
      <List>
        <ListItemButton onClick={handleLogout}>
          <ListItemIcon sx={{ minWidth: 36 }}>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText primary="Logout" />
        </ListItemButton>
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: Colors.background }}>
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { md: `${DRAWER_WIDTH}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={() => setMobileOpen(!mobileOpen)}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 700 }}>
            Admin Console
          </Typography>
          <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
            <Avatar
              sx={{
                bgcolor: Colors.primary,
                width: 34,
                height: 34,
                fontSize: 14,
              }}
            >
              {user.full_name?.charAt(0) || 'A'}
            </Avatar>
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={() => setAnchorEl(null)}
          >
            <MenuItem disabled>
              {user.full_name || 'Admin'} ({user.phone_number || ''})
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout}>Logout</MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { width: DRAWER_WIDTH },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          open
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box' },
          }}
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, md: 3 },
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          mt: 8,
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}