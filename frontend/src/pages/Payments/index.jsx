import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, CircularProgress,
  Chip, Tabs, Tab, Button, Card, CardContent
} from '@mui/material';
import { Print as PrintIcon } from '@mui/icons-material';
import { axiosPrivate } from '../../api/axios';
import ErrorBoundary from '../../components/ErrorBoundary';
import GeneratePayments from './GeneratePayments';
import PaymentReceipt from './PaymentReceipt';

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

function PaymentsModule() {
  const [tabValue, setTabValue] = useState(0);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const response = await axiosPrivate.get('/payments/');
      const data = response.data.results !== undefined ? response.data.results : response.data;
      setPayments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching payments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    if (newValue === 1) {
      fetchPayments();
    }
  };

  if (selectedReceipt) {
    return <PaymentReceipt payment={selectedReceipt} onBack={() => setSelectedReceipt(null)} />;
  }

  return (
    <Box sx={{ p: { xs: 1, md: 2 } }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary' }}>
          Farmer Settlements
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Manage farmer dues, execute bulk payments, and review transaction history.
        </Typography>
      </Box>

      <Card sx={{ borderRadius: '16px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)', overflow: 'hidden' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'rgba(248, 250, 252, 0.8)' }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange}
            sx={{
              '& .MuiTabs-indicator': { height: 3, borderRadius: '3px 3px 0 0' },
              '& .MuiTab-root': { fontWeight: 700, fontSize: '0.95rem', py: 2.5 }
            }}
          >
            <Tab label="Pending Dues (Bulk Settle)" />
            <Tab label="Payment History" />
          </Tabs>
        </Box>

        <CardContent sx={{ p: { xs: 2, md: 4 } }}>
          <TabPanel value={tabValue} index={0} sx={{ pt: 0 }}>
            <GeneratePayments onSuccess={() => setTabValue(1)} />
          </TabPanel>

          <TabPanel value={tabValue} index={1} sx={{ pt: 0 }}>
            <TableContainer sx={{ maxHeight: 'calc(100vh - 350px)' }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, color: 'text.secondary', bgcolor: 'background.paper' }}>Date & Time</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: 'text.secondary', bgcolor: 'background.paper' }}>Farmer</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: 'text.secondary', bgcolor: 'background.paper' }}>Payment Method</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: 'text.secondary', bgcolor: 'background.paper' }}>Ref Number</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, color: 'text.secondary', bgcolor: 'background.paper' }}>Amount Settled (₹)</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700, color: 'text.secondary', bgcolor: 'background.paper' }}>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 5 }}>
                        <CircularProgress />
                      </TableCell>
                    </TableRow>
                  ) : !Array.isArray(payments) || payments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 5 }}>
                        <Typography color="text.secondary">No payment history available.</Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    payments.map((payment) => (
                      <TableRow hover key={payment.id}>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>{new Date(payment.created_at).toLocaleDateString()}</Typography>
                          <Typography variant="caption" color="text.secondary">{new Date(payment.created_at).toLocaleTimeString()}</Typography>
                        </TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>{payment.farmer_name}</TableCell>
                        <TableCell>
                          <Chip 
                            label={payment.payment_method.replace('_', ' ')} 
                            size="small" 
                            sx={{ 
                              bgcolor: 'rgba(124,58,237,0.1)', 
                              color: '#7C3AED',
                              fontWeight: 700
                            }}
                          />
                        </TableCell>
                        <TableCell sx={{ color: 'text.secondary' }}>{payment.reference_number || '-'}</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 800, color: 'error.main', fontSize: '1.1rem' }}>
                          ₹ {parseFloat(payment.amount).toLocaleString('en-IN', {maximumFractionDigits: 2})}
                        </TableCell>
                        <TableCell align="center">
                          <Button 
                            size="small" 
                            startIcon={<PrintIcon />} 
                            onClick={() => setSelectedReceipt(payment)}
                            sx={{ fontWeight: 600, color: 'text.secondary', '&:hover': { bgcolor: 'rgba(37,99,235,0.05)', color: 'primary.main' } }}
                          >
                            Receipt
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>
        </CardContent>
      </Card>
    </Box>
  );
}

export default function PaymentsModuleWithErrorBoundary() {
  return (
    <ErrorBoundary>
      <PaymentsModule />
    </ErrorBoundary>
  );
}
