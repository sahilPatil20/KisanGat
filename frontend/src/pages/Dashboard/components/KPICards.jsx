import React from 'react';
import { Grid, Card, CardContent, Typography, Box } from '@mui/material';
import {
  LocalDrink as DrinkIcon,
  AttachMoney as MoneyIcon,
  People as PeopleIcon,
  WarningAmber as WarningIcon
} from '@mui/icons-material';

const kpis = [
  { title: "Today's Collection", value: '0 L', icon: <DrinkIcon fontSize="large" />, color: '#1976d2', field: 'today_collection_liters' },
  { title: "Today's Sales", value: '₹ 0.00', icon: <MoneyIcon fontSize="large" />, color: '#2e7d32', field: 'today_sales_amount' },
  { title: "Active Farmers", value: '0', icon: <PeopleIcon fontSize="large" />, color: '#ed6c02', field: 'active_farmers' },
  { title: "Outstanding Dues", value: '₹ 0.00', icon: <WarningIcon fontSize="large" />, color: '#d32f2f', field: 'outstanding_dues' },
];

export default function KPICards({ data }) {
  if (!data) return null;

  return (
    <Grid container spacing={3}>
      {kpis.map((kpi, index) => {
        let displayValue = kpi.value;
        if (data[kpi.field] !== undefined) {
          displayValue = data[kpi.field];
          if (kpi.field.includes('amount') || kpi.field.includes('dues')) displayValue = `₹ ${displayValue.toFixed(2)}`;
          if (kpi.field.includes('liters')) displayValue = `${displayValue} L`;
        }

        return (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography color="textSecondary" gutterBottom variant="overline">
                      {kpi.title}
                    </Typography>
                    <Typography variant="h4" component="div">
                      {displayValue}
                    </Typography>
                  </Box>
                  <Box sx={{ color: kpi.color, opacity: 0.8 }}>
                    {kpi.icon}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        );
      })}
    </Grid>
  );
}
