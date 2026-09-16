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
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Tooltip,
  Alert,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Snackbar,
} from '@mui/material';
import {
  Send,
  Delete,
  Refresh,
  CheckCircle,
  Schedule,
  Cancel as CancelIcon,
  Visibility,
} from '@mui/icons-material';
import { Colors } from '../utils/colors';
import { adminAPI } from '../services/api';

export default function Notifications() {
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [users, setUsers] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [sending, setSending] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'order',
    send_to: 'all',
    user_id: '',
  });

  useEffect(() => {
    fetchNotifications();
    fetchUsers();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.getNotifications();
      console.log('Notifications response:', response.data);
      setNotifications(response.data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      showSnackbar('Failed to fetch notifications', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await adminAPI.getCustomers();
      setUsers(response.data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleSendNotification = async () => {
    if (!formData.title || !formData.message) {
      showSnackbar('Please fill in all required fields', 'error');
      return;
    }

    setSending(true);
    try {
      const payload = {
        title: formData.title,
        message: formData.message,
        type: formData.type,
        send_to: formData.send_to,
        user_id: formData.send_to === 'specific' ? formData.user_id : null,
      };

      await adminAPI.sendNotification(payload);
      showSnackbar('Notification sent successfully!');
      setOpenDialog(false);
      setFormData({
        title: '',
        message: '',
        type: 'order',
        send_to: 'all',
        user_id: '',
      });
      fetchNotifications();
    } catch (error) {
      console.error('Error sending notification:', error);
      showSnackbar('Failed to send notification', 'error');
    } finally {
      setSending(false);
    }
  };

  const handleDeleteNotification = async (id) => {
    if (!window.confirm('Are you sure you want to delete this notification?')) return;

    try {
      await adminAPI.deleteNotification(id);
      showSnackbar('Notification deleted successfully!');
      fetchNotifications();
    } catch (error) {
      console.error('Error deleting notification:', error);
      showSnackbar('Failed to delete notification', 'error');
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await adminAPI.markNotificationAsRead(id);
      fetchNotifications();
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const getStatusChip = (notification) => {
    if (notification.status === 'sent') {
      return <Chip icon={<CheckCircle />} label="Sent" color="success" size="small" />;
    } else if (notification.status === 'pending') {
      return <Chip icon={<Schedule />} label="Pending" color="warning" size="small" />;
    } else if (notification.status === 'failed') {
      return <Chip icon={<CancelIcon />} label="Failed" color="error" size="small" />;
    }
    return <Chip label={notification.status || 'Unknown'} size="small" />;
  };

  const getTypeChip = (type) => {
    const colors = {
      order: 'info',
      promotion: 'success',
      system: 'default',
      payment: 'warning',
    };
    return <Chip label={type} size="small" color={colors[type] || 'default'} />;
  };

  const getSendToLabel = (sendTo) => {
    const labels = {
      all: 'All Users',
      customers: 'Customers',
      agents: 'Agents',
      specific: 'Specific User',
    };
    return labels[sendTo] || sendTo;
  };

  const stats = {
    total: notifications.length,
    sent: notifications.filter(n => n.status === 'sent').length,
    pending: notifications.filter(n => n.status === 'pending').length,
    failed: notifications.filter(n => n.status === 'failed').length,
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Notifications
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={fetchNotifications}
            sx={{ borderColor: Colors.primary, color: Colors.primary }}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<Send />}
            onClick={() => setOpenDialog(true)}
            sx={{ bgcolor: Colors.primary }}
          >
            Send Notification
          </Button>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <Paper sx={{ p: 2, textAlign: 'center', bgcolor: Colors.primaryBg }}>
            <Typography variant="h4" sx={{ color: Colors.primary }}>{stats.total}</Typography>
            <Typography variant="body2" color="text.secondary">Total Sent</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#ECFDF5' }}>
            <Typography variant="h4" sx={{ color: Colors.success }}>{stats.sent}</Typography>
            <Typography variant="body2" color="text.secondary">Delivered</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#FFFBEB' }}>
            <Typography variant="h4" sx={{ color: Colors.warning }}>{stats.pending}</Typography>
            <Typography variant="body2" color="text.secondary">Pending</Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Notifications Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ bgcolor: Colors.gray[50] }}>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Send To</TableCell>
              <TableCell align="center">Recipients</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Sent At</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {notifications.length > 0 ? (
              notifications.map((notif) => (
                <TableRow key={notif.id} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight={500}>
                      {notif.title}
                    </Typography>
                  </TableCell>
                  <TableCell>{getTypeChip(notif.type)}</TableCell>
                  <TableCell>
                    <Chip 
                      label={getSendToLabel(notif.send_to)} 
                      size="small" 
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Chip 
                      label={notif.recipients || 0} 
                      size="small" 
                      color="primary"
                      sx={{ minWidth: 30 }}
                    />
                  </TableCell>
                  <TableCell>{getStatusChip(notif)}</TableCell>
                  <TableCell>
                    {notif.sent_at ? new Date(notif.sent_at).toLocaleString() : '-'}
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                      <Tooltip title="View">
                        <IconButton
                          size="small"
                          onClick={() => {
                            setSelectedNotification(notif);
                            setOpenViewDialog(true);
                          }}
                        >
                          <Visibility fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      {notif.status === 'pending' && (
                        <Tooltip title="Mark as Read">
                          <IconButton
                            size="small"
                            color="success"
                            onClick={() => handleMarkAsRead(notif.id)}
                          >
                            <CheckCircle fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDeleteNotification(notif.id)}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    No notifications found
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Send Notification Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: Colors.primaryBg }}>
          <Typography variant="h6">Send Notification</Typography>
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            sx={{ mt: 2 }}
            required
          />
          <TextField
            fullWidth
            label="Message"
            multiline
            rows={4}
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            sx={{ mt: 2 }}
            required
          />
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Type</InputLabel>
            <Select
              value={formData.type}
              label="Type"
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            >
              <MenuItem value="order">Order</MenuItem>
              <MenuItem value="promotion">Promotion</MenuItem>
              <MenuItem value="system">System</MenuItem>
              <MenuItem value="payment">Payment</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Send To</InputLabel>
            <Select
              value={formData.send_to}
              label="Send To"
              onChange={(e) => setFormData({ ...formData, send_to: e.target.value })}
            >
              <MenuItem value="all">All Users</MenuItem>
              <MenuItem value="customers">Customers Only</MenuItem>
              <MenuItem value="agents">Agents Only</MenuItem>
              <MenuItem value="specific">Specific User</MenuItem>
            </Select>
          </FormControl>
          {formData.send_to === 'specific' && (
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel>Select User</InputLabel>
              <Select
                value={formData.user_id}
                label="Select User"
                onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
              >
                {users.map((user) => (
                  <MenuItem key={user.id} value={user.id}>
                    {user.full_name} ({user.phone_number})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSendNotification}
            disabled={sending}
            sx={{ bgcolor: Colors.primary }}
          >
            {sending ? 'Sending...' : 'Send Now'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Notification Dialog */}
      <Dialog open={openViewDialog} onClose={() => setOpenViewDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: Colors.primaryBg }}>
          <Typography variant="h6">Notification Details</Typography>
        </DialogTitle>
        <DialogContent>
          {selectedNotification && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">Title</Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>{selectedNotification.title}</Typography>

              <Typography variant="subtitle2" color="text.secondary">Message</Typography>
              <Paper sx={{ p: 2, bgcolor: Colors.gray[50], mb: 2 }}>
                <Typography variant="body2">{selectedNotification.message}</Typography>
              </Paper>

              <Typography variant="subtitle2" color="text.secondary">Type</Typography>
              <Box sx={{ mb: 2 }}>{getTypeChip(selectedNotification.type)}</Box>

              <Typography variant="subtitle2" color="text.secondary">Send To</Typography>
              <Box sx={{ mb: 2 }}>
                <Chip label={getSendToLabel(selectedNotification.send_to)} size="small" />
              </Box>

              <Typography variant="subtitle2" color="text.secondary">Recipients</Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                <Chip label={selectedNotification.recipients || 0} color="primary" />
              </Typography>

              <Typography variant="subtitle2" color="text.secondary">Status</Typography>
              <Box sx={{ mb: 2 }}>{getStatusChip(selectedNotification)}</Box>

              <Typography variant="subtitle2" color="text.secondary">Sent At</Typography>
              <Typography variant="body1">
                {selectedNotification.sent_at ? new Date(selectedNotification.sent_at).toLocaleString() : '-'}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenViewDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}