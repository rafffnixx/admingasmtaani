import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  CircularProgress,
  Card,
  CardContent,
  Grid,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  Divider,
  Avatar,
} from '@mui/material';
import {
  Search,
  Refresh,
  CheckCircle,
  Cancel,
  Visibility,
  AttachMoney,
  Person,
  Phone,
  CalendarToday,
  History,
  Settings,
  Download,
} from '@mui/icons-material';
import { Colors } from '../utils/colors';
import { adminAPI } from '../services/api';

export default function Withdrawals() {
  const [withdrawals, setWithdrawals] = useState([]);
  const [filteredWithdrawals, setFilteredWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWithdrawal, setSelectedWithdrawal] = useState(null);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [openSettingsDialog, setOpenSettingsDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [tabValue, setTabValue] = useState(0);
  const [filterStatus, setFilterStatus] = useState('all');
  const [settings, setSettings] = useState({
    min_withdrawal: 100,
    processing_fee: 0,
    auto_pay_schedule: 'daily',
  });

  useEffect(() => {
    fetchWithdrawals();
    fetchSettings();
  }, []);

  const fetchWithdrawals = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.getWithdrawals();
      const data = response.data || [];
      setWithdrawals(data);
      setFilteredWithdrawals(data);
    } catch (error) {
      console.error('Error fetching withdrawals:', error);
      setWithdrawals([]);
      setFilteredWithdrawals([]);
      showSnackbar('Failed to fetch withdrawals', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchSettings = async () => {
    try {
      const response = await adminAPI.getSettings?.();
      if (response?.data) {
        setSettings({
          min_withdrawal: response.data.min_withdrawal || 100,
          processing_fee: response.data.processing_fee || 0,
          auto_pay_schedule: response.data.auto_pay_schedule || 'daily',
        });
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
    applyFilters(term, filterStatus);
  };

  const handleFilterStatus = (status) => {
    setFilterStatus(status);
    applyFilters(searchTerm, status);
  };

  const applyFilters = (search, status) => {
    let filtered = withdrawals;

    if (search) {
      filtered = filtered.filter(w =>
        w.agent_name?.toLowerCase().includes(search.toLowerCase()) ||
        w.phone_number?.includes(search) ||
        w.agent_phone?.includes(search)
      );
    }

    if (status !== 'all') {
      filtered = filtered.filter(w => w.status === status);
    }

    setFilteredWithdrawals(filtered);
  };

  const handleProcess = async (id, status) => {
    try {
      await adminAPI.processWithdrawal(id, status);
      showSnackbar(`Withdrawal ${status} successfully!`);
      fetchWithdrawals();
    } catch (error) {
      console.error('Error processing withdrawal:', error);
      showSnackbar('Failed to process withdrawal', 'error');
    }
  };

  const handleViewWithdrawal = (withdrawal) => {
    setSelectedWithdrawal(withdrawal);
    setOpenViewDialog(true);
  };

  const handleSaveSettings = async () => {
    try {
      await adminAPI.updateSettings?.(settings);
      showSnackbar('Settings saved successfully!');
      setOpenSettingsDialog(false);
    } catch (error) {
      console.error('Error saving settings:', error);
      showSnackbar('Failed to save settings', 'error');
    }
  };

  const getStatusChip = (status) => {
    const colors = {
      pending: 'warning',
      processing: 'info',
      completed: 'success',
      failed: 'error',
      rejected: 'error',
    };
    return <Chip label={status} size="small" color={colors[status] || 'default'} />;
  };

  const getTabWithdrawals = () => {
    if (tabValue === 0) return filteredWithdrawals;
    if (tabValue === 1) return filteredWithdrawals.filter(w => w.status === 'pending');
    if (tabValue === 2) return filteredWithdrawals.filter(w => w.status === 'completed');
    if (tabValue === 3) return filteredWithdrawals.filter(w => ['failed', 'rejected'].includes(w.status));
    return filteredWithdrawals;
  };

  const stats = {
    total: withdrawals.length,
    pending: withdrawals.filter(w => w.status === 'pending').length,
    completed: withdrawals.filter(w => w.status === 'completed').length,
    totalAmount: withdrawals.reduce((sum, w) => sum + (w.amount || 0), 0),
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress sx={{ color: Colors.primary }} />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Withdrawals Management
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <Button
            variant="outlined"
            startIcon={<Settings />}
            onClick={() => setOpenSettingsDialog(true)}
            sx={{ borderColor: Colors.primary, color: Colors.primary }}
          >
            Payout Settings
          </Button>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={fetchWithdrawals}
            sx={{ borderColor: Colors.primary, color: Colors.primary }}
          >
            Refresh
          </Button>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary">Total Withdrawals</Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: Colors.primary }}>
                {stats.total}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ borderLeft: `4px solid ${Colors.warning}` }}>
            <CardContent>
              <Typography variant="body2" color="text.secondary">Pending</Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: Colors.warning }}>
                {stats.pending}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ borderLeft: `4px solid ${Colors.success}` }}>
            <CardContent>
              <Typography variant="body2" color="text.secondary">Total Amount</Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: Colors.success }}>
                KES {stats.totalAmount.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <TextField
            size="small"
            placeholder="Search withdrawals..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            sx={{ width: 250 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ color: Colors.gray[400] }} />
                </InputAdornment>
              ),
            }}
          />
          <FormControl size="small" sx={{ minWidth: 130 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={filterStatus}
              label="Status"
              onChange={(e) => handleFilterStatus(e.target.value)}
            >
              <MenuItem value="all">All Status</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="processing">Processing</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
              <MenuItem value="failed">Failed</MenuItem>
              <MenuItem value="rejected">Rejected</MenuItem>
            </Select>
          </FormControl>
          <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto' }}>
            {getTabWithdrawals().length} withdrawals found
          </Typography>
        </Box>
      </Paper>

      {/* Tabs */}
      <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} sx={{ mb: 3 }}>
        <Tab label="All" />
        <Tab label="Pending" />
        <Tab label="Completed" />
        <Tab label="Failed/Rejected" />
      </Tabs>

      {/* Withdrawals Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ bgcolor: Colors.gray[50] }}>
            <TableRow>
              <TableCell>Agent</TableCell>
              <TableCell align="right">Amount</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Date</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {getTabWithdrawals().length > 0 ? (
              getTabWithdrawals().map((withdrawal) => (
                <TableRow key={withdrawal.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ bgcolor: Colors.primary, width: 32, height: 32 }}>
                        {withdrawal.agent_name?.charAt(0) || 'A'}
                      </Avatar>
                      <Typography variant="body2">{withdrawal.agent_name || 'N/A'}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" fontWeight={500} sx={{ color: Colors.primary }}>
                      KES {Number(withdrawal.amount).toLocaleString()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{withdrawal.phone_number || withdrawal.agent_phone || 'N/A'}</Typography>
                  </TableCell>
                  <TableCell>{getStatusChip(withdrawal.status)}</TableCell>
                  <TableCell>
                    {new Date(withdrawal.requested_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                      <Tooltip title="View Details">
                        <IconButton size="small" onClick={() => handleViewWithdrawal(withdrawal)}>
                          <Visibility fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      {withdrawal.status === 'pending' && (
                        <>
                          <Tooltip title="Approve">
                            <IconButton
                              size="small"
                              color="success"
                              onClick={() => handleProcess(withdrawal.id, 'completed')}
                            >
                              <CheckCircle fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Reject">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleProcess(withdrawal.id, 'rejected')}
                            >
                              <Cancel fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </>
                      )}
                      {withdrawal.status === 'processing' && (
                        <Tooltip title="Mark as Paid">
                          <IconButton
                            size="small"
                            color="success"
                            onClick={() => handleProcess(withdrawal.id, 'completed')}
                          >
                            <CheckCircle fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    No withdrawals found
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* View Withdrawal Dialog */}
      <Dialog open={openViewDialog} onClose={() => setOpenViewDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: Colors.primaryBg }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Withdrawal Details</Typography>
            <IconButton onClick={() => setOpenViewDialog(false)}>
              <Cancel />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedWithdrawal && (
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Paper sx={{ p: 2, bgcolor: Colors.gray[50] }}>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Person sx={{ fontSize: 16 }} /> Agent Info
                    </Typography>
                    <Divider sx={{ my: 1 }} />
                    <Typography variant="body2"><strong>Name:</strong> {selectedWithdrawal.agent_name || 'N/A'}</Typography>
                    <Typography variant="body2"><strong>Phone:</strong> {selectedWithdrawal.phone_number || selectedWithdrawal.agent_phone || 'N/A'}</Typography>
                    <Typography variant="body2"><strong>Email:</strong> {selectedWithdrawal.agent_email || 'N/A'}</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12}>
                  <Paper sx={{ p: 2, bgcolor: Colors.gray[50] }}>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <AttachMoney sx={{ fontSize: 16 }} /> Withdrawal Details
                    </Typography>
                    <Divider sx={{ my: 1 }} />
                    <Typography variant="body2"><strong>Amount:</strong> KES {Number(selectedWithdrawal.amount).toLocaleString()}</Typography>
                    <Typography variant="body2"><strong>Status:</strong> {getStatusChip(selectedWithdrawal.status)}</Typography>
                    <Typography variant="body2"><strong>Requested:</strong> {new Date(selectedWithdrawal.requested_at).toLocaleString()}</Typography>
                    {selectedWithdrawal.processed_at && (
                      <Typography variant="body2"><strong>Processed:</strong> {new Date(selectedWithdrawal.processed_at).toLocaleString()}</Typography>
                    )}
                    {selectedWithdrawal.payment_reference && (
                      <Typography variant="body2"><strong>Reference:</strong> {selectedWithdrawal.payment_reference}</Typography>
                    )}
                    {selectedWithdrawal.admin_notes && (
                      <Typography variant="body2"><strong>Notes:</strong> {selectedWithdrawal.admin_notes}</Typography>
                    )}
                  </Paper>
                </Grid>
              </Grid>

              {/* Actions */}
              {selectedWithdrawal.status === 'pending' && (
                <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                  <Button
                    variant="contained"
                    color="success"
                    onClick={() => {
                      handleProcess(selectedWithdrawal.id, 'completed');
                      setOpenViewDialog(false);
                    }}
                    startIcon={<CheckCircle />}
                  >
                    Approve
                  </Button>
                  <Button
                    variant="contained"
                    color="error"
                    onClick={() => {
                      handleProcess(selectedWithdrawal.id, 'rejected');
                      setOpenViewDialog(false);
                    }}
                    startIcon={<Cancel />}
                  >
                    Reject
                  </Button>
                </Box>
              )}
              {selectedWithdrawal.status === 'processing' && (
                <Button
                  variant="contained"
                  color="success"
                  onClick={() => {
                    handleProcess(selectedWithdrawal.id, 'completed');
                    setOpenViewDialog(false);
                  }}
                  startIcon={<CheckCircle />}
                  sx={{ mt: 2 }}
                >
                  Mark as Paid
                </Button>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenViewDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Payout Settings Dialog */}
      <Dialog open={openSettingsDialog} onClose={() => setOpenSettingsDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: Colors.primaryBg }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Settings sx={{ color: Colors.primary }} />
            <Typography variant="h6">Payout Settings</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Minimum Withdrawal (KES)"
              type="number"
              value={settings.min_withdrawal}
              onChange={(e) => setSettings({ ...settings, min_withdrawal: parseFloat(e.target.value) || 0 })}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Processing Fee (KES)"
              type="number"
              value={settings.processing_fee}
              onChange={(e) => setSettings({ ...settings, processing_fee: parseFloat(e.target.value) || 0 })}
              sx={{ mb: 2 }}
            />
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Auto-Pay Schedule</InputLabel>
              <Select
                value={settings.auto_pay_schedule}
                label="Auto-Pay Schedule"
                onChange={(e) => setSettings({ ...settings, auto_pay_schedule: e.target.value })}
              >
                <MenuItem value="daily">Daily</MenuItem>
                <MenuItem value="weekly">Weekly</MenuItem>
                <MenuItem value="biweekly">Bi-Weekly</MenuItem>
                <MenuItem value="monthly">Monthly</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenSettingsDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSaveSettings}
            sx={{ bgcolor: Colors.primary }}
          >
            Save Settings
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}