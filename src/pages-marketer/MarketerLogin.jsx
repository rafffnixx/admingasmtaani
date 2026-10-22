// admin-web/src/pages-marketer/MarketerLogin.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Card, CardContent, TextField, Button, Typography, Tabs, Tab,
  Alert, CircularProgress, Stack,
} from '@mui/material';
import { Storefront as StorefrontIcon } from '@mui/icons-material';
import { useMarketerAuth } from '../context/MarketerAuthContext';
import marketerApi from '../services/marketerApi';

export default function MarketerLogin() {
  const navigate = useNavigate();
  const { login } = useMarketerAuth();
  const [tab, setTab] = useState(0);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [info, setInfo] = useState('');

  const [loginForm, setLoginForm] = useState({ phone_number: '', password: '' });
  const [signupForm, setSignupForm] = useState({
    full_name: '',
    phone_number: '',
    email: '',
    password: '',
    mpesa_number: '',
    mpesa_name: '',
  });

  const handleLogin = async (e) => {
    e.preventDefault();
    setBusy(true); setErr(''); setInfo('');
    try {
      await login(loginForm.phone_number, loginForm.password);
      navigate('/marketer', { replace: true });
    } catch (ex) {
      setErr(ex.response?.data?.error || 'Login failed');
    } finally {
      setBusy(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setBusy(true); setErr(''); setInfo('');
    try {
      const { data } = await marketerApi.post('/marketers/auth/register', signupForm);
      setInfo(data.message || 'Signup received. Awaiting admin approval.');
      setSignupForm({
        full_name: '', phone_number: '', email: '', password: '',
        mpesa_number: '', mpesa_name: '',
      });
    } catch (ex) {
      setErr(ex.response?.data?.error || 'Signup failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: '#F5F7FA',
        p: 2,
      }}
    >
      <Card sx={{ maxWidth: 480, width: '100%', boxShadow: 3 }}>
        <CardContent sx={{ p: 4 }}>
          <Stack direction="row" alignItems="center" spacing={1.5} mb={3}>
            <StorefrontIcon sx={{ fontSize: 36, color: 'primary.main' }} />
            <Box>
              <Typography variant="h5" fontWeight={800}>Gas Mtaani</Typography>
              <Typography variant="body2" color="text.secondary">
                Marketer Portal
              </Typography>
            </Box>
          </Stack>

          <Tabs value={tab} onChange={(_, v) => { setTab(v); setErr(''); setInfo(''); }} sx={{ mb: 3 }}>
            <Tab label="Sign In" />
            <Tab label="Sign Up" />
          </Tabs>

          {err && <Alert severity="error" sx={{ mb: 2 }}>{err}</Alert>}
          {info && <Alert severity="success" sx={{ mb: 2 }}>{info}</Alert>}

          {tab === 0 ? (
            <form onSubmit={handleLogin}>
              <Stack spacing={2}>
                <TextField
                  label="Phone Number"
                  placeholder="2547XXXXXXXX"
                  fullWidth
                  value={loginForm.phone_number}
                  onChange={(e) => setLoginForm({ ...loginForm, phone_number: e.target.value })}
                  required
                />
                <TextField
                  label="Password"
                  type="password"
                  fullWidth
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  required
                />
                <Button
                  type="submit" variant="contained" size="large" fullWidth
                  disabled={busy}
                  startIcon={busy ? <CircularProgress size={18} color="inherit" /> : null}
                >
                  {busy ? 'Signing in…' : 'Sign In'}
                </Button>
              </Stack>
            </form>
          ) : (
            <form onSubmit={handleSignup}>
              <Stack spacing={2}>
                <TextField
                  label="Full Name" fullWidth required
                  value={signupForm.full_name}
                  onChange={(e) => setSignupForm({ ...signupForm, full_name: e.target.value })}
                />
                <TextField
                  label="Phone Number" placeholder="2547XXXXXXXX" fullWidth required
                  value={signupForm.phone_number}
                  onChange={(e) => setSignupForm({ ...signupForm, phone_number: e.target.value })}
                />
                <TextField
                  label="Email (optional)" type="email" fullWidth
                  value={signupForm.email}
                  onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
                />
                <TextField
                  label="Password" type="password" fullWidth required
                  helperText="Minimum 6 characters"
                  value={signupForm.password}
                  onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
                />
                <TextField
                  label="M-Pesa Number (optional)" fullWidth
                  placeholder="2547XXXXXXXX"
                  value={signupForm.mpesa_number}
                  onChange={(e) => setSignupForm({ ...signupForm, mpesa_number: e.target.value })}
                />
                <TextField
                  label="M-Pesa Name (optional)" fullWidth
                  value={signupForm.mpesa_name}
                  onChange={(e) => setSignupForm({ ...signupForm, mpesa_name: e.target.value })}
                />
                <Button
                  type="submit" variant="contained" size="large" fullWidth
                  disabled={busy}
                  startIcon={busy ? <CircularProgress size={18} color="inherit" /> : null}
                >
                  {busy ? 'Creating account…' : 'Create Account'}
                </Button>
                <Typography variant="caption" color="text.secondary" textAlign="center">
                  An admin will review your account before you can log in.
                </Typography>
              </Stack>
            </form>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}