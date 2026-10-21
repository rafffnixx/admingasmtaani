// 📁 K:\gas-mtaani-admin\src\pages\LiveTracking.jsx
import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import api from '../services/api';
import { TextField, Button, Box, Typography, Paper } from '@mui/material';

// Fix default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const onlineAgentIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const activeAgentIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const customerIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

function FitBounds({ points }) {
  const map = useMap();
  useEffect(() => {
    if (!points.length) return;
    const validPoints = points.filter(p => p.lat && p.lng);
    if (validPoints.length > 0) {
      map.fitBounds(validPoints.map(p => [Number(p.lat), Number(p.lng)]), { 
        padding: [50, 50], 
        maxZoom: 15 
      });
    }
  }, [points, map]);
  return null;
}

export default function LiveTracking() {
  const [agents, setAgents] = useState([]);
  const [activeOrders, setActiveOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const pollRef = useRef(null);

  const fetchData = async () => {
    try {
      const [agentsRes, ordersRes] = await Promise.all([
        api.get('/admin/agents/live-map'),
        api.get('/admin/orders/live-tracking'),
      ]);
      setAgents(Array.isArray(agentsRes.data) ? agentsRes.data : []);
      setActiveOrders(Array.isArray(ordersRes.data) ? ordersRes.data : []);
      setError(null);
      setLastUpdate(new Date());
    } catch (err) {
      console.warn('Live tracking fetch failed:', err?.response?.data || err?.message);
      setError(err?.response?.data?.error || err.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    pollRef.current = setInterval(fetchData, 10000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  // Filter agents by search query
  const filteredAgents = agents.filter(agent => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (agent.business_name && agent.business_name.toLowerCase().includes(q)) ||
      (agent.phone_number && agent.phone_number.includes(q)) ||
      (agent.owner_name && agent.owner_name.toLowerCase().includes(q))
    );
  });

  // Combine all points for the map to fit bounds
  const allPoints = [
    ...filteredAgents.map(a => ({ lat: a.lat, lng: a.lng })),
    ...activeOrders.map(o => ({ lat: o.customer_lat, lng: o.customer_lng })),
    ...activeOrders.map(o => ({ lat: o.agent_lat, lng: o.agent_lng })),
  ];

  return (
    <Box sx={{ p: 3 }}>
      {/* Header with search */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold">Live Agent Tracking</Typography>
          <Typography variant="body2" color="text.secondary">
            {loading ? 'Loading…' : `${filteredAgents.length} agents · ${activeOrders.length} active deliveries`}
            {lastUpdate && ` · updated ${lastUpdate.toLocaleTimeString()}`}
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            size="small"
            placeholder="Search agent by name or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ width: 300, bgcolor: 'white' }}
          />
          <Button variant="contained" onClick={fetchData} sx={{ bgcolor: '#FF6B00', '&:hover': { bgcolor: '#e65e00' } }}>
            Refresh
          </Button>
        </Box>
      </Box>

      {error && (
        <Paper sx={{ p: 2, bgcolor: '#FEF2F2', color: '#B91C1C', mb: 2 }}>
          {error}
        </Paper>
      )}

      {/* Map container */}
      <Paper sx={{ height: 'calc(100vh - 220px)', minHeight: 500, overflow: 'hidden', borderRadius: 2 }}>
        <MapContainer center={[-1.286389, 36.817223]} zoom={12} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; OpenStreetMap contributors'
          />
          <FitBounds points={allPoints} />

          {/* Render all agents */}
          {filteredAgents.map((agent) => {
            if (!agent.lat || !agent.lng) return null;
            
            const hasActiveOrder = activeOrders.some(o => o.agent_name === agent.business_name);
            
            return (
              <Marker
                key={`agent-${agent.id}`}
                position={[Number(agent.lat), Number(agent.lng)]}
                icon={hasActiveOrder ? activeAgentIcon : onlineAgentIcon}
              >
                <Popup>
                  <strong>{agent.business_name}</strong>
                  <br />Owner: {agent.owner_name}
                  <br />Phone: {agent.phone_number}
                  <br />Status: {agent.is_online ? 'Online' : 'Offline'}
                  <br />Active Orders: {agent.active_orders}
                </Popup>
              </Marker>
            );
          })}

          {/* Render active order customers and agents */}
          {activeOrders.map((order) => (
            <React.Fragment key={`order-${order.order_id}`}>
              {order.customer_lat && order.customer_lng && (
                <Marker
                  position={[Number(order.customer_lat), Number(order.customer_lng)]}
                  icon={customerIcon}
                >
                  <Popup>
                    <strong>📍 Customer</strong>
                    <br />Order: {order.order_number}
                    <br />Status: {order.status}
                  </Popup>
                </Marker>
              )}
              {order.agent_lat && order.agent_lng && (
                <Marker
                  position={[Number(order.agent_lat), Number(order.agent_lng)]}
                  icon={activeAgentIcon}
                >
                  <Popup>
                    <strong>🚚 {order.agent_name}</strong>
                    <br />Order: {order.order_number}
                    <br />Status: {order.status}
                  </Popup>
                </Marker>
              )}
            </React.Fragment>
          ))}
        </MapContainer>
      </Paper>
    </Box>
  );
}