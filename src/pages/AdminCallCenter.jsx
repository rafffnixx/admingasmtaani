// 📁 gas-mtaani-admin/src/pages/AdminCallCenter.jsx
import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Tabs, Tab, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Button, Chip, CircularProgress, Avatar
} from '@mui/material';
import { Phone, Person, Storefront } from '@mui/icons-material';
import { Colors } from '../utils/colors';

export default function AdminCallCenter() {
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [history, setHistory] = useState([]);
  const [callingId, setCallingId] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('admin_token') || localStorage.getItem('token');
      
      // Fetch Users (Assuming you have a combined endpoint or fetch both)
      // For this example, I'll fetch agents and customers
      const [agentsRes, customersRes, historyRes] = await Promise.all([
        fetch('https://gas-mtaani-backend.onrender.com/api/admin/agents', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()).catch(() => []),
        fetch('https://gas-mtaani-backend.onrender.com/api/admin/customers', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()).catch(() => []),
        fetch('https://gas-mtaani-backend.onrender.com/api/agora/history', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()).catch(() => [])
      ]);

      const combinedUsers = [
        ...(Array.isArray(agentsRes) ? agentsRes : agentsRes.data || []).map(a => ({ ...a, role: 'agent', name: a.business_name || a.full_name })),
        ...(Array.isArray(customersRes) ? customersRes : customersRes.data || []).map(c => ({ ...c, role: 'customer', name: c.full_name }))
      ];

      setUsers(combinedUsers);
      setHistory(Array.isArray(historyRes) ? historyRes : []);

    } catch (err) {
      console.error('Failed to fetch data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCall = async (userId) => {
    setCallingId(userId);
    try {
      const token = localStorage.getItem('admin_token') || localStorage.getItem('token');
      const res = await fetch('https://gas-mtaani-backend.onrender.com/api/agora/admin-call/ring', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ target_user_id: userId })
      });
      const data = await res.json();
      
      if (data.success) {
        alert('📞 Ringing device... Wait for them to answer.');
        fetchData(); // Refresh history
      } else {
        alert(`Failed to call: ${data.error}`);
      }
    } catch (err) {
      alert('Error making call');
    } finally {
      setCallingId(null);
    }
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>;
  }

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" mb={3}>Call Center</Typography>
      
      <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}>
        <Tab label="Directory" />
        <Tab label="Call History" />
      </Tabs>

      {/* TAB 0: DIRECTORY (CALL USERS) */}
      {tabValue === 0 && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead sx={{ bgcolor: Colors.gray[50] }}>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell align="center">Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id} hover>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1.5}>
                      <Avatar sx={{ bgcolor: user.role === 'agent' ? Colors.primary : '#3B82F6', width: 32, height: 32 }}>
                        {user.role === 'agent' ? <Storefront fontSize="small" /> : <Person fontSize="small" />}
                      </Avatar>
                      <Typography fontWeight={500}>{user.name}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip size="small" label={user.role.toUpperCase()} color={user.role === 'agent' ? 'warning' : 'info'} />
                  </TableCell>
                  <TableCell>{user.phone_number}</TableCell>
                  <TableCell align="center">
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<Phone />}
                      disabled={callingId === user.id}
                      onClick={() => handleCall(user.id)}
                      sx={{ bgcolor: Colors.primary, '&:hover': { bgcolor: Colors.primaryDark } }}
                    >
                      {callingId === user.id ? 'Ringing...' : 'Call'}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* TAB 1: CALL HISTORY */}
      {tabValue === 1 && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead sx={{ bgcolor: Colors.gray[50] }}>
              <TableRow>
                <TableCell>Date / Time</TableCell>
                <TableCell>Contact</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Duration</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {history.length === 0 ? (
                <TableRow><TableCell colSpan={5} align="center">No call history found.</TableCell></TableRow>
              ) : (
                history.map((log) => (
                  <TableRow key={log.id} hover>
                    <TableCell>{new Date(log.created_at).toLocaleString()}</TableCell>
                    <TableCell>{log.callee_name || log.caller_name}</TableCell>
                    <TableCell>{log.order_id ? 'Order Call' : 'Support Call'}</TableCell>
                    <TableCell>
                      <Chip 
                        size="small" 
                        label={log.status.toUpperCase()} 
                        color={log.status === 'ended' ? 'default' : log.status === 'answered' ? 'success' : 'warning'} 
                      />
                    </TableCell>
                    <TableCell>{log.duration_seconds ? `${log.duration_seconds}s` : '-'}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}