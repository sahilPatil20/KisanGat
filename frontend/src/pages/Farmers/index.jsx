import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Grid,
  Card,
  CardContent,
  Avatar,
  CircularProgress,
  IconButton,
  Tooltip,
  InputAdornment,
  TextField,
  Chip
} from '@mui/material';
import { 
  Add as AddIcon, 
  Visibility as ViewIcon, 
  Delete as DeleteIcon,
  Search as SearchIcon,
  Phone as PhoneIcon,
  LocalDrink as DrinkIcon,
  AttachMoney as MoneyIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { axiosPrivate } from '../../api/axios';
import AddFarmerModal from './AddFarmerModal';
import DeleteFarmerModal from './DeleteFarmerModal';
import StatusBadge from '../../components/StatusBadge';

const AVATAR_GRADIENTS = [
  'linear-gradient(135deg,#2563EB,#4F46E5)',
  'linear-gradient(135deg,#059669,#0891B2)',
  'linear-gradient(135deg,#D97706,#EA580C)',
  'linear-gradient(135deg,#E11D48,#7C3AED)',
];

export default function FarmersList() {
  const [farmers, setFarmers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [farmerToDelete, setFarmerToDelete] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
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

  const filteredFarmers = Array.isArray(farmers) 
    ? farmers.filter(f => f.name?.toLowerCase().includes(searchQuery.toLowerCase()) || f.mobile_number?.includes(searchQuery))
    : [];

  const getInitials = (name) => {
    if (!name) return 'F';
    return name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase();
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>;
  }

  return (
    <Box sx={{ p: { xs: 1, md: 2 } }}>
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' }, mb: 4, gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary' }}>Farmers Directory</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>Manage your dairy farmers and track their collections</Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, width: { xs: '100%', md: 'auto' } }}>
          <TextField
            placeholder="Search farmers..."
            size="small"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ width: { xs: '100%', md: '250px' }, bgcolor: 'white', borderRadius: 2 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
              sx: { borderRadius: '12px' }
            }}
          />
          <Button 
            variant="contained" 
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => setIsAddModalOpen(true)}
            sx={{ borderRadius: '8px', px: 3, whiteSpace: 'nowrap' }}
          >
            Add Farmer
          </Button>
        </Box>
      </Box>

      {filteredFarmers.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 10, bgcolor: 'background.paper', borderRadius: 4, border: '1px dashed #ccc' }}>
          <Typography color="text.secondary">No farmers found matching your criteria.</Typography>
          <Button variant="outlined" sx={{ mt: 2 }} onClick={() => setIsAddModalOpen(true)}>Create New Farmer</Button>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {filteredFarmers.map((farmer, index) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={farmer.id}>
              <Card sx={{ 
                height: '100%', 
                borderRadius: '16px', 
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 12px 24px -10px rgba(37, 99, 235, 0.2)' }
              }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Avatar sx={{ width: 56, height: 56, background: AVATAR_GRADIENTS[index % 4], color: 'white', fontWeight: 700, fontSize: '1.2rem' }}>
                      {getInitials(farmer.name)}
                    </Avatar>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <StatusBadge status={farmer.status || 'ACTIVE'} />
                      <Tooltip title="View Profile">
                        <IconButton size="small" sx={{ bgcolor: 'rgba(37,99,235,0.05)', color: 'primary.main', mr: 1, '&:hover': { bgcolor: 'rgba(37,99,235,0.1)' } }} onClick={() => navigate(`/farmers/${farmer.id}`)}>
                          <ViewIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Farmer">
                        <IconButton size="small" sx={{ bgcolor: 'rgba(225,29,72,0.05)', color: 'error.main', '&:hover': { bgcolor: 'rgba(225,29,72,0.1)' } }} onClick={() => setFarmerToDelete(farmer)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                  
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5, lineHeight: 1.2 }}>
                    {farmer.name}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary', mb: 2.5, gap: 0.5 }}>
                    <PhoneIcon sx={{ fontSize: 16 }} />
                    <Typography variant="body2">{farmer.mobile_number || 'N/A'}</Typography>
                  </Box>

                  <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid item xs={6}>
                      <Box sx={{ bgcolor: 'background.default', p: 1.5, borderRadius: '12px' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary', mb: 0.5 }}>
                          <MoneyIcon sx={{ fontSize: 16 }} />
                          <Typography variant="caption" fontWeight="600">Balance</Typography>
                        </Box>
                        <Typography variant="subtitle2" sx={{ 
                          fontWeight: 800, 
                          color: parseFloat(farmer.current_balance) < 0 ? 'error.main' : 'success.main' 
                        }}>
                          ₹ {parseFloat(farmer.current_balance || 0).toLocaleString('en-IN', {maximumFractionDigits: 2})}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box sx={{ bgcolor: 'background.default', p: 1.5, borderRadius: '12px' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary', mb: 0.5 }}>
                          <DrinkIcon sx={{ fontSize: 16 }} />
                          <Typography variant="caption" fontWeight="600">Avg Qty</Typography>
                        </Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'text.primary' }}>
                          -- L
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>

                  <Box sx={{
                    display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
                    gap: 1, mb: 2, pt: 1.5,
                    borderTop: '1px solid #E2E8F0'
                  }}>
                    {[
                      { label: 'Today', value: `${farmer.today_collection || 0} L` },
                      { label: 'This Month', value: `${farmer.month_collection || 0} L` },
                      { label: 'Earned', value: `₹${(farmer.month_earnings || 0).toLocaleString('en-IN')}` },
                    ].map(stat => (
                      <Box key={stat.label} sx={{ textAlign: 'center', bgcolor: '#F0F4FF', borderRadius: '8px', py: 0.75 }}>
                        <Typography sx={{ fontSize: 13, fontWeight: 800, color: '#0F172A' }}>{stat.value}</Typography>
                        <Typography sx={{ fontSize: 9, color: '#94A3B8', mt: 0.25 }}>{stat.label}</Typography>
                      </Box>
                    ))}
                  </Box>

                  <Button 
                    fullWidth 
                    variant="outlined" 
                    color="primary" 
                    onClick={() => navigate(`/farmers/${farmer.id}`)}
                    sx={{ borderRadius: '8px', fontWeight: 600 }}
                  >
                    View Full Profile
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

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
