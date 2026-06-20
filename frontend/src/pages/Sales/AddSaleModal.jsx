import React, { useState, useEffect } from 'react';
import { 
  Dialog, DialogTitle, DialogContent, DialogActions, 
  Button, TextField, MenuItem, Typography, Box, 
  CircularProgress, Alert, Divider
} from '@mui/material';
import { axiosPrivate } from '../../api/axios';

const MILK_TYPES = [
  { value: 'COW', label: 'Cow' },
  { value: 'BUFFALO', label: 'Buffalo' },
  { value: 'MIXED', label: 'Mixed' }
];

const SHIFTS = [
  { value: 'MORNING', label: 'Morning' },
  { value: 'EVENING', label: 'Evening' }
];

const PAYMENT_STATUSES = [
  { value: 'DUE', label: 'Due' },
  { value: 'PARTIAL', label: 'Partial' },
  { value: 'PAID', label: 'Paid' }
];

export default function AddSaleModal({ open, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    sale_date: new Date().toISOString().split('T')[0],
    shift: new Date().getHours() < 12 ? 'MORNING' : 'EVENING',
    customer: '',
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

  useEffect(() => {
    if (open) {
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
      fetchData();
      
      // Reset form on open
      setFormData({
        sale_date: new Date().toISOString().split('T')[0],
        shift: new Date().getHours() < 12 ? 'MORNING' : 'EVENING',
        customer: '',
        milk_type: 'COW',
        quantity: '',
        applied_rate: '',
        payment_status: 'DUE',
        paid_amount: '',
        remarks: ''
      });
      setError('');
    }
  }, [open]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const totalAmount = parseFloat(formData.quantity || 0) * parseFloat(formData.applied_rate || 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
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
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white', mb: 2 }}>
        Record Milk Sale
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          {error && <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>}

          {showInventoryWarning && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              Warning: Sale quantity ({quantity}L) exceeds current available inventory ({availableInventory.toFixed(2)}L). Please verify stock levels before continuing.
            </Alert>
          )}

          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <TextField
              fullWidth
              label="Sale Date"
              name="sale_date"
              type="date"
              value={formData.sale_date}
              onChange={handleChange}
              required
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              fullWidth
              select
              label="Shift"
              name="shift"
              value={formData.shift}
              onChange={handleChange}
              required
            >
              {SHIFTS.map(option => (
                <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
              ))}
            </TextField>
          </Box>

          <TextField
            fullWidth
            select
            label="Customer"
            name="customer"
            value={formData.customer}
            onChange={handleChange}
            required
            margin="normal"
            disabled={fetchingData}
          >
            {fetchingData ? (
              <MenuItem value=""><CircularProgress size={20} /></MenuItem>
            ) : (
              (Array.isArray(customers) ? customers : []).map(customer => (
                <MenuItem key={customer.id} value={customer.id}>
                  {customer.name} ({customer.customer_type})
                </MenuItem>
              ))
            )}
          </TextField>

          <TextField
            fullWidth
            select
            label="Milk Type"
            name="milk_type"
            value={formData.milk_type}
            onChange={handleChange}
            margin="normal"
            required
          >
            {MILK_TYPES.map(option => (
              <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
            ))}
          </TextField>

          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <TextField
              fullWidth
              label="Quantity (Liters)"
              name="quantity"
              type="number"
              value={formData.quantity}
              onChange={handleChange}
              required
              inputProps={{ step: "0.1", min: "0" }}
            />
            <TextField
              fullWidth
              label="Sale Rate (₹/L)"
              name="applied_rate"
              type="number"
              value={formData.applied_rate}
              onChange={handleChange}
              required
              inputProps={{ step: "0.1", min: "0" }}
            />
          </Box>
          
          <Box sx={{ mt: 3, mb: 2, p: 2, bgcolor: '#e3f2fd', borderRadius: 1, textAlign: 'right', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body1" color="textSecondary">Total Amount:</Typography>
            <Typography variant="h5" color="primary" fontWeight="bold">
              ₹ { totalAmount.toFixed(2) }
            </Typography>
          </Box>

          <Divider sx={{ my: 2 }} />

          <TextField
            fullWidth
            select
            label="Payment Status"
            name="payment_status"
            value={formData.payment_status}
            onChange={handleChange}
            margin="normal"
            required
          >
            {PAYMENT_STATUSES.map(option => (
              <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
            ))}
          </TextField>

          {formData.payment_status === 'PARTIAL' && (
            <TextField
              fullWidth
              label="Paid Amount (₹)"
              name="paid_amount"
              type="number"
              value={formData.paid_amount}
              onChange={handleChange}
              required
              margin="normal"
              inputProps={{ step: "0.01", min: "0" }}
              helperText={`Due Amount: ₹ ${(totalAmount - parseFloat(formData.paid_amount || 0)).toFixed(2)}`}
            />
          )}

          <TextField
            fullWidth
            label="Remarks (Optional)"
            name="remarks"
            value={formData.remarks}
            onChange={handleChange}
            margin="normal"
            multiline
            rows={2}
          />

        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button onClick={onClose} disabled={loading}>Cancel</Button>
          <Button type="submit" variant="contained" color="primary" disabled={loading}>
            {loading ? 'Saving...' : 'Record Sale'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
