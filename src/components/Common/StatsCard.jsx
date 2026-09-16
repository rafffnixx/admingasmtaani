import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { Colors } from '../../utils/colors';

export default function StatsCard({ title, value, icon, color, bg }) {
  return (
    <Card sx={{ bgcolor: bg || Colors.white }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              {title}
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 'bold', color: color || Colors.textPrimary }}>
              {value}
            </Typography>
          </Box>
          <Box sx={{ color: color || Colors.primary }}>{icon}</Box>
        </Box>
      </CardContent>
    </Card>
  );
}