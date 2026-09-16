import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Divider,
  Alert,
  CircularProgress,
  Snackbar,
  InputAdornment,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Tab,
  Tabs,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import {
  Save,
  Business,
  Email,
  Phone,
  AccessTime,
  LocationOn,
  AttachMoney,
  Nightlight,
  TrendingUp,
  Percent,
  Payments,
  Notifications,
  Sms,
  Key,
  Visibility,
  VisibilityOff,
  DeliveryDining,
  RestartAlt,
  CheckCircle,
} from '@mui/icons-material';
import { Colors } from '../utils/colors';
import { adminAPI } from '../services/api';

export default function Settings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [showMpesaKey, setShowMpesaKey] = useState(false);
  const [showMpesaPasskey, setShowMpesaPasskey] = useState(false);
  const [openResetDialog, setOpenResetDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [settings, setSettings] = useState({
    general: {
      app_name: '',
      contact_email: '',
      contact_phone: '',
      support_hours: '',
    },
    delivery: {
      max_radius: 0,
      base_fee: 0,
      fee_per_km: 0,
      night_delivery_fee: 0,
      peak_hours_surcharge: 0,
      peak_hours: '',
    },
    commission: {
      admin_commission: 0,
      agent_commission: 0,
      min_commission: 0,
    },
    payments: {
      mpesa_shortcode: '',
      mpesa_consumer_key: '',
      mpesa_passkey: '',
    },
    notifications: {
      sms_provider: '',
      push_enabled: false,
      email_enabled: false,
      push_api_key: '',
    },
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.getSettings();
      console.log('✅ Settings fetched:', response.data);
      const data = response.data || {};
      
      setSettings({
        general: {
          app_name: data.general?.app_name || '',
          contact_email: data.general?.contact_email || '',
          contact_phone: data.general?.contact_phone || '',
          support_hours: data.general?.support_hours || '',
        },
        delivery: {
          max_radius: data.delivery?.max_radius || 0,
          base_fee: data.delivery?.base_fee || 0,
          fee_per_km: data.delivery?.fee_per_km || 0,
          night_delivery_fee: data.delivery?.night_delivery_fee || 0,
          peak_hours_surcharge: data.delivery?.peak_hours_surcharge || 0,
          peak_hours: data.delivery?.peak_hours || '',
        },
        commission: {
          admin_commission: data.commission?.admin_commission || 0,
          agent_commission: data.commission?.agent_commission || 0,
          min_commission: data.commission?.min_commission || 0,
        },
        payments: {
          mpesa_shortcode: data.payments?.mpesa_shortcode || '',
          mpesa_consumer_key: data.payments?.mpesa_consumer_key || '',
          mpesa_passkey: data.payments?.mpesa_passkey || '',
        },
        notifications: {
          sms_provider: data.notifications?.sms_provider || '',
          push_enabled: data.notifications?.push_enabled || false,
          email_enabled: data.notifications?.email_enabled || false,
          push_api_key: data.notifications?.push_api_key || '',
        },
      });
    } catch (error) {
      console.error('❌ Error fetching settings:', error);
      showSnackbar('Failed to fetch settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleChange = (section, field, value) => {
    setSettings({
      ...settings,
      [section]: {
        ...settings[section],
        [field]: value,
      },
    });
  };

  const handleSwitchChange = (section, field) => {
    setSettings({
      ...settings,
      [section]: {
        ...settings[section],
        [field]: !settings[section][field],
      },
    });
  };

const handleSave = async () => {
  console.log('========================================');
  console.log('🟢 SAVE BUTTON CLICKED!');
  console.log('📤 Data being sent:', JSON.stringify(settings, null, 2));
  
  setSaving(true);
  setSaved(false);
  
  try {
    // Check if adminAPI.updateSettings exists
    console.log('🔍 Checking adminAPI.updateSettings:', typeof adminAPI.updateSettings);
    
    const response = await adminAPI.updateSettings(settings);
    console.log('✅ FULL RESPONSE:', response);
    console.log('✅ RESPONSE DATA:', response.data);
    
    setSaved(true);
    showSnackbar('Settings saved successfully to database!', 'success');
    setTimeout(() => setSaved(false), 3000);
    
    // Verify by fetching again
    console.log('🔄 Verifying save...');
    const verify = await adminAPI.getSettings();
    console.log('✅ Verification after save:', verify.data);
    
  } catch (error) {
    console.error('❌ ERROR DETAILS:', error);
    console.error('❌ ERROR RESPONSE:', error.response);
    console.error('❌ ERROR DATA:', error.response?.data);
    console.error('❌ ERROR STATUS:', error.response?.status);
    showSnackbar(error.response?.data?.error || 'Failed to save settings', 'error');
  } finally {
    setSaving(false);
    console.log('========================================');
  }
};

  const handleReset = async () => {
    try {
      await adminAPI.resetSettings();
      showSnackbar('Settings reset to defaults!', 'success');
      setOpenResetDialog(false);
      fetchSettings();
    } catch (error) {
      console.error('Error resetting settings:', error);
      showSnackbar('Failed to reset settings', 'error');
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
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
          System Settings
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<RestartAlt />}
            onClick={() => setOpenResetDialog(true)}
            sx={{ borderColor: Colors.error, color: Colors.error }}
          >
            Reset
          </Button>
          <Button
            variant="contained"
            startIcon={<Save />}
            onClick={handleSave}
            disabled={saving}
            sx={{ bgcolor: Colors.primary, '&:hover': { bgcolor: Colors.primaryDark } }}
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </Button>
        </Box>
      </Box>

      {saved && (
        <Alert severity="success" sx={{ mb: 3 }} icon={<CheckCircle />}>
          Settings saved successfully!
        </Alert>
      )}

      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tab label="General" />
          <Tab label="Delivery" />
          <Tab label="Commission" />
          <Tab label="Payments" />
          <Tab label="Notifications" />
        </Tabs>
      </Paper>

      {/* General Settings */}
      {tabValue === 0 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
            <Business sx={{ color: Colors.primary, mr: 1 }} />
            General Settings
          </Typography>
          <Divider sx={{ mb: 3 }} />
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="App Name"
                value={settings.general.app_name}
                onChange={(e) => handleChange('general', 'app_name', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Support Hours"
                value={settings.general.support_hours}
                onChange={(e) => handleChange('general', 'support_hours', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Contact Email"
                type="email"
                value={settings.general.contact_email}
                onChange={(e) => handleChange('general', 'contact_email', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Contact Phone"
                value={settings.general.contact_phone}
                onChange={(e) => handleChange('general', 'contact_phone', e.target.value)}
              />
            </Grid>
          </Grid>
        </Paper>
      )}

      {/* Delivery Settings */}
      {tabValue === 1 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
            <DeliveryDining sx={{ color: Colors.primary, mr: 1 }} />
            Delivery Settings
          </Typography>
          <Divider sx={{ mb: 3 }} />
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Max Radius (KM)"
                type="number"
                value={settings.delivery.max_radius}
                onChange={(e) => handleChange('delivery', 'max_radius', Number(e.target.value))}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Base Fee (KES)"
                type="number"
                value={settings.delivery.base_fee}
                onChange={(e) => handleChange('delivery', 'base_fee', Number(e.target.value))}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Fee Per KM (KES)"
                type="number"
                value={settings.delivery.fee_per_km}
                onChange={(e) => handleChange('delivery', 'fee_per_km', Number(e.target.value))}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Night Delivery Fee (KES)"
                type="number"
                value={settings.delivery.night_delivery_fee}
                onChange={(e) => handleChange('delivery', 'night_delivery_fee', Number(e.target.value))}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Peak Hours Surcharge (%)"
                type="number"
                value={settings.delivery.peak_hours_surcharge}
                onChange={(e) => handleChange('delivery', 'peak_hours_surcharge', Number(e.target.value))}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Peak Hours"
                value={settings.delivery.peak_hours}
                onChange={(e) => handleChange('delivery', 'peak_hours', e.target.value)}
                placeholder="e.g., 6:00 PM - 9:00 PM"
              />
            </Grid>
          </Grid>
        </Paper>
      )}

      {/* Commission Settings */}
      {tabValue === 2 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
            <Percent sx={{ color: Colors.primary, mr: 1 }} />
            Commission Settings
          </Typography>
          <Divider sx={{ mb: 3 }} />
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Admin Commission (%)"
                type="number"
                value={settings.commission.admin_commission}
                onChange={(e) => handleChange('commission', 'admin_commission', Number(e.target.value))}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Agent Commission (%)"
                type="number"
                value={settings.commission.agent_commission}
                onChange={(e) => handleChange('commission', 'agent_commission', Number(e.target.value))}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Min Commission (KES)"
                type="number"
                value={settings.commission.min_commission}
                onChange={(e) => handleChange('commission', 'min_commission', Number(e.target.value))}
              />
            </Grid>
          </Grid>
        </Paper>
      )}

      {/* Payment Settings */}
      {tabValue === 3 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
            <Payments sx={{ color: Colors.primary, mr: 1 }} />
            Payment Settings
          </Typography>
          <Divider sx={{ mb: 3 }} />
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="M-PESA Shortcode"
                value={settings.payments.mpesa_shortcode}
                onChange={(e) => handleChange('payments', 'mpesa_shortcode', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Consumer Key"
                type={showMpesaKey ? 'text' : 'password'}
                value={settings.payments.mpesa_consumer_key}
                onChange={(e) => handleChange('payments', 'mpesa_consumer_key', e.target.value)}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowMpesaKey(!showMpesaKey)}>
                        {showMpesaKey ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Passkey"
                type={showMpesaPasskey ? 'text' : 'password'}
                value={settings.payments.mpesa_passkey}
                onChange={(e) => handleChange('payments', 'mpesa_passkey', e.target.value)}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowMpesaPasskey(!showMpesaPasskey)}>
                        {showMpesaPasskey ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
          </Grid>
        </Paper>
      )}

      {/* Notification Settings */}
      {tabValue === 4 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
            <Notifications sx={{ color: Colors.primary, mr: 1 }} />
            Notification Settings
          </Typography>
          <Divider sx={{ mb: 3 }} />
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>SMS Provider</InputLabel>
                <Select
                  value={settings.notifications.sms_provider}
                  label="SMS Provider"
                  onChange={(e) => handleChange('notifications', 'sms_provider', e.target.value)}
                >
                  <MenuItem value="Africa's Talking">Africa's Talking</MenuItem>
                  <MenuItem value="Twilio">Twilio</MenuItem>
                  <MenuItem value="SMS.to">SMS.to</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Push API Key"
                type="password"
                value={settings.notifications.push_api_key}
                onChange={(e) => handleChange('notifications', 'push_api_key', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.notifications.push_enabled}
                        onChange={() => handleSwitchChange('notifications', 'push_enabled')}
                        sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: Colors.primary } }}
                      />
                    }
                    label="Push Notifications"
                  />
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.notifications.email_enabled}
                        onChange={() => handleSwitchChange('notifications', 'email_enabled')}
                        sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: Colors.primary } }}
                      />
                    }
                    label="Email Notifications"
                  />
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Paper>
      )}

      {/* Reset Dialog */}
      <Dialog open={openResetDialog} onClose={() => setOpenResetDialog(false)}>
        <DialogTitle>Reset Settings</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to reset all settings to default values?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenResetDialog(false)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleReset}>
            Reset
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}