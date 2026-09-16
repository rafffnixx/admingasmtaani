// 📁 admin-web/src/pages/Orders.jsx

import React, { useState, useEffect, useRef } from 'react';
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
  CircularProgress,
  Card,
  CardContent,
  Grid,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Avatar,
  Badge,
  Tabs,
  Tab,
  Autocomplete,
} from '@mui/material';
import {
  Search,
  Visibility,
  Refresh,
  Download,
  Assignment,
  Person,
  Close,
  CheckCircle,
  Pending,
  LocalShipping,
  Cancel,
  PersonAdd,
  ShoppingCart,
  Schedule,
  DoneAll,
  Add,
} from '@mui/icons-material';
import { Colors } from '../utils/colors';
import { adminAPI } from '../services/api';

// TabPanel component
function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`order-tabpanel-${index}`}
      aria-labelledby={`order-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

// Status Configurations
const STATUS_CONFIG = {
  pending: { 
    label: 'Pending', 
    color: 'warning', 
    icon: <Pending sx={{ fontSize: 16 }} />,
    badgeColor: '#FF9800',
    bgColor: '#FFF3E0'
  },
  assigned: { 
    label: 'Assigned', 
    color: 'info', 
    icon: <PersonAdd sx={{ fontSize: 16 }} />,
    badgeColor: '#2196F3',
    bgColor: '#E3F2FD'
  },
  accepted: { 
    label: 'Accepted', 
    color: 'primary', 
    icon: <CheckCircle sx={{ fontSize: 16 }} />,
    badgeColor: '#1976D2',
    bgColor: '#E8EAF6'
  },
  picked_up: { 
    label: 'Picked Up', 
    color: 'info', 
    icon: <LocalShipping sx={{ fontSize: 16 }} />,
    badgeColor: '#00BCD4',
    bgColor: '#E0F7FA'
  },
  out_for_delivery: { 
    label: 'Out for Delivery', 
    color: 'info', 
    icon: <LocalShipping sx={{ fontSize: 16 }} />,
    badgeColor: '#0097A7',
    bgColor: '#E0F7FA'
  },
  delivered: { 
    label: 'Delivered', 
    color: 'success', 
    icon: <DoneAll sx={{ fontSize: 16 }} />,
    badgeColor: '#4CAF50',
    bgColor: '#E8F5E9'
  },
  confirmed: { 
    label: 'Confirmed', 
    color: 'success', 
    icon: <CheckCircle sx={{ fontSize: 16 }} />,
    badgeColor: '#2E7D32',
    bgColor: '#E8F5E9'
  },
  cancelled: { 
    label: 'Cancelled', 
    color: 'error', 
    icon: <Cancel sx={{ fontSize: 16 }} />,
    badgeColor: '#D32F2F',
    bgColor: '#FFEBEE'
  },
  declined: { 
    label: 'Declined', 
    color: 'error', 
    icon: <Cancel sx={{ fontSize: 16 }} />,
    badgeColor: '#D32F2F',
    bgColor: '#FFEBEE'
  },
};

// Order Status Flow
const ORDER_FLOW = [
  { status: 'pending', label: 'Order Placed', icon: <ShoppingCart sx={{ fontSize: 18 }} /> },
  { status: 'assigned', label: 'Assigned to Agent', icon: <PersonAdd sx={{ fontSize: 18 }} /> },
  { status: 'accepted', label: 'Agent Accepted', icon: <CheckCircle sx={{ fontSize: 18 }} /> },
  { status: 'picked_up', label: 'Picked Up', icon: <LocalShipping sx={{ fontSize: 18 }} /> },
  { status: 'out_for_delivery', label: 'Out for Delivery', icon: <LocalShipping sx={{ fontSize: 18 }} /> },
  { status: 'delivered', label: 'Delivered', icon: <DoneAll sx={{ fontSize: 18 }} /> },
  { status: 'confirmed', label: 'Confirmed', icon: <CheckCircle sx={{ fontSize: 18 }} /> },
];

export default function Orders() {
  // ============================================
  // STATE
  // ============================================
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [openAssignDialog, setOpenAssignDialog] = useState(false);
  const [openStatusDialog, setOpenStatusDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [tabValue, setTabValue] = useState(0);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDateRange, setFilterDateRange] = useState('all');
  const [agents, setAgents] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [bulkAction, setBulkAction] = useState('');
  const [updating, setUpdating] = useState(false);

  // ============================================
  // CREATE ORDER STATE
  // ============================================
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [agentList, setAgentList] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedAgentForOrder, setSelectedAgentForOrder] = useState(null);
  const [customerSearch, setCustomerSearch] = useState('');
  const [customerSearchLoading, setCustomerSearchLoading] = useState(false);

  // Refs used to debounce customer search and ignore stale/out-of-order responses
  const customerSearchTimeoutRef = useRef(null);
  const customerSearchRequestId = useRef(0);

  const [createForm, setCreateForm] = useState({
    customer_id: '',
    product_id: '',
    quantity: 1,
    agent_id: '',
    delivery_address: '',
    special_instructions: '',
    payment_method: 'cash',
    payment_status: 'pending',
    delivery_fee: 100,
  });

  // ============================================
  // FETCH FUNCTIONS
  // ============================================
  useEffect(() => {
    fetchOrders();
    fetchAgents();
  }, []);

  // Clean up any pending debounce timer on unmount
  useEffect(() => {
    return () => {
      if (customerSearchTimeoutRef.current) {
        clearTimeout(customerSearchTimeoutRef.current);
      }
    };
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.getOrders();
      console.log('✅ Orders fetched:', response.data?.length || 0);
      setOrders(response.data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      showSnackbar('Failed to fetch orders', 'error');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAgents = async () => {
    try {
      const response = await adminAPI.getAgents();
      console.log('📦 Raw response from API:', response);
      
      let agentsArray = [];
      
      if (Array.isArray(response)) {
        agentsArray = response;
      } else if (response?.data && Array.isArray(response.data)) {
        agentsArray = response.data;
      } else if (response?.data?.data && Array.isArray(response.data.data)) {
        agentsArray = response.data.data;
      } else if (typeof response === 'object' && response !== null) {
        if (response.id || response.business_name) {
          agentsArray = [response];
        }
      }
      
      const approvedAgents = agentsArray.filter(a => a.is_approved !== false);
      
      console.log('✅ Processed agents:', approvedAgents);
      console.log('✅ Agent count:', approvedAgents.length);
      
      setAgents(approvedAgents);
      
      if (approvedAgents.length === 0) {
        showSnackbar('No approved agents available', 'warning');
      }
    } catch (error) {
      console.error('❌ Error fetching agents:', error);
      setAgents([]);
      showSnackbar('Failed to load agents', 'error');
    }
  };

  // ============================================
  // CREATE ORDER FUNCTIONS
  // ============================================
  const loadProductsForCreate = async () => {
    try {
      const response = await adminAPI.getProductsList();
      setProducts(response.data || []);
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const loadAgentsForCreate = async () => {
    try {
      const response = await adminAPI.getAgentsList();
      setAgentList(response.data || []);
    } catch (error) {
      console.error('Error loading agents:', error);
    }
  };

  // ============================================
  // ✅ FIXED: searchCustomersForCreate
  // - debounced (300ms) so we don't fire a request on every keystroke
  // - race-safe: a slow, stale response can no longer overwrite a newer one
  // - exposes a loading flag for the Autocomplete's spinner
  // ============================================
  const searchCustomersForCreate = (searchTerm) => {
    console.log('🔍 Searching customers for:', searchTerm);

    // Cancel any pending debounce
    if (customerSearchTimeoutRef.current) {
      clearTimeout(customerSearchTimeoutRef.current);
    }

    if (!searchTerm || searchTerm.length < 2) {
      setCustomers([]);
      setCustomerSearchLoading(false);
      return;
    }

    setCustomerSearchLoading(true);
    const requestId = ++customerSearchRequestId.current;

    customerSearchTimeoutRef.current = setTimeout(async () => {
      try {
        const response = await adminAPI.getCustomersList(searchTerm);
        console.log('📦 Full API Response:', response);

        let customerData = [];

        if (response && Array.isArray(response)) {
          customerData = response;
        } else if (response && response.data && Array.isArray(response.data)) {
          customerData = response.data;
        } else if (response && response.data && response.data.data && Array.isArray(response.data.data)) {
          customerData = response.data.data;
        }

        // Ignore this response if a newer search has since started
        if (requestId !== customerSearchRequestId.current) {
          console.log('⏭️ Ignoring stale customer search response');
          return;
        }

        console.log('📦 Processed customers:', customerData);
        console.log('📦 Customer count:', customerData.length);

        setCustomers(customerData);

        if (customerData.length === 0) {
          console.log('⚠️ No customers found');
        }
      } catch (error) {
        console.error('❌ Error searching customers:', error);
        if (requestId === customerSearchRequestId.current) {
          setCustomers([]);
        }
      } finally {
        if (requestId === customerSearchRequestId.current) {
          setCustomerSearchLoading(false);
        }
      }
    }, 300);
  };

  const handleOpenCreateDialog = () => {
    setOpenCreateDialog(true);
    loadProductsForCreate();
    loadAgentsForCreate();
    // Reset form
    setCreateForm({
      customer_id: '',
      product_id: '',
      quantity: 1,
      agent_id: '',
      delivery_address: '',
      special_instructions: '',
      payment_method: 'cash',
      payment_status: 'pending',
      delivery_fee: 100,
    });
    setSelectedCustomer(null);
    setSelectedProduct(null);
    setSelectedAgentForOrder(null);
    setCustomers([]);
    setCustomerSearch('');
    setCustomerSearchLoading(false);
  };

  const handleCreateOrder = async () => {
    // Validate
    if (!createForm.customer_id) {
      showSnackbar('Please select a customer', 'error');
      return;
    }
    if (!createForm.product_id) {
      showSnackbar('Please select a product', 'error');
      return;
    }
    if (!createForm.delivery_address) {
      showSnackbar('Please enter delivery address', 'error');
      return;
    }

    setCreateLoading(true);
    try {
      const response = await adminAPI.createOrderForCustomer(createForm);
      if (response.data?.success) {
        showSnackbar('Order created successfully!', 'success');
        setOpenCreateDialog(false);
        await fetchOrders(); // Refresh orders list
      }
    } catch (error) {
      console.error('Error creating order:', error);
      showSnackbar(error.response?.data?.message || 'Failed to create order', 'error');
    } finally {
      setCreateLoading(false);
    }
  };

  const calculateTotal = () => {
    if (!selectedProduct) return 0;
    const subtotal = parseFloat(selectedProduct.base_price) * createForm.quantity;
    return subtotal + parseFloat(createForm.delivery_fee || 0);
  };

  // ============================================
  // HANDLER FUNCTIONS
  // ============================================
  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setOpenViewDialog(true);
  };

  const handleOpenAssign = (order) => {
    console.log('🔓 Opening assign dialog for order:', order?.order_number);
    console.log('📋 Current agents:', agents);
    setSelectedOrder(order);
    setSelectedAgent(order.agent_id || '');
    setOpenAssignDialog(true);
  };

  const handleOpenStatusUpdate = (order) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setOpenStatusDialog(true);
  };

  const handleUpdateStatus = async (orderId, status) => {
    setUpdating(true);
    try {
      const response = await adminAPI.updateOrderStatus(orderId, status);
      
      if (response.data?.success) {
        showSnackbar(`Order status updated to ${STATUS_CONFIG[status]?.label || status}!`, 'success');
        await fetchOrders();
        setOpenStatusDialog(false);
        setOpenAssignDialog(false);
      } else {
        showSnackbar('Failed to update status', 'error');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      const updatedOrders = orders.map(o => 
        o.id === orderId ? { ...o, status: status } : o
      );
      setOrders(updatedOrders);
      showSnackbar(`Order status updated to ${STATUS_CONFIG[status]?.label || status}! (Local)`, 'success');
      setOpenStatusDialog(false);
    } finally {
      setUpdating(false);
    }
  };

  const handleAssignAgent = async (orderId, agentId) => {
    if (!agentId) {
      showSnackbar('Please select an agent', 'warning');
      return;
    }
    
    setUpdating(true);
    try {
      const response = await adminAPI.assignAgent(orderId, agentId);
      console.log('📦 Assign response:', response);
      
      if (response.data?.success) {
        showSnackbar('Agent assigned successfully!', 'success');
        await fetchOrders();
        setOpenAssignDialog(false);
      } else {
        showSnackbar('Failed to assign agent', 'error');
      }
    } catch (error) {
      console.error('❌ Error assigning agent:', error);
      
      const agent = agents.find(a => a.id === agentId);
      const updatedOrders = orders.map(o => 
        o.id === orderId ? { 
          ...o, 
          agent_id: agentId, 
          agent_business: agent?.business_name || 'Assigned',
          status: 'assigned' 
        } : o
      );
      setOrders(updatedOrders);
      
      showSnackbar('Agent assigned successfully! (Local)', 'success');
      setOpenAssignDialog(false);
    } finally {
      setUpdating(false);
    }
  };

  const handleBulkAction = async () => {
    if (!bulkAction || selectedOrders.length === 0) return;
    
    try {
      await adminAPI.bulkUpdateOrders?.(selectedOrders, bulkAction);
      showSnackbar(`Bulk action completed for ${selectedOrders.length} orders`, 'success');
      setSelectedOrders([]);
      setBulkAction('');
      await fetchOrders();
    } catch (error) {
      console.error('Error performing bulk action:', error);
      showSnackbar('Failed to perform bulk action', 'error');
    }
  };

  const handleExportCSV = async () => {
    try {
      const response = await adminAPI.exportOrders?.();
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `orders_${new Date().toISOString().slice(0,10)}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      showSnackbar('Orders exported successfully!');
    } catch (error) {
      console.error('Error exporting orders:', error);
      showSnackbar('Failed to export orders', 'error');
    }
  };

  // ============================================
  // FILTER FUNCTIONS
  // ============================================
  const getFilteredOrders = () => {
    let filtered = orders;

    const statusMap = {
      0: 'all',
      1: 'pending',
      2: 'assigned',
      3: 'accepted',
      4: 'picked_up',
      5: 'out_for_delivery',
      6: 'delivered',
      7: 'confirmed',
      8: 'cancelled',
    };
    const tabStatus = statusMap[tabValue];
    if (tabStatus && tabStatus !== 'all') {
      filtered = filtered.filter(o => o.status === tabStatus);
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(o => o.status === filterStatus);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(o =>
        o.order_number?.toLowerCase().includes(term) ||
        o.customer_name?.toLowerCase().includes(term) ||
        o.agent_business?.toLowerCase().includes(term) ||
        o.customer_phone?.includes(term)
      );
    }

    if (filterDateRange !== 'all') {
      const now = new Date();
      const rangeMap = {
        today: new Date(now.setHours(0, 0, 0, 0)),
        week: new Date(now.setDate(now.getDate() - 7)),
        month: new Date(now.setMonth(now.getMonth() - 1)),
      };
      const filterDate = rangeMap[filterDateRange];
      if (filterDate) {
        filtered = filtered.filter(o => new Date(o.created_at) >= filterDate);
      }
    }

    return filtered;
  };

  const getStatusChip = (status) => {
    const config = STATUS_CONFIG[status] || { label: status, color: 'default' };
    return (
      <Chip
        label={config.label}
        size="small"
        color={config.color}
        icon={config.icon}
        sx={{ fontWeight: 500 }}
      />
    );
  };

  const getStatusBadge = (status) => {
    const config = STATUS_CONFIG[status];
    if (!config) return null;
    return (
      <Badge
        variant="dot"
        sx={{
          '& .MuiBadge-badge': {
            backgroundColor: config.badgeColor,
            color: config.badgeColor,
            boxShadow: `0 0 0 2px ${config.badgeColor}40`,
          },
        }}
      />
    );
  };

  const filteredOrders = getFilteredOrders();
  const totalOrders = orders.length;

  const getStatusCount = (status) => {
    return orders.filter(o => o.status === status).length;
  };

  const statusStats = {
    pending: getStatusCount('pending'),
    assigned: getStatusCount('assigned'),
    delivered: getStatusCount('delivered'),
    confirmed: getStatusCount('confirmed'),
    cancelled: getStatusCount('cancelled'),
  };

  const tabCounts = {
    all: totalOrders,
    pending: statusStats.pending,
    assigned: statusStats.assigned,
    accepted: getStatusCount('accepted'),
    picked_up: getStatusCount('picked_up'),
    out_for_delivery: getStatusCount('out_for_delivery'),
    delivered: statusStats.delivered,
    confirmed: statusStats.confirmed,
    cancelled: statusStats.cancelled,
  };

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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
            Order Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage all customer orders across the platform
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleOpenCreateDialog}
            sx={{ bgcolor: Colors.primary }}
          >
            Create Order
          </Button>
          <Button
            variant="outlined"
            startIcon={<Download />}
            onClick={handleExportCSV}
            sx={{ borderColor: Colors.primary, color: Colors.primary }}
          >
            Export
          </Button>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={fetchOrders}
            sx={{ borderColor: Colors.primary, color: Colors.primary }}
          >
            Refresh
          </Button>
        </Box>
      </Box>

      {/* ============================================ */}
      {/* STATS CARDS */}
      {/* ============================================ */}
  

      {/* ============================================ */}
      {/* TABS */}
      {/* ============================================ */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={(e, v) => setTabValue(v)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            '& .MuiTab-root': {
              minHeight: 48,
              textTransform: 'none',
              fontWeight: 500,
            },
          }}
        >
          <Tab label={`All (${tabCounts.all})`} />
          <Tab label={`Pending (${tabCounts.pending})`} icon={<Pending sx={{ fontSize: 16 }} />} iconPosition="start" />
          <Tab label={`Assigned (${tabCounts.assigned})`} icon={<PersonAdd sx={{ fontSize: 16 }} />} iconPosition="start" />
          <Tab label={`Accepted (${tabCounts.accepted})`} icon={<CheckCircle sx={{ fontSize: 16 }} />} iconPosition="start" />
          <Tab label={`Picked Up (${tabCounts.picked_up})`} icon={<LocalShipping sx={{ fontSize: 16 }} />} iconPosition="start" />
          <Tab label={`Out for Delivery (${tabCounts.out_for_delivery})`} icon={<LocalShipping sx={{ fontSize: 16 }} />} iconPosition="start" />
          <Tab label={`Delivered (${tabCounts.delivered})`} icon={<DoneAll sx={{ fontSize: 16 }} />} iconPosition="start" />
          <Tab label={`Confirmed (${tabCounts.confirmed})`} icon={<CheckCircle sx={{ fontSize: 16 }} />} iconPosition="start" />
          <Tab label={`Cancelled (${tabCounts.cancelled})`} icon={<Cancel sx={{ fontSize: 16 }} />} iconPosition="start" />
        </Tabs>
      </Paper>

      {/* ============================================ */}
      {/* FILTERS */}
      {/* ============================================ */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <TextField
            size="small"
            placeholder="Search orders..."
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
          <FormControl size="small" sx={{ minWidth: 130 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={filterStatus}
              label="Status"
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <MenuItem value="all">All Status</MenuItem>
              {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                <MenuItem key={key} value={key}>{config.label}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 130 }}>
            <InputLabel>Date Range</InputLabel>
            <Select
              value={filterDateRange}
              label="Date Range"
              onChange={(e) => setFilterDateRange(e.target.value)}
            >
              <MenuItem value="all">All Time</MenuItem>
              <MenuItem value="today">Today</MenuItem>
              <MenuItem value="week">This Week</MenuItem>
              <MenuItem value="month">This Month</MenuItem>
            </Select>
          </FormControl>

          <Box sx={{ display: 'flex', gap: 1, ml: 'auto', alignItems: 'center' }}>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Bulk Action</InputLabel>
              <Select
                value={bulkAction}
                label="Bulk Action"
                onChange={(e) => setBulkAction(e.target.value)}
                disabled={selectedOrders.length === 0}
              >
                <MenuItem value="">Select Action</MenuItem>
                <MenuItem value="assign">Assign to Agent</MenuItem>
                <MenuItem value="confirm">Confirm Orders</MenuItem>
                <MenuItem value="cancel">Cancel Orders</MenuItem>
              </Select>
            </FormControl>
            <Button
              variant="contained"
              size="small"
              onClick={handleBulkAction}
              disabled={!bulkAction || selectedOrders.length === 0}
              sx={{ bgcolor: Colors.primary }}
            >
              Apply to {selectedOrders.length} orders
            </Button>
          </Box>

          <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto' }}>
            {filteredOrders.length} orders found
          </Typography>
        </Box>
      </Paper>

      {/* ============================================ */}
      {/* ORDERS TABLE */}
      {/* ============================================ */}
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 1000 }}>
          <TableHead sx={{ bgcolor: Colors.gray[50] }}>
            <TableRow>
              <TableCell padding="checkbox">
                <input
                  type="checkbox"
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedOrders(filteredOrders.map(o => o.id));
                    } else {
                      setSelectedOrders([]);
                    }
                  }}
                  checked={selectedOrders.length === filteredOrders.length && filteredOrders.length > 0}
                />
              </TableCell>
              <TableCell>Order #</TableCell>
              <TableCell>Customer</TableCell>
              <TableCell>Agent</TableCell>
              <TableCell align="right">Amount</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Date</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredOrders.length > 0 ? (
              filteredOrders.map((order) => (
                <TableRow
                  key={order.id}
                  hover
                  selected={selectedOrders.includes(order.id)}
                  sx={{
                    '&:hover': { bgcolor: Colors.gray[50] },
                    bgcolor: order.status === 'pending' ? '#FFF8E1' : 'inherit',
                  }}
                >
                  <TableCell padding="checkbox">
                    <input
                      type="checkbox"
                      checked={selectedOrders.includes(order.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedOrders([...selectedOrders, order.id]);
                        } else {
                          setSelectedOrders(selectedOrders.filter(id => id !== order.id));
                        }
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={500}>
                      {order.order_number}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2">{order.customer_name || 'N/A'}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {order.customer_phone}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    {order.agent_business ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar sx={{ width: 24, height: 24, bgcolor: Colors.primary }}>
                          <Person sx={{ fontSize: 14 }} />
                        </Avatar>
                        <Typography variant="body2">{order.agent_business}</Typography>
                      </Box>
                    ) : (
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => handleOpenAssign(order)}
                        sx={{ borderColor: Colors.warning, color: Colors.warning }}
                      >
                        Assign Agent
                      </Button>
                    )}
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" fontWeight={500} sx={{ color: Colors.primary }}>
                      KES {Number(order.total_amount).toLocaleString()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {getStatusBadge(order.status)}
                      {getStatusChip(order.status)}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {new Date(order.created_at).toLocaleDateString()}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(order.created_at).toLocaleTimeString()}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5 }}>
                      <Tooltip title="View Details">
                        <IconButton size="small" onClick={() => handleViewOrder(order)}>
                          <Visibility fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Assign Agent">
                        <IconButton size="small" onClick={() => handleOpenAssign(order)}>
                          <PersonAdd fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Update Status">
                        <IconButton size="small" onClick={() => handleOpenStatusUpdate(order)}>
                          <Schedule fontSize="small" />
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
                    No orders found matching your criteria
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* ============================================ */}
      {/* VIEW ORDER DIALOG */}
      {/* ============================================ */}
      <Dialog open={openViewDialog} onClose={() => setOpenViewDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ bgcolor: Colors.primaryBg }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="h6">Order {selectedOrder?.order_number}</Typography>
              {selectedOrder && getStatusChip(selectedOrder.status)}
            </Box>
            <IconButton onClick={() => setOpenViewDialog(false)}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedOrder && (
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2, bgcolor: Colors.gray[50] }}>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Person sx={{ fontSize: 16 }} /> Customer Info
                    </Typography>
                    <Divider sx={{ my: 1 }} />
                    <Typography variant="body2"><strong>Name:</strong> {selectedOrder.customer_name || 'N/A'}</Typography>
                    <Typography variant="body2"><strong>Phone:</strong> {selectedOrder.customer_phone || 'N/A'}</Typography>
                    <Typography variant="body2"><strong>Email:</strong> {selectedOrder.customer_email || 'N/A'}</Typography>
                    <Typography variant="body2"><strong>Address:</strong> {selectedOrder.delivery_address || 'N/A'}</Typography>
                    {selectedOrder.delivery_instructions && (
                      <Typography variant="body2"><strong>Instructions:</strong> {selectedOrder.delivery_instructions}</Typography>
                    )}
                  </Paper>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2, bgcolor: Colors.gray[50] }}>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Assignment sx={{ fontSize: 16 }} /> Order Details
                    </Typography>
                    <Divider sx={{ my: 1 }} />
                    <Typography variant="body2"><strong>Product:</strong> {selectedOrder.product_name || 'N/A'}</Typography>
                    <Typography variant="body2"><strong>Quantity:</strong> {selectedOrder.quantity || 1}</Typography>
                    <Typography variant="body2"><strong>Total:</strong> KES {Number(selectedOrder.total_amount).toLocaleString()}</Typography>
                    <Typography variant="body2"><strong>Payment:</strong> {selectedOrder.payment_status || 'N/A'}</Typography>
                    <Typography variant="body2"><strong>Payment Method:</strong> {selectedOrder.payment_method || 'N/A'}</Typography>
                    <Typography variant="body2"><strong>Agent:</strong> {selectedOrder.agent_business || 'Unassigned'}</Typography>
                    <Typography variant="body2"><strong>Created:</strong> {new Date(selectedOrder.created_at).toLocaleString()}</Typography>
                  </Paper>
                </Grid>
              </Grid>

              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
                  Order Progress
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                  {ORDER_FLOW.map((step, index) => {
                    const isActive = selectedOrder.status === step.status;
                    const isCompleted = ORDER_FLOW.findIndex(s => s.status === selectedOrder.status) >= index;
                    return (
                      <React.Fragment key={step.status}>
                        <Box
                          sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            opacity: isCompleted ? 1 : 0.4,
                          }}
                        >
                          <Box
                            sx={{
                              width: 40,
                              height: 40,
                              borderRadius: '50%',
                              bgcolor: isCompleted ? Colors.primary : Colors.gray[200],
                              color: isCompleted ? 'white' : Colors.gray[400],
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              border: isActive ? `3px solid ${Colors.primary}` : 'none',
                            }}
                          >
                            {step.icon}
                          </Box>
                          <Typography variant="caption" sx={{ mt: 0.5, textAlign: 'center' }}>
                            {step.label}
                          </Typography>
                        </Box>
                        {index < ORDER_FLOW.length - 1 && (
                          <Box
                            sx={{
                              flex: 1,
                              height: 2,
                              bgcolor: isCompleted ? Colors.primary : Colors.gray[200],
                              minWidth: 20,
                            }}
                          />
                        )}
                      </React.Fragment>
                    );
                  })}
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenViewDialog(false)}>Close</Button>
          <Button
            variant="contained"
            onClick={() => {
              setOpenViewDialog(false);
              handleOpenAssign(selectedOrder);
            }}
            sx={{ bgcolor: Colors.primary }}
          >
            Assign Agent
          </Button>
          <Button
            variant="outlined"
            onClick={() => {
              setOpenViewDialog(false);
              handleOpenStatusUpdate(selectedOrder);
            }}
            sx={{ borderColor: Colors.primary, color: Colors.primary }}
          >
            Update Status
          </Button>
        </DialogActions>
      </Dialog>

      {/* ============================================ */}
      {/* ASSIGN AGENT DIALOG */}
      {/* ============================================ */}
      <Dialog open={openAssignDialog} onClose={() => setOpenAssignDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Assign Agent to Order</Typography>
            <IconButton onClick={() => setOpenAssignDialog(false)}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Assigning agent to order: <strong>{selectedOrder?.order_number}</strong>
            </Typography>
            
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
              Available agents: {agents?.length || 0}
            </Typography>
            
            <FormControl fullWidth>
              <InputLabel>Select Agent</InputLabel>
              <Select
                value={selectedAgent}
                label="Select Agent"
                onChange={(e) => setSelectedAgent(e.target.value)}
                renderValue={(selected) => {
                  const agent = agents.find(a => a.id === selected);
                  return agent ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar sx={{ width: 24, height: 24, bgcolor: Colors.primary }}>
                        <Person sx={{ fontSize: 14 }} />
                      </Avatar>
                      {agent.business_name} ({agent.full_name})
                    </Box>
                  ) : 'Select Agent';
                }}
              >
                {agents && agents.length > 0 ? (
                  agents
                    .filter(a => a.is_approved !== false)
                    .map((agent) => (
                      <MenuItem key={agent.id} value={agent.id}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 0.5 }}>
                          <Avatar sx={{ width: 32, height: 32, bgcolor: Colors.primary }}>
                            {agent.full_name?.charAt(0) || 'A'}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight={500}>
                              {agent.business_name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {agent.full_name} • {agent.phone_number}
                            </Typography>
                          </Box>
                        </Box>
                      </MenuItem>
                    ))
                ) : (
                  <MenuItem disabled>
                    <Typography variant="body2" color="text.secondary">
                      No agents available. Please add agents first.
                    </Typography>
                  </MenuItem>
                )}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAssignDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => handleAssignAgent(selectedOrder?.id, selectedAgent)}
            sx={{ bgcolor: Colors.primary }}
            disabled={!selectedAgent || updating}
          >
            {updating ? <CircularProgress size={24} /> : 'Assign Agent'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ============================================ */}
      {/* UPDATE STATUS DIALOG */}
      {/* ============================================ */}
      <Dialog open={openStatusDialog} onClose={() => setOpenStatusDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Update Order Status</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Update status for order: <strong>{selectedOrder?.order_number}</strong>
            </Typography>
            <FormControl fullWidth>
              <InputLabel>New Status</InputLabel>
              <Select
                value={newStatus}
                label="New Status"
                onChange={(e) => setNewStatus(e.target.value)}
              >
                {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                  <MenuItem key={key} value={key}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {config.icon}
                      {config.label}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenStatusDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => handleUpdateStatus(selectedOrder?.id, newStatus)}
            sx={{ bgcolor: Colors.primary }}
            disabled={!newStatus || newStatus === selectedOrder?.status || updating}
          >
            {updating ? <CircularProgress size={24} /> : 'Update Status'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ============================================ */}
      {/* CREATE ORDER DIALOG */}
      {/* ============================================ */}
      <Dialog 
        open={openCreateDialog} 
        onClose={() => setOpenCreateDialog(false)} 
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Create Order for Customer</Typography>
            <IconButton onClick={() => setOpenCreateDialog(false)}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={3}>
              {/* Customer Selection - ✅ FIXED: debounced, race-safe, not re-filtered by MUI */}
              <Grid item xs={12}>
                <Autocomplete
                  options={customers}
                  loading={customerSearchLoading}
                  // 🔑 Customers are already filtered server-side by search term.
                  // Without this, MUI re-filters `options` against the current inputValue
                  // using getOptionLabel, which can silently drop valid server results
                  // (casing, phone formatting, partial-name matches, etc).
                  filterOptions={(x) => x}
                  value={selectedCustomer}
                  onChange={(e, newValue) => {
                    console.log('🔄 Customer selected:', newValue);
                    setSelectedCustomer(newValue);
                    setCreateForm({ ...createForm, customer_id: newValue?.id || '' });
                  }}
                  onInputChange={(event, newInputValue, reason) => {
                    console.log('📝 Input changed:', newInputValue, 'reason:', reason);
                    setCustomerSearch(newInputValue);
                    if (reason === 'input') {
                      searchCustomersForCreate(newInputValue);
                    }
                  }}
                  getOptionLabel={(option) => {
                    if (typeof option === 'string') return option;
                    return option ? `${option.full_name} (${option.phone_number})` : '';
                  }}
                  isOptionEqualToValue={(option, value) => {
                    if (!option || !value) return false;
                    return option.id === value.id;
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Search Customer"
                      required
                      placeholder="Type customer name or phone..."
                      InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                          <>
                            {customerSearchLoading ? (
                              <CircularProgress color="inherit" size={18} />
                            ) : null}
                            {params.InputProps.endAdornment}
                          </>
                        ),
                      }}
                    />
                  )}
                  noOptionsText={
                    customerSearch.length < 2
                      ? 'Type at least 2 characters'
                      : 'No customers found. Try a different search.'
                  }
                />
              </Grid>

              {/* Product Selection */}
              <Grid item xs={12} md={6}>
                <Autocomplete
                  options={products}
                  value={selectedProduct}
                  onChange={(e, newValue) => {
                    setSelectedProduct(newValue);
                    setCreateForm({ ...createForm, product_id: newValue?.id || '' });
                  }}
                  getOptionLabel={(option) => `${option.brand_name} - ${option.name} (KES ${option.base_price})`}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Select Product"
                      required
                      placeholder="Search products..."
                    />
                  )}
                />
              </Grid>

              {/* Quantity */}
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label="Quantity"
                  type="number"
                  required
                  value={createForm.quantity}
                  onChange={(e) => setCreateForm({ ...createForm, quantity: parseInt(e.target.value) || 1 })}
                  inputProps={{ min: 1 }}
                />
              </Grid>

              {/* Delivery Fee */}
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label="Delivery Fee (KES)"
                  type="number"
                  value={createForm.delivery_fee}
                  onChange={(e) => setCreateForm({ ...createForm, delivery_fee: parseFloat(e.target.value) || 0 })}
                  inputProps={{ min: 0 }}
                />
              </Grid>

              {/* Agent Assignment (Optional) */}
              <Grid item xs={12} md={6}>
                <Autocomplete
                  options={agentList}
                  value={selectedAgentForOrder}
                  onChange={(e, newValue) => {
                    setSelectedAgentForOrder(newValue);
                    setCreateForm({ ...createForm, agent_id: newValue?.id || '' });
                  }}
                  getOptionLabel={(option) => `${option.business_name} (${option.full_name})`}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Assign Agent (Optional)"
                      placeholder="Select agent..."
                    />
                  )}
                />
              </Grid>

              {/* Payment Method */}
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Payment Method</InputLabel>
                  <Select
                    value={createForm.payment_method}
                    label="Payment Method"
                    onChange={(e) => setCreateForm({ ...createForm, payment_method: e.target.value })}
                  >
                    <MenuItem value="cash">Cash on Delivery</MenuItem>
                    <MenuItem value="mpesa">M-PESA</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* Delivery Address */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Delivery Address"
                  required
                  multiline
                  rows={2}
                  value={createForm.delivery_address}
                  onChange={(e) => setCreateForm({ ...createForm, delivery_address: e.target.value })}
                  placeholder="Enter complete delivery address"
                />
              </Grid>

              {/* Special Instructions */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Special Instructions"
                  multiline
                  rows={2}
                  value={createForm.special_instructions}
                  onChange={(e) => setCreateForm({ ...createForm, special_instructions: e.target.value })}
                  placeholder="Any special delivery instructions..."
                />
              </Grid>

              {/* Order Summary */}
              <Grid item xs={12}>
                <Card sx={{ bgcolor: '#F5F5F5' }}>
                  <CardContent>
                    <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 2 }}>
                      Order Summary
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={4}>
                        <Typography variant="caption" color="text.secondary">Product</Typography>
                        <Typography variant="body2">
                          {selectedProduct ? `${selectedProduct.brand_name} - ${selectedProduct.name}` : 'Not selected'}
                        </Typography>
                      </Grid>
                      <Grid item xs={4}>
                        <Typography variant="caption" color="text.secondary">Quantity</Typography>
                        <Typography variant="body2">{createForm.quantity}</Typography>
                      </Grid>
                      <Grid item xs={4}>
                        <Typography variant="caption" color="text.secondary">Unit Price</Typography>
                        <Typography variant="body2">
                          KES {selectedProduct ? parseFloat(selectedProduct.base_price).toLocaleString() : '0'}
                        </Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Divider sx={{ my: 1 }} />
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">Subtotal</Typography>
                        <Typography variant="body2">
                          KES {selectedProduct ? (parseFloat(selectedProduct.base_price) * createForm.quantity).toLocaleString() : '0'}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">Delivery Fee</Typography>
                        <Typography variant="body2">KES {parseFloat(createForm.delivery_fee).toLocaleString()}</Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="h6" sx={{ color: Colors.primary }}>
                          Total: KES {calculateTotal().toLocaleString()}
                        </Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCreateDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleCreateOrder}
            disabled={createLoading}
            sx={{ bgcolor: Colors.primary }}
          >
            {createLoading ? <CircularProgress size={24} color="inherit" /> : 'Create Order'}
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
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}