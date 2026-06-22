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
  Chip,
  Grid,
  Card,
  CardContent,
  Snackbar,
  Alert,
  Avatar
} from '@mui/material';
import { Add as AddIcon, LocalDrink as DrinkIcon, People as PeopleIcon } from '@mui/icons-material';
import { axiosPrivate } from '../../api/axios';
import AddCollectionModal from './AddCollectionModal';
import { formatDate } from '../../utils/formatDate';
import StatusBadge from '../../components/StatusBadge';

export default function CollectionsList() {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    fetchCollections();
  }, []);

  const fetchCollections = async () => {
    try {
      const response = await axiosPrivate.get('/collections/');
      setCollections(response.data.results !== undefined ? response.data.results : response.data);
    } catch (err) {
      console.error('Error fetching collections:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCollectionAdded = (newCollection) => {
    setCollections(prev => Array.isArray(prev) ? [newCollection, ...prev] : [newCollection]);
    setToastMessage('Collection Saved Successfully!');
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>;
  }

  return (
    <Box sx={{ p: { xs: 1, md: 2 } }}>
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' }, mb: 4, gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary' }}>Milk Collections</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>Log daily milk entries and track shift collections.</Typography>
        </Box>
        <Button 
          variant="contained" 
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => setIsAddModalOpen(true)}
          sx={{ borderRadius: '8px', px: 3, py: 1 }}
        >
          Fast Collection Entry
        </Button>
      </Box>

      {/* Real-time Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <Card sx={{ borderRadius: '16px', border: '1px solid rgba(37,99,235,0.1)', boxShadow: '0 4px 12px rgba(37,99,235,0.05)' }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 3, '&:last-child': { pb: 3 } }}>
              <Box>
                <Typography color="text.secondary" variant="caption" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>Today's Cow Milk</Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, color: 'primary.main', mt: 0.5 }}>
                  {(Array.isArray(collections) ? collections : [])
                    .filter(c => c.collection_date === new Date().toISOString().split('T')[0] && c.milk_type === 'COW')
                    .reduce((sum, c) => sum + parseFloat(c.quantity || 0), 0).toFixed(1)} L
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: 'rgba(37,99,235,0.1)', color: 'primary.main', width: 56, height: 56 }}>
                <DrinkIcon fontSize="large" />
              </Avatar>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ borderRadius: '16px', border: '1px solid rgba(124,58,237,0.1)', boxShadow: '0 4px 12px rgba(124,58,237,0.05)' }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 3, '&:last-child': { pb: 3 } }}>
              <Box>
                <Typography color="text.secondary" variant="caption" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>Today's Buffalo Milk</Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, color: '#7C3AED', mt: 0.5 }}>
                  {(Array.isArray(collections) ? collections : [])
                    .filter(c => c.collection_date === new Date().toISOString().split('T')[0] && c.milk_type === 'BUFFALO')
                    .reduce((sum, c) => sum + parseFloat(c.quantity || 0), 0).toFixed(1)} L
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: 'rgba(124,58,237,0.1)', color: '#7C3AED', width: 56, height: 56 }}>
                <DrinkIcon fontSize="large" />
              </Avatar>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ borderRadius: '16px', border: '1px solid rgba(217,119,6,0.1)', boxShadow: '0 4px 12px rgba(217,119,6,0.05)' }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 3, '&:last-child': { pb: 3 } }}>
              <Box>
                <Typography color="text.secondary" variant="caption" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>Farmers Covered Today</Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, color: '#D97706', mt: 0.5 }}>
                  {new Set(
                    (Array.isArray(collections) ? collections : [])
                      .filter(c => c.collection_date === new Date().toISOString().split('T')[0])
                      .map(c => c.farmer_id || c.farmer_name)
                  ).size}
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: 'rgba(217,119,6,0.1)', color: '#D97706', width: 56, height: 56 }}>
                <PeopleIcon fontSize="large" />
              </Avatar>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card sx={{ borderRadius: '16px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'background.default' }}>
                <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>Date & Shift</TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>Farmer Info</TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>Type</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700, color: 'text.secondary' }}>Qty (L)</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700, color: 'text.secondary' }}>FAT/SNF</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700, color: 'text.secondary' }}>Rate (₹)</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700, color: 'text.secondary' }}>Total Amount</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {!Array.isArray(collections) || collections.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                    <Typography color="text.secondary">No milk collections logged yet.</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                collections.map((collection) => (
                  <TableRow key={collection.id} hover>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{formatDate(collection.collection_date)}</Typography>
                      <Box sx={{ mt: 0.5 }}><StatusBadge status={collection.shift} /></Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>{collection.farmer_name}</Typography>
                      <Typography variant="caption" color="text.secondary">{collection.farmer_mobile}</Typography>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={collection.milk_type} />
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, fontSize: '1.1rem' }}>{collection.quantity}</TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{collection.fat_percentage} %</Typography>
                      <Typography variant="caption" color="text.secondary">{collection.snf_percentage || '-'} %</Typography>
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600, color: 'text.secondary' }}>₹ {collection.applied_rate}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 800, color: 'success.main', fontSize: '1.1rem' }}>
                      ₹ {parseFloat(collection.total_amount).toLocaleString('en-IN', {maximumFractionDigits: 2})}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      <AddCollectionModal 
        open={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onCollectionAdded={handleCollectionAdded}
      />
      
      <Snackbar 
        open={!!toastMessage} 
        autoHideDuration={4000} 
        onClose={() => setToastMessage('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setToastMessage('')} severity="success" sx={{ width: '100%', borderRadius: 2, fontWeight: 600, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
          {toastMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}
