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
  Chip
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { axiosPrivate } from '../../api/axios';
import AddCollectionModal from './AddCollectionModal';

export default function CollectionsList() {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

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
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}><CircularProgress /></Box>;
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">Milk Collections</Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={() => setIsAddModalOpen(true)}
        >
          Add Collection
        </Button>
      </Box>

      <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #eee' }}>
        <Table>
          <TableHead sx={{ bgcolor: '#f8f9fa' }}>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Shift</TableCell>
              <TableCell>Farmer</TableCell>
              <TableCell>Type</TableCell>
              <TableCell align="right">Qty (L)</TableCell>
              <TableCell align="right">FAT/SNF</TableCell>
              <TableCell align="right">Rate (₹)</TableCell>
              <TableCell align="right">Total Amount (₹)</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {!Array.isArray(collections) || collections.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                  No milk collections logged yet.
                </TableCell>
              </TableRow>
            ) : (
              collections.map((collection) => (
                <TableRow key={collection.id} hover>
                  <TableCell>{collection.collection_date}</TableCell>
                  <TableCell>
                    <Chip 
                      label={collection.shift} 
                      size="small" 
                      color={collection.shift === 'MORNING' ? 'primary' : 'secondary'} 
                      variant="outlined" 
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">{collection.farmer_name}</Typography>
                    <Typography variant="caption" color="textSecondary">{collection.farmer_mobile}</Typography>
                  </TableCell>
                  <TableCell>{collection.milk_type}</TableCell>
                  <TableCell align="right" fontWeight="medium">{collection.quantity}</TableCell>
                  <TableCell align="right">
                    {collection.fat_percentage} / {collection.snf_percentage || '-'}
                  </TableCell>
                  <TableCell align="right">{collection.applied_rate}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                    {collection.total_amount}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <AddCollectionModal 
        open={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onCollectionAdded={handleCollectionAdded}
      />
    </Box>
  );
}
