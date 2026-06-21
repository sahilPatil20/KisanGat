import React, { useState, useEffect } from 'react';
import { Box, Grid, CircularProgress, Typography, Alert, Button } from '@mui/material';
import { axiosPrivate } from '../../api/axios';
import KPICards from './components/KPICards';
import RevenueChart from './components/RevenueChart';
import RecentTransactionsTable from './components/RecentTransactionsTable';
import { Download as DownloadIcon } from '@mui/icons-material';

export default function Dashboard() {
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
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
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
