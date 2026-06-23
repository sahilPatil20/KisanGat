import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import {
  AccountBalanceWallet as WalletIcon,
  Payments as PaymentsIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import { axiosPrivate } from '../../api/axios';
import CustomerPaymentModal from './CustomerPaymentModal';

export default function CustomerDues() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const navigate = useNavigate();

  const fetchCustomers = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axiosPrivate.get('/customers/');
      const data = response.data.results ?? response.data;
      setCustomers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load customer dues', err);
      setError('Unable to load customer dues. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const customersWithDues = useMemo(
    () => customers
      .filter((customer) => Number(customer.current_balance || 0) > 0)
      .sort((a, b) => Number(b.current_balance) - Number(a.current_balance)),
    [customers]
  );

  const totalOutstanding = customersWithDues.reduce(
    (sum, customer) => sum + Number(customer.current_balance || 0),
    0
  );

  const handlePaymentSuccess = () => {
    setSelectedCustomer(null);
    fetchCustomers();
  };

  return (
    <Box sx={{ p: { xs: 1, md: 2 } }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>
          Customer Dues
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Review outstanding customer balances and record received payments.
        </Typography>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' }, gap: 3, mb: 4 }}>
        <Card sx={{ borderRadius: 3 }}>
          <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 3 }}>
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>
                Total Outstanding
              </Typography>
              <Typography variant="h4" color="error.main" sx={{ fontWeight: 800, mt: 0.5 }}>
                ₹ {totalOutstanding.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
              </Typography>
            </Box>
            <Avatar sx={{ bgcolor: 'error.light', color: 'error.main', width: 56, height: 56 }}>
              <WalletIcon />
            </Avatar>
          </CardContent>
        </Card>

        <Card sx={{ borderRadius: 3 }}>
          <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 3 }}>
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>
                Customers With Dues
              </Typography>
              <Typography variant="h4" color="warning.main" sx={{ fontWeight: 800, mt: 0.5 }}>
                {customersWithDues.length}
              </Typography>
            </Box>
            <Avatar sx={{ bgcolor: 'warning.light', color: 'warning.dark', width: 56, height: 56 }}>
              <PaymentsIcon />
            </Avatar>
          </CardContent>
        </Card>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <Card sx={{ borderRadius: 3 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Customer</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Contact</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>Amount Due</TableCell>
                <TableCell align="center" sx={{ fontWeight: 700 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 6 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : customersWithDues.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 6 }}>
                    <Typography color="text.secondary">All customer balances are settled.</Typography>
                  </TableCell>
                </TableRow>
              ) : customersWithDues.map((customer) => (
                <TableRow hover key={customer.id}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar sx={{ bgcolor: 'primary.main', width: 34, height: 34 }}>
                        {customer.name?.[0]?.toUpperCase()}
                      </Avatar>
                      <Box>
                        <Typography sx={{ fontWeight: 700 }}>{customer.name}</Typography>
                        <Typography variant="caption" color="text.secondary">{customer.customer_type}</Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>{customer.mobile_number}</TableCell>
                  <TableCell align="right">
                    <Typography color="error.main" sx={{ fontWeight: 800 }}>
                      ₹ {Number(customer.current_balance).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, flexWrap: 'wrap' }}>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<VisibilityIcon />}
                        onClick={() => navigate(`/customers/${customer.id}`)}
                      >
                        Profile
                      </Button>
                      <Button
                        size="small"
                        variant="contained"
                        color="success"
                        startIcon={<PaymentsIcon />}
                        onClick={() => setSelectedCustomer(customer)}
                      >
                        Record Payment
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      <CustomerPaymentModal
        open={Boolean(selectedCustomer)}
        customer={selectedCustomer}
        onClose={() => setSelectedCustomer(null)}
        onSuccess={handlePaymentSuccess}
      />
    </Box>
  );
}
