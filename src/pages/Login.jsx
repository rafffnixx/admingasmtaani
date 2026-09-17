// 📁 admin-web/src/pages/Login.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  Avatar,
  CircularProgress,
  InputAdornment,
  IconButton,
  Divider,
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { adminAuthAPI } from '../services/api';
import { Colors } from '../utils/colors';

export default function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ phone_number: '', password: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await adminAuthAPI.login(form);
      console.log('📦 Login response:', response.data);

      // Backend returns FLAT: { success: true, token, user }
      // Some endpoints may wrap it: { success: true, data: { token, user } }
      // Handle both shapes.
      const token =
        response.data?.token ??
        response.data?.data?.token;

      const user =
        response.data?.user ??
        response.data?.data?.user;

      console.log('🔑 Token present:', !!token);
      console.log('👤 User:', user);

      if (!token || !user) {
        setError('Invalid response from server. Missing token or user.');
        return;
      }

      if (user.user_type !== 'admin') {
        setError('This account does not have admin access.');
        return;
      }

      localStorage.setItem('admin_token', token);
      localStorage.setItem('admin_user', JSON.stringify(user));

      console.log('✅ Stored admin_token:', token.slice(0, 30) + '...');
      console.log('✅ Stored admin_user:', user.full_name, '| role:', user.user_type);

      navigate('/', { replace: true });
    } catch (err) {
      console.error('Login error:', err);
      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          'Login failed. Please check your credentials.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
        background: `linear-gradient(135deg, ${Colors.gray[100]} 0%, ${Colors.gray[200]} 100%)`,
      }}
    >
      <Paper
        elevation={0}
        sx={{
          width: '100%',
          maxWidth: 400,
          px: { xs: 3, sm: 4 },
          py: { xs: 4, sm: 5 },
          backgroundColor: Colors.surface,
          border: `1px solid ${Colors.border}`,
          borderRadius: 3,
          boxShadow: Colors.shadow.lg,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <Avatar
            sx={{
              bgcolor: Colors.primary,
              width: 60,
              height: 60,
              boxShadow: `0 6px 16px ${Colors.primary}40`,
            }}
          >
            <LockOutlinedIcon sx={{ fontSize: 30 }} />
          </Avatar>
        </Box>

        <Typography
          variant="h6"
          sx={{ fontWeight: 700, textAlign: 'center', color: Colors.textPrimary }}
        >
          Gas Mtaani Admin
        </Typography>
        <Typography
          variant="body2"
          sx={{ color: Colors.textSecondary, textAlign: 'center', mt: 0.5, mb: 3 }}
        >
          Sign in to manage the platform
        </Typography>

        <Divider sx={{ mb: 3 }} />

        {error && (
          <Alert severity="error" sx={{ width: '100%', mb: 2, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
          <TextField
            fullWidth
            required
            autoFocus
            size="medium"
            label="Phone Number"
            name="phone_number"
            value={form.phone_number}
            onChange={(e) => setForm({ ...form, phone_number: e.target.value })}
            autoComplete="off"
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            required
            size="medium"
            label="Password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            autoComplete="off"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                    tabIndex={-1}
                  >
                    {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Button
            type="submit"
            fullWidth
            size="large"
            variant="contained"
            disabled={loading}
            sx={{
              mt: 3,
              height: 48,
              borderRadius: 2,
              bgcolor: Colors.primary,
              color: Colors.white,
              fontWeight: 700,
              boxShadow: `0 4px 12px ${Colors.primary}40`,
              '&:hover': {
                bgcolor: Colors.primaryDark,
                boxShadow: `0 6px 16px ${Colors.primary}55`,
              },
            }}
          >
            {loading ? <CircularProgress size={22} color="inherit" /> : 'Sign in'}
          </Button>
        </Box>

        <Typography
          variant="caption"
          sx={{ color: Colors.textLight, textAlign: 'center', mt: 3 }}
        >
          Authorized personnel only
        </Typography>
      </Paper>
    </Box>
  );
}