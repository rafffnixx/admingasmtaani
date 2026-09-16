// 📁 admin-web/src/pages/Customers.jsx

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
  TextField,
  InputAdornment,
  Avatar,
  CircularProgress,
  Card,
  CardContent,
  Grid,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  Snackbar,
  Alert,
  Menu,
  MenuItem,
  ListItemIcon,
  FormControl,
  InputLabel,
  Select,
  Switch,
  FormControlLabel,
  Tooltip,
  Divider,
  Badge,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction,
} from '@mui/material';
import {
  Search,
  PersonAdd,
  FilterList,
  MoreVert,
  Phone,
  Email,
  LocationOn,
  Visibility,
  Edit,
  Delete,
  Block,
  CheckCircle,
  Cancel,
  Refresh,
  Download,
  Print,
  History,
  ShoppingCart,
  AttachMoney,
  Star,
  StarBorder,
  Verified,
  VerifiedUser,
  Close,
  Save,
  Person,
  CalendarToday,
  TrendingUp,
  TrendingDown,
  Add,
  Send,
  Lock,
  AccountCircle,
  Receipt,
  Chat,
  SupportAgent,
  Payment,
  Info,
  ArrowBack,
  ArrowForward,
} from '@mui/icons-material';
import { Colors } from '../utils/colors';
import { adminAPI, authAPI } from '../services/api';

// ============================================
// TAB PANEL COMPONENT
// ============================================
function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`customer-tabpanel-${index}`}
      aria-labelledby={`customer-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

export default function Customers() {
  // ============================================
  // STATE
  // ============================================
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openBulkDialog, setOpenBulkDialog] = useState(false);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [profileTabValue, setProfileTabValue] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [anchorEl, setAnchorEl] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedCustomers, setSelectedCustomers] = useState([]);
  const [bulkAction, setBulkAction] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Customer profile data
  const [customerOrders, setCustomerOrders] = useState([]);
  const [customerPayments, setCustomerPayments] = useState([]);
  const [customerChats, setCustomerChats] = useState([]);
  const [customerSupportTickets, setCustomerSupportTickets] = useState([]);
  const [customerProfile, setCustomerProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false);

  const [editForm, setEditForm] = useState({
    full_name: '',
    phone_number: '',
    email: '',
    is_active: true,
    user_type: 'customer',
  });

  const [createForm, setCreateForm] = useState({
    full_name: '',
    phone_number: '',
    email: '',
    password: '',
    confirm_password: '',
    user_type: 'customer',
    is_active: true,
    is_verified: true,
  });

  const [createErrors, setCreateErrors] = useState({});

  // ============================================
  // STATS
  // ============================================
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    total_spent: 0,
    avg_orders: 0,
    new_this_month: 0,
  });

  // ============================================
  // FETCH FUNCTIONS
  // ============================================
  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.getCustomers();
      console.log('📦 Customers response:', response);
      
      let customersData = [];
      if (Array.isArray(response)) {
        customersData = response;
      } else if (response?.data && Array.isArray(response.data)) {
        customersData = response.data;
      } else if (response?.data?.data && Array.isArray(response.data.data)) {
        customersData = response.data.data;
      }
      
      console.log('✅ Processed customers:', customersData.length);
      setCustomers(customersData);
      calculateStats(customersData);
      
    } catch (error) {
      console.error('Error fetching customers:', error);
      showSnackbar('Failed to fetch customers', 'error');
      setCustomers([]);
      calculateStats([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data) => {
    const total = data.length;
    const active = data.filter(c => c.is_active !== false).length;
    const inactive = data.filter(c => c.is_active === false).length;
    const total_spent = data.reduce((sum, c) => sum + (parseFloat(c.total_spent) || 0), 0);
    const avg_orders = total > 0 ? Math.round(data.reduce((sum, c) => sum + (c.orders_count || 0), 0) / total) : 0;
    const new_this_month = data.filter(c => {
      const joined = new Date(c.joined_at || c.created_at);
      const now = new Date();
      return joined.getMonth() === now.getMonth() && joined.getFullYear() === now.getFullYear();
    }).length;

    setStats({ total, active, inactive, total_spent, avg_orders, new_this_month });
  };

  // ============================================
  // ✅ FIXED: FETCH CUSTOMER PROFILE DATA
  // ============================================
  const fetchCustomerProfileData = async (customerId) => {
    setLoadingProfile(true);
    try {
      // Use the customer data we already have from the list
      const customer = customers.find(c => c.id === customerId);
      if (customer) {
        setCustomerProfile(customer);
        setSelectedCustomer(prev => ({ ...prev, ...customer }));
      }

      // ✅ Fetch customer orders from the dedicated endpoint
      try {
        const ordersResponse = await adminAPI.getCustomerOrders?.(customerId);
        console.log('📦 Orders response:', ordersResponse);
        
        let ordersData = [];
        if (ordersResponse?.data && Array.isArray(ordersResponse.data)) {
          ordersData = ordersResponse.data;
        } else if (Array.isArray(ordersResponse)) {
          ordersData = ordersResponse;
        }
        
        console.log('✅ Orders found:', ordersData.length);
        setCustomerOrders(ordersData);
      } catch (err) {
        console.log('Orders endpoint not available, using customer data');
        setCustomerOrders([]);
      }

      // Fetch customer payments
      try {
        const paymentsResponse = await adminAPI.getCustomerPayments?.(customerId);
        const paymentsData = paymentsResponse?.data || paymentsResponse || [];
        setCustomerPayments(paymentsData);
      } catch (err) {
        setCustomerPayments([]);
      }

      // Fetch customer chats
      try {
        const chatsResponse = await adminAPI.getCustomerChats?.(customerId);
        const chatsData = chatsResponse?.data || chatsResponse || [];
        setCustomerChats(chatsData);
      } catch (err) {
        setCustomerChats([]);
      }

      // Fetch customer support tickets
      try {
        const ticketsResponse = await adminAPI.getCustomerTickets?.(customerId);
        const ticketsData = ticketsResponse?.data || ticketsResponse || [];
        setCustomerSupportTickets(ticketsData);
      } catch (err) {
        setCustomerSupportTickets([]);
      }

    } catch (error) {
      console.error('Error fetching customer profile:', error);
      showSnackbar('Failed to load customer details', 'error');
    } finally {
      setLoadingProfile(false);
    }
  };

  // ============================================
  // HANDLER FUNCTIONS
  // ============================================
  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleViewCustomer = (customer) => {
    setSelectedCustomer(customer);
    setProfileTabValue(0);
    setOpenViewDialog(true);
    fetchCustomerProfileData(customer.id);
  };

  const handleEditCustomer = (customer) => {
    setSelectedCustomer(customer);
    setEditForm({
      full_name: customer.full_name || '',
      phone_number: customer.phone_number || '',
      email: customer.email || '',
      is_active: customer.is_active !== false,
      user_type: customer.user_type || 'customer',
    });
    setOpenEditDialog(true);
  };

  const handleDeleteCustomer = (customer) => {
    setSelectedCustomer(customer);
    setOpenDeleteDialog(true);
  };

  const handleUpdateCustomer = async () => {
    setSubmitting(true);
    try {
      await adminAPI.updateCustomer?.(selectedCustomer.id, editForm);
      showSnackbar('Customer updated successfully!');
      setOpenEditDialog(false);
      await fetchCustomers();
    } catch (error) {
      console.error('Error updating customer:', error);
      const updatedCustomers = customers.map(c =>
        c.id === selectedCustomer.id ? { ...c, ...editForm } : c
      );
      setCustomers(updatedCustomers);
      calculateStats(updatedCustomers);
      showSnackbar('Customer updated (local)', 'success');
      setOpenEditDialog(false);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    setSubmitting(true);
    try {
      await adminAPI.deleteCustomer?.(selectedCustomer.id);
      showSnackbar('Customer deleted successfully!');
      setOpenDeleteDialog(false);
      await fetchCustomers();
    } catch (error) {
      console.error('Error deleting customer:', error);
      const updatedCustomers = customers.filter(c => c.id !== selectedCustomer.id);
      setCustomers(updatedCustomers);
      calculateStats(updatedCustomers);
      showSnackbar('Customer deleted (local)', 'success');
      setOpenDeleteDialog(false);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (customer) => {
    try {
      const newStatus = !customer.is_active;
      await adminAPI.toggleCustomerStatus?.(customer.id, newStatus);
      showSnackbar(`Customer ${newStatus ? 'activated' : 'deactivated'} successfully!`);
      await fetchCustomers();
    } catch (error) {
      console.error('Error toggling status:', error);
      const updatedCustomers = customers.map(c =>
        c.id === customer.id ? { ...c, is_active: !c.is_active } : c
      );
      setCustomers(updatedCustomers);
      calculateStats(updatedCustomers);
      showSnackbar(`Customer ${!customer.is_active ? 'activated' : 'deactivated'} (local)`, 'success');
    }
  };

  // ============================================
  // CREATE CUSTOMER FUNCTIONS
  // ============================================
  const handleOpenCreateDialog = () => {
    setCreateForm({
      full_name: '',
      phone_number: '',
      email: '',
      password: '',
      confirm_password: '',
      user_type: 'customer',
      is_active: true,
      is_verified: true,
    });
    setCreateErrors({});
    setOpenCreateDialog(true);
  };

  const validateCreateForm = () => {
    const errors = {};
    if (!createForm.full_name.trim()) {
      errors.full_name = 'Full name is required';
    }
    if (!createForm.phone_number.trim()) {
      errors.phone_number = 'Phone number is required';
    } else if (createForm.phone_number.length < 10) {
      errors.phone_number = 'Phone number must be at least 10 digits';
    }
    if (createForm.email && !/\S+@\S+\.\S+/.test(createForm.email)) {
      errors.email = 'Please enter a valid email address';
    }
    if (!createForm.password) {
      errors.password = 'Password is required';
    } else if (createForm.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    if (createForm.password !== createForm.confirm_password) {
      errors.confirm_password = 'Passwords do not match';
    }
    return errors;
  };

  const handleCreateCustomer = async () => {
    const errors = validateCreateForm();
    if (Object.keys(errors).length > 0) {
      setCreateErrors(errors);
      return;
    }

    setSubmitting(true);
    try {
      const response = await authAPI.register({
        phone_number: createForm.phone_number,
        password: createForm.password,
        full_name: createForm.full_name,
        email: createForm.email || null,
        user_type: createForm.user_type || 'customer',
        is_verified: createForm.is_verified !== false,
        is_active: createForm.is_active !== false,
      });

      if (response.data?.success) {
        showSnackbar(`Customer ${createForm.full_name} created successfully!`, 'success');
        setOpenCreateDialog(false);
        await fetchCustomers();
      } else {
        showSnackbar(response.data?.message || 'Failed to create customer', 'error');
      }
    } catch (error) {
      console.error('Error creating customer:', error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message || 
                          'Failed to create customer';
      showSnackbar(errorMessage, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleBulkAction = async () => {
    if (!bulkAction || selectedCustomers.length === 0) return;
    
    setSubmitting(true);
    try {
      for (const id of selectedCustomers) {
        if (bulkAction === 'activate') {
          await adminAPI.toggleCustomerStatus?.(id, true);
        } else if (bulkAction === 'deactivate') {
          await adminAPI.toggleCustomerStatus?.(id, false);
        } else if (bulkAction === 'delete') {
          await adminAPI.deleteCustomer?.(id);
        }
      }
      showSnackbar(`Bulk action completed for ${selectedCustomers.length} customers`, 'success');
      setSelectedCustomers([]);
      setBulkAction('');
      setOpenBulkDialog(false);
      await fetchCustomers();
    } catch (error) {
      console.error('Error performing bulk action:', error);
      showSnackbar('Failed to perform bulk action', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleExportCSV = async () => {
    try {
      const response = await adminAPI.exportCustomers?.();
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `customers_${new Date().toISOString().slice(0,10)}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      showSnackbar('Customers exported successfully!');
    } catch (error) {
      console.error('Error exporting customers:', error);
      showSnackbar('Failed to export customers', 'error');
    }
  };

  // ============================================
  // FILTER FUNCTIONS
  // ============================================
  const getFilteredCustomers = () => {
    let filtered = customers;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(c =>
        c.full_name?.toLowerCase().includes(term) ||
        c.phone_number?.includes(term) ||
        c.email?.toLowerCase().includes(term)
      );
    }

    if (filterStatus === 'active') {
      filtered = filtered.filter(c => c.is_active !== false);
    } else if (filterStatus === 'inactive') {
      filtered = filtered.filter(c => c.is_active === false);
    }

    return filtered;
  };

  const filteredCustomers = getFilteredCustomers();

  // ============================================
  // RENDER
  // ============================================
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress sx={{ color: Colors.primary }} />
      </Box>
    );
  }

  return (
    <Box sx={{ pb: 4 }}>
      {/* ============================================ */}
      {/* HEADER */}
      {/* ============================================ */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
            Customer Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage and create customer accounts
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <TextField
            size="small"
            placeholder="Search customers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ width: 250 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ color: Colors.gray[400] }} />
                </InputAdornment>
              ),
            }}
          />
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleOpenCreateDialog}
            sx={{ bgcolor: Colors.primary }}
          >
            Create Customer
          </Button>
          <Button
            variant="outlined"
            size="small"
            startIcon={<Refresh />}
            onClick={fetchCustomers}
            sx={{ borderColor: Colors.primary, color: Colors.primary }}
          >
            Refresh
          </Button>
          <Button
            variant="outlined"
            size="small"
            startIcon={<Download />}
            onClick={handleExportCSV}
            sx={{ borderColor: Colors.primary, color: Colors.primary }}
          >
            Export
          </Button>
        </Box>
      </Box>

      {/* ============================================ */}
      {/* STATS CARDS */}
      {/* ============================================ */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary">Total</Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: Colors.primary }}>
                {stats.total}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ borderLeft: `4px solid ${Colors.success}` }}>
            <CardContent>
              <Typography variant="body2" color="text.secondary">Active</Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: Colors.success }}>
                {stats.active}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ borderLeft: `4px solid ${Colors.error}` }}>
            <CardContent>
              <Typography variant="body2" color="text.secondary">Inactive</Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: Colors.error }}>
                {stats.inactive}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ borderLeft: `4px solid ${Colors.warning}` }}>
            <CardContent>
              <Typography variant="body2" color="text.secondary">Total Spent</Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: Colors.warning }}>
                KES {(stats.total_spent || 0).toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ borderLeft: `4px solid ${Colors.info}` }}>
            <CardContent>
              <Typography variant="body2" color="text.secondary">Avg Orders</Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: Colors.info }}>
                {stats.avg_orders}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* ============================================ */}
      {/* FILTERS & BULK ACTIONS */}
      {/* ============================================ */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={filterStatus}
              label="Status"
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
            </Select>
          </FormControl>

          {selectedCustomers.length > 0 && (
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <Typography variant="caption" color="text.secondary">
                {selectedCustomers.length} selected
              </Typography>
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Bulk Action</InputLabel>
                <Select
                  value={bulkAction}
                  label="Bulk Action"
                  onChange={(e) => setBulkAction(e.target.value)}
                >
                  <MenuItem value="">Select Action</MenuItem>
                  <MenuItem value="activate">Activate</MenuItem>
                  <MenuItem value="deactivate">Deactivate</MenuItem>
                  <MenuItem value="delete">Delete</MenuItem>
                </Select>
              </FormControl>
              <Button
                variant="contained"
                size="small"
                onClick={handleBulkAction}
                disabled={!bulkAction || submitting}
                sx={{ bgcolor: Colors.primary }}
              >
                {submitting ? <CircularProgress size={20} /> : 'Apply'}
              </Button>
            </Box>
          )}

          <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto' }}>
            {filteredCustomers.length} customers found
          </Typography>
        </Box>
      </Paper>

      {/* ============================================ */}
      {/* CUSTOMERS TABLE */}
      {/* ============================================ */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ bgcolor: Colors.gray[50] }}>
            <TableRow>
              <TableCell padding="checkbox">
                <input
                  type="checkbox"
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedCustomers(filteredCustomers.map(c => c.id));
                    } else {
                      setSelectedCustomers([]);
                    }
                  }}
                  checked={selectedCustomers.length === filteredCustomers.length && filteredCustomers.length > 0}
                />
              </TableCell>
              <TableCell>Customer</TableCell>
              <TableCell>Contact</TableCell>
              <TableCell align="center">Orders</TableCell>
              <TableCell align="right">Total Spent</TableCell>
              <TableCell>Joined</TableCell>
              <TableCell align="center">Status</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredCustomers.length > 0 ? (
              filteredCustomers.map((customer) => (
                <TableRow
                  key={customer.id}
                  hover
                  selected={selectedCustomers.includes(customer.id)}
                  sx={{
                    bgcolor: customer.is_active === false ? '#FFF3E0' : 'inherit',
                  }}
                >
                  <TableCell padding="checkbox">
                    <input
                      type="checkbox"
                      checked={selectedCustomers.includes(customer.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedCustomers([...selectedCustomers, customer.id]);
                        } else {
                          setSelectedCustomers(selectedCustomers.filter(id => id !== customer.id));
                        }
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ bgcolor: customer.is_active !== false ? Colors.primary : Colors.gray[400] }}>
                        {customer.full_name?.charAt(0) || 'U'}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight={500}>
                          {customer.full_name || 'Unknown'}
                        </Typography>
                        {customer.is_verified && (
                          <Chip
                            label="Verified"
                            size="small"
                            icon={<Verified sx={{ fontSize: 12 }} />}
                            color="success"
                            sx={{ height: 18, fontSize: '0.6rem' }}
                          />
                        )}
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Phone sx={{ fontSize: 14, color: Colors.gray[400] }} />
                        {customer.phone_number || 'N/A'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Email sx={{ fontSize: 14, color: Colors.gray[400] }} />
                        {customer.email || 'No email'}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={customer.orders_count || 0}
                      size="small"
                      sx={{ bgcolor: Colors.primaryBg, color: Colors.primary, minWidth: 30 }}
                    />
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 500 }}>
                    KES {(customer.total_spent || 0).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    {customer.joined_at || customer.created_at ? 
                      new Date(customer.joined_at || customer.created_at).toLocaleDateString() : 
                      'N/A'}
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={customer.is_active !== false ? 'Active' : 'Inactive'}
                      size="small"
                      color={customer.is_active !== false ? 'success' : 'error'}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                      <Tooltip title="View Profile">
                        <IconButton size="small" onClick={() => handleViewCustomer(customer)}>
                          <Visibility fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit">
                        <IconButton size="small" onClick={() => handleEditCustomer(customer)}>
                          <Edit fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={customer.is_active !== false ? 'Deactivate' : 'Activate'}>
                        <IconButton
                          size="small"
                          color={customer.is_active !== false ? 'warning' : 'success'}
                          onClick={() => handleToggleStatus(customer)}
                        >
                          {customer.is_active !== false ? <Block fontSize="small" /> : <CheckCircle fontSize="small" />}
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton size="small" color="error" onClick={() => handleDeleteCustomer(customer)}>
                          <Delete fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    No customers found
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* ============================================ */}
      {/* CUSTOMER PROFILE DIALOG - FULL VIEW */}
      {/* ============================================ */}
      <Dialog 
        open={openViewDialog} 
        onClose={() => setOpenViewDialog(false)} 
        maxWidth="lg" 
        fullWidth
      >
        <DialogTitle sx={{ bgcolor: Colors.primaryBg, borderBottom: '1px solid #e0e0e0' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: Colors.primary, width: 56, height: 56 }}>
                {selectedCustomer?.full_name?.charAt(0) || 'U'}
              </Avatar>
              <Box>
                <Typography variant="h5">{selectedCustomer?.full_name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  <Phone sx={{ fontSize: 14, mr: 0.5 }} /> {selectedCustomer?.phone_number}
                  {selectedCustomer?.email && (
                    <>
                      <Email sx={{ fontSize: 14, ml: 2, mr: 0.5 }} /> {selectedCustomer?.email}
                    </>
                  )}
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              {loadingProfile ? (
                <CircularProgress size={24} />
              ) : (
                <>
                  <Chip
                    label={selectedCustomer?.is_active !== false ? 'Active' : 'Inactive'}
                    color={selectedCustomer?.is_active !== false ? 'success' : 'error'}
                  />
                  <Chip
                    label={`${selectedCustomer?.orders_count || 0} Orders`}
                    color="primary"
                    variant="outlined"
                  />
                </>
              )}
              <IconButton onClick={() => setOpenViewDialog(false)}>
                <Close />
              </IconButton>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs
              value={profileTabValue}
              onChange={(e, v) => setProfileTabValue(v)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{ px: 2 }}
            >
              <Tab label="Profile" icon={<Info />} iconPosition="start" />
              <Tab label="Orders" icon={<History />} iconPosition="start" />
              <Tab label="Payments" icon={<Payment />} iconPosition="start" />
              <Tab label="Chat History" icon={<Chat />} iconPosition="start" />
              <Tab label="Support Tickets" icon={<SupportAgent />} iconPosition="start" />
            </Tabs>
          </Box>

          {/* ========================================== */}
          {/* TAB 1: PROFILE */}
          {/* ========================================== */}
          <TabPanel value={profileTabValue} index={0}>
            <Box sx={{ p: 3 }}>
              {loadingProfile ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3, bgcolor: Colors.gray[50] }}>
                      <Typography variant="h6" sx={{ mb: 2, color: Colors.primary }}>
                        Personal Information
                      </Typography>
                      <Divider sx={{ mb: 2 }} />
                      <Grid container spacing={2}>
                        <Grid item xs={12}>
                          <Typography variant="subtitle2" color="text.secondary">Full Name</Typography>
                          <Typography variant="body1">{selectedCustomer?.full_name}</Typography>
                        </Grid>
                        <Grid item xs={12}>
                          <Typography variant="subtitle2" color="text.secondary">Phone Number</Typography>
                          <Typography variant="body1">{selectedCustomer?.phone_number}</Typography>
                        </Grid>
                        <Grid item xs={12}>
                          <Typography variant="subtitle2" color="text.secondary">Email</Typography>
                          <Typography variant="body1">{selectedCustomer?.email || 'Not provided'}</Typography>
                        </Grid>
                        <Grid item xs={12}>
                          <Typography variant="subtitle2" color="text.secondary">Joined Date</Typography>
                          <Typography variant="body1">
                            {selectedCustomer?.joined_at || selectedCustomer?.created_at ? 
                              new Date(selectedCustomer.joined_at || selectedCustomer.created_at).toLocaleString() : 
                              'N/A'}
                          </Typography>
                        </Grid>
                        <Grid item xs={12}>
                          <Typography variant="subtitle2" color="text.secondary">Status</Typography>
                          <Chip
                            label={selectedCustomer?.is_active !== false ? 'Active' : 'Inactive'}
                            color={selectedCustomer?.is_active !== false ? 'success' : 'error'}
                            size="small"
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <Typography variant="subtitle2" color="text.secondary">Verified</Typography>
                          <Chip
                            label={selectedCustomer?.is_verified ? 'Verified' : 'Not Verified'}
                            color={selectedCustomer?.is_verified ? 'success' : 'warning'}
                            size="small"
                          />
                        </Grid>
                      </Grid>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3, bgcolor: Colors.gray[50] }}>
                      <Typography variant="h6" sx={{ mb: 2, color: Colors.primary }}>
                        Account Statistics
                      </Typography>
                      <Divider sx={{ mb: 2 }} />
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Typography variant="subtitle2" color="text.secondary">Total Orders</Typography>
                          <Typography variant="h4" sx={{ color: Colors.primary }}>
                            {selectedCustomer?.orders_count || 0}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="subtitle2" color="text.secondary">Total Spent</Typography>
                          <Typography variant="h4" sx={{ color: Colors.primary }}>
                            KES {(selectedCustomer?.total_spent || 0).toLocaleString()}
                          </Typography>
                        </Grid>
                        <Grid item xs={12}>
                          <Typography variant="subtitle2" color="text.secondary">Rating</Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {[...Array(5)].map((_, i) => (
                              i < Math.floor(selectedCustomer?.rating || 0) ? (
                                <Star key={i} sx={{ color: Colors.warning }} />
                              ) : (
                                <StarBorder key={i} sx={{ color: Colors.gray[300] }} />
                              )
                            ))}
                            <Typography variant="body2">({selectedCustomer?.rating || 0})</Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={12}>
                          <Typography variant="subtitle2" color="text.secondary">Last Order</Typography>
                          <Typography variant="body1">
                            {selectedCustomer?.last_order ? 
                              new Date(selectedCustomer.last_order).toLocaleDateString() : 
                              'No orders yet'}
                          </Typography>
                        </Grid>
                      </Grid>
                    </Paper>
                  </Grid>
                </Grid>
              )}
            </Box>
          </TabPanel>

          {/* ========================================== */}
          {/* ✅ TAB 2: ORDER HISTORY - FIXED */}
          {/* ========================================== */}
          <TabPanel value={profileTabValue} index={1}>
            <Box sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Order History</Typography>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                  <Typography variant="caption" color="text.secondary">
                    Total: {selectedCustomer?.orders_count || 0} orders
                  </Typography>
                  <Button variant="outlined" size="small" startIcon={<ShoppingCart />}>
                    View All Orders
                  </Button>
                </Box>
              </Box>
              {loadingProfile ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress />
                </Box>
              ) : customerOrders.length > 0 ? (
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead sx={{ bgcolor: Colors.gray[50] }}>
                      <TableRow>
                        <TableCell>Order ID</TableCell>
                        <TableCell>Date</TableCell>
                        <TableCell>Items</TableCell>
                        <TableCell align="right">Total</TableCell>
                        <TableCell>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {customerOrders.map((order) => (
                        <TableRow key={order.id} hover>
                          <TableCell>
                            <Typography variant="body2" fontWeight={500}>
                              {order.order_number || order.id}
                            </Typography>
                          </TableCell>
                          <TableCell>{new Date(order.created_at || order.date).toLocaleDateString()}</TableCell>
                          <TableCell>{order.quantity || order.items || 1} items</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 500 }}>
                            KES {(order.total_amount || order.total || 0).toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={order.status || 'pending'}
                              size="small"
                              color={
                                order.status === 'delivered' ? 'success' :
                                order.status === 'confirmed' ? 'info' :
                                order.status === 'pending' ? 'warning' : 'error'
                              }
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                // ✅ FIXED: Show message based on customer data
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    {selectedCustomer?.orders_count > 0 
                      ? `Loading ${selectedCustomer.orders_count} orders...` 
                      : 'No orders found'}
                  </Typography>
                  {selectedCustomer?.orders_count > 0 && (
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                      {selectedCustomer.orders_count} orders available
                    </Typography>
                  )}
                </Box>
              )}
            </Box>
          </TabPanel>

          {/* ========================================== */}
          {/* TAB 3: PAYMENT HISTORY */}
          {/* ========================================== */}
          <TabPanel value={profileTabValue} index={2}>
            <Box sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Payment History</Typography>
                <Typography variant="caption" color="text.secondary">
                  Total: KES {customerPayments.reduce((sum, p) => sum + (p.amount || 0), 0).toLocaleString()}
                </Typography>
              </Box>
              {loadingProfile ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress />
                </Box>
              ) : customerPayments.length > 0 ? (
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead sx={{ bgcolor: Colors.gray[50] }}>
                      <TableRow>
                        <TableCell>Transaction ID</TableCell>
                        <TableCell>Date</TableCell>
                        <TableCell align="right">Amount</TableCell>
                        <TableCell>Method</TableCell>
                        <TableCell>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {customerPayments.map((payment) => (
                        <TableRow key={payment.id} hover>
                          <TableCell>
                            <Typography variant="body2" fontWeight={500}>
                              {payment.transaction_id || payment.id}
                            </Typography>
                          </TableCell>
                          <TableCell>{new Date(payment.created_at || payment.date).toLocaleDateString()}</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 500 }}>
                            KES {(payment.amount || 0).toLocaleString()}
                          </TableCell>
                          <TableCell>{payment.payment_method || payment.method || 'N/A'}</TableCell>
                          <TableCell>
                            <Chip
                              label={payment.status || 'pending'}
                              size="small"
                              color={payment.status === 'completed' || payment.status === 'paid' ? 'success' : 'warning'}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
                  No payments found
                </Typography>
              )}
            </Box>
          </TabPanel>

          {/* ========================================== */}
          {/* TAB 4: CHAT HISTORY */}
          {/* ========================================== */}
          <TabPanel value={profileTabValue} index={3}>
            <Box sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Chat History</Typography>
                <Button variant="contained" size="small" startIcon={<Send />} sx={{ bgcolor: Colors.primary }}>
                  New Message
                </Button>
              </Box>
              {loadingProfile ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress />
                </Box>
              ) : customerChats.length > 0 ? (
                <List>
                  {customerChats.map((chat) => (
                    <Paper key={chat.id} sx={{ mb: 1, '&:hover': { bgcolor: Colors.gray[50] } }}>
                      <ListItem button>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: chat.status === 'resolved' ? Colors.success : Colors.warning }}>
                            <Chat />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                              <Typography variant="subtitle2">{chat.agent_name || chat.agent || 'Support'}</Typography>
                              <Typography variant="caption" color="text.secondary">
                                {chat.created_at ? new Date(chat.created_at).toLocaleString() : 'N/A'}
                              </Typography>
                            </Box>
                          }
                          secondary={chat.message || chat.last_message || 'No message'}
                        />
                        <ListItemSecondaryAction>
                          <Chip
                            label={chat.status || 'active'}
                            size="small"
                            color={chat.status === 'resolved' ? 'success' : 'warning'}
                          />
                        </ListItemSecondaryAction>
                      </ListItem>
                    </Paper>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
                  No chat history found
                </Typography>
              )}
            </Box>
          </TabPanel>

          {/* ========================================== */}
          {/* TAB 5: SUPPORT TICKETS */}
          {/* ========================================== */}
          <TabPanel value={profileTabValue} index={4}>
            <Box sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Support Tickets</Typography>
                <Button variant="contained" size="small" startIcon={<Add />} sx={{ bgcolor: Colors.primary }}>
                  New Ticket
                </Button>
              </Box>
              {loadingProfile ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress />
                </Box>
              ) : customerSupportTickets.length > 0 ? (
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead sx={{ bgcolor: Colors.gray[50] }}>
                      <TableRow>
                        <TableCell>Ticket ID</TableCell>
                        <TableCell>Subject</TableCell>
                        <TableCell>Priority</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Date</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {customerSupportTickets.map((ticket) => (
                        <TableRow key={ticket.id} hover>
                          <TableCell>
                            <Typography variant="body2" fontWeight={500}>
                              {ticket.ticket_number || ticket.id}
                            </Typography>
                          </TableCell>
                          <TableCell>{ticket.subject || ticket.title || 'N/A'}</TableCell>
                          <TableCell>
                            <Chip
                              label={ticket.priority || 'medium'}
                              size="small"
                              color={
                                ticket.priority === 'high' ? 'error' :
                                ticket.priority === 'medium' ? 'warning' : 'info'
                              }
                            />
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={ticket.status || 'open'}
                              size="small"
                              color={ticket.status === 'resolved' || ticket.status === 'closed' ? 'success' : 'warning'}
                            />
                          </TableCell>
                          <TableCell>{new Date(ticket.created_at || ticket.date).toLocaleDateString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
                  No support tickets found
                </Typography>
              )}
            </Box>
          </TabPanel>
        </DialogContent>
        <DialogActions sx={{ borderTop: '1px solid #e0e0e0', p: 2 }}>
          <Button onClick={() => setOpenViewDialog(false)}>Close</Button>
          <Button
            variant="contained"
            onClick={() => {
              setOpenViewDialog(false);
              handleEditCustomer(selectedCustomer);
            }}
            sx={{ bgcolor: Colors.primary }}
          >
            Edit Customer
          </Button>
          <Button
            variant="outlined"
            onClick={() => {
              setOpenViewDialog(false);
            }}
          >
            View Orders
          </Button>
        </DialogActions>
      </Dialog>

      {/* ============================================ */}
      {/* CREATE CUSTOMER DIALOG */}
      {/* ============================================ */}
      <Dialog 
        open={openCreateDialog} 
        onClose={() => setOpenCreateDialog(false)} 
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Create Customer Account</Typography>
            <IconButton onClick={() => setOpenCreateDialog(false)}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Alert severity="info" sx={{ mb: 3 }}>
              Create a new customer account. The customer will receive a welcome message with their login details.
            </Alert>

            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Full Name"
                  required
                  value={createForm.full_name}
                  onChange={(e) => setCreateForm({ ...createForm, full_name: e.target.value })}
                  error={!!createErrors.full_name}
                  helperText={createErrors.full_name}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Person />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  required
                  value={createForm.phone_number}
                  onChange={(e) => setCreateForm({ ...createForm, phone_number: e.target.value })}
                  error={!!createErrors.phone_number}
                  helperText={createErrors.phone_number}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Phone />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email (Optional)"
                  type="email"
                  value={createForm.email}
                  onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                  error={!!createErrors.email}
                  helperText={createErrors.email}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={createForm.password}
                  onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                  error={!!createErrors.password}
                  helperText={createErrors.password || 'Minimum 6 characters'}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowPassword(!showPassword)}>
                          {showPassword ? <Cancel /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Confirm Password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={createForm.confirm_password}
                  onChange={(e) => setCreateForm({ ...createForm, confirm_password: e.target.value })}
                  error={!!createErrors.confirm_password}
                  helperText={createErrors.confirm_password}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>User Type</InputLabel>
                  <Select
                    value={createForm.user_type}
                    label="User Type"
                    onChange={(e) => setCreateForm({ ...createForm, user_type: e.target.value })}
                  >
                    <MenuItem value="customer">Customer</MenuItem>
                    <MenuItem value="agent">Agent</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={createForm.is_active}
                      onChange={(e) => setCreateForm({ ...createForm, is_active: e.target.checked })}
                    />
                  }
                  label={createForm.is_active ? 'Active' : 'Inactive'}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={createForm.is_verified}
                      onChange={(e) => setCreateForm({ ...createForm, is_verified: e.target.checked })}
                    />
                  }
                  label="Verified"
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCreateDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleCreateCustomer}
            disabled={submitting}
            sx={{ bgcolor: Colors.primary }}
          >
            {submitting ? <CircularProgress size={24} /> : 'Create Account'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ============================================ */}
      {/* EDIT CUSTOMER DIALOG */}
      {/* ============================================ */}
      <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Edit Customer</Typography>
            <IconButton onClick={() => setOpenEditDialog(false)}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            margin="normal"
            label="Full Name"
            value={editForm.full_name}
            onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Phone Number"
            value={editForm.phone_number}
            onChange={(e) => setEditForm({ ...editForm, phone_number: e.target.value })}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Email"
            value={editForm.email}
            onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
          />
          <FormControlLabel
            control={
              <Switch
                checked={editForm.is_active}
                onChange={(e) => setEditForm({ ...editForm, is_active: e.target.checked })}
              />
            }
            label={editForm.is_active ? 'Active' : 'Inactive'}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleUpdateCustomer}
            disabled={submitting}
            sx={{ bgcolor: Colors.primary }}
          >
            {submitting ? <CircularProgress size={24} /> : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ============================================ */}
      {/* DELETE CONFIRMATION DIALOG */}
      {/* ============================================ */}
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle>Delete Customer</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete <strong>{selectedCustomer?.full_name}</strong>?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            This action cannot be undone. All associated data will be removed.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDeleteConfirm}
            disabled={submitting}
          >
            {submitting ? <CircularProgress size={24} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ============================================ */}
      {/* SNACKBAR */}
      {/* ============================================ */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}