import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  TextField,
  MenuItem,
  Autocomplete,
  Typography,
  Box,
  Alert,
  CircularProgress,
  InputAdornment,
  Divider
} from '@mui/material';
import { axiosPrivate } from '../../api/axios';

export default function AddCollectionModal({ open, onClose, onCollectionAdded }) {
  const [farmers, setFarmers] = useState([]);
  const [loadingFarmers, setLoadingFarmers] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  
  const farmerInputRef = useRef(null);

  // Rate state
  const [activeRates, setActiveRates] = useState({
    COW: { purchase_rate: 0, selling_rate: 0 },
    BUFFALO: { purchase_rate: 0, selling_rate: 0 }
  });

  const [formData, setFormData] = useState({
    collection_date: new Date().toISOString().split('T')[0],
    shift: new Date().getHours() < 14 ? 'MORNING' : 'EVENING',
    farmer: null,
    milk_type: 'COW',
    quantity: '',
    fat_percentage: '',
    snf_percentage: '',
    applied_rate: ''
  });

  useEffect(() => {
    if (open) {
      fetchFarmers();
      fetchActiveRates();
      setSuccessMsg(null);
      setError(null);
      // Try to focus farmer input on open
      setTimeout(() => {
        if (farmerInputRef.current) {
          farmerInputRef.current.focus();
        }
      }, 100);
    }
  }, [open]);

  // When milk_type or activeRates change, auto-fill the rate
  useEffect(() => {
    if (activeRates[formData.milk_type]) {
      setFormData(prev => ({
        ...prev,
        applied_rate: activeRates[formData.milk_type].purchase_rate.toString()
      }));
    }
  }, [formData.milk_type, activeRates]);

  const fetchActiveRates = async () => {
    try {
      const response = await axiosPrivate.get('/settings/active-rates/');
      setActiveRates(response.data);
    } catch (err) {
      console.error('Failed to fetch active rates', err);
    }
  };

  const fetchFarmers = async () => {
    setLoadingFarmers(true);
    try {
      const response = await axiosPrivate.get('/farmers/');
      setFarmers(response.data.results !== undefined ? response.data.results : response.data);
    } catch (err) {
      console.error('Failed to fetch farmers', err);
    } finally {
      setLoadingFarmers(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFarmerChange = (e, newValue) => {
    setFormData(prev => ({ ...prev, farmer: newValue }));
  };

  const processSubmit = async (isSaveAndNext) => {
    if (!formData.farmer) {
      setError('Please select a farmer.');
      return;
    }
    
    setSubmitting(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const payload = {
        ...formData,
        farmer: formData.farmer.id
      };
      
      if (payload.snf_percentage === '') {
        payload.snf_percentage = null;
      }
      
      const response = await axiosPrivate.post('/collections/', payload);
      onCollectionAdded(response.data);
      
      if (isSaveAndNext) {
        setSuccessMsg(`Collection for ${formData.farmer.name} saved successfully!`);
        // Reset specific fields
        setFormData(prev => ({
          ...prev,
          farmer: null,
          quantity: '',
          fat_percentage: '',
          snf_percentage: ''
        }));
        
        // Auto focus back to Farmer Selection
        setTimeout(() => {
          if (farmerInputRef.current) {
            farmerInputRef.current.focus();
          }
        }, 100);
        
      } else {
        onClose();
      }
    } catch (err) {
      console.error('Failed to add collection', err);
      const data = err.response?.data;
      if (data && typeof data === 'object' && !data.detail) {
        const messages = Object.entries(data)
          .map(([key, val]) => `${key}: ${Array.isArray(val) ? val.join(' ') : val}`)
          .join(' | ');
        setError(`Error: ${messages}`);
      } else {
        setError(data?.detail || 'Failed to add collection. Please check your inputs.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitClose = (e) => {
    e.preventDefault();
    processSubmit(false);
  };

  const handleSubmitNext = (e) => {
    e.preventDefault();
    processSubmit(true);
  };

  const qty = parseFloat(formData.quantity) || 0;
  const rate = parseFloat(formData.applied_rate) || 0;
  const total = (qty * rate).toFixed(2);

  return (
    <Dialog open={open} onClose={submitting ? undefined : onClose} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle sx={{ fontWeight: 800, fontSize: '1.5rem', pb: 1 }}>Smart Collection Entry</DialogTitle>
      <Divider />
      <form>
        <DialogContent sx={{ p: 4, pt: 3 }}>
          {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}
          {successMsg && <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>{successMsg}</Alert>}
          
          <Grid container spacing={3}>
            {/* Top row: Context */}
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Date"
                type="date"
                name="collection_date"
                value={formData.collection_date}
                onChange={handleChange}
                required
                InputLabelProps={{ shrink: true }}
                sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'background.default' } }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                select
                label="Shift"
                name="shift"
                value={formData.shift}
                onChange={handleChange}
                required
                sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'background.default' } }}
              >
                <MenuItem value="MORNING">Morning Shift</MenuItem>
                <MenuItem value="EVENING">Evening Shift</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                select
                label="Milk Type"
                name="milk_type"
                value={formData.milk_type}
                onChange={handleChange}
                required
                sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'background.default' } }}
              >
                <MenuItem value="COW">Cow Milk</MenuItem>
                <MenuItem value="BUFFALO">Buffalo Milk</MenuItem>
              </TextField>
            </Grid>

            {/* Middle Row: Farmer Search (Large) */}
            <Grid item xs={12}>
              <Autocomplete
                options={farmers}
                getOptionLabel={(option) => `${option.name} (${option.mobile_number}) - Bal: ₹${option.current_balance}`}
                value={formData.farmer}
                onChange={handleFarmerChange}
                loading={loadingFarmers}
                disableClearable={false}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Search Farmer (Name or Mobile)..."
                    required
                    inputRef={farmerInputRef}
                    sx={{ '& .MuiOutlinedInput-root': { py: 1.5, fontSize: '1.1rem' } }}
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <React.Fragment>
                          {loadingFarmers ? <CircularProgress color="inherit" size={20} /> : null}
                          {params.InputProps.endAdornment}
                        </React.Fragment>
                      ),
                    }}
                  />
                )}
              />
            </Grid>

            {/* Bottom Row: Entry Values */}
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="Quantity"
                type="number"
                inputProps={{ step: "0.1", min: "0" }}
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                required
                InputProps={{
                  endAdornment: <InputAdornment position="end">L</InputAdornment>,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="FAT"
                type="number"
                inputProps={{ step: "0.1", min: "0" }}
                name="fat_percentage"
                value={formData.fat_percentage}
                onChange={handleChange}
                required
                InputProps={{
                  endAdornment: <InputAdornment position="end">%</InputAdornment>,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="SNF"
                type="number"
                inputProps={{ step: "0.1", min: "0" }}
                name="snf_percentage"
                value={formData.snf_percentage}
                onChange={handleChange}
                InputProps={{
                  endAdornment: <InputAdornment position="end">%</InputAdornment>,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="Rate"
                type="number"
                inputProps={{ step: "0.1", min: "0" }}
                name="applied_rate"
                value={formData.applied_rate}
                onChange={handleChange}
                required
                InputProps={{
                  startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                }}
              />
            </Grid>
          </Grid>
          
          <Box sx={{ 
            mt: 4, 
            p: 3, 
            bgcolor: 'primary.main', 
            color: 'white',
            borderRadius: 3, 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            boxShadow: '0 10px 15px -3px rgba(37,99,235,0.3)'
          }}>
            <Typography variant="h6" sx={{ fontWeight: 600, opacity: 0.9 }}>Calculated Net Amount</Typography>
            <Typography variant="h3" sx={{ fontWeight: 800 }}>₹ {total}</Typography>
          </Box>

        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0, display: 'flex', justifyContent: 'space-between' }}>
          <Button onClick={onClose} color="inherit" disabled={submitting} sx={{ fontWeight: 600 }}>Cancel</Button>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button 
              onClick={handleSubmitClose} 
              variant="outlined" 
              color="primary" 
              disabled={submitting}
              sx={{ fontWeight: 700 }}
            >
              Save & Close
            </Button>
            <Button 
              onClick={handleSubmitNext} 
              variant="contained" 
              color="primary" 
              disabled={submitting}
              sx={{ fontWeight: 700, px: 4 }}
            >
              {submitting ? 'Saving...' : 'Save & Add Next'}
            </Button>
          </Box>
        </DialogActions>
      </form>
    </Dialog>
  );
}
