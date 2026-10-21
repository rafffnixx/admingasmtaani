// 📁 admin-web/src/components/AdminCallListener.jsx
import React, { useEffect, useState, useRef } from 'react';
import { Box, Paper, Typography, Button, Stack } from '@mui/material';
import { PhoneInTalk, CallEnd } from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { adminAPI } from '../services/api';

export default function AdminCallListener() {
  const [ringingCall, setRingingCall] = useState(null);
  const pollRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const poll = async () => {
    if (location.pathname === '/incoming-calls') {
      setRingingCall(null);
      return;
    }
    try {
      const res = await adminAPI.getPendingSupportCalls();
      const calls = Array.isArray(res.data) ? res.data : [];
      setRingingCall(calls.length > 0 ? calls[0] : null);
    } catch {}
  };

  useEffect(() => {
    poll();
    pollRef.current = setInterval(poll, 3000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [location.pathname]);

  const handleDecline = async () => {
    if (!ringingCall) return;
    try { await adminAPI.endSupportCall(ringingCall.id); } catch {}
    setRingingCall(null);
  };

  if (!ringingCall) return null;

  return (
    <Box sx={{ position: 'fixed', bottom: 24, right: 24, zIndex: 1300, maxWidth: 380 }}>
      <Paper elevation={8} sx={{ p: 2, bgcolor: '#FEF2F2', border: '2px solid #EF4444', borderRadius: 2 }}>
        <Stack direction="row" alignItems="center" gap={1.5} mb={1.5}>
          <Box sx={{ width: 40, height: 40, borderRadius: '50%', bgcolor: '#EF4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <PhoneInTalk sx={{ color: '#fff' }} />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle2" fontWeight={700} color="error">Incoming Support Call</Typography>
            <Typography variant="caption" color="text.secondary">
              {ringingCall.caller_name || 'Caller'} ({ringingCall.caller_phone || 'N/A'})
            </Typography>
          </Box>
        </Stack>
        <Stack direction="row" gap={1}>
          <Button size="small" variant="contained" fullWidth startIcon={<PhoneInTalk />}
            sx={{ bgcolor: '#22C55E', '&:hover': { bgcolor: '#16A34A' } }}
            onClick={() => navigate('/incoming-calls')}>
            Answer
          </Button>
          <Button size="small" variant="outlined" color="error" fullWidth startIcon={<CallEnd />} onClick={handleDecline}>
            Decline
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
}