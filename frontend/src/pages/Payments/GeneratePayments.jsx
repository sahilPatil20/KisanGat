import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Checkbox, CircularProgress,
  Alert, MenuItem, TextField, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import { AccountBalanceWallet as WalletIcon } from '@mui/icons-material';
import { axiosPrivate } from '../../api/axios';

export default function GeneratePayments({ onSuccess }) {
  const [dues, setDues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Selection
  const [selected, setSelected] = useState([]);
  
  // Bulk Settle Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [remarks, setRemarks] = useState('Automated Bulk Settlement');
  const [processing, setProcessing] = useState(false);

  const fetchDues = async () => {
    setLoading(true);
    try {
      const response = await axiosPrivate.get('/payments/pending-dues/');
      setDues(response.data);
      setError('');
      // Select all by default
      setSelected(response.data.map(d => d.farmer_id));
    } catch (err) {
      console.error(err);
      setError('Failed to load pending dues.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDues();
  }, []);

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelected(dues.map(d => d.farmer_id));
    } else {
      setSelected([]);
    }
  };

  const handleSelectOne = (event, id) => {
    if (event.target.checked) {
      setSelected([...selected, id]);
    } else {
      setSelected(selected.filter(selectedId => selectedId !== id));
    }
  };

  const handleBulkSettle = async () => {
    setProcessing(true);
    try {
      const payload = {
        farmer_ids: selected,
        payment_method: paymentMethod,
        remarks: remarks
      };
      await axiosPrivate.post('/payments/bulk-settle/', payload);
      setModalOpen(false);
      fetchDues();
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || 'Bulk settlement failed.');
      setModalOpen(false);
    } finally {
      setProcessing(false);
    }
  };

  const selectedTotal = dues
    .filter(d => selected.includes(d.farmer_id))
    .reduce((sum, d) => sum + parseFloat(d.due_amount), 0);

  if (loading) {
    return <CircularProgress sx={{ display: 'block', mx: 'auto', mt: 4 }} />;
  }

  return (
    <Box>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Pending Dues ({dues.length} Farmers)</Typography>
        <Button 
          variant="contained" 
          color="primary"
          startIcon={<WalletIcon />}
          disabled={selected.length === 0}
          onClick={() => setModalOpen(true)}
        >
          Settle Selected (₹{selectedTotal.toFixed(2)})
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  indeterminate={selected.length > 0 && selected.length < dues.length}
                  checked={dues.length > 0 && selected.length === dues.length}
                  onChange={handleSelectAll}
                />
              </TableCell>
              <TableCell>Farmer Name</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold' }}>Amount Due (₹)</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {dues.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                  No pending dues found. All farmers are settled!
                </TableCell>
              </TableRow>
            ) : (
              dues.map((due) => {
                const isSelected = selected.includes(due.farmer_id);
                return (
                  <TableRow hover key={due.farmer_id} selected={isSelected}>
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={isSelected}
                        onChange={(e) => handleSelectOne(e, due.farmer_id)}
                      />
                    </TableCell>
                    <TableCell>{due.farmer_name}</TableCell>
                    <TableCell>{due.phone}</TableCell>
                    <TableCell align="right" sx={{ color: 'error.main', fontWeight: 'bold' }}>
                      {parseFloat(due.due_amount).toFixed(2)}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Confirmation Modal */}
      <Dialog open={modalOpen} onClose={() => !processing && setModalOpen(false)}>
        <DialogTitle>Confirm Bulk Settlement</DialogTitle>
        <DialogContent dividers>
          <Typography gutterBottom>
            You are about to settle dues for <strong>{selected.length}</strong> farmers.
          </Typography>
          <Typography variant="h6" color="primary" gutterBottom>
            Total Payout: ₹{selectedTotal.toFixed(2)}
          </Typography>
          
          <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              select
              label="Payment Method"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              fullWidth
            >
              <MenuItem value="CASH">Cash</MenuItem>
              <MenuItem value="BANK_TRANSFER">Bank Transfer</MenuItem>
              <MenuItem value="UPI">UPI</MenuItem>
            </TextField>
            <TextField
              label="Remarks"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setModalOpen(false)} disabled={processing}>Cancel</Button>
          <Button 
            onClick={handleBulkSettle} 
            variant="contained" 
            color="primary"
            disabled={processing}
          >
            {processing ? <CircularProgress size={24} color="inherit" /> : 'Confirm Payment'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
