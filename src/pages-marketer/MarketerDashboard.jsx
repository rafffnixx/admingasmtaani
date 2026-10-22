// admin-web/src/pages-marketer/MarketerDashboard.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Grid, Card, CardContent, Typography, Button, Stack, Avatar,
  CircularProgress, Divider,
} from '@mui/material';
import {
  People as PeopleIcon,
  CheckCircle as CheckIcon,
  Paid as PaidIcon,
  AccountBalanceWallet as WalletIcon,
  PersonAdd as PersonAddIcon,
  ArrowForward as ArrowIcon,
} from '@mui/icons-material';
import { useMarketerAuth } from '../context/MarketerAuthContext';

function StatCard({ title, value, icon, color, subtitle }) {
  return (
    <Card>
      <CardContent>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Avatar sx={{ bgcolor: color, width: 48, height: 48 }}>{icon}</Avatar>
          <Box>
            <Typography variant="body2" color="text.secondary">{title}</Typography>
            <Typography variant="h5" fontWeight={800}>{value}</Typography>
            {subtitle && <Typography variant="caption" color="text.secondary">{subtitle}</Typography>}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

export default function MarketerDashboard() {
  const { marketer, loading } = useMarketerAuth();
  const navigate = useNavigate();

  if (loading || !marketer) return <CircularProgress />;

  const stats = marketer.stats || {};
  const available = Number(stats.available_balance || 0);
  const earned = Number(marketer.total_earned || 0);
  const withdrawn = Number(marketer.total_withdrawn || 0);
  const rate = Number(marketer.commission_rate || 0);

  return (
    <Box>
      <Typography variant="h4" fontWeight={800} gutterBottom>
        Hi, {marketer.full_name.split(' ')[0]} 👋
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Earn KES {rate.toFixed(0)} for every customer you bring in who places their first delivered order.
      </Typography>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Registered Customers"
            value={stats.registrations || 0}
            icon={<PeopleIcon />}
            color="#1976D2"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="First Orders"
            value={stats.first_orders || 0}
            icon={<CheckIcon />}
            color="#2E7D32"
            subtitle="Commissions unlocked"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Earned"
            value={`KES ${earned.toFixed(0)}`}
            icon={<PaidIcon />}
            color="#ED6C02"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Available Balance"
            value={`KES ${available.toFixed(0)}`}
            icon={<WalletIcon />}
            color="#9C27B0"
            subtitle={`KES ${withdrawn.toFixed(0)} withdrawn`}
          />
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={700} gutterBottom>
                Quick Actions
              </Typography>
              <Stack spacing={1.5} sx={{ mt: 2 }}>
                <Button
                  variant="contained" size="large" fullWidth
                  startIcon={<PersonAddIcon />}
                  onClick={() => navigate('/marketer/registrations')}
                >
                  Register a New Customer
                </Button>
                <Button
                  variant="outlined" size="large" fullWidth
                  endIcon={<ArrowIcon />}
                  onClick={() => navigate('/marketer/withdrawals')}
                  disabled={available < 500}
                >
                  {available < 500
                    ? `Withdraw (min KES 500 — you have ${available.toFixed(0)})`
                    : `Withdraw KES ${available.toFixed(0)}`}
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={700} gutterBottom>
                How It Works
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Stack spacing={1.5}>
                <Box>
                  <Typography variant="subtitle2" fontWeight={700}>1. Register a customer</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Add their phone number. If they're new, an account is created automatically.
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" fontWeight={700}>2. They place their first order</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Your customer downloads the app and orders gas. You don't need to do anything.
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" fontWeight={700}>3. Order delivered → you earn</Typography>
                  <Typography variant="body2" color="text.secondary">
                    KES {rate.toFixed(0)} is credited to your account. Admin approves it, then you withdraw.
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}