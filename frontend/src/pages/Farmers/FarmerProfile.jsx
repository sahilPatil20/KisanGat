import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper,
  Grid,
  Divider,
  CircularProgress,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip
} from '@mui/material';
import { ArrowBack as ArrowBackIcon, AccountCircle } from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { axiosPrivate } from '../../api/axios';
import RecordPaymentModal from './RecordPaymentModal';

export default function FarmerProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [farmer, setFarmer] = useState(null);
  const [ledger, setLedger] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);

  const fetchFarmerDetails = async () => {
    try {
      const [farmerRes, ledgerRes] = await Promise.all([
        axiosPrivate.get(`/farmers/${id}/`),
        axiosPrivate.get(`/farmers/${id}/ledger/`)
      ]);
      setFarmer(farmerRes.data);
      setLedger(ledgerRes.data);
    } catch (err) {
      console.error('Error fetching farmer profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFarmerDetails();
  }, [id]);

  const handlePaymentSuccess = () => {
    setPaymentModalOpen(false);
    fetchFarmerDetails();
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}><CircularProgress /></Box>;
  }

  if (!farmer) {
    return <Typography color="error">Farmer not found.</Typography>;
  }

  return (
    <Box>
      <Button 
        startIcon={<ArrowBackIcon />} 
        onClick={() => navigate('/farmers')}
        sx={{ mb: 2 }}
      >
        Back to Farmers List
      </Button>

      <Grid container spacing={3}>
        {/* Profile Card */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <AccountCircle sx={{ fontSize: 80, color: 'primary.main', mb: 2 }} />
            <Typography variant="h5" fontWeight="bold">{farmer.name}</Typography>
            <Typography color="textSecondary" gutterBottom>{farmer.mobile_number}</Typography>
            
            <Divider sx={{ my: 2 }} />
            
            <Box sx={{ textAlign: 'left' }}>
              <Typography variant="subtitle2" color="textSecondary">Current Balance</Typography>
              <Typography variant="h4" color={parseFloat(farmer.current_balance) < 0 ? 'error.main' : 'success.main'} sx={{ mb: 1 }}>
                ₹ {farmer.current_balance}
              </Typography>
              <Button 
                variant="contained" 
                color="secondary" 
                fullWidth 
                sx={{ mb: 3 }}
                onClick={() => setPaymentModalOpen(true)}
              >
                Pay Farmer
              </Button>
              
              <Typography variant="subtitle2" color="textSecondary">Address</Typography>
              <Typography gutterBottom>{farmer.address || 'N/A'}</Typography>
              
              <Typography variant="subtitle2" color="textSecondary" sx={{ mt: 1 }}>Bank A/C</Typography>
              <Typography gutterBottom>{farmer.bank_account_number || 'N/A'}</Typography>
              
              <Typography variant="subtitle2" color="textSecondary" sx={{ mt: 1 }}>IFSC</Typography>
              <Typography gutterBottom>{farmer.bank_ifsc || 'N/A'}</Typography>
              
              <Typography variant="subtitle2" color="textSecondary" sx={{ mt: 1 }}>UPI ID</Typography>
              <Typography>{farmer.upi_id || 'N/A'}</Typography>
            </Box>
          </Paper>
        </Grid>

        {/* Ledger Table */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" fontWeight="bold" mb={2}>Transaction Ledger</Typography>
            <TableContainer>
              <Table size="small">
                <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell align="right">Debit (₹)</TableCell>
                    <TableCell align="right">Credit (₹)</TableCell>
                    <TableCell align="right">Balance (₹)</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {ledger.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                        No transactions found for this farmer.
                      </TableCell>
                    </TableRow>
                  ) : (
                    ledger.map((entry) => (
                      <TableRow key={entry.id} hover>
                        <TableCell>{new Date(entry.transaction_date).toLocaleString()}</TableCell>
                        <TableCell>
                          <Chip 
                            label={entry.transaction_type} 
                            size="small"
                            color={
                              entry.transaction_type === 'COLLECTION' ? 'primary' : 
                              entry.transaction_type === 'PAYMENT' ? 'error' : 'default'
                            }
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell align="right" sx={{ color: 'error.main' }}>
                          {parseFloat(entry.debit_amount) > 0 ? entry.debit_amount : '-'}
                        </TableCell>
                        <TableCell align="right" sx={{ color: 'success.main' }}>
                          {parseFloat(entry.credit_amount) > 0 ? entry.credit_amount : '-'}
                        </TableCell>
                        <TableCell align="right" fontWeight="bold">{entry.running_balance}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
      
      <RecordPaymentModal 
        open={paymentModalOpen} 
        onClose={() => setPaymentModalOpen(false)} 
        farmer={farmer} 
        onSuccess={handlePaymentSuccess} 
      />
    </Box>
  );
}
