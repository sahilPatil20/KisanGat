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
  Chip
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { axiosPrivate } from '../../api/axios';
import AddSaleModal from './AddSaleModal';
import ErrorBoundary from '../../components/ErrorBoundary';

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

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold" color="primary">
          Milk Sales
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />}
          onClick={() => setModalOpen(true)}
        >
          Record Sale
        </Button>
      </Box>

      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer sx={{ maxHeight: 'calc(100vh - 200px)' }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Shift</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell>Milk Type</TableCell>
                <TableCell align="right">Qty (L)</TableCell>
                <TableCell align="right">Rate (₹)</TableCell>
                <TableCell align="right">Total (₹)</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 5 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : sales.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 5 }}>
                    <Typography color="textSecondary">No sales recorded yet.</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                sales.map((sale) => (
                  <TableRow hover key={sale.id}>
                    <TableCell>{new Date(sale.sale_date).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Chip 
                        label={sale.shift} 
                        size="small" 
                        color={sale.shift === 'MORNING' ? 'warning' : 'primary'}
                        variant="outlined" 
                      />
                    </TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>{sale.customer_name}</TableCell>
                    <TableCell>{sale.milk_type}</TableCell>
                    <TableCell align="right">{sale.quantity}</TableCell>
                    <TableCell align="right">{sale.applied_rate}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                      {sale.total_amount}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
      
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
