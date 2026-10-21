// 📁 K:\gas-mtaani-admin\src\pages\LiveTracking.jsx
import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import api from '../services/api';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const agentIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
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

function FitBounds({ orders }) {
  const map = useMap();
  useEffect(() => {
    if (!orders.length) return;
    const points = [];
    orders.forEach((o) => {
      if (o.agent_lat && o.agent_lng) points.push([Number(o.agent_lat), Number(o.agent_lng)]);
      if (o.customer_lat && o.customer_lng) points.push([Number(o.customer_lat), Number(o.customer_lng)]);
    });
    if (points.length > 0) {
      map.fitBounds(points, { padding: [50, 50], maxZoom: 15 });
    }
  }, [orders, map]);
  return null;
}

export default function LiveTracking() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const pollRef = useRef(null);

  const fetchLiveOrders = async () => {
    try {
      const res = await api.get('/admin/orders/live-tracking');
      setOrders(Array.isArray(res.data) ? res.data : []);
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
    fetchLiveOrders();
    pollRef.current = setInterval(fetchLiveOrders, 5000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  const defaultCenter = [-1.286389, 36.817223];

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <h1 style={{ margin: 0 }}>Live Agent Tracking</h1>
          <p style={{ margin: '4px 0 0', color: '#666', fontSize: 14 }}>
            {loading ? 'Loading…' : `${orders.length} active deliver${orders.length === 1 ? 'y' : 'ies'}`}
            {lastUpdate && (
              <span style={{ marginLeft: 8, fontSize: 12 }}>
                · updated {lastUpdate.toLocaleTimeString()}
              </span>
            )}
          </p>
        </div>
        <button
          onClick={fetchLiveOrders}
          style={{
            padding: '10px 16px', backgroundColor: '#FF6B00', color: '#fff',
            border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer',
          }}
        >
          Refresh
        </button>
      </div>

      {error && (
        <div style={{ padding: 12, backgroundColor: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, color: '#B91C1C', marginBottom: 16 }}>
          {error}
        </div>
      )}

      <div style={{ height: 'calc(100vh - 180px)', minHeight: 500, borderRadius: 12, overflow: 'hidden', border: '1px solid #E5E7EB' }}>
        <MapContainer center={defaultCenter} zoom={12} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; OpenStreetMap contributors'
          />
          <FitBounds orders={orders} />

          {orders.map((order) => (
            <React.Fragment key={order.order_id}>
              {order.customer_lat && order.customer_lng && (
                <Marker position={[Number(order.customer_lat), Number(order.customer_lng)]} icon={customerIcon}>
                  <Popup>
                    <strong>📍 Customer</strong>
                    <br />Order: {order.order_number}
                    <br />Status: {order.status}
                  </Popup>
                </Marker>
              )}

              {order.agent_lat && order.agent_lng && (
                <Marker position={[Number(order.agent_lat), Number(order.agent_lng)]} icon={agentIcon}>
                  <Popup>
                    <strong>🚚 {order.agent_name}</strong>
                    <br />Order: {order.order_number}
                    <br />Status: {order.status}
                    <br />Phone: {order.agent_phone}
                  </Popup>
                </Marker>
              )}
            </React.Fragment>
          ))}
        </MapContainer>
      </div>

      {orders.length === 0 && !loading && (
        <div style={{ textAlign: 'center', padding: 40, color: '#666' }}>
          No active deliveries right now.
        </div>
      )}
    </div>
  );
}