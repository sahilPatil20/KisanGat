import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  CircularProgress,
  Box,
  Alert
} from '@mui/material';
import { axiosPrivate } from '../../api/axios';

export default function DeleteFarmerModal({ open, onClose, farmer, onFarmerDeleted }) {
  const [loading, setLoading] = useState(true);
  const [dependencies, setDependencies] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (open && farmer) {
      checkDependencies();
    } else {
      setDependencies(null);
      setError(null);
    }
  }, [open, farmer]);

  const checkDependencies = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosPrivate.get(`/farmers/${farmer.id}/dependencies/`);
      setDependencies(response.data);
    } catch (err) {
      console.error('Failed to check dependencies', err);
      setError('Failed to check for associated records. Deletion cannot proceed safely.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    setError(null);
    try {
      await axiosPrivate.delete(`/farmers/${farmer.id}/`);
      onFarmerDeleted(farmer.id);
      onClose();
    } catch (err) {
      console.error('Failed to delete farmer', err);
      setError(err.response?.data?.detail || 'Failed to delete farmer. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  if (!farmer) return null;

  return (
    <Dialog open={open} onClose={isDeleting ? undefined : onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Delete Farmer</DialogTitle>
      <DialogContent dividers>
        <Typography variant="subtitle1" gutterBottom>
          <strong>{farmer.name}</strong> ({farmer.mobile_number})
        </Typography>

        {loading ? (
          <Box display="flex" flexDirection="column" alignItems="center" my={3}>
            <CircularProgress size={30} sx={{ mb: 2 }} />
            <Typography color="textSecondary">Checking for dependencies...</Typography>
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>
        ) : dependencies && !dependencies.can_delete ? (
          <Alert severity="warning" sx={{ mt: 2 }}>
            This farmer cannot be deleted because they are associated with existing records.
            <ul style={{ margin: '8px 0 0', paddingLeft: '20px' }}>
              {dependencies.dependencies.ledger_entries > 0 && (
                <li>{dependencies.dependencies.ledger_entries} Ledger Transactions</li>
              )}
            </ul>
            <Typography variant="body2" sx={{ mt: 1 }}>
              Please remove or transfer related records before deletion, or keep the farmer active.
            </Typography>
          </Alert>
        ) : (
          <Alert severity="error" sx={{ mt: 2 }}>
            Are you sure you want to delete this farmer?
            <br /><br />
            This action will hide the farmer from the active directory. This action is auditable.
          </Alert>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isDeleting} color="inherit">
          Cancel
        </Button>
        <Button 
          onClick={handleDelete} 
          disabled={loading || isDeleting || (dependencies && !dependencies.can_delete) || !!error}
          color="error" 
          variant="contained"
        >
          {isDeleting ? <CircularProgress size={24} color="inherit" /> : 'Confirm Delete'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
