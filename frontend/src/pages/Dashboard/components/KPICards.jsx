import React from 'react';
import { Grid, Card, CardContent, Typography, Box, Avatar } from '@mui/material';
import {
  LocalDrink as DrinkIcon,
  CurrencyRupee as RupeeIcon,
  People as PeopleIcon,
  WarningAmber as WarningIcon,
  Inventory as InventoryIcon,
  AccountBalanceWallet as WalletIcon
} from '@mui/icons-material';

export default function KPICards({ data }) {
  if (!data) return null;

  const kpis = [
    { 
      title: "Today's Collection", 
      value: `${data.today_collection?.total || 0} L`, 
      icon: <DrinkIcon />, 
      color: '#2563EB', // Primary Blue
      bg: 'linear-gradient(135deg, rgba(37,99,235,0.1) 0%, rgba(37,99,235,0.05) 100%)',
      subtitle: `Cow: ${data.today_collection?.cow || 0}L • Buffalo: ${data.today_collection?.buffalo || 0}L`
    },
    { 
      title: "Today's Revenue", 
      value: `₹ ${(data.today_sales?.total || 0).toLocaleString('en-IN', {maximumFractionDigits: 2})}`, 
      icon: <RupeeIcon />, 
      color: '#059669', // Emerald
      bg: 'linear-gradient(135deg, rgba(5,150,105,0.1) 0%, rgba(5,150,105,0.05) 100%)',
      subtitle: `Milk: ₹${(data.today_sales?.cow_milk + data.today_sales?.buffalo_milk + data.today_sales?.mixed_milk || 0).toLocaleString('en-IN')} • Products: ₹${(data.today_sales?.dairy_products || 0).toLocaleString('en-IN')}`
    },
    { 
      title: "Outstanding Dues", 
      value: `₹ ${(data.customer_dues || 0).toLocaleString('en-IN', {maximumFractionDigits: 2})}`, 
      icon: <WarningIcon />, 
      color: '#E11D48', // Rose
      bg: 'linear-gradient(135deg, rgba(225,29,72,0.1) 0%, rgba(225,29,72,0.05) 100%)',
      subtitle: 'Total Customer Pending Dues'
    },
    { 
      title: "Farmer Payables", 
      value: `₹ ${(data.farmer_payables || 0).toLocaleString('en-IN', {maximumFractionDigits: 2})}`, 
      icon: <WalletIcon />, 
      color: '#7C3AED', // Violet
      bg: 'linear-gradient(135deg, rgba(124,58,237,0.1) 0%, rgba(124,58,237,0.05) 100%)',
      subtitle: 'Pending Payouts to Farmers'
    },
    { 
      title: "Active Farmers", 
      value: data.active_farmers_data?.active || 0, 
      icon: <PeopleIcon />, 
      color: '#D97706', // Amber
      bg: 'linear-gradient(135deg, rgba(217,119,6,0.1) 0%, rgba(217,119,6,0.05) 100%)',
      subtitle: `Out of ${data.active_farmers_data?.total || 0} Total Farmers`
    },
    { 
      title: "Current Inventory", 
      value: `${data.inventory?.total || 0} L`, 
      icon: <InventoryIcon />, 
      color: '#4F46E5', // Indigo
      bg: 'linear-gradient(135deg, rgba(79,70,229,0.1) 0%, rgba(79,70,229,0.05) 100%)',
      subtitle: `Cow: ${data.inventory?.cow || 0}L • Buffalo: ${data.inventory?.buffalo || 0}L`
    },
    { 
      title: "Today's Customers", 
      value: data.today_metrics?.unique_customers || 0, 
      icon: <PeopleIcon />, 
      color: '#059669', // Emerald
      bg: 'linear-gradient(135deg, rgba(5,150,105,0.1) 0%, rgba(5,150,105,0.05) 100%)',
      subtitle: 'Unique Customers Served Today'
    },
    { 
      title: "Transactions Today", 
      value: data.today_metrics?.total_transactions || 0, 
      icon: <RupeeIcon />, 
      color: '#2563EB', // Primary Blue
      bg: 'linear-gradient(135deg, rgba(37,99,235,0.1) 0%, rgba(37,99,235,0.05) 100%)',
      subtitle: 'Total Operations Logged Today'
    },
  ];

  return (
    <Grid container spacing={3}>
      {kpis.map((kpi, index) => (
        <Grid item xs={12} sm={6} md={3} key={index}>
          <Card sx={{ 
            height: '100%', 
            borderRadius: '16px',
            border: '1px solid rgba(255,255,255,0.8)',
            background: 'rgba(255, 255, 255, 0.7)',
            backdropFilter: 'blur(20px)',
            transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: '0 12px 20px -8px rgba(0,0,0,0.15)',
            }
          }}>
            <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Typography color="text.secondary" sx={{ fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {kpi.title}
                </Typography>
                <Avatar sx={{ 
                  bgcolor: 'transparent', 
                  color: kpi.color, 
                  background: kpi.bg,
                  width: 44, 
                  height: 44,
                  borderRadius: '12px'
                }}>
                  {kpi.icon}
                </Avatar>
              </Box>
              <Typography variant="h4" component="div" sx={{ fontWeight: 800, mb: 1, color: 'text.primary' }}>
                {kpi.value}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500, display: 'block', mt: 1, borderTop: '1px solid rgba(0,0,0,0.05)', pt: 1 }}>
                {kpi.subtitle}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}
