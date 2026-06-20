import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, CircularProgress,
  Chip, Tabs, Tab, Button
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
    <Box>
      <Typography variant="h4" fontWeight="bold" color="primary" sx={{ mb: 3 }}>
        Farmer Payments & Settlements
      </Typography>

      <Paper sx={{ width: '100%', mb: 2 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="Pending Dues (Bulk Settle)" />
            <Tab label="Payment History" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <GeneratePayments onSuccess={() => setTabValue(1)} />
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <TableContainer sx={{ maxHeight: 'calc(100vh - 250px)' }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Farmer</TableCell>
                  <TableCell>Method</TableCell>
                  <TableCell>Ref Number</TableCell>
                  <TableCell align="right">Amount (₹)</TableCell>
                  <TableCell align="center">Action</TableCell>
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
                      <Typography color="textSecondary">No payments recorded yet.</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  payments.map((payment) => (
                    <TableRow hover key={payment.id}>
                      <TableCell>{new Date(payment.created_at).toLocaleString()}</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>{payment.farmer_name}</TableCell>
                      <TableCell>
                        <Chip 
                          label={payment.payment_method.replace('_', ' ')} 
                          size="small" 
                          color="secondary"
                          variant="outlined" 
                        />
                      </TableCell>
                      <TableCell>{payment.reference_number || '-'}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold', color: 'error.main' }}>
                        {parseFloat(payment.amount).toFixed(2)}
                      </TableCell>
                      <TableCell align="center">
                        <Button 
                          size="small" 
                          startIcon={<PrintIcon />} 
                          onClick={() => setSelectedReceipt(payment)}
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
      </Paper>
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
