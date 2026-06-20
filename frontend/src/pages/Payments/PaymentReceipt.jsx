import React from 'react';
import { Box, Typography, Paper, Divider, Button } from '@mui/material';
import { Print as PrintIcon, ArrowBack as BackIcon } from '@mui/icons-material';

export default function PaymentReceipt({ payment, onBack }) {
  if (!payment) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', gap: 2, '@media print': { display: 'none' } }}>
        <Button startIcon={<BackIcon />} onClick={onBack}>
          Back to Payments
        </Button>
        <Button variant="contained" startIcon={<PrintIcon />} onClick={handlePrint}>
          Print Receipt
        </Button>
      </Box>

      <Paper 
        elevation={0} 
        sx={{ 
          maxWidth: 600, 
          mx: 'auto', 
          p: 4, 
          border: '1px solid #ccc',
          '@media print': { border: 'none', p: 0 }
        }}
      >
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Typography variant="h4" fontWeight="bold" color="primary" gutterBottom>
            KisanGat Dairy Co-operative
          </Typography>
          <Typography variant="subtitle1" color="textSecondary">
            Payment Receipt
          </Typography>
        </Box>

        <Divider sx={{ mb: 3 }} />

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="body1" color="textSecondary">Receipt No:</Typography>
          <Typography variant="body1" fontWeight="bold">#{payment.id}</Typography>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="body1" color="textSecondary">Date:</Typography>
          <Typography variant="body1" fontWeight="bold">
            {new Date(payment.created_at).toLocaleString()}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="body1" color="textSecondary">Farmer Name:</Typography>
          <Typography variant="body1" fontWeight="bold">{payment.farmer_name}</Typography>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
          <Typography variant="body1" color="textSecondary">Payment Method:</Typography>
          <Typography variant="body1" fontWeight="bold">
            {payment.payment_method.replace('_', ' ')}
          </Typography>
        </Box>

        <Box sx={{ bgcolor: 'grey.100', p: 3, borderRadius: 1, mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Amount Paid:</Typography>
            <Typography variant="h4" fontWeight="bold" color="success.main">
              ₹{parseFloat(payment.amount).toFixed(2)}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="body2" color="textSecondary" gutterBottom>Remarks:</Typography>
          <Typography variant="body1">{payment.remarks || 'N/A'}</Typography>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 8 }}>
          <Box sx={{ textAlign: 'center', width: '40%' }}>
            <Divider sx={{ mb: 1, borderColor: 'black' }} />
            <Typography variant="body2">Authorized Signatory</Typography>
          </Box>
          <Box sx={{ textAlign: 'center', width: '40%' }}>
            <Divider sx={{ mb: 1, borderColor: 'black' }} />
            <Typography variant="body2">Farmer Signature</Typography>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}
