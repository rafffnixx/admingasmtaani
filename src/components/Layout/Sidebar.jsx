import React from 'react';
import { Drawer, List, ListItem, ListItemIcon, ListItemText, Toolbar, Typography, Box } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import StoreIcon from '@mui/icons-material/Store';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PaymentsIcon from '@mui/icons-material/Payments';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import BarChartIcon from '@mui/icons-material/BarChart';
import InventoryIcon from '@mui/icons-material/Inventory';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import SupportIcon from '@mui/icons-material/Support';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AssessmentIcon from '@mui/icons-material/Assessment';
import DeleteIcon from '@mui/icons-material/Delete';
import LiveTvIcon from '@mui/icons-material/LiveTv';
import { useNavigate, useLocation } from 'react-router-dom';
import { Colors } from '../utils/colors';

const drawerWidth = 240;

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
    { text: 'Live Dashboard', icon: <LiveTvIcon />, path: '/live' },
    { text: 'Agents', icon: <PeopleIcon />, path: '/agents' },
    { text: 'Customers', icon: <PeopleIcon />, path: '/customers' },
    { text: 'Products', icon: <StoreIcon />, path: '/products' },
    { text: 'Inventory', icon: <InventoryIcon />, path: '/inventory' },
    { text: 'Orders', icon: <ShoppingCartIcon />, path: '/orders' },
    { text: 'Withdrawals', icon: <PaymentsIcon />, path: '/withdrawals' },
    { text: 'Promotions', icon: <LocalOfferIcon />, path: '/promotions' },
    { text: 'Reports', icon: <AssessmentIcon />, path: '/reports' },
    { text: 'Analytics', icon: <BarChartIcon />, path: '/analytics' },
    { text: 'Notifications', icon: <NotificationsIcon />, path: '/notifications' },
    { text: 'Support', icon: <SupportIcon />, path: '/support' },
    { text: 'Trash', icon: <DeleteIcon />, path: '/trash' },
    { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
  ];

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          borderRight: `1px solid ${Colors.gray[200]}`,
          bgcolor: Colors.white,
        },
      }}
    >
      <Toolbar>
        <Typography variant="h6" sx={{ fontWeight: 'bold', color: Colors.primary }}>
          Gas Mtaani
        </Typography>
      </Toolbar>
      <Box sx={{ overflow: 'auto', flex: 1 }}>
        <List>
          {menuItems.map((item) => (
            <ListItem
              button
              key={item.text}
              onClick={() => navigate(item.path)}
              sx={{
                bgcolor: location.pathname === item.path ? Colors.primaryBg : 'transparent',
                '&:hover': { bgcolor: Colors.primaryBg },
                borderRight: location.pathname === item.path ? `3px solid ${Colors.primary}` : 'none',
                mx: 1,
                borderRadius: 1,
                mb: 0.5,
              }}
            >
              <ListItemIcon
                sx={{
                  color: location.pathname === item.path ? Colors.primary : Colors.gray[600],
                  minWidth: 40,
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.text}
                sx={{
                  color: location.pathname === item.path ? Colors.primary : Colors.gray[700],
                  fontWeight: location.pathname === item.path ? 600 : 400,
                }}
              />
            </ListItem>
          ))}
        </List>
      </Box>
      <Box sx={{ p: 2, borderTop: `1px solid ${Colors.gray[200]}` }}>
        <ListItem
          button
          onClick={() => {
            localStorage.removeItem('admin_token');
            localStorage.removeItem('admin_user');
            navigate('/login');
          }}
          sx={{ borderRadius: 1 }}
        >
          <ListItemIcon>
            <LogoutIcon sx={{ color: Colors.error }} />
          </ListItemIcon>
          <ListItemText primary="Logout" sx={{ color: Colors.error }} />
        </ListItem>
      </Box>
    </Drawer>
  );
}