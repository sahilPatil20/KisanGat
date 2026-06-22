import React, { useState, useEffect } from 'react';
import { Box, Grid, CircularProgress, Typography, Alert, Button, Skeleton } from '@mui/material';
import { axiosPrivate } from '../../api/axios';
import KPICards from './components/KPICards';
import RevenueChart from './components/RevenueChart';
import RecentTransactionsTable from './components/RecentTransactionsTable';
import { Download as DownloadIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [dashboardRes, profileRes] = await Promise.all([
          axiosPrivate.get('/dashboard/overview/'),
          axiosPrivate.get('/profile/')
        ]);
        setDashboardData(dashboardRes.data);
        setProfile(profileRes.data.account);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  if (loading) {
    return (
      // FIXED: Dashboard loading skeletons
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* Hero skeleton */}
        <Skeleton variant="rectangular" width="100%" height={140}
          sx={{ borderRadius: '16px' }} animation="wave" />
        {/* KPI skeletons — 4 per row */}
        <Grid container spacing={3}>
          {[...Array(8)].map((_, i) => (
            <Grid item xs={12} sm={6} md={3} key={i}>
              <Skeleton variant="rectangular" height={120}
                sx={{ borderRadius: '16px' }} animation="wave" />
            </Grid>
          ))}
        </Grid>
        {/* Chart skeleton */}
        <Grid container spacing={3}>
          <Grid item xs={12} lg={8}>
            <Skeleton variant="rectangular" height={320}
              sx={{ borderRadius: '16px' }} animation="wave" />
          </Grid>
          <Grid item xs={12} lg={4}>
            <Skeleton variant="rectangular" height={320}
              sx={{ borderRadius: '16px' }} animation="wave" />
          </Grid>
        </Grid>
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>;
  }

  return (
    <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Hero Section */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 2,
        background: 'linear-gradient(135deg, #2563EB 0%, #4F46E5 100%)',
        p: 4,
        borderRadius: '16px',
        color: 'white',
        boxShadow: '0 10px 15px -3px rgb(37 99 235 / 0.3), 0 4px 6px -4px rgb(37 99 235 / 0.3)'
      }}>
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 500, opacity: 0.9, mb: 0.5 }}>
            {currentDate}
          </Typography>
          <Typography variant="h3" sx={{ fontWeight: 800 }}>
            {getGreeting()}, {profile?.first_name || profile?.username || 'User'}! 👋
          </Typography>
          <Typography variant="body1" sx={{ mt: 1, opacity: 0.8, maxWidth: 500 }}>
            Here is what's happening at your dairy today. Milk collections, sales, and recent operations are looking good.
          </Typography>
        </Box>
        <Button 
          variant="outlined" 
          startIcon={<DownloadIcon />}
          sx={{ 
            borderColor: 'rgba(255,255,255,0.8)', 
            color: 'white', 
            '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' },
            fontWeight: 700,
            borderRadius: '8px'
          }}
        >
          Download Report
        </Button>
      </Box>
      
      {/* FIXED: Dashboard empty state */}
      {dashboardData?.today_collection?.total === 0 && dashboardData?.today_sales?.total === 0 && (
        <Box sx={{
          textAlign: 'center', py: 6, px: 4,
          bgcolor: 'background.paper', borderRadius: '16px',
          border: '1px dashed #CBD5E1'
        }}>
          <Typography variant="h6" fontWeight={700} color="text.primary" mb={1}>
            No activity recorded today
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            Start by recording your first milk collection for today.
          </Typography>
          <Button variant="contained" onClick={() => navigate('/collections')}
            sx={{ borderRadius: '8px', px: 4, fontWeight: 700 }}>
            Record First Collection →
          </Button>
        </Box>
      )}

      <KPICards data={dashboardData} />
      
      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          <RevenueChart data={dashboardData?.revenue_chart} />
        </Grid>
        <Grid item xs={12} lg={4}>
          <RecentTransactionsTable data={dashboardData?.recent_activities} />
        </Grid>
      </Grid>
    </Box>
  );
}
