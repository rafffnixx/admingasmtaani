// 📁 admin-web/src/pages/Agents.jsx

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
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
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
  Visibility,
  Edit,
  Delete,
  Block,
  CheckCircle,
  Cancel,
  Refresh,
  Download,
  Phone,
  Email,
  Store,
  Verified,
  Pending,
  Close,
  Check,
  Star,
  StarBorder,
  ShoppingCart,
  AttachMoney,
  History,
  Payment,
  Chat,
  SupportAgent,
  Info,
  Add,
  VerifiedUser,
  TrendingUp,
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
      id={`agent-tabpanel-${index}`}
      aria-labelledby={`agent-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

export default function Agents() {
  // ============================================
  // STATE
  // ============================================
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [profileTabValue, setProfileTabValue] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedAgents, setSelectedAgents] = useState([]);
  const [bulkAction, setBulkAction] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Agent profile data
  const [agentOrders, setAgentOrders] = useState([]);
  const [agentPayments, setAgentPayments] = useState([]);
  const [agentChats, setAgentChats] = useState([]);
  const [agentSupportTickets, setAgentSupportTickets] = useState([]);
  const [loadingProfile, setLoadingProfile] = useState(false);

  // Edit form
  const [editForm, setEditForm] = useState({
    business_name: '',
    full_name: '',
    phone_number: '',
    email: '',
    is_approved: false,
    is_active: true,
    commission_rate: 10,
  });

  // Create form
  const [createForm, setCreateForm] = useState({
    phone_number: '',
    password: '',
    full_name: '',
    email: '',
    business_name: '',
    business_address: '',
    user_type: 'agent',
    is_approved: false,
    is_active: true,
    commission_rate: 10,
  });

  const [createErrors, setCreateErrors] = useState({});

  // ============================================
  // STATS
  // ============================================
  const [stats, setStats] = useState({
    total: 0,
    approved: 0,
    pending: 0,
    banned: 0,
    online: 0,
    total_deliveries: 0,
    total_revenue: 0,
  });

  // ============================================
  // FETCH FUNCTIONS
  // ============================================
  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.getAgents();
      console.log('📦 Agents response:', response);
      
      let agentsData = [];
      if (Array.isArray(response)) {
        agentsData = response;
      } else if (response?.data && Array.isArray(response.data)) {
        agentsData = response.data;
      } else if (response?.data?.data && Array.isArray(response.data.data)) {
        agentsData = response.data.data;
      }
      
      console.log('✅ Processed agents:', agentsData.length);
      setAgents(agentsData);
      calculateStats(agentsData);
      
    } catch (error) {
      console.error('Error fetching agents:', error);
      showSnackbar('Failed to fetch agents', 'error');
      setAgents([]);
      calculateStats([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data) => {
    const total = data.length;
    const approved = data.filter(a => a.is_approved === true && a.is_active !== false).length;
    const pending = data.filter(a => a.is_approved === false && a.is_active !== false).length;
    const banned = data.filter(a => a.is_active === false).length;
    const online = data.filter(a => a.is_online === true && a.is_active !== false).length;
    const total_deliveries = data.reduce((sum, a) => sum + (parseInt(a.delivery_count) || 0), 0);
    const total_revenue = data.reduce((sum, a) => sum + (parseFloat(a.total_revenue) || 0), 0);

    setStats({ total, approved, pending, banned, online, total_deliveries, total_revenue });
  };

  // ============================================
  // FETCH AGENT PROFILE DATA
  // ============================================
  const fetchAgentProfileData = async (agentId) => {
    setLoadingProfile(true);
    try {
      const agent = agents.find(a => a.id === agentId);
      if (agent) {
        setSelectedAgent(prev => ({ ...prev, ...agent }));
      }

      // Fetch agent orders
      try {
        const ordersResponse = await adminAPI.getAgentOrders?.(agentId);
        setAgentOrders(ordersResponse?.data || ordersResponse || []);
      } catch (err) {
        setAgentOrders([]);
      }

      // Fetch agent payments
      try {
        const paymentsResponse = await adminAPI.getAgentPayments?.(agentId);
        setAgentPayments(paymentsResponse?.data || paymentsResponse || []);
      } catch (err) {
        setAgentPayments([]);
      }

      // Fetch agent chats
      try {
        const chatsResponse = await adminAPI.getAgentChats?.(agentId);
        setAgentChats(chatsResponse?.data || chatsResponse || []);
      } catch (err) {
        setAgentChats([]);
      }

      // Fetch agent support tickets
      try {
        const ticketsResponse = await adminAPI.getAgentTickets?.(agentId);
        setAgentSupportTickets(ticketsResponse?.data || ticketsResponse || []);
      } catch (err) {
        setAgentSupportTickets([]);
      }

    } catch (error) {
      console.error('Error fetching agent profile:', error);
      showSnackbar('Failed to load agent details', 'error');
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

  const handleViewAgent = (agent) => {
    setSelectedAgent(agent);
    setProfileTabValue(0);
    setOpenViewDialog(true);
    fetchAgentProfileData(agent.id);
  };

  const handleEditAgent = (agent) => {
    setSelectedAgent(agent);
    setEditForm({
      business_name: agent.business_name || '',
      full_name: agent.full_name || '',
      phone_number: agent.phone_number || '',
      email: agent.email || '',
      is_approved: agent.is_approved || false,
      is_active: agent.is_active !== false,
      commission_rate: agent.commission_rate || 10,
    });
    setOpenEditDialog(true);
  };

  const handleDeleteAgent = (agent) => {
    setSelectedAgent(agent);
    setOpenDeleteDialog(true);
  };

  const handleApprove = async (id) => {
    try {
      await adminAPI.approveAgent(id);
      showSnackbar('Agent approved successfully!');
      fetchAgents();
    } catch (error) {
      console.error('Error approving agent:', error);
      showSnackbar('Failed to approve agent', 'error');
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm('Are you sure you want to reject this agent?')) return;
    try {
      await adminAPI.rejectAgent(id);
      showSnackbar('Agent rejected');
      fetchAgents();
    } catch (error) {
      showSnackbar('Failed to reject agent', 'error');
    }
  };

  const handleBan = async (id) => {
    if (!window.confirm('Are you sure you want to ban this agent?')) return;
    try {
      await adminAPI.banAgent(id);
      showSnackbar('Agent banned');
      fetchAgents();
    } catch (error) {
      showSnackbar('Failed to ban agent', 'error');
    }
  };

  const handleUnban = async (id) => {
    try {
      await adminAPI.unbanAgent(id);
      showSnackbar('Agent unbanned');
      fetchAgents();
    } catch (error) {
      showSnackbar('Failed to unban agent', 'error');
    }
  };

  const handleUpdateAgent = async () => {
    setSubmitting(true);
    try {
      await adminAPI.updateAgent?.(selectedAgent.id, editForm);
      showSnackbar('Agent updated successfully!');
      setOpenEditDialog(false);
      await fetchAgents();
    } catch (error) {
      console.error('Error updating agent:', error);
      showSnackbar('Failed to update agent', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    setSubmitting(true);
    try {
      await adminAPI.deleteAgent?.(selectedAgent.id);
      showSnackbar('Agent deleted successfully!');
      setOpenDeleteDialog(false);
      await fetchAgents();
    } catch (error) {
      console.error('Error deleting agent:', error);
      showSnackbar('Failed to delete agent', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // ============================================
  // CREATE AGENT FUNCTIONS
  // ============================================
  const handleOpenCreateDialog = () => {
    setCreateForm({
      phone_number: '',
      password: '',
      full_name: '',
      email: '',
      business_name: '',
      business_address: '',
      user_type: 'agent',
      is_approved: false,
      is_active: true,
      commission_rate: 10,
    });
    setCreateErrors({});
    setOpenCreateDialog(true);
  };

  const validateCreateForm = () => {
    const errors = {};
    if (!createForm.phone_number) errors.phone_number = 'Phone number is required';
    if (!createForm.password) errors.password = 'Password is required';
    if (createForm.password && createForm.password.length < 6) errors.password = 'Password must be at least 6 characters';
    if (!createForm.full_name) errors.full_name = 'Full name is required';
    if (!createForm.business_name) errors.business_name = 'Business name is required';
    if (createForm.email && !/\S+@\S+\.\S+/.test(createForm.email)) errors.email = 'Invalid email address';
    return errors;
  };

  const handleCreateAgent = async () => {
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
        user_type: 'agent',
        is_verified: true,
        is_active: createForm.is_active,
      });

      if (response.data?.success) {
        showSnackbar(`Agent ${createForm.full_name} created successfully!`, 'success');
        setOpenCreateDialog(false);
        await fetchAgents();
      }
    } catch (error) {
      console.error('Error creating agent:', error);
      showSnackbar(error.response?.data?.message || 'Failed to create agent', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // ============================================
  // STATUS CHIP FUNCTION
  // ============================================
  const getStatusChip = (agent) => {
    if (!agent) {
      return <Chip label="Unknown" color="default" size="small" />;
    }

    if (!agent.is_approved && agent.is_active !== false) {
      return <Chip label="Pending" color="warning" size="small" icon={<Pending sx={{ fontSize: 14 }} />} />;
    }
    if (agent.is_active === false) {
      return <Chip label="Banned" color="error" size="small" icon={<Block sx={{ fontSize: 14 }} />} />;
    }
    if (agent.is_online) {
      return <Chip label="Online" color="success" size="small" icon={<CheckCircle sx={{ fontSize: 14 }} />} />;
    }
    return <Chip label="Approved" color="info" size="small" icon={<Verified sx={{ fontSize: 14 }} />} />;
  };

  // ============================================
  // FILTER FUNCTIONS
  // ============================================
  const getFilteredAgents = () => {
    let filtered = agents;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(a =>
        a.business_name?.toLowerCase().includes(term) ||
        a.full_name?.toLowerCase().includes(term) ||
        a.phone_number?.includes(term) ||
        a.email?.toLowerCase().includes(term)
      );
    }

    if (tabValue === 1) {
      filtered = filtered.filter(a => !a.is_approved && a.is_active !== false);
    } else if (tabValue === 2) {
      filtered = filtered.filter(a => a.is_approved && a.is_active !== false);
    } else if (tabValue === 3) {
      filtered = filtered.filter(a => a.is_active === false);
    }

    if (filterStatus === 'approved') {
      filtered = filtered.filter(a => a.is_approved);
    } else if (filterStatus === 'pending') {
      filtered = filtered.filter(a => !a.is_approved && a.is_active !== false);
    } else if (filterStatus === 'banned') {
      filtered = filtered.filter(a => a.is_active === false);
    } else if (filterStatus === 'online') {
      filtered = filtered.filter(a => a.is_online);
    }

    return filtered;
  };

  const filteredAgents = getFilteredAgents();

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
            Agent Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage all agents on the platform
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <TextField
            size="small"
            placeholder="Search agents..."
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
            Create Agent
          </Button>
          <Button
            variant="outlined"
            size="small"
            startIcon={<Refresh />}
            onClick={fetchAgents}
            sx={{ borderColor: Colors.primary, color: Colors.primary }}
          >
            Refresh
          </Button>
          <Button
            variant="outlined"
            size="small"
            startIcon={<Download />}
            onClick={() => showSnackbar('Export coming soon!', 'info')}
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
              <Typography variant="body2" color="text.secondary">Approved</Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: Colors.success }}>
                {stats.approved}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ borderLeft: `4px solid ${Colors.warning}` }}>
            <CardContent>
              <Typography variant="body2" color="text.secondary">Pending</Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: Colors.warning }}>
                {stats.pending}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ borderLeft: `4px solid ${Colors.error}` }}>
            <CardContent>
              <Typography variant="body2" color="text.secondary">Banned</Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: Colors.error }}>
                {stats.banned}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ borderLeft: `4px solid ${Colors.info}` }}>
            <CardContent>
              <Typography variant="body2" color="text.secondary">Online</Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: Colors.info }}>
                {stats.online}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

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
          <Tab label={`All (${stats.total})`} />
          <Tab label={`Pending (${stats.pending})`} icon={<Pending sx={{ fontSize: 16 }} />} iconPosition="start" />
          <Tab label="Approved" />
          <Tab label={`Banned (${stats.banned})`} icon={<Block sx={{ fontSize: 16 }} />} iconPosition="start" />
        </Tabs>
      </Paper>

      {/* ============================================ */}
      {/* AGENTS TABLE */}
      {/* ============================================ */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ bgcolor: Colors.gray[50] }}>
            <TableRow>
              <TableCell>Agent</TableCell>
              <TableCell>Business</TableCell>
              <TableCell>Contact</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="center">Deliveries</TableCell>
              <TableCell align="center">Revenue</TableCell>
              <TableCell align="center">Rating</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredAgents.length > 0 ? (
              filteredAgents.map((agent) => (
                <TableRow
                  key={agent.id}
                  hover
                  sx={{
                    bgcolor: !agent.is_approved && agent.is_active !== false ? '#FFF8E1' :
                            agent.is_active === false ? '#FFEBEE' : 'inherit',
                  }}
                >
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ bgcolor: agent.is_active !== false ? Colors.primary : Colors.gray[400] }}>
                        {agent.business_name?.charAt(0) || 'A'}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight={500}>
                          {agent.full_name || agent.business_name}
                        </Typography>
                        {agent.is_verified && (
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
                    <Typography variant="body2">{agent.business_name}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {agent.business_address || 'No address'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Phone sx={{ fontSize: 14, color: Colors.gray[400] }} />
                      {agent.phone_number}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Email sx={{ fontSize: 14, color: Colors.gray[400] }} />
                      {agent.email || 'No email'}
                    </Typography>
                  </TableCell>
                  <TableCell>{getStatusChip(agent)}</TableCell>
                  <TableCell align="center">
                    <Chip
                      label={agent.delivery_count || 0}
                      size="small"
                      color={(agent.delivery_count || 0) > 0 ? 'primary' : 'default'}
                      sx={{ minWidth: 30 }}
                    />
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 500, color: Colors.primary }}>
                    KES {(agent.total_revenue || 0).toLocaleString()}
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                      <Star sx={{ fontSize: 14, color: Colors.warning }} />
                      <Typography variant="body2">
                        {Number(agent.rating || 0).toFixed(1)}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5 }}>
                      <Tooltip title="View Profile">
                        <IconButton size="small" onClick={() => handleViewAgent(agent)}>
                          <Visibility fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit">
                        <IconButton size="small" onClick={() => handleEditAgent(agent)}>
                          <Edit fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      {!agent.is_approved && agent.is_active !== false && (
                        <>
                          <Tooltip title="Approve">
                            <IconButton size="small" color="success" onClick={() => handleApprove(agent.id)}>
                              <Check fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Reject">
                            <IconButton size="small" color="error" onClick={() => handleReject(agent.id)}>
                              <Close fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </>
                      )}
                      {agent.is_approved && agent.is_active !== false && (
                        <Tooltip title="Ban">
                          <IconButton size="small" color="error" onClick={() => handleBan(agent.id)}>
                            <Block fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      {agent.is_active === false && (
                        <Tooltip title="Unban">
                          <IconButton size="small" color="success" onClick={() => handleUnban(agent.id)}>
                            <Verified fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      <Tooltip title="Delete">
                        <IconButton size="small" color="error" onClick={() => handleDeleteAgent(agent)}>
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
                    No agents found
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* ============================================ */}
      {/* AGENT PROFILE DIALOG */}
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
                {selectedAgent?.business_name?.charAt(0) || 'A'}
              </Avatar>
              <Box>
                <Typography variant="h5">{selectedAgent?.business_name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  <Store sx={{ fontSize: 14, mr: 0.5 }} /> {selectedAgent?.full_name}
                  {selectedAgent?.phone_number && (
                    <>
                      <Phone sx={{ fontSize: 14, ml: 2, mr: 0.5 }} /> {selectedAgent?.phone_number}
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
                  {getStatusChip(selectedAgent)}
                  <Chip
                    label={`${selectedAgent?.delivery_count || 0} Deliveries`}
                    color="primary"
                    variant="outlined"
                  />
                  <Chip
                    label={`KES ${(selectedAgent?.total_revenue || 0).toLocaleString()}`}
                    color="success"
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
              <Tab label="Support" icon={<SupportAgent />} iconPosition="start" />
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
                        Business Information
                      </Typography>
                      <Divider sx={{ mb: 2 }} />
                      <Grid container spacing={2}>
                        <Grid item xs={12}>
                          <Typography variant="subtitle2" color="text.secondary">Business Name</Typography>
                          <Typography variant="body1">{selectedAgent?.business_name}</Typography>
                        </Grid>
                        <Grid item xs={12}>
                          <Typography variant="subtitle2" color="text.secondary">Full Name</Typography>
                          <Typography variant="body1">{selectedAgent?.full_name}</Typography>
                        </Grid>
                        <Grid item xs={12}>
                          <Typography variant="subtitle2" color="text.secondary">Phone</Typography>
                          <Typography variant="body1">{selectedAgent?.phone_number}</Typography>
                        </Grid>
                        <Grid item xs={12}>
                          <Typography variant="subtitle2" color="text.secondary">Email</Typography>
                          <Typography variant="body1">{selectedAgent?.email || 'N/A'}</Typography>
                        </Grid>
                        <Grid item xs={12}>
                          <Typography variant="subtitle2" color="text.secondary">Address</Typography>
                          <Typography variant="body1">{selectedAgent?.business_address || 'N/A'}</Typography>
                        </Grid>
                        <Grid item xs={12}>
                          <Typography variant="subtitle2" color="text.secondary">Commission Rate</Typography>
                          <Typography variant="body1">{selectedAgent?.commission_rate || 10}%</Typography>
                        </Grid>
                      </Grid>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3, bgcolor: Colors.gray[50] }}>
                      <Typography variant="h6" sx={{ mb: 2, color: Colors.primary }}>
                        Performance Stats
                      </Typography>
                      <Divider sx={{ mb: 2 }} />
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Typography variant="subtitle2" color="text.secondary">Total Deliveries</Typography>
                          <Typography variant="h4" sx={{ color: Colors.primary }}>
                            {selectedAgent?.delivery_count || 0}
                          </Typography>
                          {selectedAgent?.delivery_count > 0 && (
                            <Typography variant="caption" color="text.secondary">
                              {selectedAgent.delivery_count} orders delivered
                            </Typography>
                          )}
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="subtitle2" color="text.secondary">Total Revenue</Typography>
                          <Typography variant="h4" sx={{ color: Colors.primary }}>
                            KES {(selectedAgent?.total_revenue || 0).toLocaleString()}
                          </Typography>
                        </Grid>
                        <Grid item xs={12}>
                          <Typography variant="subtitle2" color="text.secondary">Rating</Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {[...Array(5)].map((_, i) => (
                              i < Math.floor(Number(selectedAgent?.rating || 0)) ? (
                                <Star key={i} sx={{ color: Colors.warning }} />
                              ) : (
                                <StarBorder key={i} sx={{ color: Colors.gray[300] }} />
                              )
                            ))}
                            <Typography variant="body2">
                              ({Number(selectedAgent?.rating || 0).toFixed(1)})
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={12}>
                          <Typography variant="subtitle2" color="text.secondary">Status</Typography>
                          {getStatusChip(selectedAgent)}
                        </Grid>
                        <Grid item xs={12}>
                          <Typography variant="subtitle2" color="text.secondary">Joined</Typography>
                          <Typography variant="body1">
                            {selectedAgent?.created_at ? 
                              new Date(selectedAgent.created_at).toLocaleDateString() : 
                              'N/A'}
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
          {/* TAB 2: ORDERS */}
          {/* ========================================== */}
          <TabPanel value={profileTabValue} index={1}>
            <Box sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>Order History</Typography>
              {loadingProfile ? (
                <CircularProgress />
              ) : agentOrders.length > 0 ? (
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead sx={{ bgcolor: Colors.gray[50] }}>
                      <TableRow>
                        <TableCell>Order ID</TableCell>
                        <TableCell>Date</TableCell>
                        <TableCell>Customer</TableCell>
                        <TableCell align="right">Total</TableCell>
                        <TableCell>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {agentOrders.map((order) => (
                        <TableRow key={order.id} hover>
                          <TableCell>{order.order_number || order.id}</TableCell>
                          <TableCell>{new Date(order.created_at || order.date).toLocaleDateString()}</TableCell>
                          <TableCell>{order.customer_name || 'N/A'}</TableCell>
                          <TableCell align="right">KES {(order.total_amount || order.total || 0).toLocaleString()}</TableCell>
                          <TableCell>
                            <Chip
                              label={order.status || 'pending'}
                              size="small"
                              color={order.status === 'delivered' ? 'success' : 'warning'}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography variant="body2" color="text.secondary">No orders found</Typography>
              )}
            </Box>
          </TabPanel>

          {/* ========================================== */}
          {/* TAB 3: PAYMENTS */}
          {/* ========================================== */}
          <TabPanel value={profileTabValue} index={2}>
            <Box sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>Payment History</Typography>
              {loadingProfile ? (
                <CircularProgress />
              ) : agentPayments.length > 0 ? (
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
                      {agentPayments.map((payment) => (
                        <TableRow key={payment.id} hover>
                          <TableCell>{payment.transaction_id || payment.id}</TableCell>
                          <TableCell>{new Date(payment.created_at || payment.date).toLocaleDateString()}</TableCell>
                          <TableCell align="right">KES {(payment.amount || 0).toLocaleString()}</TableCell>
                          <TableCell>{payment.payment_method || 'N/A'}</TableCell>
                          <TableCell>
                            <Chip
                              label={payment.status || 'pending'}
                              size="small"
                              color={payment.status === 'completed' ? 'success' : 'warning'}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography variant="body2" color="text.secondary">No payments found</Typography>
              )}
            </Box>
          </TabPanel>

          {/* ========================================== */}
          {/* TAB 4: CHATS */}
          {/* ========================================== */}
          <TabPanel value={profileTabValue} index={3}>
            <Box sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>Chat History</Typography>
              {loadingProfile ? (
                <CircularProgress />
              ) : agentChats.length > 0 ? (
                <List>
                  {agentChats.map((chat) => (
                    <Paper key={chat.id} sx={{ mb: 1 }}>
                      <ListItem>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: chat.status === 'resolved' ? Colors.success : Colors.warning }}>
                            <Chat />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                              <Typography variant="subtitle2">{chat.customer_name || 'Customer'}</Typography>
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
                <Typography variant="body2" color="text.secondary">No chat history found</Typography>
              )}
            </Box>
          </TabPanel>

          {/* ========================================== */}
          {/* TAB 5: SUPPORT */}
          {/* ========================================== */}
          <TabPanel value={profileTabValue} index={4}>
            <Box sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>Support Tickets</Typography>
              {loadingProfile ? (
                <CircularProgress />
              ) : agentSupportTickets.length > 0 ? (
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
                      {agentSupportTickets.map((ticket) => (
                        <TableRow key={ticket.id} hover>
                          <TableCell>{ticket.ticket_number || ticket.id}</TableCell>
                          <TableCell>{ticket.subject || 'N/A'}</TableCell>
                          <TableCell>
                            <Chip
                              label={ticket.priority || 'medium'}
                              size="small"
                              color={ticket.priority === 'high' ? 'error' : 'warning'}
                            />
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={ticket.status || 'open'}
                              size="small"
                              color={ticket.status === 'resolved' ? 'success' : 'warning'}
                            />
                          </TableCell>
                          <TableCell>{new Date(ticket.created_at || ticket.date).toLocaleDateString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography variant="body2" color="text.secondary">No support tickets found</Typography>
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
              handleEditAgent(selectedAgent);
            }}
            sx={{ bgcolor: Colors.primary }}
          >
            Edit Agent
          </Button>
        </DialogActions>
      </Dialog>

      {/* ============================================ */}
      {/* CREATE AGENT DIALOG */}
      {/* ============================================ */}
      <Dialog 
        open={openCreateDialog} 
        onClose={() => setOpenCreateDialog(false)} 
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Create Agent Account</Typography>
            <IconButton onClick={() => setOpenCreateDialog(false)}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Alert severity="info" sx={{ mb: 3 }}>
              Create a new agent account. The agent will need to be approved before they can start accepting orders.
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
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Business Name"
                  required
                  value={createForm.business_name}
                  onChange={(e) => setCreateForm({ ...createForm, business_name: e.target.value })}
                  error={!!createErrors.business_name}
                  helperText={createErrors.business_name}
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
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email (Optional)"
                  value={createForm.email}
                  onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                  error={!!createErrors.email}
                  helperText={createErrors.email}
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
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowPassword(!showPassword)}>
                          {showPassword ? <Close /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Business Address"
                  multiline
                  rows={2}
                  value={createForm.business_address}
                  onChange={(e) => setCreateForm({ ...createForm, business_address: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Commission Rate (%)"
                  type="number"
                  value={createForm.commission_rate}
                  onChange={(e) => setCreateForm({ ...createForm, commission_rate: parseFloat(e.target.value) || 10 })}
                  inputProps={{ min: 0, max: 100 }}
                  helperText="Percentage of order total the agent earns"
                />
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
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCreateDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleCreateAgent}
            disabled={submitting}
            sx={{ bgcolor: Colors.primary }}
          >
            {submitting ? <CircularProgress size={24} /> : 'Create Agent'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ============================================ */}
      {/* EDIT AGENT DIALOG */}
      {/* ============================================ */}
      <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Edit Agent</Typography>
            <IconButton onClick={() => setOpenEditDialog(false)}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Business Name"
                value={editForm.business_name}
                onChange={(e) => setEditForm({ ...editForm, business_name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Full Name"
                value={editForm.full_name}
                onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Phone Number"
                value={editForm.phone_number}
                onChange={(e) => setEditForm({ ...editForm, phone_number: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Commission Rate (%)"
                type="number"
                value={editForm.commission_rate}
                onChange={(e) => setEditForm({ ...editForm, commission_rate: parseFloat(e.target.value) || 10 })}
                inputProps={{ min: 0, max: 100 }}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={editForm.is_active}
                    onChange={(e) => setEditForm({ ...editForm, is_active: e.target.checked })}
                  />
                }
                label={editForm.is_active ? 'Active' : 'Inactive'}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleUpdateAgent}
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
        <DialogTitle>Delete Agent</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete <strong>{selectedAgent?.business_name}</strong>?
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