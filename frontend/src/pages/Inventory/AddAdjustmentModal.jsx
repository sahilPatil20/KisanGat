import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, MenuItem, Typography, Box,
  CircularProgress, Alert
} from '@mui/material';
import { axiosPrivate } from '../../api/axios';

const MILK_TYPES = [
  { value: 'COW', label: 'Cow Milk' },
  { value: 'BUFFALO', label: 'Buffalo Milk' }
];

const ADJUSTMENT_TYPES = [
  { value: 'ADD', label: 'Add Stock (+)' },
  { value: 'SUBTRACT', label: 'Subtract Stock (-)' }
];

const REASON_CHOICES = [
  { value: 'SPOILAGE', label: 'Spoilage' },
  { value: 'LEAKAGE', label: 'Leakage' },
  { value: 'TESTING', label: 'Testing' },
  { value: 'PERSONAL_USE', label: 'Personal Use' },
  { value: 'DONATION', label: 'Donation' },
  { value: 'MANUAL_CORRECTION', label: 'Manual Correction' },
  { value: 'OTHER', label: 'Other' },
];

export default function AddAdjustmentModal({ open, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    adjustment_type: 'SUBTRACT',
    milk_type: 'COW',
    quantity: '',
    reason: 'SPOILAGE',
    remarks: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Reset form when opened
  useEffect(() => {
    if (open) {
      setFormData({
        adjustment_type: 'SUBTRACT',
        milk_type: 'COW',
        quantity: '',
        reason: 'SPOILAGE',
        remarks: '',
      });
      setError('');
    }
  }, [open]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await axiosPrivate.post('/inventory/adjustments/', formData);
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.detail || err.response?.data?.message || 'Failed to record adjustment');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Record Inventory Adjustment</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent dividers>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          {formData.adjustment_type === 'SUBTRACT' && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              Warning: You are about to reduce inventory stock manually. This action is permanently logged.
            </Alert>
          )}

          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <TextField
              select
              label="Adjustment Type"
              name="adjustment_type"
              value={formData.adjustment_type}
              onChange={handleChange}
              fullWidth
              required
            >
              {ADJUSTMENT_TYPES.map(option => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="Milk Type"
              name="milk_type"
              value={formData.milk_type}
              onChange={handleChange}
              fullWidth
              required
            >
              {MILK_TYPES.map(option => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Box>

          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <TextField
              label="Quantity (Liters)"
              name="quantity"
              type="number"
              inputProps={{ step: "0.01", min: "0.1" }}
              value={formData.quantity}
              onChange={handleChange}
              fullWidth
              required
            />
            
            <TextField
              select
              label="Reason"
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              fullWidth
              required
            >
              {REASON_CHOICES.map(option => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Box>

          <TextField
            label="Remarks (Optional)"
            name="remarks"
            value={formData.remarks}
            onChange={handleChange}
            fullWidth
            multiline
            rows={2}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={loading}>Cancel</Button>
          <Button 
            type="submit" 
            variant="contained" 
            color={formData.adjustment_type === 'SUBTRACT' ? 'error' : 'primary'}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Save Adjustment'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
