import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  CircularProgress
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { axiosPrivate } from '../../api/axios';

const farmerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  mobile_number: z.string().min(10, 'Enter a valid 10-digit mobile number').max(15),
  address: z.string().optional(),
  bank_account_number: z.string().optional(),
  bank_ifsc: z.string().optional(),
  upi_id: z.string().optional()
});

export default function AddFarmerModal({ open, onClose, onFarmerAdded }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(farmerSchema)
  });

  const onSubmit = async (data) => {
    let response;
    try {
      response = await axiosPrivate.post('/farmers/', data);
    } catch (err) {
      console.error('Failed to add farmer', err);
      alert('Failed to add farmer. Please try again.');
      return; // Stop execution on API failure
    }
    
    // UI Updates outside of try-catch to prevent masking React/JS runtime errors
    onFarmerAdded(response.data);
    reset();
    onClose();
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add New Farmer</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Full Name *"
                {...register('name')}
                error={!!errors.name}
                helperText={errors.name?.message}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Mobile Number *"
                {...register('mobile_number')}
                error={!!errors.mobile_number}
                helperText={errors.mobile_number?.message}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address"
                multiline
                rows={2}
                {...register('address')}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Bank Account Number"
                {...register('bank_account_number')}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Bank IFSC Code"
                {...register('bank_ifsc')}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="UPI ID"
                {...register('upi_id')}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={isSubmitting}>Cancel</Button>
          <Button 
            type="submit" 
            variant="contained" 
            disabled={isSubmitting}
            startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
          >
            Save Farmer
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
