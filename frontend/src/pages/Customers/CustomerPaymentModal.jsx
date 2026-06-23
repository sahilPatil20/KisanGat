import React, { useState } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  TextField, 
  Typography,
  Box,
  MenuItem
} from '@mui/material';
import { axiosPrivate } from '../../api/axios';

const PAYMENT_METHODS = [
  { value: 'CASH', label: 'Cash' },
  { value: 'BANK_TRANSFER', label: 'Bank Transfer' },
  { value: 'UPI', label: 'UPI' }
];

export default function CustomerPaymentModal({ open, onClose, customer, onSuccess }) {
  const [formData, setFormData] = useState({
    amount: '',
    payment_method: 'CASH',
    reference_number: '',
    remarks: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!customer) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (parseFloat(formData.amount) <= 0) {
      setError('Amount must be greater than zero.');
      return;
    }

    setLoading(true);
    try {
      await axiosPrivate.post(`/customers/${customer.id}/record-payment/`, {
        ...formData
      });
      setFormData({ amount: '', payment_method: 'CASH', reference_number: '', remarks: '' });
      onSuccess();
    } catch (err) {
      console.error('Error recording payment:', err);
      setError('Failed to record payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ bgcolor: 'success.main', color: 'white', mb: 2 }}>
        Receive Payment from {customer.name}
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Box sx={{ mb: 3, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
            <Typography variant="body2" color="textSecondary">Current Amount Owed</Typography>
            <Typography variant="h5" color="error.main" fontWeight="bold">
              ₹ {parseFloat(customer.current_balance || 0).toLocaleString('en-IN', {maximumFractionDigits: 2})}
            </Typography>
          </Box>

          {error && <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>}

          <TextField
            fullWidth
            label="Amount Received (₹)"
            name="amount"
            type="number"
            value={formData.amount}
            onChange={handleChange}
            required
            margin="normal"
            inputProps={{ step: "0.01", min: "0" }}
          />

          <TextField
            fullWidth
            select
            label="Payment Method"
            name="payment_method"
            value={formData.payment_method}
            onChange={handleChange}
            margin="normal"
            required
          >
            {PAYMENT_METHODS.map(option => (
              <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
            ))}
          </TextField>

          <TextField
            fullWidth
            label="Reference Number (e.g. UPI Txn ID)"
            name="reference_number"
            value={formData.reference_number}
            onChange={handleChange}
            margin="normal"
          />

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
          <Button type="submit" variant="contained" color="success" disabled={loading}>
            {loading ? 'Processing...' : 'Record Payment'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
