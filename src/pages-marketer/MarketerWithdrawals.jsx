// admin-web/src/pages-marketer/MarketerWithdrawals.jsx
import React, { useEffect, useState } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, Stack, TextField, Button,
  Alert, CircularProgress, Table, TableHead, TableRow, TableCell,
  TableBody, Chip, Divider,
} from '@mui/material';
import {
  AccountBalanceWallet as WalletIcon,
  Send as SendIcon,
} from '@mui/icons-material';
import { useMarketerAuth } from '../context/MarketerAuthContext';
import marketerApi from '../services/marketerApi';

const STATUS_COLOR = {
  pending: 'warning',
  processing: 'info',
  paid: 'success',
  rejected: 'error',
};

const MIN_WITHDRAWAL = 500;

export default function MarketerWithdrawals() {
  const { marketer, refresh } = useMarketerAuth();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState({ amount: '', mpesa_number: '', mpesa_name: '' });

  const available = Number(marketer?.stats?.available_balance || 0);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await marketerApi.get('/marketers/withdrawals');
      setList(Array.isArray(data) ? data : []);
    } catch (ex) {
      setErr(ex.response?.data?.error || 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // Prefill mpesa from marketer profile if set
    if (marketer?.mpesa_number) {
      setForm((f) => ({
        ...f,
        mpesa_number: f.mpesa_number || marketer.mpesa_number,
        mpesa_name: f.mpesa_name || marketer.mpesa_name || '',
      }));
    }
  }, [marketer]);

  const submit = async () => {
    setBusy(true); setErr(''); setSuccess('');
    try {
      const payload = {
        amount: Number(form.amount),
        mpesa_number: form.mpesa_number,
        mpesa_name: form.mpesa_name,
      };
      const { data } = await marketerApi.post('/marketers/withdrawals', payload);
      setSuccess(`Withdrawal request submitted — KES ${Number(data.amount).toFixed(0)} pending`);
      setForm({ amount: '', mpesa_number: form.mpesa_number, mpesa_name: form.mpesa_name });
      await load();
      await refresh();
    } catch (ex) {
      setErr(ex.response?.data?.error || 'Withdrawal failed');
    } finally {
      setBusy(false);
    }
  };

  const amountOk =
    Number(form.amount) >= MIN_WITHDRAWAL &&
    Number(form.amount) <= available &&
    Boolean(form.mpesa_number);

  return (
    <Box>
      <Typography variant="h4" fontWeight={800} gutterBottom>Withdrawals</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Minimum KES {MIN_WITHDRAWAL}. Only approved commissions can be withdrawn. Admin processes within 24h.
      </Typography>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center">
                <WalletIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                <Box>
                  <Typography variant="body2" color="text.secondary">Available</Typography>
                  <Typography variant="h4" fontWeight={800}>KES {available.toFixed(0)}</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={700} gutterBottom>Request Withdrawal</Typography>
              <Divider sx={{ mb: 2 }} />
              <Stack spacing={2}>
                {err && <Alert severity="error">{err}</Alert>}
                {success && <Alert severity="success">{success}</Alert>}
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <TextField
                    label="Amount (KES)" type="number" fullWidth
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                    helperText={`Min ${MIN_WITHDRAWAL} · Max ${available.toFixed(0)}`}
                  />
                  <TextField
                    label="M-Pesa Number" fullWidth
                    placeholder="2547XXXXXXXX"
                    value={form.mpesa_number}
                    onChange={(e) => setForm({ ...form, mpesa_number: e.target.value })}
                  />
                </Stack>
                <TextField
                  label="M-Pesa Name (optional)" fullWidth
                  value={form.mpesa_name}
                  onChange={(e) => setForm({ ...form, mpesa_name: e.target.value })}
                />
                <Box>
                  <Button
                    variant="contained" size="large"
                    startIcon={busy ? <CircularProgress size={18} color="inherit" /> : <SendIcon />}
                    onClick={submit}
                    disabled={busy || !amountOk}
                  >
                    {busy ? 'Submitting…' : 'Request Withdrawal'}
                  </Button>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card>
        <CardContent sx={{ p: 0 }}>
          <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
            <Typography variant="h6" fontWeight={700}>History</Typography>
          </Box>
          {loading ? (
            <Box sx={{ p: 4, textAlign: 'center' }}><CircularProgress /></Box>
          ) : list.length === 0 ? (
            <Box sx={{ p: 6, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">No withdrawals yet.</Typography>
            </Box>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Requested</TableCell>
                  <TableCell>M-Pesa</TableCell>
                  <TableCell align="right">Amount</TableCell>
                  <TableCell align="right">Status</TableCell>
                  <TableCell>Paid</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {list.map((w) => (
                  <TableRow key={w.id} hover>
                    <TableCell>
                      {new Date(w.requested_at).toLocaleDateString('en-KE', {
                        day: '2-digit', month: 'short', year: 'numeric',
                      })}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{w.mpesa_number || '—'}</Typography>
                      <Typography variant="caption" color="text.secondary">{w.mpesa_name || ''}</Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography fontWeight={700}>KES {Number(w.amount).toFixed(0)}</Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Chip size="small" label={w.status} color={STATUS_COLOR[w.status] || 'default'} />
                    </TableCell>
                    <TableCell>
                      {w.paid_at
                        ? new Date(w.paid_at).toLocaleDateString('en-KE')
                        : '—'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}