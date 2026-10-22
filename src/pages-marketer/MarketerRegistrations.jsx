// admin-web/src/pages-marketer/MarketerRegistrations.jsx
import React, { useEffect, useState } from 'react';
import {
  Box, Card, CardContent, Typography, Button, Stack, Table, TableHead,
  TableRow, TableCell, TableBody, Chip, IconButton, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Alert, CircularProgress,
  Tooltip, InputAdornment,
} from '@mui/material';
import {
  PersonAdd as PersonAddIcon,
  Refresh as RefreshIcon,
  CheckCircle as CheckIcon,
  HourglassEmpty as HourglassIcon,
  ContentCopy as CopyIcon,
} from '@mui/icons-material';
import marketerApi from '../services/marketerApi';

export default function MarketerRegistrations() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [err, setErr] = useState('');
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    phone_number: '', full_name: '', county: '', sub_county: '',
  });

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await marketerApi.get('/marketers/registrations');
      setList(Array.isArray(data) ? data : []);
    } catch (ex) {
      setErr(ex.response?.data?.error || 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const submit = async () => {
    setSaving(true); setErr('');
    try {
      await marketerApi.post('/marketers/registrations', form);
      setOpen(false);
      setForm({ phone_number: '', full_name: '', county: '', sub_county: '' });
      await load();
    } catch (ex) {
      setErr(ex.response?.data?.error || 'Registration failed');
    } finally {
      setSaving(false);
    }
  };

  const maskedPhone = (p) => {
    if (!p) return '—';
    const s = String(p);
    if (s.length < 7) return s;
    return s.slice(0, 4) + '****' + s.slice(-3);
  };

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" fontWeight={800}>My Registrees</Typography>
          <Typography variant="body2" color="text.secondary">
            {list.length} customer{list.length === 1 ? '' : 's'} registered by you
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Tooltip title="Refresh">
            <IconButton onClick={load}><RefreshIcon /></IconButton>
          </Tooltip>
          <Button
            variant="contained" startIcon={<PersonAddIcon />}
            onClick={() => { setErr(''); setOpen(true); }}
          >
            Register Customer
          </Button>
        </Stack>
      </Stack>

      <Card>
        <CardContent sx={{ p: 0 }}>
          {loading ? (
            <Box sx={{ p: 4, textAlign: 'center' }}><CircularProgress /></Box>
          ) : list.length === 0 ? (
            <Box sx={{ p: 6, textAlign: 'center' }}>
              <PersonAddIcon sx={{ fontSize: 56, color: 'text.disabled', mb: 2 }} />
              <Typography variant="h6" gutterBottom>No registrations yet</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Register your first customer to start earning commissions.
              </Typography>
              <Button variant="contained" onClick={() => setOpen(true)}>
                Register Customer
              </Button>
            </Box>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Customer</TableCell>
                  <TableCell>Phone</TableCell>
                  <TableCell>Registered</TableCell>
                  <TableCell>First Order</TableCell>
                  <TableCell align="right">Commission</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {list.map((r) => (
                  <TableRow key={r.id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {r.customer_name || '—'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {r.customer_id?.slice(0, 8)}
                      </Typography>
                    </TableCell>
                    <TableCell>{maskedPhone(r.customer_phone)}</TableCell>
                    <TableCell>
                      {new Date(r.registered_at).toLocaleDateString('en-KE', {
                        day: '2-digit', month: 'short', year: 'numeric',
                      })}
                    </TableCell>
                    <TableCell>
                      {r.has_first_order ? (
                        <Chip
                          size="small" icon={<CheckIcon />} label="Delivered"
                          color="success" variant="outlined"
                        />
                      ) : (
                        <Chip
                          size="small" icon={<HourglassIcon />} label="Pending"
                          color="default" variant="outlined"
                        />
                      )}
                    </TableCell>
                    <TableCell align="right">
                      {r.commission_amount != null ? (
                        <Chip
                          size="small"
                          label={`KES ${Number(r.commission_amount).toFixed(0)} · ${r.commission_status}`}
                          color={
                            r.commission_status === 'paid' ? 'success' :
                            r.commission_status === 'approved' ? 'primary' : 'warning'
                          }
                        />
                      ) : (
                        <Typography variant="caption" color="text.secondary">—</Typography>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Register Customer</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {err && <Alert severity="error">{err}</Alert>}
            <TextField
              label="Phone Number" placeholder="2547XXXXXXXX" required
              value={form.phone_number}
              onChange={(e) => setForm({ ...form, phone_number: e.target.value })}
              helperText="If the phone isn't registered yet, a new account will be created"
              fullWidth
            />
            <TextField
              label="Full Name" placeholder="Jane Wanjiku"
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              fullWidth
            />
            <TextField
              label="County (optional)"
              value={form.county}
              onChange={(e) => setForm({ ...form, county: e.target.value })}
              fullWidth
            />
            <TextField
              label="Sub-county (optional)"
              value={form.sub_county}
              onChange={(e) => setForm({ ...form, sub_county: e.target.value })}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpen(false)} disabled={saving}>Cancel</Button>
          <Button
            variant="contained" onClick={submit} disabled={saving || !form.phone_number}
            startIcon={saving ? <CircularProgress size={18} color="inherit" /> : <PersonAddIcon />}
          >
            {saving ? 'Registering…' : 'Register'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}