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
  Grid,
  Switch,
  FormControlLabel,
  CircularProgress,
  Tooltip,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Refresh,
  LocalOffer,
  Percent,
  CheckCircle,
  Cancel,
} from '@mui/icons-material';
import { Colors } from '../utils/colors';
import { adminAPI } from '../services/api';

export default function Promotions() {
  const [loading, setLoading] = useState(true);
  const [promotions, setPromotions] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingPromo, setEditingPromo] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    type: 'percentage',
    value: 0,
    min_order: 0,
    max_discount: 0,
    expires_at: '',
    is_active: true,
  });

  useEffect(() => {
    fetchPromotions();
  }, []);

  const fetchPromotions = async () => {
    try {
      // Mock data for now
      setPromotions([
        { id: 1, code: 'WELCOME10', type: 'percentage', value: 10, min_order: 500, max_discount: 200, expires_at: '2024-12-31', is_active: true, used_count: 45 },
        { id: 2, code: 'FREEDEL', type: 'free_delivery', value: 0, min_order: 1000, max_discount: 0, expires_at: '2024-11-30', is_active: true, used_count: 23 },
        { id: 3, code: 'SAVE20', type: 'percentage', value: 20, min_order: 2000, max_discount: 500, expires_at: '2024-10-15', is_active: false, used_count: 12 },
      ]);
    } catch (error) {
      console.error('Error fetching promotions:', error);
    } finally {
      setLoading(false);
    }
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
          Promotions & Discounts
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={fetchPromotions}
            sx={{ borderColor: Colors.primary, color: Colors.primary }}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => { setEditingPromo(null); setOpenDialog(true); }}
            sx={{ bgcolor: Colors.primary }}
          >
            Add Promotion
          </Button>
        </Box>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ bgcolor: Colors.gray[50] }}>
            <TableRow>
              <TableCell>Code</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Value</TableCell>
              <TableCell>Min Order</TableCell>
              <TableCell>Expires</TableCell>
              <TableCell>Used</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {promotions.map((promo) => (
              <TableRow key={promo.id} hover>
                <TableCell>
                  <Chip label={promo.code} sx={{ fontWeight: 'bold', bgcolor: Colors.primaryBg }} />
                </TableCell>
                <TableCell>{promo.type.replace('_', ' ').toUpperCase()}</TableCell>
                <TableCell>
                  {promo.type === 'percentage' ? `${promo.value}%` : promo.type === 'free_delivery' ? 'Free' : `KES ${promo.value}`}
                </TableCell>
                <TableCell>KES {promo.min_order}</TableCell>
                <TableCell>{new Date(promo.expires_at).toLocaleDateString()}</TableCell>
                <TableCell>{promo.used_count}</TableCell>
                <TableCell>
                  <Chip
                    label={promo.is_active ? 'Active' : 'Inactive'}
                    color={promo.is_active ? 'success' : 'error'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <IconButton size="small" onClick={() => { setEditingPromo(promo); setOpenDialog(true); }}>
                    <Edit fontSize="small" />
                  </IconButton>
                  <IconButton size="small" color="error">
                    <Delete fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}