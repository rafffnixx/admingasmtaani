import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { Colors } from '../../utils/colors';

export default function Loading() {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <CircularProgress sx={{ color: Colors.primary }} />
      <Typography sx={{ ml: 2, color: Colors.textSecondary }}>Loading...</Typography>
    </Box>
  );
}