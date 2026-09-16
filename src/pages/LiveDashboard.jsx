import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Avatar,
  LinearProgress,
  Chip,
  IconButton,
  Tooltip,
  Badge,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  CircularProgress,
} from '@mui/material';
import {
  FiberManualRecord,
  Refresh,
  LocationOn,
  TrendingUp,
  TrendingDown,
  People,
  Store,
  ShoppingCart,
  AttachMoney,
  NotificationsActive,
  CheckCircle,
  Schedule,
  PersonAdd,
} from '@mui/icons-material';
import { Colors } from '../utils/colors';
import { adminAPI } from '../services/api';

export default function LiveDashboard() {
  const [loading, setLoading] = useState(true);
  const [liveData, setLiveData] = useState({
    liveOrders: [],
    activeAgents: [],
    recentSignups: [],
    revenue: { today: 0, target: 50000, progress: 0 },
    stats: {
      onlineAgents: 0,
      activeUsers: 0,
      pendingOrders: 0,
      todayOrders: 0,
    },
  });

  useEffect(() => {
    fetchLiveData();
    const interval = setInterval(fetchLiveData, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchLiveData = async () => {
    try {
      // Simulate real-time data
      setLiveData({
        liveOrders: [
          { id: 1, customer: 'John Doe', amount: 1200, status: 'pending', time: '2 min ago' },
          { id: 2, customer: 'Jane Smith', amount: 2200, status: 'assigned', time: '5 min ago' },
          { id: 3, customer: 'Peter Kariuki', amount: 1150, status: 'delivered', time: '12 min ago' },
        ],
        activeAgents: [
          { name: 'Progas Shop', status: 'online', location: 'Westlands', orders: 3 },
          { name: 'Total Gas', status: 'online', location: 'Kilimani', orders: 2 },
          { name: 'Gas Express', status: 'offline', location: 'CBD', orders: 0 },
        ],
        recentSignups: [
          { name: 'Grace Muthoni', time: '5 min ago', type: 'customer' },
          { name: 'David Ochieng', time: '15 min ago', type: 'agent' },
          { name: 'Sarah Wanjiru', time: '32 min ago', type: 'customer' },
        ],
        revenue: { today: 34200, target: 50000, progress: 68 },
        stats: {
          onlineAgents: 2,
          activeUsers: 45,
          pendingOrders: 8,
          todayOrders: 23,
        },
      });
    } catch (error) {
      console.error('Error fetching live data:', error);
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
          Live Dashboard
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Chip
            icon={<FiberManualRecord sx={{ color: Colors.success, fontSize: 12 }} />}
            label="Live"
            color="success"
            size="small"
          />
          <IconButton onClick={fetchLiveData}>
            <Refresh />
          </IconButton>
        </Box>
      </Box>

      {/* Quick Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">Online Agents</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: Colors.success }}>
                    {liveData.stats.onlineAgents}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: Colors.primaryBg }}>
                  <Store sx={{ color: Colors.primary }} />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">Active Users</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: Colors.info }}>
                    {liveData.stats.activeUsers}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: '#EFF6FF' }}>
                  <People sx={{ color: Colors.info }} />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">Pending Orders</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: Colors.warning }}>
                    {liveData.stats.pendingOrders}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: '#FFFBEB' }}>
                  <ShoppingCart sx={{ color: Colors.warning }} />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">Today's Orders</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: Colors.primary }}>
                    {liveData.stats.todayOrders}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: Colors.primaryBg }}>
                  <TrendingUp sx={{ color: Colors.primary }} />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Live Orders Feed */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
              <NotificationsActive sx={{ color: Colors.primary }} />
              Live Orders Feed
            </Typography>
            <List>
              {liveData.liveOrders.map((order, index) => (
                <React.Fragment key={order.id}>
                  <ListItem alignItems="flex-start">
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: order.status === 'pending' ? Colors.warning : order.status === 'assigned' ? Colors.info : Colors.success }}>
                        {order.status === 'pending' ? <Schedule /> : order.status === 'assigned' ? <TrendingUp /> : <CheckCircle />}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2" fontWeight={500}>{order.customer}</Typography>
                          <Typography variant="body2" fontWeight={500} sx={{ color: Colors.primary }}>
                            KES {order.amount}
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Chip label={order.status} size="small" color={order.status === 'pending' ? 'warning' : order.status === 'assigned' ? 'info' : 'success'} />
                          <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                            {order.time}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                  {index < liveData.liveOrders.length - 1 && <Divider variant="inset" component="li" />}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Active Agents */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
              <Store sx={{ color: Colors.primary }} />
              Active Agents
            </Typography>
            {liveData.activeAgents.map((agent, index) => (
              <Box key={index} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 1, borderBottom: index < liveData.activeAgents.length - 1 ? `1px solid ${Colors.gray[200]}` : 'none' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: agent.status === 'online' ? Colors.success : Colors.gray[400], width: 32, height: 32 }}>
                    <Store sx={{ fontSize: 16 }} />
                  </Avatar>
                  <Box>
                    <Typography variant="body2" fontWeight={500}>{agent.name}</Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <LocationOn sx={{ fontSize: 12 }} />
                      {agent.location}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Chip label={`${agent.orders} orders`} size="small" color={agent.orders > 0 ? 'primary' : 'default'} />
                  <Chip
                    label={agent.status}
                    size="small"
                    color={agent.status === 'online' ? 'success' : 'default'}
                  />
                </Box>
              </Box>
            ))}
          </Paper>
        </Grid>

        {/* Recent Signups */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
              <PersonAdd sx={{ color: Colors.primary }} />
              Recent Signups
            </Typography>
            {liveData.recentSignups.map((signup, index) => (
              <Box key={index} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 1, borderBottom: index < liveData.recentSignups.length - 1 ? `1px solid ${Colors.gray[200]}` : 'none' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: signup.type === 'agent' ? Colors.primary : Colors.info, width: 32, height: 32 }}>
                    {signup.type === 'agent' ? <Store sx={{ fontSize: 16 }} /> : <People sx={{ fontSize: 16 }} />}
                  </Avatar>
                  <Box>
                    <Typography variant="body2" fontWeight={500}>{signup.name}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {signup.type === 'agent' ? 'New Agent' : 'New Customer'}
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="caption" color="text.secondary">{signup.time}</Typography>
              </Box>
            ))}
          </Paper>
        </Grid>

        {/* Revenue Progress */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
              <AttachMoney sx={{ color: Colors.primary }} />
              Daily Revenue Progress
            </Typography>
            <Box sx={{ textAlign: 'center', mb: 2 }}>
              <Typography variant="h3" sx={{ color: Colors.primary, fontWeight: 'bold' }}>
                KES {liveData.revenue.today.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Target: KES {liveData.revenue.target.toLocaleString()}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <LinearProgress
                variant="determinate"
                value={liveData.revenue.progress}
                sx={{ flex: 1, height: 10, borderRadius: 5 }}
              />
              <Typography variant="body2" fontWeight="bold" sx={{ color: liveData.revenue.progress >= 100 ? Colors.success : Colors.primary }}>
                {liveData.revenue.progress}%
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}