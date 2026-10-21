// 📁 admin-web/src/pages/Support.jsx
import React, { useState, useEffect, useRef } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, IconButton, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  Tabs, Tab, Avatar, CircularProgress, Tooltip, MenuItem, FormControl, InputLabel, Select,
  Grid, Card, CardContent, Snackbar, Alert, Divider,
} from '@mui/material';
import {
  Refresh, Visibility, CheckCircle, Cancel, AccessTime, Person, Reply,
  PhoneInTalk, CallEnd, Mic, MicOff,
} from '@mui/icons-material';
import AgoraRTC from 'agora-rtc-sdk-ng';
import { Colors } from '../utils/colors';
import { adminAPI, api } from '../services/api';

export default function Support() {
  const [loading, setLoading] = useState(true);
  const [tickets, setTickets] = useState([]);
  const [filteredTickets, setFilteredTickets] = useState([]);
  const [tabValue, setTabValue] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [openReplyDialog, setOpenReplyDialog] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [searchTerm, setSearchTerm] = useState('');
  const [replyMessage, setReplyMessage] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // ── Live Call State ──
  const [pendingCalls, setPendingCalls] = useState([]);
  const [activeCall, setActiveCall] = useState(null);
  const [callConnected, setCallConnected] = useState(false);
  const [micMuted, setMicMuted] = useState(false);
  const agoraClientRef = useRef(null);
  const localAudioTrackRef = useRef(null);
  const pollRef = useRef(null);

  useEffect(() => {
    fetchTickets();
    pollPendingCalls();

    pollRef.current = setInterval(pollPendingCalls, 5000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
      endCall();
    };
  }, []);

  // ── Fetch pending support calls (from Agora) ──
  const pollPendingCalls = async () => {
    try {
      const res = await api.get('/admin/support-calls/pending');
      setPendingCalls(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      // Silent — endpoint may not exist yet
    }
  };

  // ── Answer call from browser ──
  const answerCall = async (call) => {
    try {
      const appId = import.meta.env.VITE_AGORA_APP_ID;
      if (!appId) {
        showSnackbar('Agora App ID not configured', 'error');
        return;
      }

      // 1. Call backend to get a token for this admin
      const tokenRes = await api.post(`/admin/support-calls/${call.id}/answer`);
      const { token, uid, channel_name } = tokenRes.data || {};

      if (!token || !channel_name) {
        showSnackbar('Backend did not return Agora token', 'error');
        return;
      }

      // 2. Join the Agora channel
      const client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
      agoraClientRef.current = client;

      await client.join(appId, channel_name, token, uid);

      // 3. Publish microphone
      const audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
      localAudioTrackRef.current = audioTrack;
      await client.publish([audioTrack]);

      // 4. Play remote audio
      client.on('user-published', async (user, mediaType) => {
        if (mediaType === 'audio') {
          await client.subscribe(user, mediaType);
          user.audioTrack.play();
        }
      });

      client.on('user-left', () => {
        showSnackbar('Caller ended the call', 'info');
        endCall();
      });

      setActiveCall({ ...call, channel_name });
      setCallConnected(true);
      showSnackbar('Connected — you can speak now');
    } catch (err) {
      console.error('Answer call error:', err);
      showSnackbar(err?.response?.data?.error || err.message || 'Failed to answer call', 'error');
    }
  };

  // ── End call ──
  const endCall = async () => {
    try {
      if (localAudioTrackRef.current) {
        localAudioTrackRef.current.stop();
        localAudioTrackRef.current.close();
        localAudioTrackRef.current = null;
      }
      if (agoraClientRef.current) {
        await agoraClientRef.current.leave();
        agoraClientRef.current = null;
      }
      if (activeCall?.id) {
        await api.post(`/admin/support-calls/${activeCall.id}/end`).catch(() => {});
      }
    } catch (e) {
      console.warn('End call error:', e.message);
    } finally {
      setActiveCall(null);
      setCallConnected(false);
      setMicMuted(false);
      pollPendingCalls();
    }
  };

  // ── Toggle mic ──
  const toggleMic = async () => {
    if (!localAudioTrackRef.current) return;
    const next = !micMuted;
    await localAudioTrackRef.current.setEnabled(!next);
    setMicMuted(next);
  };

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.getSupportTickets();
      setTickets(response.data || []);
      setFilteredTickets(response.data || []);
    } catch (error) {
      console.error('Error fetching support tickets:', error);
      showSnackbar('Failed to fetch support tickets', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    applyFilters(searchTerm, newValue, statusFilter);
  };

  const handleStatusFilterChange = (event) => {
    const newStatus = event.target.value;
    setStatusFilter(newStatus);
    applyFilters(searchTerm, tabValue, newStatus);
  };

  const handleSearch = (event) => {
    const term = event.target.value;
    setSearchTerm(term);
    applyFilters(term, tabValue, statusFilter);
  };

  const applyFilters = (search, tab, status) => {
    let filtered = tickets;
    if (tab === 1) filtered = filtered.filter(t => t.status === 'open');
    else if (tab === 2) filtered = filtered.filter(t => t.status === 'in_progress');
    else if (tab === 3) filtered = filtered.filter(t => t.status === 'resolved' || t.status === 'closed');
    if (status !== 'all') filtered = filtered.filter(t => t.status === status);
    if (search) {
      filtered = filtered.filter(t =>
        t.subject?.toLowerCase().includes(search.toLowerCase()) ||
        t.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
        t.message?.toLowerCase().includes(search.toLowerCase())
      );
    }
    setFilteredTickets(filtered);
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await adminAPI.updateSupportTicket(id, { status });
      showSnackbar(`Ticket ${status} successfully!`);
      fetchTickets();
    } catch (error) {
      showSnackbar('Failed to update ticket', 'error');
    }
  };

  const handleReply = async () => {
    if (!replyMessage.trim()) {
      showSnackbar('Please enter a reply message', 'error');
      return;
    }
    try {
      await adminAPI.replyToSupportTicket(selectedTicket.id, { message: replyMessage });
      showSnackbar('Reply sent successfully!');
      setOpenReplyDialog(false);
      setReplyMessage('');
      fetchTickets();
    } catch (error) {
      showSnackbar('Failed to send reply', 'error');
    }
  };

  const getStatusChip = (status) => {
    const colors = { open: 'warning', in_progress: 'info', resolved: 'success', closed: 'default' };
    const labels = { open: 'Open', in_progress: 'In Progress', resolved: 'Resolved', closed: 'Closed' };
    return <Chip label={labels[status] || status} color={colors[status] || 'default'} size="small" />;
  };

  const getPriorityChip = (priority) => {
    const colors = { low: 'success', medium: 'info', high: 'warning', urgent: 'error' };
    return <Chip label={priority} color={colors[priority] || 'default'} size="small" />;
  };

  const getStatusCount = (status) => tickets.filter(t => t.status === status).length;

  const stats = {
    total: tickets.length,
    open: getStatusCount('open'),
    inProgress: getStatusCount('in_progress'),
    resolved: getStatusCount('resolved'),
    closed: getStatusCount('closed'),
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
      {/* ──────────────────────────────────────────────── */}
      {/* LIVE INCOMING CALLS                            */}
      {/* ──────────────────────────────────────────────── */}
      {pendingCalls.length > 0 && !activeCall && (
        <Paper sx={{ p: 2, mb: 3, bgcolor: '#FEF2F2', border: '2px solid #EF4444', borderRadius: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <PhoneInTalk sx={{ color: '#EF4444', fontSize: 32 }} />
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" color="error" fontWeight="bold">
                🔔 Incoming Support Call
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {pendingCalls[0].caller_name || 'Caller'} ({pendingCalls[0].caller_phone || 'N/A'}) is waiting
              </Typography>
            </Box>
            <Button
              variant="contained"
              sx={{ bgcolor: '#22C55E', '&:hover': { bgcolor: '#16A34A' } }}
              startIcon={<PhoneInTalk />}
              onClick={() => answerCall(pendingCalls[0])}
            >
              Answer
            </Button>
            <Button
              variant="outlined"
              color="error"
              onClick={async () => {
                await api.post(`/admin/support-calls/${pendingCalls[0].id}/end`).catch(() => {});
                pollPendingCalls();
              }}
            >
              Decline
            </Button>
          </Box>
        </Paper>
      )}

      {activeCall && (
        <Paper sx={{ p: 2, mb: 3, bgcolor: '#ECFDF5', border: '2px solid #22C55E', borderRadius: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <PhoneInTalk sx={{ color: '#22C55E', fontSize: 32 }} />
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" color="success.main" fontWeight="bold">
                {callConnected ? '🎙️ Call Connected' : 'Connecting…'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {activeCall.caller_name || 'Caller'} — {activeCall.caller_phone || 'N/A'}
              </Typography>
            </Box>
            <IconButton
              onClick={toggleMic}
              sx={{
                bgcolor: micMuted ? '#EF4444' : '#22C55E',
                color: '#FFF',
                '&:hover': { bgcolor: micMuted ? '#DC2626' : '#16A34A' },
              }}
            >
              {micMuted ? <MicOff /> : <Mic />}
            </IconButton>
            <Button
              variant="contained"
              color="error"
              startIcon={<CallEnd />}
              onClick={endCall}
            >
              End Call
            </Button>
          </Box>
        </Paper>
      )}

      {/* ──────────────────────────────────────────────── */}
      {/* EXISTING SUPPORT TICKETS UI                    */}
      {/* ──────────────────────────────────────────────── */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Support Tickets
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField size="small" placeholder="Search tickets..." value={searchTerm} onChange={handleSearch} sx={{ width: 200 }} />
          <FormControl size="small" sx={{ minWidth: 130 }}>
            <InputLabel>Filter</InputLabel>
            <Select value={statusFilter} label="Filter" onChange={handleStatusFilterChange}>
              <MenuItem value="all">All Status</MenuItem>
              <MenuItem value="open">Open</MenuItem>
              <MenuItem value="in_progress">In Progress</MenuItem>
              <MenuItem value="resolved">Resolved</MenuItem>
              <MenuItem value="closed">Closed</MenuItem>
            </Select>
          </FormControl>
          <Button variant="outlined" startIcon={<Refresh />} onClick={fetchTickets} sx={{ borderColor: Colors.primary, color: Colors.primary }}>
            Refresh
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card><CardContent sx={{ textAlign: 'center' }}><Typography variant="h4" sx={{ color: Colors.primary }}>{stats.total}</Typography><Typography variant="body2" color="text.secondary">Total Tickets</Typography></CardContent></Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ borderLeft: `4px solid ${Colors.warning}` }}><CardContent sx={{ textAlign: 'center' }}><Typography variant="h4" sx={{ color: Colors.warning }}>{stats.open}</Typography><Typography variant="body2" color="text.secondary">Open</Typography></CardContent></Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ borderLeft: `4px solid ${Colors.info}` }}><CardContent sx={{ textAlign: 'center' }}><Typography variant="h4" sx={{ color: Colors.info }}>{stats.inProgress}</Typography><Typography variant="body2" color="text.secondary">In Progress</Typography></CardContent></Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ borderLeft: `4px solid ${Colors.success}` }}><CardContent sx={{ textAlign: 'center' }}><Typography variant="h4" sx={{ color: Colors.success }}>{stats.resolved}</Typography><Typography variant="body2" color="text.secondary">Resolved</Typography></CardContent></Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ borderLeft: `4px solid ${Colors.gray[400]}` }}><CardContent sx={{ textAlign: 'center' }}><Typography variant="h4" sx={{ color: Colors.gray[600] }}>{stats.closed}</Typography><Typography variant="body2" color="text.secondary">Closed</Typography></CardContent></Card>
        </Grid>
      </Grid>

      <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}>
        <Tab label="All" />
        <Tab label={`Open (${stats.open})`} />
        <Tab label={`In Progress (${stats.inProgress})`} />
        <Tab label={`Resolved/Closed (${stats.resolved + stats.closed})`} />
      </Tabs>

      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ bgcolor: Colors.gray[50] }}>
            <TableRow>
              <TableCell>Subject</TableCell>
              <TableCell>Customer</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Priority</TableCell>
              <TableCell>Date</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredTickets.length > 0 ? (
              filteredTickets.map((ticket) => (
                <TableRow key={ticket.id} hover>
                  <TableCell><Typography variant="body2" fontWeight={500}>{ticket.subject}</Typography></TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar sx={{ width: 24, height: 24, bgcolor: Colors.primary }}><Person sx={{ fontSize: 14 }} /></Avatar>
                      <Typography variant="body2">{ticket.customer_name || 'N/A'}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{getStatusChip(ticket.status)}</TableCell>
                  <TableCell>{getPriorityChip(ticket.priority)}</TableCell>
                  <TableCell>{ticket.created_at ? new Date(ticket.created_at).toLocaleDateString() : 'N/A'}</TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                      <Tooltip title="View Details">
                        <IconButton size="small" onClick={() => { setSelectedTicket(ticket); setOpenDialog(true); }}>
                          <Visibility fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      {ticket.status === 'open' && (
                        <Tooltip title="Mark In Progress">
                          <IconButton size="small" color="info" onClick={() => handleUpdateStatus(ticket.id, 'in_progress')}>
                            <AccessTime fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      {ticket.status === 'in_progress' && (
                        <Tooltip title="Mark Resolved">
                          <IconButton size="small" color="success" onClick={() => handleUpdateStatus(ticket.id, 'resolved')}>
                            <CheckCircle fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      {(ticket.status === 'open' || ticket.status === 'in_progress') && (
                        <Tooltip title="Reply">
                          <IconButton size="small" color="primary" onClick={() => { setSelectedTicket(ticket); setOpenReplyDialog(true); }}>
                            <Reply fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      {ticket.status === 'open' && (
                        <Tooltip title="Close">
                          <IconButton size="small" color="error" onClick={() => handleUpdateStatus(ticket.id, 'closed')}>
                            <Cancel fontSize="small" />
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
                  <Typography variant="body2" color="text.secondary">No tickets found</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* View Ticket Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ bgcolor: Colors.primaryBg }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">{selectedTicket?.subject}</Typography>
            <Box>{selectedTicket && getStatusChip(selectedTicket.status)}{selectedTicket && getPriorityChip(selectedTicket.priority)}</Box>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedTicket && (
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">Customer</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>{selectedTicket.customer_name || 'N/A'}</Typography>
                  <Typography variant="subtitle2" color="text.secondary">Phone</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>{selectedTicket.customer_phone || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">Status</Typography>
                  <Box sx={{ mb: 2 }}>{getStatusChip(selectedTicket.status)}</Box>
                  <Typography variant="subtitle2" color="text.secondary">Priority</Typography>
                  <Box sx={{ mb: 2 }}>{getPriorityChip(selectedTicket.priority)}</Box>
                  <Typography variant="subtitle2" color="text.secondary">Created</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>{selectedTicket.created_at ? new Date(selectedTicket.created_at).toLocaleString() : 'N/A'}</Typography>
                </Grid>
              </Grid>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle2" color="text.secondary">Message</Typography>
              <Paper sx={{ p: 2, bgcolor: Colors.gray[50], mb: 2 }}><Typography variant="body2">{selectedTicket.message}</Typography></Paper>
              <Typography variant="subtitle2" color="text.secondary">Actions</Typography>
              <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
                {selectedTicket.status === 'open' && (
                  <>
                    <Button size="small" variant="contained" color="info" onClick={() => { handleUpdateStatus(selectedTicket.id, 'in_progress'); setOpenDialog(false); }}>Mark In Progress</Button>
                    <Button size="small" variant="outlined" color="error" onClick={() => { handleUpdateStatus(selectedTicket.id, 'closed'); setOpenDialog(false); }}>Close</Button>
                  </>
                )}
                {selectedTicket.status === 'in_progress' && (
                  <Button size="small" variant="contained" color="success" onClick={() => { handleUpdateStatus(selectedTicket.id, 'resolved'); setOpenDialog(false); }}>Mark Resolved</Button>
                )}
                <Button size="small" variant="outlined" color="primary" onClick={() => { setOpenReplyDialog(true); setOpenDialog(false); }}>Reply</Button>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions><Button onClick={() => setOpenDialog(false)}>Close</Button></DialogActions>
      </Dialog>

      {/* Reply Dialog */}
      <Dialog open={openReplyDialog} onClose={() => setOpenReplyDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: Colors.primaryBg }}><Typography variant="h6">Reply to Ticket</Typography></DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" color="text.secondary">Subject</Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>{selectedTicket?.subject}</Typography>
            <Typography variant="subtitle2" color="text.secondary">Customer</Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>{selectedTicket?.customer_name}</Typography>
            <TextField fullWidth label="Reply Message" multiline rows={4} value={replyMessage} onChange={(e) => setReplyMessage(e.target.value)} placeholder="Type your reply here..." sx={{ mt: 2 }} />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenReplyDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleReply} sx={{ bgcolor: Colors.primary }}>Send Reply</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
}