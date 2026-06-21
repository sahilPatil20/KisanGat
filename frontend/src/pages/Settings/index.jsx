import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Divider,
  Snackbar,
  MenuItem,
  InputAdornment
} from '@mui/material';
import { Save as SaveIcon, Storefront as StorefrontIcon, Settings as SettingsIcon, MonetizationOn as MonetizationOnIcon } from '@mui/icons-material';
import { axiosPrivate } from '../../api/axios';
import ErrorBoundary from '../../components/ErrorBoundary';

function Settings() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  const [dairyForm, setDairyForm] = useState({
    dairy_name: '',
    owner_name: '',
    address: '',
    phone: '',
    gst_number: '',
    logo_path: ''
  });

  const [ratesForm, setRatesForm] = useState({
    cow_purchase: '',
    cow_selling: '',
    buffalo_purchase: '',
    buffalo_selling: ''
  });

  const [prefsForm, setPrefsForm] = useState({
    currency: 'INR',
    date_format: 'YYYY-MM-DD',
    time_format: '24H',
    auto_logout_duration: '30'
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await axiosPrivate.get('/settings/');
      const data = response.data;
      
      setDairyForm({
        dairy_name: data.dairy?.dairy_name || '',
        owner_name: data.dairy?.owner_name || '',
        address: data.dairy?.address || '',
        phone: data.dairy?.phone || '',
        gst_number: data.dairy?.gst_number || '',
        logo_path: data.dairy?.logo_path || ''
      });

      setRatesForm({
        cow_purchase: data.rates?.COW?.purchase_rate || '',
        cow_selling: data.rates?.COW?.selling_rate || '',
        buffalo_purchase: data.rates?.BUFFALO?.purchase_rate || '',
        buffalo_selling: data.rates?.BUFFALO?.selling_rate || ''
      });

      setPrefsForm({
        currency: data.preferences?.currency || 'INR',
        date_format: data.preferences?.date_format || 'YYYY-MM-DD',
        time_format: data.preferences?.time_format || '24H',
        auto_logout_duration: data.preferences?.auto_logout_duration || '30'
      });
    } catch (err) {
      console.error('Failed to fetch settings', err);
      setError('Failed to load settings data.');
    } finally {
      setLoading(false);
    }
  };

  const handleDairyChange = (e) => setDairyForm({ ...dairyForm, [e.target.name]: e.target.value });
  const handleRatesChange = (e) => setRatesForm({ ...ratesForm, [e.target.name]: e.target.value });
  const handlePrefsChange = (e) => setPrefsForm({ ...prefsForm, [e.target.name]: e.target.value });

  const handleSaveAll = async () => {
    setSubmitting(true);
    setError('');
    
    const payload = {
      dairy: dairyForm,
      rates: {
        COW: {
          purchase_rate: parseFloat(ratesForm.cow_purchase) || 0,
          selling_rate: parseFloat(ratesForm.cow_selling) || 0
        },
        BUFFALO: {
          purchase_rate: parseFloat(ratesForm.buffalo_purchase) || 0,
          selling_rate: parseFloat(ratesForm.buffalo_selling) || 0
        }
      },
      preferences: prefsForm
    };

    try {
      await axiosPrivate.put('/settings/', payload);
      setToastMessage('All configurations successfully synced with the server.');
      fetchSettings();
    } catch (err) {
      console.error('Failed to save settings', err);
      setError('Failed to save settings. Please verify all inputs and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress /></Box>;

  return (
    <Box sx={{ p: { xs: 1, md: 2 }, maxWidth: '1200px', mx: 'auto' }}>
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' }, mb: 4, gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary' }}>System Configurations</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>Manage dairy profile, pricing logic, and global preferences.</Typography>
        </Box>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={handleSaveAll}
          disabled={submitting}
          startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
          sx={{ borderRadius: '8px', px: 4, py: 1.5, fontWeight: 700, boxShadow: '0 4px 14px 0 rgba(37,99,235,0.39)' }}
        >
          {submitting ? 'Syncing...' : 'Save All Changes'}
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 4, borderRadius: 2, fontWeight: 600 }}>{error}</Alert>}

      <Grid container spacing={4}>
        {/* Dairy Settings */}
        <Grid item xs={12} md={7}>
          <Card sx={{ borderRadius: '16px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)', height: '100%' }}>
            <CardContent sx={{ p: { xs: 2, md: 4 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                <StorefrontIcon color="primary" />
                <Typography variant="h6" fontWeight="800">Dairy Enterprise Profile</Typography>
              </Box>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField fullWidth label="Registered Business Name" name="dairy_name" value={dairyForm.dairy_name} onChange={handleDairyChange} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Proprietor/Owner Name" name="owner_name" value={dairyForm.owner_name} onChange={handleDairyChange} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Contact Phone" name="phone" value={dairyForm.phone} onChange={handleDairyChange} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                </Grid>
                <Grid item xs={12}>
                  <TextField fullWidth label="Operating Address" name="address" value={dairyForm.address} onChange={handleDairyChange} multiline rows={3} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                </Grid>
                <Grid item xs={12}>
                  <TextField fullWidth label="GSTIN / Tax ID" name="gst_number" value={dairyForm.gst_number} onChange={handleDairyChange} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Milk Rates */}
        <Grid item xs={12} md={5}>
          <Card sx={{ borderRadius: '16px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)', height: '100%', border: '1px solid rgba(16,185,129,0.1)' }}>
            <CardContent sx={{ p: { xs: 2, md: 4 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                <MonetizationOnIcon sx={{ color: '#10B981' }} />
                <Typography variant="h6" fontWeight="800">Global Pricing Matrix</Typography>
              </Box>
              
              <Box sx={{ mb: 4, p: 2.5, bgcolor: 'rgba(37,99,235,0.04)', borderRadius: 3, border: '1px solid rgba(37,99,235,0.1)' }}>
                <Typography variant="subtitle2" sx={{ color: 'primary.main', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, mb: 2 }}>Cow Milk (₹/L)</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <TextField fullWidth label="Farmer Buy Rate" name="cow_purchase" type="number" inputProps={{ step: "0.1", min: "0" }} value={ratesForm.cow_purchase} onChange={handleRatesChange} InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: 'background.paper' } }} />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField fullWidth label="Customer Sell Rate" name="cow_selling" type="number" inputProps={{ step: "0.1", min: "0" }} value={ratesForm.cow_selling} onChange={handleRatesChange} InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: 'background.paper' } }} />
                  </Grid>
                </Grid>
              </Box>

              <Box sx={{ p: 2.5, bgcolor: 'rgba(124,58,237,0.04)', borderRadius: 3, border: '1px solid rgba(124,58,237,0.1)' }}>
                <Typography variant="subtitle2" sx={{ color: '#7C3AED', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, mb: 2 }}>Buffalo Milk (₹/L)</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <TextField fullWidth label="Farmer Buy Rate" name="buffalo_purchase" type="number" inputProps={{ step: "0.1", min: "0" }} value={ratesForm.buffalo_purchase} onChange={handleRatesChange} InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: 'background.paper' } }} />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField fullWidth label="Customer Sell Rate" name="buffalo_selling" type="number" inputProps={{ step: "0.1", min: "0" }} value={ratesForm.buffalo_selling} onChange={handleRatesChange} InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: 'background.paper' } }} />
                  </Grid>
                </Grid>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* System & Session Preferences */}
        <Grid item xs={12}>
          <Card sx={{ borderRadius: '16px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)', mb: 4 }}>
            <CardContent sx={{ p: { xs: 2, md: 4 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 4 }}>
                <SettingsIcon color="action" />
                <Typography variant="h6" fontWeight="800">Application Preferences</Typography>
              </Box>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField fullWidth select label="Base Currency" name="currency" value={prefsForm.currency} onChange={handlePrefsChange} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}>
                    <MenuItem value="INR">₹ INR (Indian Rupee)</MenuItem>
                    <MenuItem value="USD">$ USD (US Dollar)</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField fullWidth select label="Date Format" name="date_format" value={prefsForm.date_format} onChange={handlePrefsChange} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}>
                    <MenuItem value="YYYY-MM-DD">YYYY-MM-DD (2024-12-31)</MenuItem>
                    <MenuItem value="DD/MM/YYYY">DD/MM/YYYY (31/12/2024)</MenuItem>
                    <MenuItem value="MM/DD/YYYY">MM/DD/YYYY (12/31/2024)</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField fullWidth select label="Time Format" name="time_format" value={prefsForm.time_format} onChange={handlePrefsChange} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}>
                    <MenuItem value="24H">24-Hour (14:30)</MenuItem>
                    <MenuItem value="12H">12-Hour (02:30 PM)</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField fullWidth select label="Security Auto-Logout" name="auto_logout_duration" value={prefsForm.auto_logout_duration} onChange={handlePrefsChange} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}>
                    <MenuItem value="15">Idle for 15 Minutes</MenuItem>
                    <MenuItem value="30">Idle for 30 Minutes</MenuItem>
                    <MenuItem value="60">Idle for 1 Hour</MenuItem>
                    <MenuItem value="120">Idle for 2 Hours</MenuItem>
                  </TextField>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Snackbar 
        open={!!toastMessage} 
        autoHideDuration={4000} 
        onClose={() => setToastMessage('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setToastMessage('')} severity="success" sx={{ width: '100%', borderRadius: 2, fontWeight: 600, boxShadow: '0 10px 15px -3px rgba(16,185,129,0.3)' }}>
          {toastMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default function SettingsWithErrorBoundary() {
  return (
    <ErrorBoundary>
      <Settings />
    </ErrorBoundary>
  );
}
