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
  Chip,
  Card,
  CardContent,
  Avatar,
  IconButton
} from '@mui/material';
import { 
  ArrowBack as ArrowBackIcon, 
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  AccountBalance as BankIcon,
  Payment as PaymentIcon,
  Timeline as TimelineIcon,
  LocalDrink as DrinkIcon
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { axiosPrivate } from '../../api/axios';
import RecordPaymentModal from './RecordPaymentModal';
import { formatDate } from '../../utils/formatDate';
import StatusBadge from '../../components/StatusBadge';

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

  const getInitials = (name) => {
    if (!name) return 'F';
    return name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase();
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>;
  }

  if (!farmer) {
    return <Box sx={{ p: 3 }}><Typography color="error">Farmer not found.</Typography></Box>;
  }

  return (
    <Box sx={{ p: { xs: 1, md: 2 } }}>
      <Button 
        startIcon={<ArrowBackIcon />} 
        onClick={() => navigate('/farmers')}
        sx={{ mb: 3, fontWeight: 600, color: 'text.secondary' }}
      >
        Back to Directory
      </Button>

      <Grid container spacing={3}>
        {/* Profile Details Card */}
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: '16px', border: '1px solid rgba(226, 232, 240, 0.8)', mb: 3 }}>
            <CardContent sx={{ p: 4, textAlign: 'center' }}>
              <Avatar 
                sx={{ 
                  width: 80, 
                  height: 80, 
                  bgcolor: 'primary.main', 
                  color: 'white', 
                  fontSize: '2rem', 
                  fontWeight: 700, 
                  mx: 'auto', 
                  mb: 2,
                  boxShadow: '0 4px 14px 0 rgba(37,99,235,0.39)'
                }}
              >
                {getInitials(farmer.name)}
              </Avatar>
              <Typography variant="h5" sx={{ fontWeight: 800 }}>{farmer.name}</Typography>
              <Box sx={{ mt: 1 }}><StatusBadge status="ACTIVE" /></Box>
              
              <Box sx={{ mt: 4, p: 2, bgcolor: 'background.default', borderRadius: '12px', textAlign: 'left' }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 1 }}>
                  Current Balance
                </Typography>
                <Typography variant="h3" sx={{ 
                  fontWeight: 800, 
                  color: parseFloat(farmer.current_balance) < 0 ? 'error.main' : 'success.main',
                  mt: 0.5
                }}>
                  ₹ {parseFloat(farmer.current_balance).toLocaleString('en-IN', {maximumFractionDigits: 2})}
                </Typography>
                <Button 
                  variant="contained" 
                  fullWidth 
                  startIcon={<PaymentIcon />}
                  sx={{ mt: 2, py: 1.5, borderRadius: '8px', fontWeight: 700 }}
                  onClick={() => setPaymentModalOpen(true)}
                >
                  Settle Payment
                </Button>
              </Box>

              <Divider sx={{ my: 3 }} />
              
              <Box sx={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: 'rgba(37,99,235,0.1)', color: 'primary.main', width: 36, height: 36 }}>
                    <PhoneIcon fontSize="small" />
                  </Avatar>
                  <Box>
                    <Typography variant="caption" color="text.secondary" display="block">Mobile Number</Typography>
                    <Typography variant="body2" fontWeight="600">{farmer.mobile_number || 'N/A'}</Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: 'rgba(37,99,235,0.1)', color: 'primary.main', width: 36, height: 36 }}>
                    <LocationIcon fontSize="small" />
                  </Avatar>
                  <Box>
                    <Typography variant="caption" color="text.secondary" display="block">Address</Typography>
                    <Typography variant="body2" fontWeight="600">{farmer.address || 'N/A'}</Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: 'rgba(37,99,235,0.1)', color: 'primary.main', width: 36, height: 36 }}>
                    <BankIcon fontSize="small" />
                  </Avatar>
                  <Box>
                    <Typography variant="caption" color="text.secondary" display="block">Bank Account</Typography>
                    <Typography variant="body2" fontWeight="600">{farmer.bank_account_number ? `${farmer.bank_account_number} (${farmer.bank_ifsc})` : 'N/A'}</Typography>
                    {farmer.upi_id && <Typography variant="caption" color="text.secondary">UPI: {farmer.upi_id}</Typography>}
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Ledger & Analytics Section */}
        <Grid item xs={12} md={8}>
          <Grid container spacing={3} sx={{ mb: 3 }}>
             <Grid item xs={12} sm={6}>
               <Card sx={{ borderRadius: '16px', height: '100%' }}>
                 <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: 'rgba(5,150,105,0.1)', color: '#059669', width: 48, height: 48 }}>
                      <DrinkIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>TOTAL SUPPLIED</Typography>
                      <Typography variant="h5" sx={{ fontWeight: 800 }}>-- L</Typography>
                    </Box>
                 </CardContent>
               </Card>
             </Grid>
             <Grid item xs={12} sm={6}>
               <Card sx={{ borderRadius: '16px', height: '100%' }}>
                 <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: 'rgba(124,58,237,0.1)', color: '#7C3AED', width: 48, height: 48 }}>
                      <TimelineIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>TOTAL EARNINGS</Typography>
                      <Typography variant="h5" sx={{ fontWeight: 800 }}>--</Typography>
                    </Box>
                 </CardContent>
               </Card>
             </Grid>
          </Grid>

          <Card sx={{ borderRadius: '16px', height: 'auto', minHeight: 400 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 3 }}>Transaction History</Typography>
              <TableContainer>
                <Table size="medium">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Date</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Type</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600, color: 'text.secondary' }}>Debit (₹)</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600, color: 'text.secondary' }}>Credit (₹)</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600, color: 'text.secondary' }}>Balance (₹)</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {ledger.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                          <Typography color="text.secondary">No transactions found for this farmer.</Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      ledger.map((entry) => (
                        <TableRow key={entry.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                          <TableCell sx={{ fontWeight: 500 }}>
                            {formatDate(entry.transaction_date)}
                            <Typography variant="caption" display="block" color="text.secondary">
                              {new Date(entry.transaction_date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={entry.transaction_type} />
                          </TableCell>
                          <TableCell align="right" sx={{ color: 'error.main', fontWeight: 600 }}>
                            {parseFloat(entry.debit_amount) > 0 ? parseFloat(entry.debit_amount).toLocaleString('en-IN', {maximumFractionDigits: 2}) : '-'}
                          </TableCell>
                          <TableCell align="right" sx={{ color: 'success.main', fontWeight: 600 }}>
                            {parseFloat(entry.credit_amount) > 0 ? parseFloat(entry.credit_amount).toLocaleString('en-IN', {maximumFractionDigits: 2}) : '-'}
                          </TableCell>
                          <TableCell align="right" sx={{ fontWeight: 800 }}>
                            ₹ {parseFloat(entry.running_balance).toLocaleString('en-IN', {maximumFractionDigits: 2})}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
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
