import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, Grid, Divider, CircularProgress, 
  Button, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Chip, Tabs, Tab, Snackbar, Alert 
} from '@mui/material';
import { ArrowBack as ArrowBackIcon, Storefront as StorefrontIcon, Payment as PaymentIcon, Receipt as ReceiptIcon } from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { axiosPrivate } from '../../api/axios';
import CustomerPaymentModal from './CustomerPaymentModal';

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export default function CustomerProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [ledger, setLedger] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [toast, setToast] = useState({ open: false, message: '' });

  const fetchCustomerDetails = async () => {
    try {
      const [customerRes, ledgerRes] = await Promise.all([
        axiosPrivate.get(`/customers/${id}/`),
        axiosPrivate.get(`/customers/${id}/ledger/`)
      ]);
      setCustomer(customerRes.data);
      setLedger(ledgerRes.data);
    } catch (err) {
      console.error('Error fetching customer profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomerDetails();
  }, [id]);

  const handlePaymentSuccess = () => {
    setPaymentModalOpen(false);
    setToast({ open: true, message: 'Payment Recorded Successfully' });
    fetchCustomerDetails();
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}><CircularProgress /></Box>;
  }

  if (!customer) {
    return <Typography color="error">Customer not found.</Typography>;
  }

  const purchases = ledger.filter(l => l.transaction_type === 'SALE');
  const payments = ledger.filter(l => l.transaction_type === 'PAYMENT');
  const lifetimePurchases = purchases.reduce((sum, item) => sum + parseFloat(item.debit_amount), 0);
  const totalPayments = payments.reduce((sum, item) => sum + parseFloat(item.credit_amount), 0);
  const lastTransaction = ledger.length > 0 ? new Date(ledger[0].transaction_date).toLocaleString() : 'N/A';

  return (
    <Box>
      <Button 
        startIcon={<ArrowBackIcon />} 
        onClick={() => navigate('/customers')}
        sx={{ mb: 2 }}
      >
        Back to Customers List
      </Button>

      <Grid container spacing={3}>
        {/* Profile Card */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <StorefrontIcon sx={{ fontSize: 80, color: 'primary.main', mb: 2 }} />
            <Typography variant="h5" fontWeight="bold">{customer.name}</Typography>
            <Typography color="textSecondary" gutterBottom>{customer.customer_type}</Typography>
            <Typography color="textSecondary" gutterBottom>{customer.mobile_number}</Typography>
            
            <Divider sx={{ my: 2 }} />
            
            <Box sx={{ textAlign: 'left' }}>
              <Typography variant="subtitle2" color="textSecondary">Amount Owed to Us</Typography>
              <Typography variant="h4" color={parseFloat(customer.current_balance) > 0 ? 'error.main' : 'success.main'} sx={{ mb: 1 }}>
                ₹ {parseFloat(customer.current_balance || 0).toFixed(2)}
              </Typography>
              <Button 
                variant="contained" 
                color="success" 
                fullWidth 
                sx={{ mb: 3 }}
                onClick={() => setPaymentModalOpen(true)}
              >
                Receive Payment
              </Button>
              
              <Typography variant="subtitle2" color="textSecondary">Address</Typography>
              <Typography gutterBottom>{customer.address || 'N/A'}</Typography>
            </Box>
          </Paper>
        </Grid>

        {/* Details Area */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ width: '100%' }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs value={tabValue} onChange={handleTabChange} variant="scrollable" scrollButtons="auto">
                <Tab label="Overview" />
                <Tab label="Purchases" />
                <Tab label="Payments" />
                <Tab label="Ledger" />
                <Tab label="Bills" />
              </Tabs>
            </Box>

            <TabPanel value={tabValue} index={0}>
              <Grid container spacing={3} sx={{ px: 2 }}>
                <Grid item xs={12} sm={6}>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography color="textSecondary" gutterBottom>Current Balance</Typography>
                    <Typography variant="h5" color={parseFloat(customer.current_balance) > 0 ? 'error.main' : 'success.main'}>
                      ₹ {parseFloat(customer.current_balance || 0).toFixed(2)}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography color="textSecondary" gutterBottom>Lifetime Purchases</Typography>
                    <Typography variant="h5">₹ {lifetimePurchases.toFixed(2)}</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography color="textSecondary" gutterBottom>Total Payments Received</Typography>
                    <Typography variant="h5" color="success.main">₹ {totalPayments.toFixed(2)}</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography color="textSecondary" gutterBottom>Last Transaction Date</Typography>
                    <Typography variant="h6">{lastTransaction}</Typography>
                  </Paper>
                </Grid>
              </Grid>
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
              <TableContainer sx={{ px: 2 }}>
                <Table size="small">
                  <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell>Remarks</TableCell>
                      <TableCell align="right">Amount (₹)</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {purchases.map(p => (
                      <TableRow hover key={p.id}>
                        <TableCell>{new Date(p.transaction_date).toLocaleString()}</TableCell>
                        <TableCell>{p.remarks}</TableCell>
                        <TableCell align="right" sx={{ color: 'error.main', fontWeight: 'bold' }}>{p.debit_amount}</TableCell>
                      </TableRow>
                    ))}
                    {purchases.length === 0 && (
                      <TableRow><TableCell colSpan={3} align="center">No purchases yet.</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </TabPanel>

            <TabPanel value={tabValue} index={2}>
              <TableContainer sx={{ px: 2 }}>
                <Table size="small">
                  <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell>Remarks</TableCell>
                      <TableCell align="right">Amount Paid (₹)</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {payments.map(p => (
                      <TableRow hover key={p.id}>
                        <TableCell>{new Date(p.transaction_date).toLocaleString()}</TableCell>
                        <TableCell>{p.remarks}</TableCell>
                        <TableCell align="right" sx={{ color: 'success.main', fontWeight: 'bold' }}>{p.credit_amount}</TableCell>
                      </TableRow>
                    ))}
                    {payments.length === 0 && (
                      <TableRow><TableCell colSpan={3} align="center">No payments received yet.</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </TabPanel>

            <TabPanel value={tabValue} index={3}>
              <TableContainer sx={{ px: 2 }}>
                <Table size="small">
                  <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Remarks</TableCell>
                      <TableCell align="right">Debit (Owed) ₹</TableCell>
                      <TableCell align="right">Credit (Paid) ₹</TableCell>
                      <TableCell align="right">Balance (₹)</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {ledger.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                          No transactions found for this customer.
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
                                entry.transaction_type === 'SALE' ? 'error' : 
                                entry.transaction_type === 'PAYMENT' ? 'success' : 'default'
                              }
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell sx={{ fontSize: '0.85rem', color: 'text.secondary', maxWidth: 200 }}>
                            {entry.remarks}
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
            </TabPanel>

            <TabPanel value={tabValue} index={4}>
              <Box sx={{ p: 3, textAlign: 'center' }}>
                <ReceiptIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
                <Typography color="textSecondary">Billing functionality coming soon.</Typography>
              </Box>
            </TabPanel>
          </Paper>
        </Grid>
      </Grid>
      
      <CustomerPaymentModal 
        open={paymentModalOpen} 
        onClose={() => setPaymentModalOpen(false)} 
        customer={customer} 
        onSuccess={handlePaymentSuccess} 
      />

      <Snackbar 
        open={toast.open} 
        autoHideDuration={6000} 
        onClose={() => setToast({ ...toast, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setToast({ ...toast, open: false })} severity="success" sx={{ width: '100%' }}>
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
