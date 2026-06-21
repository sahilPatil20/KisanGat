import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Checkbox, CircularProgress,
  Alert, MenuItem, TextField, Dialog, DialogTitle, DialogContent, DialogActions,
  Chip
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
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>Farmers Awaiting Payment</Typography>
          <Chip label={`${dues.length} Total`} size="small" sx={{ bgcolor: 'rgba(37,99,235,0.1)', color: 'primary.main', fontWeight: 700 }} />
        </Box>
        <Button 
          variant="contained" 
          color="primary"
          startIcon={<WalletIcon />}
          disabled={selected.length === 0}
          onClick={() => setModalOpen(true)}
          sx={{ borderRadius: '8px', py: 1.2, px: 3, fontWeight: 700, boxShadow: '0 4px 14px 0 rgba(37,99,235,0.39)' }}
        >
          Settle Selected (₹ {selectedTotal.toLocaleString('en-IN', {maximumFractionDigits: 2})})
        </Button>
      </Box>

      <TableContainer sx={{ border: '1px solid rgba(226,232,240,1)', borderRadius: '12px' }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: '#f8fafc' }}>
              <TableCell padding="checkbox">
                <Checkbox
                  indeterminate={selected.length > 0 && selected.length < dues.length}
                  checked={dues.length > 0 && selected.length === dues.length}
                  onChange={handleSelectAll}
                  color="primary"
                />
              </TableCell>
              <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>Farmer Name</TableCell>
              <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>Contact</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, color: 'text.secondary' }}>Amount Due</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {dues.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 6 }}>
                  <Typography color="text.secondary" sx={{ fontWeight: 500 }}>No pending dues found. All farmers are settled!</Typography>
                </TableCell>
              </TableRow>
            ) : (
              dues.map((due) => {
                const isSelected = selected.includes(due.farmer_id);
                return (
                  <TableRow 
                    hover 
                    key={due.farmer_id} 
                    selected={isSelected}
                    sx={{ '&.Mui-selected': { bgcolor: 'rgba(37,99,235,0.04)' } }}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={isSelected}
                        onChange={(e) => handleSelectOne(e, due.farmer_id)}
                        color="primary"
                      />
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{due.farmer_name}</TableCell>
                    <TableCell sx={{ color: 'text.secondary' }}>{due.phone || 'N/A'}</TableCell>
                    <TableCell align="right" sx={{ color: 'error.main', fontWeight: 800, fontSize: '1.1rem' }}>
                      ₹ {parseFloat(due.due_amount).toLocaleString('en-IN', {maximumFractionDigits: 2})}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Confirmation Modal */}
      <Dialog 
        open={modalOpen} 
        onClose={() => !processing && setModalOpen(false)}
        PaperProps={{ sx: { borderRadius: 3, width: '100%', maxWidth: 500 } }}
      >
        <DialogTitle sx={{ fontWeight: 800, fontSize: '1.5rem', pb: 1 }}>Settle Dues</DialogTitle>
        <DialogContent dividers sx={{ p: 4 }}>
          <Typography sx={{ color: 'text.secondary', mb: 1 }}>
            You are about to issue payments for <strong>{selected.length}</strong> selected farmers.
          </Typography>
          
          <Box sx={{ bgcolor: 'rgba(5,150,105,0.1)', color: '#059669', p: 3, borderRadius: '12px', mb: 4, textAlign: 'center' }}>
            <Typography variant="overline" sx={{ fontWeight: 700, opacity: 0.8 }}>Total Outflow</Typography>
            <Typography variant="h3" sx={{ fontWeight: 800 }}>₹ {selectedTotal.toLocaleString('en-IN', {maximumFractionDigits: 2})}</Typography>
          </Box>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField
              select
              label="Payment Method"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              fullWidth
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            >
              <MenuItem value="CASH">Cash</MenuItem>
              <MenuItem value="BANK_TRANSFER">Bank Transfer</MenuItem>
              <MenuItem value="UPI">UPI</MenuItem>
            </TextField>
            <TextField
              label="Remarks / Reference"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              fullWidth
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, display: 'flex', justifyContent: 'space-between' }}>
          <Button onClick={() => setModalOpen(false)} disabled={processing} sx={{ fontWeight: 600, color: 'text.secondary' }}>Cancel</Button>
          <Button 
            onClick={handleBulkSettle} 
            variant="contained" 
            color="primary"
            disabled={processing}
            sx={{ fontWeight: 700, px: 4, py: 1.5, borderRadius: '8px' }}
          >
            {processing ? <CircularProgress size={24} color="inherit" /> : 'Confirm & Process Payment'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
