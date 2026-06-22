import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
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
  CardContent,
  Avatar,
  Chip
} from '@mui/material';
import { Add as AddIcon, Visibility as VisibilityIcon, People as PeopleIcon, AccountBalanceWallet as WalletIcon, WarningAmber as WarningIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { axiosPrivate } from '../../api/axios';
import StatusBadge from '../../components/StatusBadge';

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
    <Box sx={{ p: { xs: 1, md: 2 } }}>
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' }, mb: 4, gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary' }}>
            Customers Directory
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Manage buyers, track outstanding balances, and handle profiles.
          </Typography>
        </Box>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />}
          onClick={() => setOpenModal(true)}
          sx={{ borderRadius: '8px', px: 3, py: 1 }}
        >
          Add Customer
        </Button>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: '16px', border: '1px solid rgba(37,99,235,0.1)', boxShadow: '0 4px 12px rgba(37,99,235,0.05)' }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 3, '&:last-child': { pb: 3 } }}>
              <Box>
                <Typography color="text.secondary" variant="caption" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>Total Customers</Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, color: 'primary.main', mt: 0.5 }}>{totalCustomers}</Typography>
              </Box>
              <Avatar sx={{ bgcolor: 'rgba(37,99,235,0.1)', color: 'primary.main', width: 56, height: 56 }}>
                <PeopleIcon fontSize="large" />
              </Avatar>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: '16px', border: '1px solid rgba(16,185,129,0.1)', boxShadow: '0 4px 12px rgba(16,185,129,0.05)' }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 3, '&:last-child': { pb: 3 } }}>
              <Box>
                <Typography color="text.secondary" variant="caption" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>Active Customers</Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, color: '#10B981', mt: 0.5 }}>{activeCustomers}</Typography>
              </Box>
              <Avatar sx={{ bgcolor: 'rgba(16,185,129,0.1)', color: '#10B981', width: 56, height: 56 }}>
                <PeopleIcon fontSize="large" />
              </Avatar>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: '16px', border: '1px solid rgba(225,29,72,0.1)', boxShadow: '0 4px 12px rgba(225,29,72,0.05)' }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 3, '&:last-child': { pb: 3 } }}>
              <Box>
                <Typography color="text.secondary" variant="caption" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>Outstanding Balance</Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, color: '#E11D48', mt: 0.5 }}>₹{outstandingBalance.toLocaleString('en-IN', {maximumFractionDigits: 0})}</Typography>
              </Box>
              <Avatar sx={{ bgcolor: 'rgba(225,29,72,0.1)', color: '#E11D48', width: 56, height: 56 }}>
                <WalletIcon fontSize="large" />
              </Avatar>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: '16px', border: '1px solid rgba(245,158,11,0.1)', boxShadow: '0 4px 12px rgba(245,158,11,0.05)' }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 3, '&:last-child': { pb: 3 } }}>
              <Box>
                <Typography color="text.secondary" variant="caption" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>Pending Dues</Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, color: '#F59E0B', mt: 0.5 }}>{customersWithDues}</Typography>
              </Box>
              <Avatar sx={{ bgcolor: 'rgba(245,158,11,0.1)', color: '#F59E0B', width: 56, height: 56 }}>
                <WarningIcon fontSize="large" />
              </Avatar>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card sx={{ borderRadius: '16px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }}>
        <TableContainer sx={{ maxHeight: 'calc(100vh - 350px)' }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, color: 'text.secondary', bgcolor: 'background.paper' }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'text.secondary', bgcolor: 'background.paper' }}>Contact</TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'text.secondary', bgcolor: 'background.paper' }}>Type</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700, color: 'text.secondary', bgcolor: 'background.paper' }}>Balance Owed (₹)</TableCell>
                <TableCell align="center" sx={{ fontWeight: 700, color: 'text.secondary', bgcolor: 'background.paper' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 6 }}><CircularProgress /></TableCell>
                </TableRow>
              ) : !Array.isArray(customers) || customers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                    <Typography color="text.secondary">No customers found. Click 'Add Customer' to create one.</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                customers.map((customer) => (
                  <TableRow hover key={customer.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32, fontSize: '0.9rem', fontWeight: 700 }}>
                          {customer.name[0]?.toUpperCase()}
                        </Avatar>
                        <Typography sx={{ fontWeight: 700 }}>{customer.name}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ color: 'text.secondary' }}>{customer.mobile_number}</TableCell>
                    <TableCell>
                      <StatusBadge status={customer.customer_type} />
                    </TableCell>
                    <TableCell align="right">
                      <Typography sx={{ fontWeight: 800, color: parseFloat(customer.current_balance) > 0 ? 'error.main' : 'success.main', fontSize: '1.1rem' }}>
                        ₹ {parseFloat(customer.current_balance).toLocaleString('en-IN', {maximumFractionDigits: 2})}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Button 
                        variant="outlined" 
                        size="small"
                        startIcon={<VisibilityIcon />}
                        onClick={() => navigate(`/customers/${customer.id}`)}
                        sx={{ borderRadius: 2, fontWeight: 600, textTransform: 'none' }}
                      >
                        Profile
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 800, fontSize: '1.5rem', pb: 1 }}>Register Customer</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent dividers sx={{ p: 4, pt: 3 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <TextField fullWidth label="Full Name" name="name" value={formData.name} onChange={handleChange} required sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
              <TextField fullWidth label="Mobile Number" name="mobile_number" value={formData.mobile_number} onChange={handleChange} required sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
              <TextField fullWidth label="Address" name="address" value={formData.address} onChange={handleChange} multiline rows={2} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
              <TextField fullWidth select label="Customer Type" name="customer_type" value={formData.customer_type} onChange={handleChange} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}>
                {CUSTOMER_TYPES.map(option => (
                  <MenuItem key={option.value} value={option.value} sx={{ fontWeight: 500 }}>{option.label}</MenuItem>
                ))}
              </TextField>
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 2, justifyContent: 'space-between' }}>
            <Button onClick={() => setOpenModal(false)} sx={{ fontWeight: 600, color: 'text.secondary' }}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary" sx={{ px: 4, py: 1.5, borderRadius: 2, fontWeight: 700 }}>Save Customer</Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}
