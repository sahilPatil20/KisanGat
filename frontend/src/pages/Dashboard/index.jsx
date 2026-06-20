import React, { useState, useEffect } from 'react';
import { Box, Grid, CircularProgress, Typography, Alert } from '@mui/material';
import { axiosPrivate } from '../../api/axios';
import KPICards from './components/KPICards';
import RevenueChart from './components/RevenueChart';
import RecentTransactionsTable from './components/RecentTransactionsTable';

export default function Dashboard() {
  const [summaryData, setSummaryData] = useState(null);
  const [revenueData, setRevenueData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [summaryRes, revenueRes] = await Promise.all([
          axiosPrivate.get('/dashboard/summary/'),
          axiosPrivate.get('/dashboard/revenue/')
        ]);
        setSummaryData(summaryRes.data);
        setRevenueData(revenueRes.data);
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

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>
        Dashboard Overview
      </Typography>
      
      <KPICards data={summaryData} />
      
      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid item xs={12} lg={8}>
          <RevenueChart data={revenueData} />
        </Grid>
        <Grid item xs={12} lg={4}>
          <RecentTransactionsTable />
        </Grid>
      </Grid>
    </Box>
  );
}
