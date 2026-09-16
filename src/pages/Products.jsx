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
  Snackbar,
  Alert,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Tabs,
  Tab,
  Divider,
  Menu,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Search,
  Add,
  Edit,
  Delete,
  Visibility,
  Refresh,
  Image as ImageIcon,
  AttachMoney,
  Category,
  Scale,
  Description,
  CloudUpload,
  Close,
  CheckCircle,
  History,
  TrendingUp,
  TrendingDown,
  MoreVert,
  Download,
  Print,
  Whatshot,
} from '@mui/icons-material';
import { Colors } from '../utils/colors';
import { adminAPI } from '../services/api';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openPriceHistoryDialog, setOpenPriceHistoryDialog] = useState(false);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedForBulk, setSelectedForBulk] = useState([]);
  const [formData, setFormData] = useState({
    brand_name: '',
    name: '',
    product_type: 'gas',
    weight_kg: '',
    description: '',
    base_price: '',
    delivery_price_per_km: '10',
    image_url: '',
    is_active: true,
  });
  const [priceHistory, setPriceHistory] = useState([]);

  // Mock products for fallback
  const mockProducts = [
    { id: '1', brand_name: 'Progas', name: '6kg Gas Cylinder', product_type: 'gas', weight_kg: 6, base_price: 1200, delivery_price_per_km: 10, image_url: '', is_active: true, created_at: new Date().toISOString(), price_history: [{ price: 1200, date: new Date().toISOString() }] },
    { id: '2', brand_name: 'Progas', name: '13kg Gas Cylinder', product_type: 'gas', weight_kg: 13, base_price: 2200, delivery_price_per_km: 10, image_url: '', is_active: true, created_at: new Date().toISOString(), price_history: [{ price: 2200, date: new Date().toISOString() }] },
    { id: '3', brand_name: 'Total', name: '6kg Gas Cylinder', product_type: 'gas', weight_kg: 6, base_price: 1150, delivery_price_per_km: 10, image_url: '', is_active: true, created_at: new Date().toISOString(), price_history: [{ price: 1150, date: new Date().toISOString() }] },
    { id: '4', brand_name: 'Total', name: '13kg Gas Cylinder', product_type: 'gas', weight_kg: 13, base_price: 2100, delivery_price_per_km: 10, image_url: '', is_active: false, created_at: new Date().toISOString(), price_history: [{ price: 2100, date: new Date().toISOString() }] },
    { id: '5', brand_name: 'Accessory', name: 'Cooking Hose 1.5m', product_type: 'accessory', weight_kg: null, base_price: 350, delivery_price_per_km: 0, image_url: '', is_active: true, created_at: new Date().toISOString(), price_history: [{ price: 350, date: new Date().toISOString() }] },
    { id: '6', brand_name: 'Accessory', name: 'Gas Regulator', product_type: 'accessory', weight_kg: null, base_price: 450, delivery_price_per_km: 0, image_url: '', is_active: true, created_at: new Date().toISOString(), price_history: [{ price: 450, date: new Date().toISOString() }] },
  ];

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.getProducts?.() || { data: mockProducts };
      setProducts(response.data || mockProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts(mockProducts);
      showSnackbar('Using demo data - connect backend for real data', 'info');
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleAddProduct = () => {
    setFormData({
      brand_name: '',
      name: '',
      product_type: 'gas',
      weight_kg: '',
      description: '',
      base_price: '',
      delivery_price_per_km: '10',
      image_url: '',
      is_active: true,
    });
    setOpenAddDialog(true);
  };

  const handleEditProduct = (product) => {
    setSelectedProduct(product);
    setFormData({
      brand_name: product.brand_name || '',
      name: product.name || '',
      product_type: product.product_type || 'gas',
      weight_kg: product.weight_kg || '',
      description: product.description || '',
      base_price: product.base_price || '',
      delivery_price_per_km: product.delivery_price_per_km || '10',
      image_url: product.image_url || '',
      is_active: product.is_active !== false,
    });
    setOpenEditDialog(true);
  };

  const handleViewProduct = (product) => {
    setSelectedProduct(product);
    setOpenViewDialog(true);
  };

  const handleDeleteProduct = (product) => {
    setSelectedProduct(product);
    setOpenDeleteDialog(true);
  };

  const handlePriceHistory = (product) => {
    setSelectedProduct(product);
    // Generate mock price history
    const history = [
      { price: product.base_price * 0.9, date: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString() },
      { price: product.base_price * 0.95, date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString() },
      { price: product.base_price, date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() },
      { price: product.base_price * 1.05, date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString() },
      { price: product.base_price, date: new Date().toISOString() },
    ];
    setPriceHistory(history);
    setOpenPriceHistoryDialog(true);
  };

  const handleSaveProduct = async () => {
    try {
      const productData = {
        ...formData,
        base_price: parseFloat(formData.base_price),
        weight_kg: formData.weight_kg ? parseFloat(formData.weight_kg) : null,
        delivery_price_per_km: parseFloat(formData.delivery_price_per_km) || 0,
      };
      
      if (selectedProduct) {
        await adminAPI.updateProduct?.(selectedProduct.id, productData);
        showSnackbar('Product updated successfully!');
      } else {
        await adminAPI.createProduct?.(productData);
        showSnackbar('Product created successfully!');
      }
      setOpenAddDialog(false);
      setOpenEditDialog(false);
      fetchProducts();
    } catch (error) {
      console.error('Error saving product:', error);
      // Save locally for demo
      const newProduct = {
        id: selectedProduct?.id || Date.now().toString(),
        ...formData,
        base_price: parseFloat(formData.base_price),
        weight_kg: formData.weight_kg ? parseFloat(formData.weight_kg) : null,
        delivery_price_per_km: parseFloat(formData.delivery_price_per_km) || 0,
        created_at: new Date().toISOString(),
        price_history: [{ price: parseFloat(formData.base_price), date: new Date().toISOString() }],
      };
      
      if (selectedProduct) {
        const updatedProducts = products.map(p => p.id === selectedProduct.id ? { ...p, ...newProduct } : p);
        setProducts(updatedProducts);
        showSnackbar('Product updated (demo mode)', 'success');
      } else {
        setProducts([newProduct, ...products]);
        showSnackbar('Product created (demo mode)', 'success');
      }
      setOpenAddDialog(false);
      setOpenEditDialog(false);
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      await adminAPI.deleteProduct?.(selectedProduct.id);
      showSnackbar('Product deleted successfully!');
      setOpenDeleteDialog(false);
      fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      const updatedProducts = products.filter(p => p.id !== selectedProduct.id);
      setProducts(updatedProducts);
      showSnackbar('Product deleted (demo mode)', 'success');
      setOpenDeleteDialog(false);
    }
  };

  const handleToggleStatus = async (product) => {
    try {
      const newStatus = !product.is_active;
      await adminAPI.updateProduct?.(product.id, { ...product, is_active: newStatus });
      showSnackbar(`Product ${newStatus ? 'activated' : 'deactivated'} successfully!`);
      fetchProducts();
    } catch (error) {
      console.error('Error toggling status:', error);
      const updatedProducts = products.map(p =>
        p.id === product.id ? { ...p, is_active: !p.is_active } : p
      );
      setProducts(updatedProducts);
      showSnackbar(`Product ${!product.is_active ? 'activated' : 'deactivated'} (demo mode)`, 'success');
    }
  };

  const getFilteredProducts = () => {
    let filtered = products;

    if (searchTerm) {
      filtered = filtered.filter(p =>
        p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.brand_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterType !== 'all') {
      filtered = filtered.filter(p => p.product_type === filterType);
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(p => p.is_active === (filterStatus === 'active'));
    }

    return filtered;
  };

  const stats = {
    total: products.length,
    active: products.filter(p => p.is_active !== false).length,
    inactive: products.filter(p => p.is_active === false).length,
    gas: products.filter(p => p.product_type === 'gas').length,
    accessory: products.filter(p => p.product_type === 'accessory').length,
  };

  // ✅ FIXED: Using Whatshot instead of Fire
  const getProductTypeIcon = (type) => {
    return type === 'gas' ? <Whatshot sx={{ fontSize: 16 }} /> : <Category sx={{ fontSize: 16 }} />;
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
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Products Management
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField
            size="small"
            placeholder="Search products..."
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
            variant="outlined"
            size="small"
            startIcon={<Refresh />}
            onClick={fetchProducts}
            sx={{ borderColor: Colors.primary, color: Colors.primary }}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleAddProduct}
            sx={{ bgcolor: Colors.primary, '&:hover': { bgcolor: Colors.primaryDark } }}
          >
            Add Product
          </Button>
        </Box>
      </Box>

      {/* Stats Cards */}
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
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary">Active</Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: Colors.success }}>
                {stats.active}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary">Inactive</Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: Colors.error }}>
                {stats.inactive}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary">Gas</Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: Colors.info }}>
                {stats.gas}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary">Accessories</Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: Colors.warning }}>
                {stats.accessory}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'center', flexWrap: 'wrap' }}>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Type</InputLabel>
          <Select
            value={filterType}
            label="Type"
            onChange={(e) => setFilterType(e.target.value)}
          >
            <MenuItem value="all">All Types</MenuItem>
            <MenuItem value="gas">Gas</MenuItem>
            <MenuItem value="accessory">Accessory</MenuItem>
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={filterStatus}
            label="Status"
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <MenuItem value="all">All Status</MenuItem>
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="inactive">Inactive</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Products Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ bgcolor: Colors.gray[50] }}>
            <TableRow>
              <TableCell>Product</TableCell>
              <TableCell>Brand</TableCell>
              <TableCell>Price</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Weight</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {getFilteredProducts().length > 0 ? (
              getFilteredProducts().map((product) => (
                <TableRow key={product.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar
                        variant="rounded"
                        sx={{
                          bgcolor: product.is_active !== false ? Colors.primaryBg : Colors.gray[200],
                          width: 40,
                          height: 40,
                        }}
                      >
                        {product.image_url ? (
                          <img src={product.image_url} alt={product.name} style={{ width: 40, height: 40, objectFit: 'cover' }} />
                        ) : (
                          <Whatshot sx={{ color: Colors.primary }} />
                        )}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight={500}>
                          {product.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {product.product_type}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{product.brand_name}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={500} sx={{ color: Colors.primary }}>
                      KES {Number(product.base_price).toLocaleString()}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Delivery: KES {product.delivery_price_per_km}/km
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={product.product_type}
                      size="small"
                      icon={getProductTypeIcon(product.product_type)}
                      color={product.product_type === 'gas' ? 'primary' : 'default'}
                    />
                  </TableCell>
                  <TableCell>
                    {product.weight_kg ? `${product.weight_kg}kg` : '-'}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={product.is_active !== false ? 'Active' : 'Inactive'}
                      size="small"
                      color={product.is_active !== false ? 'success' : 'error'}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                      <Tooltip title="View Details">
                        <IconButton size="small" onClick={() => handleViewProduct(product)}>
                          <Visibility fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit">
                        <IconButton size="small" onClick={() => handleEditProduct(product)}>
                          <Edit fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Price History">
                        <IconButton size="small" onClick={() => handlePriceHistory(product)}>
                          <History fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={product.is_active !== false ? 'Deactivate' : 'Activate'}>
                        <IconButton
                          size="small"
                          color={product.is_active !== false ? 'warning' : 'success'}
                          onClick={() => handleToggleStatus(product)}
                        >
                          {product.is_active !== false ? <Close fontSize="small" /> : <CheckCircle fontSize="small" />}
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton size="small" color="error" onClick={() => handleDeleteProduct(product)}>
                          <Delete fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    No products found
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add Product Dialog */}
      <Dialog open={openAddDialog} onClose={() => setOpenAddDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: Colors.primaryBg }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Add sx={{ color: Colors.primary }} />
            <Typography variant="h6">Add New Product</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Product Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Brand Name"
                value={formData.brand_name}
                onChange={(e) => setFormData({ ...formData, brand_name: e.target.value })}
                placeholder="e.g., Progas, Total"
                required
              />
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>Product Type</InputLabel>
                <Select
                  value={formData.product_type}
                  label="Product Type"
                  onChange={(e) => setFormData({ ...formData, product_type: e.target.value })}
                >
                  <MenuItem value="gas">Gas</MenuItem>
                  <MenuItem value="accessory">Accessory</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Weight (kg)"
                type="number"
                value={formData.weight_kg}
                onChange={(e) => setFormData({ ...formData, weight_kg: e.target.value })}
                placeholder="e.g., 6, 13"
                disabled={formData.product_type === 'accessory'}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Base Price (KES)"
                type="number"
                value={formData.base_price}
                onChange={(e) => setFormData({ ...formData, base_price: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Delivery Price per KM"
                type="number"
                value={formData.delivery_price_per_km}
                onChange={(e) => setFormData({ ...formData, delivery_price_per_km: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Image URL"
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                placeholder="https://example.com/image.jpg"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  />
                }
                label={formData.is_active ? 'Active' : 'Inactive'}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveProduct} sx={{ bgcolor: Colors.primary }}>
            Create Product
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Product Dialog */}
      <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: Colors.primaryBg }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Edit sx={{ color: Colors.primary }} />
            <Typography variant="h6">Edit Product</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Product Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Brand Name"
                value={formData.brand_name}
                onChange={(e) => setFormData({ ...formData, brand_name: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>Product Type</InputLabel>
                <Select
                  value={formData.product_type}
                  label="Product Type"
                  onChange={(e) => setFormData({ ...formData, product_type: e.target.value })}
                >
                  <MenuItem value="gas">Gas</MenuItem>
                  <MenuItem value="accessory">Accessory</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Weight (kg)"
                type="number"
                value={formData.weight_kg}
                onChange={(e) => setFormData({ ...formData, weight_kg: e.target.value })}
                disabled={formData.product_type === 'accessory'}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Base Price (KES)"
                type="number"
                value={formData.base_price}
                onChange={(e) => setFormData({ ...formData, base_price: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Delivery Price per KM"
                type="number"
                value={formData.delivery_price_per_km}
                onChange={(e) => setFormData({ ...formData, delivery_price_per_km: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Image URL"
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  />
                }
                label={formData.is_active ? 'Active' : 'Inactive'}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveProduct} sx={{ bgcolor: Colors.primary }}>
            Update Product
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Product Dialog */}
      <Dialog open={openViewDialog} onClose={() => setOpenViewDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: Colors.primaryBg }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar variant="rounded" sx={{ bgcolor: Colors.primary, width: 56, height: 56 }}>
              {selectedProduct?.image_url ? (
                <img src={selectedProduct.image_url} alt={selectedProduct.name} style={{ width: 56, height: 56, objectFit: 'cover' }} />
              ) : (
                <Whatshot sx={{ fontSize: 32, color: Colors.white }} />
              )}
            </Avatar>
            <Box>
              <Typography variant="h6">{selectedProduct?.name}</Typography>
              <Typography variant="body2" color="text.secondary">{selectedProduct?.brand_name}</Typography>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {selectedProduct && (
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="text.secondary">Price</Typography>
                <Typography variant="h6" sx={{ color: Colors.primary }}>
                  KES {Number(selectedProduct.base_price).toLocaleString()}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="text.secondary">Type</Typography>
                <Chip label={selectedProduct.product_type} size="small" />
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="text.secondary">Weight</Typography>
                <Typography variant="body1">{selectedProduct.weight_kg ? `${selectedProduct.weight_kg}kg` : 'N/A'}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="text.secondary">Status</Typography>
                <Chip
                  label={selectedProduct.is_active !== false ? 'Active' : 'Inactive'}
                  color={selectedProduct.is_active !== false ? 'success' : 'error'}
                  size="small"
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary">Description</Typography>
                <Typography variant="body2">{selectedProduct.description || 'No description'}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary">Delivery Price</Typography>
                <Typography variant="body2">KES {selectedProduct.delivery_price_per_km}/km</Typography>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenViewDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle>Delete Product</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete <strong>{selectedProduct?.name}</strong>?
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleDeleteConfirm}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Price History Dialog */}
      <Dialog open={openPriceHistoryDialog} onClose={() => setOpenPriceHistoryDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: Colors.primaryBg }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <History sx={{ color: Colors.primary }} />
            <Typography variant="h6">Price History - {selectedProduct?.name}</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Current Price: <strong>KES {Number(selectedProduct?.base_price).toLocaleString()}</strong>
            </Typography>
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell align="right">Price</TableCell>
                    <TableCell align="right">Change</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {priceHistory.map((item, index) => {
                    const change = index > 0 ? ((item.price - priceHistory[index - 1].price) / priceHistory[index - 1].price * 100) : 0;
                    return (
                      <TableRow key={index}>
                        <TableCell>{new Date(item.date).toLocaleDateString()}</TableCell>
                        <TableCell align="right">KES {Number(item.price).toLocaleString()}</TableCell>
                        <TableCell align="right">
                          {index > 0 && (
                            <Chip
                              size="small"
                              label={`${change > 0 ? '+' : ''}${change.toFixed(1)}%`}
                              color={change > 0 ? 'success' : change < 0 ? 'error' : 'default'}
                              sx={{ height: 20, fontSize: 11 }}
                            />
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPriceHistoryDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}