// admin-web/src/pages-marketer/MarketerCommissions.jsx
import React, { useEffect, useState } from 'react';
import {
  Box, Card, CardContent, Typography, Stack, Chip, Table, TableHead,
  TableRow, TableCell, TableBody, CircularProgress, Tabs, Tab, Alert,
} from '@mui/material';
import marketerApi from '../services/marketerApi';

const STATUS_COLOR = {
  pending: 'warning',
  approved: 'primary',
  paid: 'success',
  cancelled: 'default',
};

export default function MarketerCommissions() {
  const [tab, setTab] = useState('all');
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  const load = async (status) => {
    setLoading(true); setErr('');
    try {
      const params = status && status !== 'all' ? { status } : {};
      const { data } = await marketerApi.get('/marketers/commissions', { params });
      setList(Array.isArray(data) ? data : []);
    } catch (ex) {
      setErr(ex.response?.data?.error || 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(tab); }, [tab]);

  const totals = list.reduce((acc, c) => {
    acc[c.status] = (acc[c.status] || 0) + Number(c.amount);
    return acc;
  }, {});

  return (
    <Box>
      <Typography variant="h4" fontWeight={800} gutterBottom>Commissions</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Pending = waiting for admin approval. Approved = available for withdrawal. Paid = money sent.
      </Typography>

      <Stack direction="row" spacing={2} mb={3} flexWrap="wrap">
        <Chip color="warning" label={`Pending: KES ${(totals.pending || 0).toFixed(0)}`} />
        <Chip color="primary" label={`Approved: KES ${(totals.approved || 0).toFixed(0)}`} />
        <Chip color="success" label={`Paid: KES ${(totals.paid || 0).toFixed(0)}`} />
      </Stack>

      <Card>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tab value="all" label="All" />
          <Tab value="pending" label="Pending" />
          <Tab value="approved" label="Approved" />
          <Tab value="paid" label="Paid" />
        </Tabs>
        <CardContent sx={{ p: 0 }}>
          {err && <Alert severity="error" sx={{ m: 2 }}>{err}</Alert>}
          {loading ? (
            <Box sx={{ p: 4, textAlign: 'center' }}><CircularProgress /></Box>
          ) : list.length === 0 ? (
            <Box sx={{ p: 6, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                No commissions in this category yet.
              </Typography>
            </Box>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Customer</TableCell>
                  <TableCell>Order</TableCell>
                  <TableCell align="right">Amount</TableCell>
                  <TableCell align="right">Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {list.map((c) => (
                  <TableRow key={c.id} hover>
                    <TableCell>
                      {new Date(c.created_at).toLocaleDateString('en-KE', {
                        day: '2-digit', month: 'short', year: 'numeric',
                      })}
                    </TableCell>
                    <TableCell>{c.customer_name || '—'}</TableCell>
                    <TableCell>
                      <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>
                        {c.order_id?.slice(0, 8)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography fontWeight={700}>KES {Number(c.amount).toFixed(0)}</Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Chip
                        size="small"
                        label={c.status}
                        color={STATUS_COLOR[c.status] || 'default'}
                        variant={c.status === 'paid' ? 'filled' : 'outlined'}
                      />
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