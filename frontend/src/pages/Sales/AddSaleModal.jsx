import React, { useState, useEffect } from 'react';
import { 
  Dialog, DialogTitle, DialogContent, DialogActions, 
  Button, TextField, MenuItem, Typography, Box, 
  CircularProgress, Alert, Divider, Autocomplete, InputAdornment
} from '@mui/material';
import { axiosPrivate } from '../../api/axios';

const MILK_TYPES = [
  { value: 'COW', label: 'Cow Milk' },
  { value: 'BUFFALO', label: 'Buffalo Milk' },
  { value: 'MIXED', label: 'Mixed Milk' }
];

const SHIFTS = [
  { value: 'MORNING', label: 'Morning Shift' },
  { value: 'EVENING', label: 'Evening Shift' }
];

const PAYMENT_STATUSES = [
  { value: 'DUE', label: 'Full Amount Due (Credit)' },
  { value: 'PARTIAL', label: 'Partial Payment Received' },
  { value: 'PAID', label: 'Fully Paid Now' }
];

export default function AddSaleModal({ open, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    sale_date: new Date().toISOString().split('T')[0],
    shift: new Date().getHours() < 12 ? 'MORNING' : 'EVENING',
    customer: null,
    milk_type: 'COW',
    quantity: '',
    applied_rate: '',
    payment_status: 'DUE',
    paid_amount: '',
    remarks: ''
  });
  
  const [customers, setCustomers] = useState([]);
  const [availableInventory, setAvailableInventory] = useState(0);
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(false);
  const [error, setError] = useState('');

  // Active Rates & Customer Summary
  const [activeRates, setActiveRates] = useState({
    COW: { purchase_rate: 0, selling_rate: 0 },
    BUFFALO: { purchase_rate: 0, selling_rate: 0 }
  });
  const [customerSummary, setCustomerSummary] = useState(null);
  const [loadingSummary, setLoadingSummary] = useState(false);

  useEffect(() => {
    if (open) {
      fetchData();
      fetchActiveRates();
      
      setFormData({
        sale_date: new Date().toISOString().split('T')[0],
        shift: new Date().getHours() < 12 ? 'MORNING' : 'EVENING',
        customer: null,
        milk_type: 'COW',
        quantity: '',
        applied_rate: '',
        payment_status: 'DUE',
        paid_amount: '',
        remarks: ''
      });
      setCustomerSummary(null);
      setError('');
    }
  }, [open]);

  useEffect(() => {
    if (activeRates[formData.milk_type]) {
      setFormData(prev => ({
        ...prev,
        applied_rate: activeRates[formData.milk_type].selling_rate.toString()
      }));
    } else if (formData.milk_type === 'MIXED') {
       const avg = (activeRates['COW']?.selling_rate + activeRates['BUFFALO']?.selling_rate) / 2;
       if (avg) {
         setFormData(prev => ({ ...prev, applied_rate: avg.toString() }));
       }
    }
  }, [formData.milk_type, activeRates]);

  useEffect(() => {
    if (formData.customer) {
      fetchCustomerSummary(formData.customer.id);
    } else {
      setCustomerSummary(null);
    }
  }, [formData.customer]);

  const fetchActiveRates = async () => {
    try {
      const response = await axiosPrivate.get('/settings/active-rates/');
      setActiveRates(response.data);
    } catch (err) {
      console.error('Failed to fetch active rates', err);
    }
  };

  const fetchData = async () => {
    setFetchingData(true);
    try {
      const [customersRes, inventoryRes] = await Promise.all([
        axiosPrivate.get('/customers/'),
        axiosPrivate.get('/sales/inventory-status/')
      ]);
      
      const customersData = customersRes.data.results !== undefined ? customersRes.data.results : customersRes.data;
      setCustomers(Array.isArray(customersData) ? customersData : []);
      setAvailableInventory(parseFloat(inventoryRes.data.available_inventory || 0));
    } catch (err) {
      console.error("Failed to fetch data", err);
    } finally {
      setFetchingData(false);
    }
  };

  const fetchCustomerSummary = async (customerId) => {
    setLoadingSummary(true);
    try {
      const response = await axiosPrivate.get(`/sales/customer-summary/?customer_id=${customerId}`);
      setCustomerSummary(response.data);
    } catch (err) {
      console.error('Failed to fetch customer summary', err);
    } finally {
      setLoadingSummary(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleCustomerChange = (e, newValue) => {
    setFormData(prev => ({ ...prev, customer: newValue }));
  };

  const totalAmount = parseFloat(formData.quantity || 0) * parseFloat(formData.applied_rate || 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.customer) {
      setError('Please select a customer.');
      return;
    }
    
    if (parseFloat(formData.quantity) <= 0 || parseFloat(formData.applied_rate) <= 0) {
      setError('Quantity and Rate must be greater than zero.');
      return;
    }

    let finalPaidAmount = 0;
    if (formData.payment_status === 'PAID') {
      finalPaidAmount = totalAmount;
    } else if (formData.payment_status === 'PARTIAL') {
      finalPaidAmount = parseFloat(formData.paid_amount || 0);
      if (finalPaidAmount <= 0 || finalPaidAmount >= totalAmount) {
        setError('Partial paid amount must be greater than zero and less than total amount.');
        return;
      }
    }

    const payload = {
      ...formData,
      customer: formData.customer.id,
      paid_amount: finalPaidAmount
    };

    setLoading(true);
    try {
      await axiosPrivate.post('/sales/', payload);
      onSuccess();
    } catch (err) {
      console.error('Error recording sale:', err);
      setError('Failed to record sale. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const quantity = parseFloat(formData.quantity || 0);
  const showInventoryWarning = quantity > availableInventory;

  return (
    <Dialog open={open} onClose={loading ? undefined : onClose} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle sx={{ fontWeight: 800, fontSize: '1.5rem', pb: 1 }}>
        New POS Transaction
      </DialogTitle>
      <Divider />
      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ p: 4, pt: 3 }}>
          {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}

          {showInventoryWarning && (
            <Alert severity="warning" sx={{ mb: 3, borderRadius: 2, fontWeight: 600 }}>
              Notice: Sale quantity ({quantity}L) exceeds current available inventory ({availableInventory.toFixed(2)}L). Ensure stock is correct.
            </Alert>
          )}

          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            <TextField
              fullWidth
              label="Invoice Date"
              name="sale_date"
              type="date"
              value={formData.sale_date}
              onChange={handleChange}
              required
              InputLabelProps={{ shrink: true }}
              sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'background.default' } }}
            />
            <TextField
              fullWidth
              select
              label="Operational Shift"
              name="shift"
              value={formData.shift}
              onChange={handleChange}
              required
              sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'background.default' } }}
            >
              {SHIFTS.map(option => (
                <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
              ))}
            </TextField>
          </Box>

          <Autocomplete
            options={customers}
            getOptionLabel={(option) => `${option.name} (${option.customer_type})`}
            value={formData.customer}
            onChange={handleCustomerChange}
            loading={fetchingData}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Search Registered Customer..."
                required
                sx={{ '& .MuiOutlinedInput-root': { py: 1.5, fontSize: '1.1rem' } }}
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <React.Fragment>
                      {fetchingData ? <CircularProgress color="inherit" size={20} /> : null}
                      {params.InputProps.endAdornment}
                    </React.Fragment>
                  ),
                }}
              />
            )}
          />

          {customerSummary && (
            <Box sx={{ mt: 2, mb: 3, p: 2, bgcolor: 'rgba(225,29,72,0.05)', border: '1px solid rgba(225,29,72,0.1)', borderRadius: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 1 }}>Previous Unpaid Balance</Typography>
              <Typography variant="h6" sx={{ color: parseFloat(customerSummary.outstanding_balance || 0) > 0 ? "error.main" : "success.main", fontWeight: 800 }}>
                ₹ {parseFloat(customerSummary.outstanding_balance || 0).toLocaleString('en-IN', {maximumFractionDigits: 2})}
              </Typography>
            </Box>
          )}

          <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
            <TextField
              fullWidth
              select
              label="Product Type"
              name="milk_type"
              value={formData.milk_type}
              onChange={handleChange}
              required
            >
              {MILK_TYPES.map(option => (
                <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
              ))}
            </TextField>
            <TextField
              fullWidth
              label="Sale Quantity"
              name="quantity"
              type="number"
              value={formData.quantity}
              onChange={handleChange}
              required
              inputProps={{ step: "0.1", min: "0" }}
              InputProps={{
                endAdornment: <InputAdornment position="end">Liters</InputAdornment>,
              }}
            />
            <TextField
              fullWidth
              label="Selling Rate"
              name="applied_rate"
              type="number"
              value={formData.applied_rate}
              onChange={handleChange}
              required
              inputProps={{ step: "0.1", min: "0" }}
              InputProps={{
                startAdornment: <InputAdornment position="start">₹</InputAdornment>,
              }}
            />
          </Box>
          
          <Box sx={{ 
            mt: 4, 
            mb: 3, 
            p: 3, 
            bgcolor: 'primary.main', 
            color: 'white',
            borderRadius: 3, 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            boxShadow: '0 10px 15px -3px rgba(37,99,235,0.3)'
          }}>
            <Typography variant="h6" sx={{ fontWeight: 600, opacity: 0.9 }}>Total Invoice Value</Typography>
            <Typography variant="h3" sx={{ fontWeight: 800 }}>
              ₹ { totalAmount.toLocaleString('en-IN', {maximumFractionDigits: 2}) }
            </Typography>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2, color: 'text.secondary', textTransform: 'uppercase' }}>Payment Details</Typography>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              fullWidth
              select
              label="Settlement Status"
              name="payment_status"
              value={formData.payment_status}
              onChange={handleChange}
              required
              sx={{ flex: formData.payment_status === 'PARTIAL' ? 1 : 2 }}
            >
              {PAYMENT_STATUSES.map(option => (
                <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
              ))}
            </TextField>

            {formData.payment_status === 'PARTIAL' && (
              <TextField
                fullWidth
                label="Amount Collected Now"
                name="paid_amount"
                type="number"
                value={formData.paid_amount}
                onChange={handleChange}
                required
                inputProps={{ step: "0.01", min: "0" }}
                InputProps={{
                  startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                }}
                sx={{ flex: 1 }}
                helperText={<span style={{ fontWeight: 600 }}>Will Add To Due: ₹ {(totalAmount - parseFloat(formData.paid_amount || 0)).toFixed(2)}</span>}
              />
            )}
          </Box>

          <TextField
            fullWidth
            label="Internal Remarks / Reference ID (Optional)"
            name="remarks"
            value={formData.remarks}
            onChange={handleChange}
            margin="normal"
            sx={{ mt: 3 }}
          />

        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0, justifyContent: 'space-between' }}>
          <Button onClick={onClose} disabled={loading} sx={{ fontWeight: 600, color: 'text.secondary' }}>Cancel</Button>
          <Button type="submit" variant="contained" color="primary" disabled={loading} sx={{ px: 4, py: 1.5, fontWeight: 700, borderRadius: 2 }}>
            {loading ? 'Processing...' : 'Complete Transaction'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
