// 📁 admin-web/src/pages/Inventory.jsx

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
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Tooltip,
  LinearProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  Avatar,
  Divider,
} from '@mui/material';
import {
  Search,
  Add,
  Edit,
  Delete,
  Refresh,
  Warning,
  CheckCircle,
  Inventory as InventoryIcon,
  TrendingUp,
  LowPriority,
  Close,
  Person,
  Storefront,
  Warehouse,
  BarChart,
  Category,
  BrandingWatermark,
  ShowChart,
} from '@mui/icons-material';
import { Colors } from '../utils/colors';
import { adminAPI } from '../services/api';

export default function Inventory() {
  const [loading, setLoading] = useState(true);
  const [inventory, setInventory] = useState([]);
  const [agents, setAgents] = useState([]);
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAgent, setSelectedAgent] = useState('all');
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const [formData, setFormData] = useState({
    agent_id: '',
    product_id: '',
    stock_quantity: 0,
    min_stock_level: 5,
    max_stock_level: 100,
    reorder_quantity: 10,
    price_modifier: 0,
  });

  const [stats, setStats] = useState({
    total_items: 0,
    total_stock: 0,
    low_stock_count: 0,
    out_of_stock_count: 0,
    total_value: 0,
    agents_with_stock: 0,
    total_brands: 0,
    total_product_types: 0,
    brand_breakdown: [],
    product_type_breakdown: [],
    top_products: [],
    brand_values: [],
  });

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchInventory(),
        fetchAgents(),
        fetchProducts(),
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
      showSnackbar('Failed to fetch data', 'error');
    } finally {
      setLoading(false);
    }
  };

 // 📁 admin-web/src/pages/Inventory.jsx

const fetchInventory = async () => {
    try {
        const response = await adminAPI.getInventory?.();
        console.log('📦 Inventory response:', response);
        
        let inventoryData = [];
        if (Array.isArray(response)) {
            inventoryData = response;
        } else if (response?.data && Array.isArray(response.data)) {
            inventoryData = response.data;
        } else if (response?.data?.data && Array.isArray(response.data.data)) {
            inventoryData = response.data.data;
        }
        
        console.log('✅ Processed inventory:', inventoryData.length, 'items');
        console.log('✅ First item with brand:', inventoryData[0]?.brand_name);
        
        setInventory(inventoryData);
        calculateStats(inventoryData);
        
    } catch (error) {
        console.error('Error fetching inventory:', error);
        showSnackbar('Failed to fetch inventory', 'error');
        setInventory([]);
        calculateStats([]);
    }
};
  const fetchAgents = async () => {
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
      } else if (typeof response === 'object' && response !== null) {
        if (response.id || response.business_name) {
          agentsData = [response];
        }
      }
      
      console.log('✅ Processed agents:', agentsData.length);
      setAgents(agentsData);
    } catch (error) {
      console.error('❌ Error fetching agents:', error);
      setAgents([]);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await adminAPI.getProductsList?.();
      console.log('📦 Products response:', response);
      
      let productsData = [];
      if (Array.isArray(response)) {
        productsData = response;
      } else if (response?.data && Array.isArray(response.data)) {
        productsData = response.data;
      }
      
      console.log('✅ Products loaded:', productsData.length);
      setProducts(productsData);
      
      // Recalculate stats after products are loaded
      if (inventory.length > 0) {
        setTimeout(() => {
          calculateStats(inventory);
        }, 200);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    }
  };

// 📁 admin-web/src/pages/Inventory.jsx

// ============================================
// ✅ FIXED: calculateStats - uses data from API directly
// ============================================
const calculateStats = (data) => {
    console.log('📊 Calculating stats for:', data.length, 'items');
    
    // Basic stats
    const total_items = data.length;
    const total_stock = data.reduce((sum, item) => sum + (item.stock_quantity || 0), 0);
    const low_stock_count = data.filter(item => 
        (item.stock_quantity || 0) <= (item.min_stock_level || 5) && (item.stock_quantity || 0) > 0
    ).length;
    const out_of_stock_count = data.filter(item => (item.stock_quantity || 0) === 0).length;
    
    // ✅ Calculate total value using data from API
    let total_value = 0;
    data.forEach(item => {
        const price = parseFloat(item.base_price || item.product_price || 0);
        total_value += (item.stock_quantity || 0) * price;
    });
    
    const agents_with_stock = new Set(data.map(item => item.agent_id)).size;

    // ============================================
    // ✅ FIXED: BRAND BREAKDOWN - Use data from API
    // ============================================
    const brandMap = {};
    data.forEach(item => {
        // Use brand_name from the API response
        const brand = item.brand_name || 'Unknown';
        if (!brandMap[brand]) {
            brandMap[brand] = { count: 0, stock: 0, value: 0 };
        }
        brandMap[brand].count += 1;
        brandMap[brand].stock += (item.stock_quantity || 0);
        const price = parseFloat(item.base_price || item.product_price || 0);
        brandMap[brand].value += (item.stock_quantity || 0) * price;
    });

    const brand_breakdown = Object.entries(brandMap).map(([brand, data]) => ({
        brand,
        ...data,
    })).sort((a, b) => b.stock - a.stock);

    // ============================================
    // ✅ FIXED: PRODUCT TYPE BREAKDOWN - Use data from API
    // ============================================
    const typeMap = {};
    data.forEach(item => {
        // Use product_type from the API response
        const type = item.product_type || 'other';
        if (!typeMap[type]) {
            typeMap[type] = { count: 0, stock: 0, value: 0 };
        }
        typeMap[type].count += 1;
        typeMap[type].stock += (item.stock_quantity || 0);
        const price = parseFloat(item.base_price || item.product_price || 0);
        typeMap[type].value += (item.stock_quantity || 0) * price;
    });

    const product_type_breakdown = Object.entries(typeMap).map(([type, data]) => ({
        type,
        ...data,
    })).sort((a, b) => b.stock - a.stock);

    // ============================================
    // ✅ FIXED: TOP PRODUCTS - Use data from API
    // ============================================
    const productMap = {};
    data.forEach(item => {
        const key = item.product_id;
        if (!productMap[key]) {
            productMap[key] = {
                id: item.product_id,
                name: item.product_name || 'Unknown Product',
                brand: item.brand_name || 'Unknown',
                count: 0,
                stock: 0,
                value: 0,
            };
        }
        productMap[key].count += 1;
        productMap[key].stock += (item.stock_quantity || 0);
        const price = parseFloat(item.base_price || item.product_price || 0);
        productMap[key].value += (item.stock_quantity || 0) * price;
    });

    const top_products = Object.values(productMap)
        .sort((a, b) => b.value - a.value)
        .slice(0, 10);

    const total_brands = brand_breakdown.length;
    const total_product_types = product_type_breakdown.length;
    const brand_values = brand_breakdown.map(b => ({ 
        name: b.brand, 
        value: b.value 
    }));

    console.log('📊 Brand breakdown:', brand_breakdown);
    console.log('📊 Product type breakdown:', product_type_breakdown);
    console.log('📊 Top products:', top_products);

    setStats({
        total_items,
        total_stock,
        low_stock_count,
        out_of_stock_count,
        total_value,
        agents_with_stock,
        total_brands,
        total_product_types,
        brand_breakdown,
        product_type_breakdown,
        top_products,
        brand_values,
    });
};

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleOpenCreate = () => {
    setSelectedItem(null);
    setFormData({
      agent_id: '',
      product_id: '',
      stock_quantity: 0,
      min_stock_level: 5,
      max_stock_level: 100,
      reorder_quantity: 10,
      price_modifier: 0,
    });
    setOpenDialog(true);
  };

  const handleOpenEdit = (item) => {
    setSelectedItem(item);
    setFormData({
      agent_id: item.agent_id || '',
      product_id: item.product_id || '',
      stock_quantity: item.stock_quantity || 0,
      min_stock_level: item.min_stock_level || 5,
      max_stock_level: item.max_stock_level || 100,
      reorder_quantity: item.reorder_quantity || 10,
      price_modifier: item.price_modifier || 0,
    });
    setOpenDialog(true);
  };

  const handleOpenDelete = (item) => {
    setSelectedItem(item);
    setOpenDeleteDialog(true);
  };

  const handleSubmit = async () => {
    if (!formData.agent_id) {
      showSnackbar('Please select an agent', 'error');
      return;
    }
    if (!formData.product_id) {
      showSnackbar('Please select a product', 'error');
      return;
    }

    setSubmitting(true);
    try {
      if (selectedItem) {
        await adminAPI.updateInventory?.(selectedItem.id, formData);
        showSnackbar('Inventory updated successfully!', 'success');
      } else {
        await adminAPI.createInventory?.(formData);
        showSnackbar('Inventory added successfully!', 'success');
      }
      setOpenDialog(false);
      await fetchInventory();
    } catch (error) {
      console.error('Error saving inventory:', error);
      showSnackbar('Failed to save inventory', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setSubmitting(true);
    try {
      await adminAPI.deleteInventory?.(selectedItem.id);
      showSnackbar('Inventory item deleted successfully!', 'success');
      setOpenDeleteDialog(false);
      await fetchInventory();
    } catch (error) {
      console.error('Error deleting inventory:', error);
      showSnackbar('Failed to delete inventory', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const getStockStatus = (quantity, minLevel) => {
    if (quantity === 0 || quantity === null) {
      return { label: 'Out of Stock', color: 'error', icon: <Warning sx={{ fontSize: 16 }} /> };
    }
    if (quantity <= minLevel) {
      return { label: 'Low Stock', color: 'warning', icon: <LowPriority sx={{ fontSize: 16 }} /> };
    }
    return { label: 'In Stock', color: 'success', icon: <CheckCircle sx={{ fontSize: 16 }} /> };
  };

  const getAgentName = (agentId) => {
    if (!agentId) return 'Unknown Agent';
    const agent = agents.find(a => a.id === agentId);
    if (agent) {
      return agent.business_name || agent.full_name || agent.name || 'Unknown Agent';
    }
    return `Agent (${agentId.slice(0, 8)})`;
  };

  const getProductName = (productId) => {
    const product = products.find(p => p.id === productId);
    return product ? `${product.brand_name} - ${product.name}` : 'Unknown Product';
  };

  const getProductPrice = (productId) => {
    const product = products.find(p => p.id === productId);
    return product ? product.base_price : 0;
  };

  const getProductBrand = (productId) => {
    const product = products.find(p => p.id === productId);
    return product ? product.brand_name : 'Unknown';
  };

  const getFilteredInventory = () => {
    let filtered = inventory;
    
    if (selectedAgent !== 'all') {
      filtered = filtered.filter(item => item.agent_id === selectedAgent);
    }
    
    if (selectedBrand !== 'all') {
      filtered = filtered.filter(item => {
        const product = products.find(p => p.id === item.product_id);
        return product && product.brand_name === selectedBrand;
      });
    }
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(item =>
        getProductName(item.product_id).toLowerCase().includes(term) ||
        getAgentName(item.agent_id).toLowerCase().includes(term) ||
        getProductBrand(item.product_id).toLowerCase().includes(term)
      );
    }
    
    return filtered;
  };

  const filteredInventory = getFilteredInventory();

  const getUniqueBrands = () => {
    const brands = new Set();
    products.forEach(p => {
      if (p.brand_name) brands.add(p.brand_name);
    });
    return Array.from(brands);
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
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
            Inventory Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage stock levels across all agents with brand analytics
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            size="small"
            placeholder="Search inventory..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ width: 200 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ color: Colors.gray[400] }} />
                </InputAdornment>
              ),
            }}
          />
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Filter Agent</InputLabel>
            <Select
              value={selectedAgent}
              label="Filter Agent"
              onChange={(e) => setSelectedAgent(e.target.value)}
            >
              <MenuItem value="all">All Agents</MenuItem>
              {agents.map((agent) => (
                <MenuItem key={agent.id} value={agent.id}>
                  {agent.business_name || agent.full_name || 'Unnamed Agent'}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 130 }}>
            <InputLabel>Filter Brand</InputLabel>
            <Select
              value={selectedBrand}
              label="Filter Brand"
              onChange={(e) => setSelectedBrand(e.target.value)}
            >
              <MenuItem value="all">All Brands</MenuItem>
              {getUniqueBrands().map((brand) => (
                <MenuItem key={brand} value={brand}>{brand}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={fetchAllData}
            sx={{ borderColor: Colors.primary, color: Colors.primary }}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleOpenCreate}
            sx={{ bgcolor: Colors.primary }}
          >
            Add Stock
          </Button>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="caption" color="text.secondary">Total Items</Typography>
                  <Typography variant="h4" fontWeight="bold">{stats.total_items}</Typography>
                </Box>
                <Avatar sx={{ bgcolor: Colors.primary, width: 48, height: 48 }}>
                  <InventoryIcon sx={{ color: '#fff' }} />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="caption" color="text.secondary">Total Stock</Typography>
                  <Typography variant="h4" fontWeight="bold">{stats.total_stock}</Typography>
                </Box>
                <Avatar sx={{ bgcolor: '#2196F3', width: 48, height: 48 }}>
                  <Warehouse sx={{ color: '#fff' }} />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ borderLeft: `4px solid ${Colors.warning}` }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="caption" color="text.secondary">Low Stock</Typography>
                  <Typography variant="h4" fontWeight="bold" sx={{ color: Colors.warning }}>
                    {stats.low_stock_count}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: Colors.warning, width: 48, height: 48 }}>
                  <LowPriority sx={{ color: '#fff' }} />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ borderLeft: `4px solid ${Colors.error}` }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="caption" color="text.secondary">Out of Stock</Typography>
                  <Typography variant="h4" fontWeight="bold" sx={{ color: Colors.error }}>
                    {stats.out_of_stock_count}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: Colors.error, width: 48, height: 48 }}>
                  <Warning sx={{ color: '#fff' }} />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ borderLeft: `4px solid #4CAF50` }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="caption" color="text.secondary">Total Value</Typography>
                  <Typography variant="h4" fontWeight="bold" sx={{ color: '#4CAF50' }}>
                    KES {(stats.total_value || 0).toLocaleString()}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: '#4CAF50', width: 48, height: 48 }}>
                  <TrendingUp sx={{ color: '#fff' }} />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Brand & Product Type Statistics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Brand Breakdown */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <BrandingWatermark /> Brand Breakdown
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
              {stats.total_brands} brands • {stats.total_stock} total units
            </Typography>
            {stats.brand_breakdown.length > 0 ? (
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead sx={{ bgcolor: Colors.gray[50] }}>
                    <TableRow>
                      <TableCell>Brand</TableCell>
                      <TableCell align="right">Items</TableCell>
                      <TableCell align="right">Stock</TableCell>
                      <TableCell align="right">Value (KES)</TableCell>
                      <TableCell align="right">% of Stock</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {stats.brand_breakdown.map((brand) => {
                      const percentage = stats.total_stock > 0 ? ((brand.stock / stats.total_stock) * 100) : 0;
                      return (
                        <TableRow key={brand.brand} hover>
                          <TableCell>
                            <Chip 
                              label={brand.brand} 
                              size="small" 
                              variant="outlined"
                              sx={{ fontWeight: 500 }}
                            />
                          </TableCell>
                          <TableCell align="right">{brand.count}</TableCell>
                          <TableCell align="right">{brand.stock}</TableCell>
                          <TableCell align="right" sx={{ color: Colors.primary }}>
                            KES {brand.value.toLocaleString()}
                          </TableCell>
                          <TableCell align="right">
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <LinearProgress
                                variant="determinate"
                                value={percentage}
                                sx={{ flex: 1, height: 6, borderRadius: 3 }}
                              />
                              <Typography variant="caption" color="text.secondary">
                                {Math.round(percentage)}%
                              </Typography>
                            </Box>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
                No brand data available
              </Typography>
            )}
          </Paper>
        </Grid>

        {/* Product Type Breakdown */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <Category /> Product Type Breakdown
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
              {stats.total_product_types} product types • {stats.total_stock} total units
            </Typography>
            {stats.product_type_breakdown.length > 0 ? (
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead sx={{ bgcolor: Colors.gray[50] }}>
                    <TableRow>
                      <TableCell>Type</TableCell>
                      <TableCell align="right">Items</TableCell>
                      <TableCell align="right">Stock</TableCell>
                      <TableCell align="right">Value (KES)</TableCell>
                      <TableCell align="right">% of Stock</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {stats.product_type_breakdown.map((type) => {
                      const percentage = stats.total_stock > 0 ? ((type.stock / stats.total_stock) * 100) : 0;
                      return (
                        <TableRow key={type.type} hover>
                          <TableCell>
                            <Chip 
                              label={type.type.charAt(0).toUpperCase() + type.type.slice(1)} 
                              size="small" 
                              color="info"
                            />
                          </TableCell>
                          <TableCell align="right">{type.count}</TableCell>
                          <TableCell align="right">{type.stock}</TableCell>
                          <TableCell align="right" sx={{ color: Colors.primary }}>
                            KES {type.value.toLocaleString()}
                          </TableCell>
                          <TableCell align="right">
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <LinearProgress
                                variant="determinate"
                                value={percentage}
                                sx={{ flex: 1, height: 6, borderRadius: 3 }}
                              />
                              <Typography variant="caption" color="text.secondary">
                                {Math.round(percentage)}%
                              </Typography>
                            </Box>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
                No product type data available
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Top Products */}
      <Paper sx={{ mb: 3, p: 2 }}>
        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <ShowChart /> Top Products by Stock Value
        </Typography>
        {stats.top_products.length > 0 ? (
          <Grid container spacing={2}>
            {stats.top_products.map((product, index) => (
              <Grid item xs={12} sm={6} md={4} lg={2.4} key={product.id}>
                <Card sx={{ 
                  borderLeft: `4px solid ${index < 3 ? Colors.primary : Colors.gray[400]}`,
                  '&:hover': { transform: 'scale(1.02)', transition: 'transform 0.2s' }
                }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          #{index + 1} • {product.brand}
                        </Typography>
                        <Typography variant="body2" fontWeight={500} sx={{ mt: 0.5 }}>
                          {product.name}
                        </Typography>
                      </Box>
                      <Chip 
                        label={`${product.stock} units`} 
                        size="small" 
                        color={product.stock > 50 ? 'success' : 'warning'}
                      />
                    </Box>
                    <Typography variant="h6" sx={{ mt: 1, color: Colors.primary }}>
                      KES {product.value.toLocaleString()}
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={(product.stock / 100) * 100}
                      sx={{ mt: 1, height: 4, borderRadius: 2 }}
                    />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
            No product data available
          </Typography>
        )}
      </Paper>

      {/* Low Stock Alert */}
      {stats.low_stock_count > 0 && (
        <Alert 
          severity="warning" 
          sx={{ mb: 3 }}
          action={
            <Button color="inherit" size="small" onClick={() => setSearchTerm('Low Stock')}>
              View
            </Button>
          }
        >
          <strong>{stats.low_stock_count}</strong> items are running low on stock! 
          {stats.out_of_stock_count > 0 && ` (${stats.out_of_stock_count} items are out of stock)`}
        </Alert>
      )}

      {/* Agent Inventory Table */}
      <Paper sx={{ mb: 3 }}>
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Storefront /> Agent Stock Overview
          </Typography>
          <Divider sx={{ mb: 2 }} />
          
          {filteredInventory.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
              No inventory items found matching your filters
            </Typography>
          ) : (
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead sx={{ bgcolor: Colors.gray[50] }}>
                  <TableRow>
                    <TableCell>Agent</TableCell>
                    <TableCell>Product</TableCell>
                    <TableCell>Brand</TableCell>
                    <TableCell>Stock</TableCell>
                    <TableCell>Min Level</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Value</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredInventory.map((item) => {
                    const status = getStockStatus(item.stock_quantity, item.min_stock_level);
                    const productPrice = getProductPrice(item.product_id);
                    const itemValue = (item.stock_quantity || 0) * (productPrice || 0);
                    const productBrand = getProductBrand(item.product_id);
                    
                    return (
                      <TableRow 
                        key={item.id}
                        hover
                        sx={{
                          bgcolor: status.color === 'error' ? '#FFF3E0' : 
                                   status.color === 'warning' ? '#FFF8E1' : 'inherit',
                        }}
                      >
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Avatar sx={{ width: 24, height: 24, bgcolor: Colors.primary }}>
                              <Person sx={{ fontSize: 14, color: '#fff' }} />
                            </Avatar>
                            <Typography variant="body2">
                              {getAgentName(item.agent_id)}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {getProductName(item.product_id)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={productBrand} 
                            size="small" 
                            variant="outlined"
                            sx={{ fontSize: '0.7rem' }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight={500}>
                            {item.stock_quantity || 0}
                          </Typography>
                        </TableCell>
                        <TableCell>{item.min_stock_level || 5}</TableCell>
                        <TableCell>
                          <Chip
                            icon={status.icon}
                            label={status.label}
                            color={status.color}
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" sx={{ color: Colors.primary }}>
                            KES {itemValue.toLocaleString()}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5 }}>
                            <Tooltip title="Edit Stock">
                              <IconButton size="small" onClick={() => handleOpenEdit(item)}>
                                <Edit fontSize="small" sx={{ color: Colors.primary }} />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete">
                              <IconButton size="small" onClick={() => handleOpenDelete(item)}>
                                <Delete fontSize="small" sx={{ color: Colors.error }} />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      </Paper>

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">
              {selectedItem ? 'Edit Stock' : 'Add Stock'}
            </Typography>
            <IconButton onClick={() => setOpenDialog(false)}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Select Agent</InputLabel>
                  <Select
                    value={formData.agent_id}
                    label="Select Agent"
                    onChange={(e) => setFormData({ ...formData, agent_id: e.target.value })}
                    disabled={!!selectedItem}
                  >
                    {agents.map((agent) => (
                      <MenuItem key={agent.id} value={agent.id}>
                        {agent.business_name || agent.full_name || 'Unnamed Agent'}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Select Product</InputLabel>
                  <Select
                    value={formData.product_id}
                    label="Select Product"
                    onChange={(e) => setFormData({ ...formData, product_id: e.target.value })}
                    disabled={!!selectedItem}
                  >
                    {products.map((product) => (
                      <MenuItem key={product.id} value={product.id}>
                        {product.brand_name} - {product.name} (KES {product.base_price})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Stock Quantity"
                  type="number"
                  value={formData.stock_quantity}
                  onChange={(e) => setFormData({ ...formData, stock_quantity: parseInt(e.target.value) || 0 })}
                  inputProps={{ min: 0 }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Min Stock Level"
                  type="number"
                  value={formData.min_stock_level}
                  onChange={(e) => setFormData({ ...formData, min_stock_level: parseInt(e.target.value) || 5 })}
                  inputProps={{ min: 0 }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Max Stock Level"
                  type="number"
                  value={formData.max_stock_level}
                  onChange={(e) => setFormData({ ...formData, max_stock_level: parseInt(e.target.value) || 100 })}
                  inputProps={{ min: 0 }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Price Modifier (%)"
                  type="number"
                  value={formData.price_modifier}
                  onChange={(e) => setFormData({ ...formData, price_modifier: parseFloat(e.target.value) || 0 })}
                  helperText="Adjust the product price for this agent"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Reorder Quantity"
                  type="number"
                  value={formData.reorder_quantity}
                  onChange={(e) => setFormData({ ...formData, reorder_quantity: parseInt(e.target.value) || 10 })}
                  inputProps={{ min: 0 }}
                  helperText="Quantity to reorder when stock falls below min level"
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={submitting}
            sx={{ bgcolor: Colors.primary }}
          >
            {submitting ? <CircularProgress size={24} /> : (selectedItem ? 'Update' : 'Add')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle>Delete Inventory Item</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete inventory for "{getProductName(selectedItem?.product_id)}" 
            from "{getAgentName(selectedItem?.agent_id)}"?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDelete}
            disabled={submitting}
          >
            {submitting ? <CircularProgress size={24} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
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