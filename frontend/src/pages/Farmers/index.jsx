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
  IconButton,
  Tooltip
} from '@mui/material';
import { Add as AddIcon, Visibility as ViewIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { axiosPrivate } from '../../api/axios';
import AddFarmerModal from './AddFarmerModal';
import DeleteFarmerModal from './DeleteFarmerModal';

export default function FarmersList() {
  const [farmers, setFarmers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [farmerToDelete, setFarmerToDelete] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchFarmers();
  }, []);

  const fetchFarmers = async () => {
    try {
      const response = await axiosPrivate.get('/farmers/');
      // Django REST Framework pagination returns { count, next, previous, results: [...] }
      setFarmers(response.data.results !== undefined ? response.data.results : response.data);
    } catch (err) {
      console.error('Error fetching farmers:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFarmerAdded = (newFarmer) => {
    setFarmers(prev => Array.isArray(prev) ? [newFarmer, ...prev] : [newFarmer]);
  };

  const handleFarmerDeleted = (deletedId) => {
    setFarmers(prev => Array.isArray(prev) ? prev.filter(f => f.id !== deletedId) : []);
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}><CircularProgress /></Box>;
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">Farmers</Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={() => setIsAddModalOpen(true)}
        >
          Add Farmer
        </Button>
      </Box>

      <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #eee' }}>
        <Table>
          <TableHead sx={{ bgcolor: '#f8f9fa' }}>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Mobile Number</TableCell>
              <TableCell>Current Balance (₹)</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {!Array.isArray(farmers) || farmers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                  No farmers found. Click 'Add Farmer' to create one.
                </TableCell>
              </TableRow>
            ) : (
              farmers.map((farmer) => (
                <TableRow key={farmer.id} hover>
                  <TableCell fontWeight="medium">{farmer.name}</TableCell>
                  <TableCell>{farmer.mobile_number}</TableCell>
                  <TableCell sx={{ 
                    color: parseFloat(farmer.current_balance) < 0 ? 'error.main' : 'success.main',
                    fontWeight: 'bold'
                  }}>
                    {farmer.current_balance}
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="View Profile">
                      <IconButton color="primary" onClick={() => navigate(`/farmers/${farmer.id}`)}>
                        <ViewIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Farmer">
                      <IconButton color="error" onClick={() => setFarmerToDelete(farmer)}>
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <AddFarmerModal 
        open={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onFarmerAdded={handleFarmerAdded}
      />

      <DeleteFarmerModal
        open={!!farmerToDelete}
        onClose={() => setFarmerToDelete(null)}
        farmer={farmerToDelete}
        onFarmerDeleted={handleFarmerDeleted}
      />
    </Box>
  );
}
