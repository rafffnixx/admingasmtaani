// 📁 admin-web/src/pages/IncomingCalls.jsx
import React, { useEffect, useState, useRef } from 'react';
import {
  Box, Typography, Paper, Button, Card, CardContent, Chip,
  Grid, IconButton, CircularProgress, Stack, Alert,
} from '@mui/material';
import { PhoneInTalk, CallEnd, Mic, MicOff, Refresh } from '@mui/icons-material';
import AgoraRTC from 'agora-rtc-sdk-ng';
import { Colors } from '../utils/colors';
import { adminAPI } from '../services/api';

export default function IncomingCalls() {
  const [calls, setCalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCall, setActiveCall] = useState(null);
  const [connected, setConnected] = useState(false);
  const [micMuted, setMicMuted] = useState(false);
  const [error, setError] = useState(null);

  const agoraClientRef = useRef(null);
  const localAudioTrackRef = useRef(null);
  const pollRef = useRef(null);

  const fetchCalls = async () => {
    try {
      const res = await adminAPI.getActiveSupportCalls();
      setCalls(Array.isArray(res.data) ? res.data : []);
      setError(null);
    } catch (err) {
      setError('Failed to fetch calls');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCalls();
    pollRef.current = setInterval(fetchCalls, 3000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, []);

  const answerCall = async (call) => {
    try {
      const appId = import.meta.env.VITE_AGORA_APP_ID;
      if (!appId) { setError('Agora App ID not configured'); return; }

      const tokenRes = await adminAPI.answerSupportCall(call.id);
      const { token, uid, channel_name } = tokenRes.data || {};
      if (!token || !channel_name) { setError('Backend did not return token'); return; }

      const client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
      agoraClientRef.current = client;
      await client.join(appId, channel_name, token, uid);

      const audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
      localAudioTrackRef.current = audioTrack;
      await client.publish([audioTrack]);

      client.on('user-published', async (user, mediaType) => {
        if (mediaType === 'audio') {
          await client.subscribe(user, mediaType);
          user.audioTrack.play();
        }
      });
      client.on('user-left', () => endCall());

      setActiveCall({ ...call, channel_name });
      setConnected(true);
      setError(null);
      fetchCalls();
    } catch (err) {
      console.error('Answer call error:', err);
      setError(err?.response?.data?.error || err.message || 'Failed to answer');
    }
  };

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
        await adminAPI.endSupportCall(activeCall.id).catch(() => {});
      }
    } catch (e) { console.warn(e.message); }
    finally {
      setActiveCall(null);
      setConnected(false);
      setMicMuted(false);
      fetchCalls();
    }
  };

  const toggleMic = async () => {
    if (!localAudioTrackRef.current) return;
    const next = !micMuted;
    await localAudioTrackRef.current.setEnabled(!next);
    setMicMuted(next);
  };

  const ringing = calls.filter((c) => c.status === 'ringing');
  const answered = calls.filter((c) => c.status === 'answered');

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress sx={{ color: Colors.primary }} /></Box>;
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold">Incoming Calls</Typography>
          <Typography variant="body2" color="text.secondary">{ringing.length} ringing · {answered.length} answered</Typography>
        </Box>
        <Button variant="outlined" startIcon={<Refresh />} onClick={fetchCalls}>Refresh</Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {activeCall && (
        <Paper sx={{ p: 2, mb: 3, bgcolor: '#ECFDF5', border: '2px solid #22C55E' }}>
          <Stack direction="row" alignItems="center" gap={2}>
            <Box sx={{ width: 48, height: 48, borderRadius: '50%', bgcolor: '#22C55E', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <PhoneInTalk sx={{ color: '#fff', fontSize: 28 }} />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" fontWeight={700} color="success.main">{connected ? 'Call Connected' : 'Connecting…'}</Typography>
              <Typography variant="body2" color="text.secondary">{activeCall.caller_name} — {activeCall.caller_phone}</Typography>
            </Box>
            <IconButton onClick={toggleMic} sx={{ bgcolor: micMuted ? '#EF4444' : '#22C55E', color: '#fff', '&:hover': { bgcolor: micMuted ? '#DC2626' : '#16A34A' } }}>
              {micMuted ? <MicOff /> : <Mic />}
            </IconButton>
            <Button variant="contained" color="error" startIcon={<CallEnd />} onClick={endCall}>End</Button>
          </Stack>
        </Paper>
      )}

      <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1.5 }}>Ringing Now</Typography>
      {ringing.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>No ringing calls right now.</Paper>
      ) : (
        <Grid container spacing={2}>
          {ringing.map((call) => (
            <Grid item xs={12} md={6} key={call.id}>
              <Card sx={{ border: '2px solid #EF4444' }}>
                <CardContent>
                  <Stack direction="row" alignItems="center" gap={1.5}>
                    <Box sx={{ width: 44, height: 44, borderRadius: '50%', bgcolor: '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <PhoneInTalk sx={{ color: '#EF4444' }} />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography fontWeight={700}>{call.caller_name || 'Caller'}</Typography>
                      <Typography variant="caption" color="text.secondary">{call.caller_phone || 'N/A'} · {call.caller_type}</Typography>
                    </Box>
                    <Chip label="Ringing" color="error" size="small" />
                  </Stack>
                  <Stack direction="row" gap={1} mt={2}>
                    <Button variant="contained" fullWidth startIcon={<PhoneInTalk />} sx={{ bgcolor: '#22C55E', '&:hover': { bgcolor: '#16A34A' } }} onClick={() => answerCall(call)}>Answer</Button>
                    <Button variant="outlined" color="error" fullWidth startIcon={<CallEnd />} onClick={async () => { await adminAPI.endSupportCall(call.id).catch(() => {}); fetchCalls(); }}>Decline</Button>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {answered.length > 0 && (
        <>
          <Typography variant="subtitle1" fontWeight={700} sx={{ mt: 4, mb: 1.5 }}>Answered</Typography>
          <Grid container spacing={2}>
            {answered.map((call) => (
              <Grid item xs={12} md={6} key={call.id}>
                <Card>
                  <CardContent>
                    <Stack direction="row" alignItems="center" gap={1.5}>
                      <Typography fontWeight={600}>{call.caller_name || 'Caller'}</Typography>
                      <Chip label="Answered" color="success" size="small" />
                      <Box sx={{ flex: 1 }} />
                      <Button size="small" color="error" startIcon={<CallEnd />} onClick={async () => { await adminAPI.endSupportCall(call.id).catch(() => {}); fetchCalls(); }}>End</Button>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </>
      )}
    </Box>
  );
}