import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Paper, Typography } from '@mui/material';
import { Colors } from '../../utils/colors';

const data = [
  { day: 'Mon', revenue: 12000 },
  { day: 'Tue', revenue: 18500 },
  { day: 'Wed', revenue: 15200 },
  { day: 'Thu', revenue: 22000 },
  { day: 'Fri', revenue: 28000 },
  { day: 'Sat', revenue: 32000 },
  { day: 'Sun', revenue: 25000 },
];

export default function RevenueChart() {
  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
        Weekly Revenue
      </Typography>
      <ResponsiveContainer width="100%" height={250}>
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke={Colors.gray[200]} />
          <XAxis dataKey="day" tick={{ fill: Colors.gray[500] }} />
          <YAxis tick={{ fill: Colors.gray[500] }} tickFormatter={(v) => `KES ${v/1000}k`} />
          <Tooltip formatter={(v) => `KES ${v.toLocaleString()}`} />
          <Area type="monotone" dataKey="revenue" stroke={Colors.primary} fill={Colors.primary} fillOpacity={0.2} />
        </AreaChart>
      </ResponsiveContainer>
    </Paper>
  );
}