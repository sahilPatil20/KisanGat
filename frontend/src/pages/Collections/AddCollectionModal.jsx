import React, { useState, useEffect } from 'react';
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
  CircularProgress
} from '@mui/material';
import { axiosPrivate } from '../../api/axios';

export default function AddCollectionModal({ open, onClose, onCollectionAdded }) {
  const [farmers, setFarmers] = useState([]);
  const [loadingFarmers, setLoadingFarmers] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

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
    }
  }, [open]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.farmer) {
      setError('Please select a farmer.');
      return;
    }
    
    setSubmitting(true);
    setError(null);

    try {
      const payload = {
        ...formData,
        farmer: formData.farmer.id
      };
      
      // DRF DecimalField rejects empty strings (""), so we must convert to null
      if (payload.snf_percentage === '') {
        payload.snf_percentage = null;
      }
      
      const response = await axiosPrivate.post('/collections/', payload);
      onCollectionAdded(response.data);
      onClose();
    } catch (err) {
      console.error('Failed to add collection', err);
      const data = err.response?.data;
      if (data && typeof data === 'object' && !data.detail) {
        // Convert DRF field errors like { "snf_percentage": ["A valid number is required."] } into a readable string
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

  // Auto-calculated total
  const qty = parseFloat(formData.quantity) || 0;
  const rate = parseFloat(formData.applied_rate) || 0;
  const total = (qty * rate).toFixed(2);

  return (
    <Dialog open={open} onClose={submitting ? undefined : onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Log Milk Collection</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent dividers>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Date"
                type="date"
                name="collection_date"
                value={formData.collection_date}
                onChange={handleChange}
                required
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Shift"
                name="shift"
                value={formData.shift}
                onChange={handleChange}
                required
              >
                <MenuItem value="MORNING">Morning</MenuItem>
                <MenuItem value="EVENING">Evening</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12}>
              <Autocomplete
                options={farmers}
                getOptionLabel={(option) => `${option.name} (${option.mobile_number})`}
                value={formData.farmer}
                onChange={(e, newValue) => setFormData(prev => ({ ...prev, farmer: newValue }))}
                loading={loadingFarmers}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Select Farmer"
                    required
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

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Milk Type"
                name="milk_type"
                value={formData.milk_type}
                onChange={handleChange}
                required
              >
                <MenuItem value="COW">Cow</MenuItem>
                <MenuItem value="BUFFALO">Buffalo</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Quantity (Liters)"
                type="number"
                inputProps={{ step: "0.1", min: "0" }}
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="FAT %"
                type="number"
                inputProps={{ step: "0.1", min: "0" }}
                name="fat_percentage"
                value={formData.fat_percentage}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="SNF %"
                type="number"
                inputProps={{ step: "0.1", min: "0" }}
                name="snf_percentage"
                value={formData.snf_percentage}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Rate (₹/L)"
                type="number"
                inputProps={{ step: "0.1", min: "0" }}
                name="applied_rate"
                value={formData.applied_rate}
                onChange={handleChange}
                required
              />
            </Grid>
          </Grid>
          
          <Box sx={{ mt: 3, p: 2, bgcolor: '#f8f9fa', borderRadius: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="subtitle1" color="textSecondary">Total Amount:</Typography>
            <Typography variant="h5" color="primary" fontWeight="bold">₹ {total}</Typography>
          </Box>

        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} color="inherit" disabled={submitting}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={submitting}>
            {submitting ? 'Saving...' : 'Save Collection'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
