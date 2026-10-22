// admin-web/src/pages/Marketers.jsx
import React, { useEffect, useState } from 'react';
import {
  Box, Card, CardContent, Typography, Stack, Button, Table, TableHead,
  TableRow, TableCell, TableBody, Chip, Tabs, Tab, CircularProgress,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Alert,
  IconButton, Tooltip, Snackbar,
} from '@mui/material';
import {
  Check as CheckIcon,
  Close as CloseIcon,
  Refresh as RefreshIcon,
  Edit as EditIcon,
  Send as SendIcon,
} from '@mui/icons-material';
import { adminAPI } from '../services/api';

export default function Marketers() {
  const [tab, setTab] = useState(0);
  const [marketers, setMarketers] = useState([]);
  const [commissions, setCommissions] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const [snack, setSnack] = useState('');
  const [rateDialog, setRateDialog] = useState(null); // { id, rate }
  const [payDialog, setPayDialog] = useState(null);   // { id, amount }

  const loadAll = async () => {
    setLoading(true); setErr('');
    try {
      const [m, c, w] = await Promise.all([
        adminAPI.getMarketers(),
        adminAPI.getMarketerCommissions(),
        adminAPI.getMarketerWithdrawals(),
      ]);
      setMarketers(m.data || []);
      setCommissions(c.data || []);
      setWithdrawals(w.data || []);
    } catch (ex) {
      setErr(ex.response?.data?.error || 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAll(); }, []);

  const approveMarketer = async (id) => {
    try {
      await adminAPI.approveMarketer(id);
      setSnack('Marketer approved');
      loadAll();
    } catch (ex) {
      setErr(ex.response?.data?.error || 'Failed');
    }
  };

  const rejectMarketer = async (id) => {
    if (!window.confirm('Reject and deactivate this marketer?')) return;
    try {
      await adminAPI.rejectMarketer(id);
      setSnack('Marketer rejected');
      loadAll();
    } catch (ex) {
      setErr(ex.response?.data?.error || 'Failed');
    }
  };

  const saveRate = async () => {
    try {
      await adminAPI.setMarketerRate(rateDialog.id, Number(rateDialog.rate));
      setRateDialog(null);
      setSnack('Rate updated');
      loadAll();
    } catch (ex) {
      setErr(ex.response?.data?.error || 'Failed');
    }
  };

  const approveCommission = async (id) => {
    try {
      await adminAPI.approveMarketerCommission(id);
      setSnack('Commission approved');
      loadAll();
    } catch (ex) {
      setErr(ex.response?.data?.error || 'Failed');
    }
  };

  const markPaid = async () => {
    try {
      await adminAPI.processMarketerWithdrawal(payDialog.id, {
        status: 'paid',
        admin_notes: payDialog.notes || '',
      });
      setPayDialog(null);
      setSnack('Marked as paid');
      loadAll();
    } catch (ex) {
      setErr(ex.response?.data?.error || 'Failed');
    }
  };

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" fontWeight={800}>Marketers</Typography>
          <Typography variant="body2" color="text.secondary">
            Manage signups, approvals, commissions and withdrawals
          </Typography>
        </Box>
        <Tooltip title="Refresh">
          <IconButton onClick={loadAll}><RefreshIcon /></IconButton>
        </Tooltip>
      </Stack>

      {err && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setErr('')}>{err}</Alert>}

      <Card>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tab label={`Marketers (${marketers.length})`} />
          <Tab label={`Commissions (${commissions.filter(c => c.status === 'pending').length} pending)`} />
          <Tab label={`Withdrawals (${withdrawals.filter(w => w.status === 'pending').length} pending)`} />
        </Tabs>
        <CardContent sx={{ p: 0 }}>
          {loading ? (
            <Box sx={{ p: 4, textAlign: 'center' }}><CircularProgress /></Box>
          ) : tab === 0 ? (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Phone</TableCell>
                  <TableCell>Referral Code</TableCell>
                  <TableCell align="right">Registrations</TableCell>
                  <TableCell align="right">Rate</TableCell>
                  <TableCell align="right">Earned</TableCell>
                  <TableCell align="right">Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {marketers.map((m) => (
                  <TableRow key={m.id} hover>
                    <TableCell>{m.full_name}</TableCell>
                    <TableCell>{m.phone_number}</TableCell>
                    <TableCell><code>{m.referral_code}</code></TableCell>
                    <TableCell align="right">{m.registrations || 0}</TableCell>
                    <TableCell align="right">KES {Number(m.commission_rate).toFixed(0)}</TableCell>
                    <TableCell align="right">KES {Number(m.total_earned).toFixed(0)}</TableCell>
                    <TableCell align="right">
                      {m.is_approved ? (
                        <Chip size="small" label="Approved" color="success" />
                      ) : (
                        <Chip size="small" label="Pending" color="warning" />
                      )}
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Edit rate">
                        <IconButton size="small" onClick={() => setRateDialog({ id: m.id, rate: m.commission_rate })}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      {!m.is_approved && (
                        <Tooltip title="Approve">
                          <IconButton size="small" color="success" onClick={() => approveMarketer(m.id)}>
                            <CheckIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      {m.is_approved && (
                        <Tooltip title="Reject / deactivate">
                          <IconButton size="small" color="error" onClick={() => rejectMarketer(m.id)}>
                            <CloseIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : tab === 1 ? (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Marketer</TableCell>
                  <TableCell>Customer</TableCell>
                  <TableCell align="right">Amount</TableCell>
                  <TableCell align="right">Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {commissions.map((c) => (
                  <TableRow key={c.id} hover>
                    <TableCell>{new Date(c.created_at).toLocaleDateString('en-KE')}</TableCell>
                    <TableCell>{c.marketer_name}</TableCell>
                    <TableCell>{c.customer_name}</TableCell>
                    <TableCell align="right">KES {Number(c.amount).toFixed(0)}</TableCell>
                    <TableCell align="right">
                      <Chip size="small" label={c.status} color={
                        c.status === 'approved' ? 'primary' :
                        c.status === 'paid' ? 'success' : 'warning'
                      } />
                    </TableCell>
                    <TableCell align="right">
                      {c.status === 'pending' && (
                        <Button size="small" variant="contained" onClick={() => approveCommission(c.id)}>
                          Approve
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Requested</TableCell>
                  <TableCell>Marketer</TableCell>
                  <TableCell>M-Pesa</TableCell>
                  <TableCell align="right">Amount</TableCell>
                  <TableCell align="right">Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {withdrawals.map((w) => (
                  <TableRow key={w.id} hover>
                    <TableCell>{new Date(w.requested_at).toLocaleDateString('en-KE')}</TableCell>
                    <TableCell>{w.marketer_name}</TableCell>
                    <TableCell>{w.mpesa_number}</TableCell>
                    <TableCell align="right">KES {Number(w.amount).toFixed(0)}</TableCell>
                    <TableCell align="right">
                      <Chip size="small" label={w.status} color={
                        w.status === 'paid' ? 'success' :
                        w.status === 'rejected' ? 'error' :
                        w.status === 'processing' ? 'info' : 'warning'
                      } />
                    </TableCell>
                    <TableCell align="right">
                      {(w.status === 'pending' || w.status === 'processing') && (
                        <Button size="small" variant="contained" startIcon={<SendIcon />}
                          onClick={() => setPayDialog({ id: w.id, amount: w.amount, notes: '' })}>
                          Mark Paid
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Rate edit dialog */}
      <Dialog open={Boolean(rateDialog)} onClose={() => setRateDialog(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Edit Commission Rate</DialogTitle>
        <DialogContent>
          <TextField
            label="Commission (KES)" type="number" fullWidth sx={{ mt: 1 }}
            value={rateDialog?.rate ?? ''}
            onChange={(e) => setRateDialog({ ...rateDialog, rate: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRateDialog(null)}>Cancel</Button>
          <Button variant="contained" onClick={saveRate}>Save</Button>
        </DialogActions>
      </Dialog>

      {/* Mark-paid dialog */}
      <Dialog open={Boolean(payDialog)} onClose={() => setPayDialog(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Mark Withdrawal as Paid</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            Confirm you've sent KES {Number(payDialog?.amount || 0).toFixed(0)} to the M-Pesa number before marking paid.
          </Alert>
          <TextField
            label="Admin notes (optional)" fullWidth
            value={payDialog?.notes || ''}
            onChange={(e) => setPayDialog({ ...payDialog, notes: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPayDialog(null)}>Cancel</Button>
          <Button variant="contained" color="success" onClick={markPaid}>Mark Paid</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={Boolean(snack)}
        autoHideDuration={3000}
        onClose={() => setSnack('')}
        message={snack}
      />
    </Box>
  );
}