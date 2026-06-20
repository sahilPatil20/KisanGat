import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  CircularProgress,
  Alert,
  Box,
  Typography
} from '@mui/material';
import { axiosPrivate } from '../../api/axios';

const PAYMENT_METHODS = [
  { value: 'CASH', label: 'Cash' },
  { value: 'BANK_TRANSFER', label: 'Bank Transfer' },
  { value: 'UPI', label: 'UPI' }
];

export default function RecordPaymentModal({ open, onClose, farmer, onSuccess }) {
  const [formData, setFormData] = useState({
    amount: '',
    payment_method: 'CASH',
    reference_number: '',
    remarks: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      setError('Please enter a valid amount.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await axiosPrivate.post('/payments/', {
        farmer: farmer.id,
        amount: parseFloat(formData.amount),
        payment_method: formData.payment_method,
        reference_number: formData.reference_number,
        remarks: formData.remarks
      });
      onSuccess();
    } catch (err) {
      console.error('Error recording payment:', err);
      setError(err.response?.data?.detail || 'Failed to record payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!farmer) return null;

  return (
    <Dialog open={open} onClose={!loading ? onClose : undefined} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white', mb: 2 }}>
        Record Payment
      </DialogTitle>
      
      <form onSubmit={handleSubmit}>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          
          <Box sx={{ mb: 3, p: 2, bgcolor: '#f8f9fa', borderRadius: 1 }}>
            <Typography variant="subtitle2" color="textSecondary">Farmer</Typography>
            <Typography variant="h6">{farmer.name} ({farmer.mobile_number})</Typography>
            
            <Typography variant="subtitle2" color="textSecondary" sx={{ mt: 1 }}>Current Balance Owed</Typography>
            <Typography variant="h5" color="error.main" fontWeight="bold">
              ₹ {farmer.current_balance}
            </Typography>
          </Box>

          <TextField
            fullWidth
            label="Payment Amount (₹)"
            name="amount"
            type="number"
            value={formData.amount}
            onChange={handleChange}
            required
            inputProps={{ step: "0.01", min: "0.01", max: farmer.current_balance > 0 ? farmer.current_balance : undefined }}
            margin="normal"
            autoFocus
          />

          <TextField
            fullWidth
            select
            label="Payment Method"
            name="payment_method"
            value={formData.payment_method}
            onChange={handleChange}
            required
            margin="normal"
          >
            {PAYMENT_METHODS.map((method) => (
              <MenuItem key={method.value} value={method.value}>
                {method.label}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            fullWidth
            label="Reference Number (Transaction ID)"
            name="reference_number"
            value={formData.reference_number}
            onChange={handleChange}
            margin="normal"
            placeholder="e.g. UTR / Cheque No."
          />

        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            variant="contained" 
            color="primary"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
          >
            Record Payment
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
