import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Button,
  Chip,
  Card,
  Grid,
  CardContent,
  Avatar
} from '@mui/material';
import { Add as AddIcon, Receipt as ReceiptIcon, AccountBalanceWallet as WalletIcon } from '@mui/icons-material';
import { axiosPrivate } from '../../api/axios';
import AddSaleModal from './AddSaleModal';
import ErrorBoundary from '../../components/ErrorBoundary';
import { formatDate } from '../../utils/formatDate';
import StatusBadge from '../../components/StatusBadge';

function SalesList() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchSales = async () => {
    try {
      const response = await axiosPrivate.get('/sales/');
      const data = response.data.results !== undefined ? response.data.results : response.data;
      if (Array.isArray(data)) {
        setSales(data);
      } else {
        console.error('Expected array of sales, got:', data);
        setSales([]);
      }
    } catch (err) {
      console.error('Error fetching sales:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSales();
  }, []);

  const handleSaleSuccess = () => {
    setModalOpen(false);
    fetchSales();
  };

  const todaySales = sales.filter(s => s.sale_date === new Date().toISOString().split('T')[0]);
  const totalVolume = todaySales.reduce((sum, s) => sum + parseFloat(s.quantity), 0);
  const totalRevenue = todaySales.reduce((sum, s) => sum + parseFloat(s.total_amount), 0);

  return (
    <Box sx={{ p: { xs: 1, md: 2 } }}>
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' }, mb: 4, gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary' }}>
            Milk Sales & Billing
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Record customer sales, track invoices, and manage revenue.
          </Typography>
        </Box>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />}
          onClick={() => setModalOpen(true)}
          sx={{ borderRadius: '8px', px: 3, py: 1 }}
        >
          New Point of Sale
        </Button>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6}>
          <Card sx={{ borderRadius: '16px', border: '1px solid rgba(16,185,129,0.1)', boxShadow: '0 4px 12px rgba(16,185,129,0.05)' }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 3, '&:last-child': { pb: 3 } }}>
              <Box>
                <Typography color="text.secondary" variant="caption" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>Today's Volume Sold</Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, color: '#10B981', mt: 0.5 }}>{totalVolume.toFixed(1)} L</Typography>
              </Box>
              <Avatar sx={{ bgcolor: 'rgba(16,185,129,0.1)', color: '#10B981', width: 56, height: 56 }}>
                <ReceiptIcon fontSize="large" />
              </Avatar>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Card sx={{ borderRadius: '16px', border: '1px solid rgba(37,99,235,0.1)', boxShadow: '0 4px 12px rgba(37,99,235,0.05)' }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 3, '&:last-child': { pb: 3 } }}>
              <Box>
                <Typography color="text.secondary" variant="caption" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>Today's Revenue</Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, color: 'primary.main', mt: 0.5 }}>₹{totalRevenue.toLocaleString('en-IN', {maximumFractionDigits: 2})}</Typography>
              </Box>
              <Avatar sx={{ bgcolor: 'rgba(37,99,235,0.1)', color: 'primary.main', width: 56, height: 56 }}>
                <WalletIcon fontSize="large" />
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
                <TableCell sx={{ fontWeight: 700, color: 'text.secondary', bgcolor: 'background.paper' }}>Invoice Date</TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'text.secondary', bgcolor: 'background.paper' }}>Customer</TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'text.secondary', bgcolor: 'background.paper' }}>Details</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700, color: 'text.secondary', bgcolor: 'background.paper' }}>Qty (L)</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700, color: 'text.secondary', bgcolor: 'background.paper' }}>Rate (₹)</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700, color: 'text.secondary', bgcolor: 'background.paper' }}>Total (₹)</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : sales.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                    <Typography color="text.secondary">No sales recorded yet. Click 'New Point of Sale' to begin.</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                sales.map((sale) => (
                  <TableRow hover key={sale.id}>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{formatDate(sale.sale_date)}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ fontWeight: 700 }}>{sale.customer_name}</Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <StatusBadge status={sale.shift} />
                        <StatusBadge status={sale.milk_type} />
                        <StatusBadge status={sale.payment_status} /> {/* FIXED: payment_status badge */}
                      </Box>
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, fontSize: '1.1rem' }}>{sale.quantity}</TableCell>
                    <TableCell align="right" sx={{ color: 'text.secondary', fontWeight: 600 }}>₹{sale.applied_rate}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 800, color: 'success.main', fontSize: '1.1rem' }}>
                      ₹ {parseFloat(sale.total_amount).toLocaleString('en-IN', {maximumFractionDigits: 2})}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
      
      <AddSaleModal 
        open={modalOpen} 
        onClose={() => setModalOpen(false)} 
        onSuccess={handleSaleSuccess} 
      />
    </Box>
  );
}

export default function SalesListWithErrorBoundary() {
  return (
    <ErrorBoundary>
      <SalesList />
    </ErrorBoundary>
  );
}
