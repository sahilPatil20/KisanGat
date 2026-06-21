import React, { useState, useEffect } from 'react';
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
  Typography,
  Grid,
  Divider
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
  
  const [summary, setSummary] = useState(null);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (open && farmer) {
      // Reset form
      setFormData({
        amount: '',
        payment_method: 'CASH',
        reference_number: '',
        remarks: ''
      });
      setError(null);
      fetchSummary();
    }
  }, [open, farmer]);

  const fetchSummary = async () => {
    setLoadingSummary(true);
    try {
      const response = await axiosPrivate.get(`/payments/farmer-summary/?farmer_id=${farmer.id}`);
      setSummary(response.data);
      // Auto-fill the payable amount
      setFormData(prev => ({
        ...prev,
        amount: response.data.pending_balance > 0 ? response.data.pending_balance.toString() : ''
      }));
    } catch (err) {
      console.error('Failed to fetch farmer summary', err);
      setError('Could not calculate pending balance automatically.');
    } finally {
      setLoadingSummary(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payAmount = parseFloat(formData.amount);
    
    if (!payAmount || payAmount <= 0) {
      setError('Please enter a valid amount greater than 0.');
      return;
    }

    if (summary && payAmount > summary.pending_balance) {
      setError(`Amount exceeds payable balance of ₹${summary.pending_balance}`);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await axiosPrivate.post('/payments/', {
        farmer: farmer.id,
        amount: payAmount,
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
            <Typography variant="subtitle2" color="textSecondary">Farmer Details</Typography>
            <Typography variant="h6">{farmer.name} ({farmer.mobile_number})</Typography>
            
            <Divider sx={{ my: 1.5 }} />

            {loadingSummary ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <CircularProgress size={20} />
                <Typography variant="body2" color="textSecondary">Calculating balance...</Typography>
              </Box>
            ) : summary ? (
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="textSecondary">Total Milk Supplied</Typography>
                  <Typography variant="body1" fontWeight="medium">{summary.total_liters} Liters</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="textSecondary">Gross Amount Earned</Typography>
                  <Typography variant="body1" fontWeight="medium">₹ {summary.gross_amount}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="textSecondary">Already Paid</Typography>
                  <Typography variant="body1" fontWeight="medium">₹ {summary.already_paid}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="error.main">Net Payable Balance</Typography>
                  <Typography variant="h6" color="error.main" fontWeight="bold">₹ {summary.pending_balance}</Typography>
                </Grid>
              </Grid>
            ) : (
              <Typography variant="body2" color="error">Failed to load summary</Typography>
            )}
          </Box>

          <TextField
            fullWidth
            label="Payment Amount (₹)"
            name="amount"
            type="number"
            value={formData.amount}
            onChange={handleChange}
            required
            inputProps={{ step: "0.01", min: "0.01", max: summary?.pending_balance > 0 ? summary.pending_balance : undefined }}
            margin="normal"
            autoFocus
            disabled={loadingSummary}
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
          
          <TextField
            fullWidth
            label="Remarks"
            name="remarks"
            value={formData.remarks}
            onChange={handleChange}
            margin="normal"
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
            disabled={loading || loadingSummary || (summary && summary.pending_balance <= 0)}
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
          >
            {loading ? 'Processing...' : 'Record Payment'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
