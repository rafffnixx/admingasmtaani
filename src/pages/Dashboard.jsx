// 📁 admin-web/src/pages/Dashboard.jsx

import React, { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Alert,
  LinearProgress,
  Avatar,
  IconButton,
  Tooltip,
  Button,  // ✅ ADD THIS - WAS MISSING
} from '@mui/material';
import {
  People,
  Store,
  ShoppingCart,
  AttachMoney,
  TrendingUp,
  Refresh,
  Today,
  TrendingDown,
  Pending,
  CheckCircle,
  Cancel,
  Phone,  // ✅ ADD THIS - WAS MISSING
} from '@mui/icons-material';
import { adminAPI } from '../services/api';
import { Colors } from '../utils/colors';
import RevenueChart from '../components/Charts/RevenueChart';
import StatsCard from '../components/Common/StatsCard';
import Loading from '../components/Common/Loading';

const FALLBACK_STATS = {
  total_customers: 0,
  total_agents: 0,
  pending_agents: 0,
  total_orders: 0,
  today_orders: 0,
  total_revenue: 0,
  today_revenue: 0,
};

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(FALLBACK_STATS);
  const [orders, setOrders] = useState([]);
  const [recentAgents, setRecentAgents] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      console.log('📊 Fetching dashboard data...');
      
      const [statsRes, ordersRes, agentsRes] = await Promise.all([
        adminAPI.getDashboard(),
        adminAPI.getOrders(),
        adminAPI.getAgents(),
      ]);
      
      console.log('📊 Stats response:', statsRes.data);
      console.log('📊 Orders response:', ordersRes.data?.length || 0);
      
      setStats(statsRes.data || FALLBACK_STATS);
      setOrders(ordersRes.data?.slice(0, 5) || []);
      
      // Get recent pending agents
      const agents = agentsRes.data || [];
      const pending = agents.filter(a => !a.is_approved && a.is_active !== false).slice(0, 3);
      setRecentAgents(pending);
      
      setError(null);
    } catch (err) {
      console.error('❌ Error fetching dashboard:', err);
      const errorMsg = err.response?.data?.error || err.message || 'Failed to fetch data';
      setError(errorMsg);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboard();
  };

  const statsData = [
    { 
      title: 'Total Customers', 
      value: stats.total_customers || 0, 
      icon: <People sx={{ fontSize: 32 }} />, 
      color: Colors.primary, 
      bg: Colors.primaryBg,
      change: '+12%',
      changeType: 'up',
    },
    { 
      title: 'Total Agents', 
      value: stats.total_agents || 0, 
      icon: <Store sx={{ fontSize: 32 }} />, 
      color: Colors.info, 
      bg: '#EFF6FF',
      change: stats.pending_agents > 0 ? `${stats.pending_agents} pending` : 'All approved',
      changeType: stats.pending_agents > 0 ? 'warning' : 'up',
    },
    { 
      title: 'Total Orders', 
      value: stats.total_orders || 0, 
      icon: <ShoppingCart sx={{ fontSize: 32 }} />, 
      color: Colors.success, 
      bg: '#ECFDF5',
      change: `${stats.today_orders || 0} today`,
      changeType: stats.today_orders > 0 ? 'up' : 'neutral',
    },
    { 
      title: 'Total Revenue', 
      value: `KES ${(stats.total_revenue || 0).toLocaleString()}`, 
      icon: <AttachMoney sx={{ fontSize: 32 }} />, 
      color: Colors.warning, 
      bg: '#FFFBEB',
      change: `KES ${(stats.today_revenue || 0).toLocaleString()} today`,
      changeType: stats.today_revenue > 0 ? 'up' : 'neutral',
    },
  ];

  const getStatusColor = (status) => {
    const colors = {
      pending: 'warning',
      assigned: 'info',
      accepted: 'primary',
      picked_up: 'info',
      out_for_delivery: 'info',
      delivered: 'success',
      confirmed: 'success',
      cancelled: 'error',
      declined: 'error',
    };
    return colors[status] || 'default';
  };

  if (loading) return <Loading />;

  return (
    <Box>
      {/* ============================================ */}
      {/* HEADER */}
      {/* ============================================ */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
            Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Overview of your business performance
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TrendingUp sx={{ color: Colors.success }} />
            <Typography variant="body2" color="text.secondary">Live Data</Typography>
          </Box>
          <Tooltip title="Refresh Dashboard">
            <IconButton 
              onClick={handleRefresh} 
              disabled={refreshing}
              sx={{ 
                bgcolor: Colors.gray[50],
                '&:hover': { bgcolor: Colors.gray[100] }
              }}
            >
              <Refresh sx={{ fontSize: 20 }} />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* ============================================ */}
      {/* ERROR ALERT */}
      {/* ============================================ */}
      {error && (
        <Alert 
          severity="warning" 
          sx={{ mb: 3 }} 
          onClose={() => setError(null)}
          action={
            <Button color="inherit" size="small" onClick={fetchDashboard}>
              Retry
            </Button>
          }
        >
          <strong>⚠️ {error}</strong>
        </Alert>
      )}

      {/* ============================================ */}
      {/* STATS CARDS */}
      {/* ============================================ */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {statsData.map((stat, i) => (
          <Grid item xs={12} sm={6} md={3} key={i}>
            <StatsCard 
              title={stat.title} 
              value={stat.value} 
              icon={stat.icon} 
              color={stat.color} 
              bg={stat.bg}
              change={stat.change}
              changeType={stat.changeType}
            />
          </Grid>
        ))}
      </Grid>

      {/* ============================================ */}
      {/* TODAY'S STATS */}
      {/* ============================================ */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Card sx={{ 
            height: '100%',
            bgcolor: Colors.primaryBg,
            borderLeft: `4px solid ${Colors.primary}`,
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="subtitle1" color="text.secondary" sx={{ fontWeight: 500 }}>
                    Today's Orders
                  </Typography>
                  <Typography variant="h2" sx={{ color: Colors.primary, fontWeight: 'bold', mt: 1 }}>
                    {stats.today_orders || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    {stats.today_orders > 0 
                      ? `${stats.today_orders} orders placed today` 
                      : 'No orders yet today'}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: Colors.primary, width: 56, height: 56 }}>
                  <Today sx={{ fontSize: 32, color: '#fff' }} />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card sx={{ 
            height: '100%',
            bgcolor: '#ECFDF5',
            borderLeft: `4px solid ${Colors.success}`,
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="subtitle1" color="text.secondary" sx={{ fontWeight: 500 }}>
                    Today's Revenue
                  </Typography>
                  <Typography variant="h2" sx={{ color: Colors.success, fontWeight: 'bold', mt: 1 }}>
                    KES {(stats.today_revenue || 0).toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    {stats.today_revenue > 0 
                      ? 'Revenue generated today' 
                      : 'No revenue yet today'}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: Colors.success, width: 56, height: 56 }}>
                  <AttachMoney sx={{ fontSize: 32, color: '#fff' }} />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* ============================================ */}
      {/* REVENUE CHART */}
      {/* ============================================ */}
      <RevenueChart />

      {/* ============================================ */}
      {/* PENDING AGENTS ALERT */}
      {/* ============================================ */}
      {stats.pending_agents > 0 && (
        <Paper 
          sx={{ 
            p: 2, 
            mt: 3, 
            bgcolor: Colors.primaryBg, 
            borderLeft: `4px solid ${Colors.primary}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Typography variant="body2">
            <strong>{stats.pending_agents}</strong> agent{stats.pending_agents > 1 ? 's are' : ' is'} pending approval.
          </Typography>
          <Button 
            variant="outlined" 
            size="small" 
            onClick={() => window.location.href = '/agents'}
            sx={{ borderColor: Colors.primary, color: Colors.primary }}
          >
            Review Agents
          </Button>
        </Paper>
      )}

      {/* ============================================ */}
      {/* RECENT ORDERS */}
      {/* ============================================ */}
      <Box sx={{ mt: 4, mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          Recent Orders
        </Typography>
        <Button 
          variant="text" 
          size="small" 
          onClick={() => window.location.href = '/orders'}
          sx={{ color: Colors.primary }}
        >
          View All
        </Button>
      </Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ bgcolor: Colors.gray[50] }}>
            <TableRow>
              <TableCell>Order #</TableCell>
              <TableCell>Customer</TableCell>
              <TableCell align="right">Amount</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Date</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.length > 0 ? (
              orders.map((order) => (
                <TableRow key={order.id} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight={500}>
                      {order.order_number}
                    </Typography>
                  </TableCell>
                  <TableCell>{order.customer_name || 'N/A'}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 500 }}>
                    KES {Number(order.total_amount).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={order.status || 'pending'} 
                      size="small" 
                      color={getStatusColor(order.status)} 
                    />
                  </TableCell>
                  <TableCell>
                    {new Date(order.created_at).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    No orders found
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* ============================================ */}
      {/* PENDING AGENTS SECTION */}
      {/* ============================================ */}
      {recentAgents.length > 0 && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
            Pending Agent Approvals
          </Typography>
          <Grid container spacing={2}>
            {recentAgents.map((agent) => (
              <Grid item xs={12} sm={6} md={4} key={agent.id}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ bgcolor: Colors.warning }}>
                        <Pending />
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2" fontWeight={500}>
                          {agent.business_name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {agent.full_name}
                        </Typography>
                      </Box>
                    </Box>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                      <Phone sx={{ fontSize: 12, mr: 0.5 }} /> {agent.phone_number}
                    </Typography>
                    <Button 
                      variant="outlined" 
                      size="small" 
                      fullWidth 
                      sx={{ mt: 2, borderColor: Colors.primary, color: Colors.primary }}
                      onClick={() => window.location.href = '/agents'}
                    >
                      Review
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
    </Box>
  );
}