// 📁 admin-web/src/components/AdminCallListener.jsx
import React, { useEffect, useState, useRef } from 'react';
import { Box, Paper, Typography, Button, Stack } from '@mui/material';
import { PhoneInTalk, CallEnd } from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { io } from 'socket.io-client';

export default function AdminCallListener() {
  const [ringingCall, setRingingCall] = useState(null);
  const ringtoneRef = useRef(null);
  const socketRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // 1. Setup Ringtone
    ringtoneRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
    ringtoneRef.current.loop = true;

    // 2. Connect Socket.io
    socketRef.current = io('https://gas-mtaani-backend.onrender.com');
    
    socketRef.current.on('connect', () => {
      socketRef.current.emit('join_admin_room');
    });

    // 3. Listen for instant incoming calls
    socketRef.current.on('incoming_call', (data) => {
      // Don't ring if we are already on the Incoming Calls page
      if (location.pathname === '/incoming-calls') return;
      
      setRingingCall(data);
      if (ringtoneRef.current) {
        ringtoneRef.current.play().catch(e => console.log('Audio blocked', e));
      }
    });

    // 4. Stop ringing if another admin answers
    socketRef.current.on('call_answered_by_other', () => {
      setRingingCall(null);
      if (ringtoneRef.current) ringtoneRef.current.pause();
    });

    return () => {
      socketRef.current.disconnect();
      if (ringtoneRef.current) ringtoneRef.current.pause();
    };
  }, [location.pathname]);

  const handleDecline = async () => {
    if (!ringingCall) return;
    try {
      const token = localStorage.getItem('admin_token') || localStorage.getItem('token');
      await fetch(`https://gas-mtaani-backend.onrender.com/api/agora/support-calls/${ringingCall.callId}/end`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch {}
    setRingingCall(null);
    if (ringtoneRef.current) ringtoneRef.current.pause();
  };

  const handleAnswer = () => {
    setRingingCall(null);
    if (ringtoneRef.current) ringtoneRef.current.pause();
    navigate('/incoming-calls');
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
              {ringingCall.callerName || 'Caller'} ({ringingCall.callerType})
            </Typography>
          </Box>
        </Stack>
        <Stack direction="row" gap={1}>
          <Button size="small" variant="contained" fullWidth startIcon={<PhoneInTalk />}
            sx={{ bgcolor: '#22C55E', '&:hover': { bgcolor: '#16A34A' } }}
            onClick={handleAnswer}>
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