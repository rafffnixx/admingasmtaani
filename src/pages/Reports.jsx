import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  TextField,
  InputAdornment,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Download,
  Print,
  Refresh,
  DateRange,
  FileDownload,
  PictureAsPdf,
  Description,
  TrendingUp,
  AttachMoney,
  People,
  Store,
  ShoppingCart,
  CalendarToday,
  Clear,
} from '@mui/icons-material';
import { Colors } from '../utils/colors';
import { adminAPI } from '../services/api';

export default function Reports() {
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [reportData, setReportData] = useState([]);
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  });
  const [reportType, setReportType] = useState('sales');
  const [openPreview, setOpenPreview] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);

  useEffect(() => {
    fetchReport();
  }, [tabValue, dateRange, reportType]);

  const fetchReport = async () => {
    setLoading(true);
    try {
      // Simulate API call with different data based on tab
      const mockData = getMockReportData(tabValue);
      setReportData(mockData);
    } catch (error) {
      console.error('Error fetching report:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMockReportData = (tab) => {
    const reports = {
      0: [
        { date: '2024-01-01', orders: 12, revenue: 14400, avg_order: 1200 },
        { date: '2024-01-02', orders: 15, revenue: 18000, avg_order: 1200 },
        { date: '2024-01-03', orders: 18, revenue: 21600, avg_order: 1200 },
        { date: '2024-01-04', orders: 10, revenue: 12000, avg_order: 1200 },
        { date: '2024-01-05', orders: 22, revenue: 26400, avg_order: 1200 },
      ],
      1: [
        { agent: 'Progas Shop', deliveries: 45, revenue: 54000, rating: 4.9, commission: 5400 },
        { agent: 'Total Gas', deliveries: 32, revenue: 38400, rating: 4.7, commission: 3840 },
        { agent: 'Gas Express', deliveries: 28, revenue: 33600, rating: 4.5, commission: 3360 },
      ],
      2: [
        { customer: 'John Doe', orders: 12, spent: 24500, last_order: '2024-01-05' },
        { customer: 'Jane Smith', orders: 8, spent: 18200, last_order: '2024-01-04' },
        { customer: 'Peter Kariuki', orders: 5, spent: 9200, last_order: '2024-01-03' },
      ],
    };
    return reports[tab] || [];
  };

  const handleExportCSV = () => {
    const headers = Object.keys(reportData[0] || {});
    const csv = [
      headers.join(','),
      ...reportData.map(row => headers.map(h => row[h] || '').join(','))
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${['sales','agent','customer'][tabValue]}_report.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const handleExportPDF = () => {
    alert('PDF export coming soon!');
  };

  const handlePrint = () => {
    window.print();
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
          Reports
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={fetchReport}
            sx={{ borderColor: Colors.primary, color: Colors.primary }}
          >
            Refresh
          </Button>
          <Button
            variant="outlined"
            startIcon={<PictureAsPdf />}
            onClick={handleExportPDF}
            sx={{ borderColor: Colors.error, color: Colors.error }}
          >
            PDF
          </Button>
          <Button
            variant="outlined"
            startIcon={<Description />}
            onClick={handleExportCSV}
            sx={{ borderColor: Colors.success, color: Colors.success }}
          >
            CSV
          </Button>
          <Button
            variant="outlined"
            startIcon={<Print />}
            onClick={handlePrint}
            sx={{ borderColor: Colors.gray[500], color: Colors.gray[500] }}
          >
            Print
          </Button>
        </Box>
      </Box>

      {/* Date Range Picker */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <TextField
            size="small"
            label="Start Date"
            type="date"
            value={dateRange.start}
            onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            size="small"
            label="End Date"
            type="date"
            value={dateRange.end}
            onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
            InputLabelProps={{ shrink: true }}
          />
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Report Type</InputLabel>
            <Select
              value={reportType}
              label="Report Type"
              onChange={(e) => setReportType(e.target.value)}
            >
              <MenuItem value="sales">Sales Report</MenuItem>
              <MenuItem value="agents">Agent Report</MenuItem>
              <MenuItem value="customers">Customer Report</MenuItem>
              <MenuItem value="products">Product Report</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="contained"
            onClick={fetchReport}
            sx={{ bgcolor: Colors.primary }}
          >
            Generate
          </Button>
        </Box>
      </Paper>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary">Total Revenue</Typography>
              <Typography variant="h4" sx={{ color: Colors.primary }}>
                KES {reportData.reduce((sum, r) => sum + (r.revenue || r.spent || 0), 0).toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary">Total Records</Typography>
              <Typography variant="h4" sx={{ color: Colors.info }}>
                {reportData.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary">Average Value</Typography>
              <Typography variant="h4" sx={{ color: Colors.success }}>
                KES {reportData.length ? Math.round(reportData.reduce((sum, r) => sum + (r.revenue || r.spent || 0), 0) / reportData.length) : 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary">Date Range</Typography>
              <Typography variant="h6" sx={{ color: Colors.warning }}>
                {dateRange.start} to {dateRange.end}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Report Tabs */}
      <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} sx={{ mb: 3 }}>
        <Tab label="Sales Report" />
        <Tab label="Agent Report" />
        <Tab label="Customer Report" />
      </Tabs>

      {/* Report Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ bgcolor: Colors.gray[50] }}>
            <TableRow>
              {Object.keys(reportData[0] || {}).map((key) => (
                <TableCell key={key}>
                  {key.replace(/_/g, ' ').toUpperCase()}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {reportData.length > 0 ? (
              reportData.map((row, index) => (
                <TableRow key={index} hover>
                  {Object.values(row).map((value, i) => (
                    <TableCell key={i}>
                      {typeof value === 'number' ? value.toLocaleString() : value}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    No data found for the selected period
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}