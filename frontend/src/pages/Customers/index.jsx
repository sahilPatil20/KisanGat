import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Grid,
  Card,
  CardContent
} from '@mui/material';
import { Add as AddIcon, Visibility as VisibilityIcon, People as PeopleIcon, AccountBalanceWallet as WalletIcon, WarningAmber as WarningIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { axiosPrivate } from '../../api/axios';

const CUSTOMER_TYPES = [
  { value: 'RETAIL', label: 'Retail' },
  { value: 'WHOLESALE', label: 'Wholesale' },
  { value: 'HOTEL', label: 'Hotel' },
  { value: 'SHOP', label: 'Shop' }
];

export default function CustomersList() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    mobile_number: '',
    address: '',
    customer_type: 'RETAIL'
  });
  const navigate = useNavigate();

  const fetchCustomers = async () => {
    try {
      const response = await axiosPrivate.get('/customers/');
      const data = response.data.results !== undefined ? response.data.results : response.data;
      if (Array.isArray(data)) {
        setCustomers(data);
      } else {
        console.error('Expected array of customers, got:', data);
        setCustomers([]);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axiosPrivate.post('/customers/', formData);
      setOpenModal(false);
      setFormData({ name: '', mobile_number: '', address: '', customer_type: 'RETAIL' });
      fetchCustomers();
    } catch (error) {
      console.error('Error adding customer:', error);
    }
  };

  const totalCustomers = customers.length;
  const activeCustomers = customers.length; // API filters deleted
  const outstandingBalance = customers.reduce((sum, c) => sum + parseFloat(c.current_balance || 0), 0);
  const customersWithDues = customers.filter(c => parseFloat(c.current_balance || 0) > 0).length;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold" color="primary">
          Customers
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />}
          onClick={() => setOpenModal(true)}
        >
          Add Customer
        </Button>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'primary.main', color: 'white' }}>
            <CardContent>
              <Typography variant="subtitle2" sx={{ opacity: 0.8 }}>Total Customers</Typography>
              <Typography variant="h4" sx={{ mt: 1, mb: 1, fontWeight: 'bold' }}>{totalCustomers}</Typography>
              <PeopleIcon sx={{ position: 'absolute', right: 20, top: 20, opacity: 0.3, fontSize: 40 }} />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'success.main', color: 'white' }}>
            <CardContent>
              <Typography variant="subtitle2" sx={{ opacity: 0.8 }}>Active Customers</Typography>
              <Typography variant="h4" sx={{ mt: 1, mb: 1, fontWeight: 'bold' }}>{activeCustomers}</Typography>
              <PeopleIcon sx={{ position: 'absolute', right: 20, top: 20, opacity: 0.3, fontSize: 40 }} />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'error.main', color: 'white' }}>
            <CardContent>
              <Typography variant="subtitle2" sx={{ opacity: 0.8 }}>Outstanding Balance</Typography>
              <Typography variant="h4" sx={{ mt: 1, mb: 1, fontWeight: 'bold' }}>₹{outstandingBalance.toFixed(2)}</Typography>
              <WalletIcon sx={{ position: 'absolute', right: 20, top: 20, opacity: 0.3, fontSize: 40 }} />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'warning.main', color: 'white' }}>
            <CardContent>
              <Typography variant="subtitle2" sx={{ opacity: 0.8 }}>Customers With Dues</Typography>
              <Typography variant="h4" sx={{ mt: 1, mb: 1, fontWeight: 'bold' }}>{customersWithDues}</Typography>
              <WarningIcon sx={{ position: 'absolute', right: 20, top: 20, opacity: 0.3, fontSize: 40 }} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer sx={{ maxHeight: 'calc(100vh - 200px)' }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Mobile</TableCell>
                <TableCell>Type</TableCell>
                <TableCell align="right">Balance Owed (₹)</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 3 }}><CircularProgress /></TableCell>
                </TableRow>
              ) : !Array.isArray(customers) || customers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                    No customers found. Click 'Add Customer' to create one.
                  </TableCell>
                </TableRow>
              ) : (
                customers.map((customer) => (
                  <TableRow hover key={customer.id}>
                    <TableCell sx={{ fontWeight: 'bold' }}>{customer.name}</TableCell>
                    <TableCell>{customer.mobile_number}</TableCell>
                    <TableCell>{customer.customer_type}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold', color: parseFloat(customer.current_balance) > 0 ? 'error.main' : 'success.main' }}>
                      {customer.current_balance}
                    </TableCell>
                    <TableCell align="center">
                      <Button 
                        variant="outlined" 
                        size="small"
                        startIcon={<VisibilityIcon />}
                        onClick={() => navigate(`/customers/${customer.id}`)}
                      >
                        View Profile
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white', mb: 2 }}>Add New Customer</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <TextField fullWidth label="Full Name" name="name" value={formData.name} onChange={handleChange} required margin="normal" />
            <TextField fullWidth label="Mobile Number" name="mobile_number" value={formData.mobile_number} onChange={handleChange} required margin="normal" />
            <TextField fullWidth label="Address" name="address" value={formData.address} onChange={handleChange} margin="normal" multiline rows={2} />
            <TextField fullWidth select label="Customer Type" name="customer_type" value={formData.customer_type} onChange={handleChange} margin="normal">
              {CUSTOMER_TYPES.map(option => (
                <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
              ))}
            </TextField>
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 0 }}>
            <Button onClick={() => setOpenModal(false)}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary">Add Customer</Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}
