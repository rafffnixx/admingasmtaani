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
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Tooltip,
  Alert,
} from '@mui/material';
import {
  Restore,
  DeleteForever,
  Refresh,
  Person,
  Store,
  ShoppingCart,
  Category,
  Warning,
} from '@mui/icons-material';
import { Colors } from '../utils/colors';
import { adminAPI } from '../services/api';

export default function Trash() {
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [deletedItems, setDeletedItems] = useState({
    customers: [],
    agents: [],
    products: [],
    orders: [],
  });
  const [selectedItem, setSelectedItem] = useState(null);
  const [openRestoreDialog, setOpenRestoreDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  useEffect(() => {
    fetchDeletedItems();
  }, []);

  const fetchDeletedItems = async () => {
    try {
      // Simulate deleted items
      setDeletedItems({
        customers: [
          { id: 1, name: 'John Doe', phone: '0712345678', deleted_at: '2024-01-15', reason: 'Account closed' },
          { id: 2, name: 'Jane Smith', phone: '0723456789', deleted_at: '2024-01-14', reason: 'Duplicate account' },
        ],
        agents: [
          { id: 1, business: 'Gas Express', phone: '0734567890', deleted_at: '2024-01-13', reason: 'Inactive' },
        ],
        products: [
          { id: 1, name: 'Old Hose', brand: 'Accessory', deleted_at: '2024-01-12', reason: 'Discontinued' },
        ],
        orders: [
          { id: 1, number: 'GM-2024-001', customer: 'John Doe', amount: 1200, deleted_at: '2024-01-11', reason: 'Cancelled' },
        ],
      });
    } catch (error) {
      console.error('Error fetching deleted items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = (item) => {
    setSelectedItem(item);
    setOpenRestoreDialog(true);
  };

  const handlePermanentDelete = (item) => {
    setSelectedItem(item);
    setOpenDeleteDialog(true);
  };

  const confirmRestore = async () => {
    try {
      await adminAPI.restoreItem?.(selectedItem.id, getCurrentType());
      alert('Item restored successfully!');
      setOpenRestoreDialog(false);
      fetchDeletedItems();
    } catch (error) {
      console.error('Error restoring item:', error);
      alert('Failed to restore item');
    }
  };

  const confirmPermanentDelete = async () => {
    try {
      await adminAPI.permanentDelete?.(selectedItem.id, getCurrentType());
      alert('Item permanently deleted!');
      setOpenDeleteDialog(false);
      fetchDeletedItems();
    } catch (error) {
      console.error('Error permanently deleting item:', error);
      alert('Failed to permanently delete item');
    }
  };

  const getCurrentType = () => {
    const types = ['customers', 'agents', 'products', 'orders'];
    return types[tabValue];
  };

  const getCurrentItems = () => {
    const keys = ['customers', 'agents', 'products', 'orders'];
    return deletedItems[keys[tabValue]] || [];
  };

  const getColumns = () => {
    const columns = {
      customers: ['Name', 'Phone', 'Deleted At', 'Reason'],
      agents: ['Business', 'Phone', 'Deleted At', 'Reason'],
      products: ['Name', 'Brand', 'Deleted At', 'Reason'],
      orders: ['Order #', 'Customer', 'Amount', 'Deleted At', 'Reason'],
    };
    return columns[getCurrentType()] || [];
  };

  const getRowData = (item) => {
    switch (getCurrentType()) {
      case 'customers':
        return [item.name, item.phone, item.deleted_at, item.reason];
      case 'agents':
        return [item.business, item.phone, item.deleted_at, item.reason];
      case 'products':
        return [item.name, item.brand, item.deleted_at, item.reason];
      case 'orders':
        return [item.number, item.customer, `KES ${item.amount}`, item.deleted_at, item.reason];
      default:
        return [];
    }
  };

  const tabs = [
    { label: 'Customers', icon: <Person />, count: deletedItems.customers.length },
    { label: 'Agents', icon: <Store />, count: deletedItems.agents.length },
    { label: 'Products', icon: <Category />, count: deletedItems.products.length },
    { label: 'Orders', icon: <ShoppingCart />, count: deletedItems.orders.length },
  ];

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
          Trash
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={fetchDeletedItems}
            sx={{ borderColor: Colors.primary, color: Colors.primary }}
          >
            Refresh
          </Button>
        </Box>
      </Box>

      {Object.values(deletedItems).flat().length === 0 && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Trash is empty. Deleted items will appear here.
        </Alert>
      )}

      <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} sx={{ mb: 3 }}>
        {tabs.map((tab, index) => (
          <Tab
            key={index}
            label={tab.label}
            icon={tab.icon}
            iconPosition="start"
            sx={{ '& .MuiTab-wrapper': { gap: 1 } }}
          />
        ))}
      </Tabs>

      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ bgcolor: Colors.gray[50] }}>
            <TableRow>
              {getColumns().map((col) => (
                <TableCell key={col}>{col}</TableCell>
              ))}
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {getCurrentItems().length > 0 ? (
              getCurrentItems().map((item, index) => (
                <TableRow key={index} hover>
                  {getRowData(item).map((value, i) => (
                    <TableCell key={i}>{value}</TableCell>
                  ))}
                  <TableCell align="center">
                    <Tooltip title="Restore">
                      <IconButton size="small" color="success" onClick={() => handleRestore(item)}>
                        <Restore fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Permanently Delete">
                      <IconButton size="small" color="error" onClick={() => handlePermanentDelete(item)}>
                        <DeleteForever fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={getColumns().length + 1} align="center" sx={{ py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    No items in trash
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Restore Dialog */}
      <Dialog open={openRestoreDialog} onClose={() => setOpenRestoreDialog(false)}>
        <DialogTitle>Restore Item</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to restore this item?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenRestoreDialog(false)}>Cancel</Button>
          <Button variant="contained" color="success" onClick={confirmRestore}>
            Restore
          </Button>
        </DialogActions>
      </Dialog>

      {/* Permanent Delete Dialog */}
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle sx={{ bgcolor: Colors.error, color: Colors.white }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Warning />
            Permanently Delete
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ mt: 2 }}>
            This action <strong>cannot be undone</strong>. Are you sure you want to permanently delete this item?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={confirmPermanentDelete}>
            Permanently Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}