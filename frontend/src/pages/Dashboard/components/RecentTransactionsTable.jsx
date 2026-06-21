import React from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Box,
  Avatar,
  Divider
} from '@mui/material';
import {
  LocalDrink as DrinkIcon,
  AttachMoney as SalesIcon,
  Payment as PaymentIcon
} from '@mui/icons-material';

export default function RecentTransactionsTable({ data }) {
  if (!data || data.length === 0) return null;

  const getIcon = (type) => {
    if (type.includes('Collection')) return <DrinkIcon fontSize="small" sx={{ color: '#2563EB' }} />;
    if (type.includes('Sale')) return <SalesIcon fontSize="small" sx={{ color: '#059669' }} />;
    return <PaymentIcon fontSize="small" sx={{ color: '#7C3AED' }} />;
  };

  const getBgColor = (type) => {
    if (type.includes('Collection')) return 'rgba(37,99,235,0.1)';
    if (type.includes('Sale')) return 'rgba(5,150,105,0.1)';
    return 'rgba(124,58,237,0.1)';
  };

  return (
    <Card sx={{ height: '100%', borderRadius: '16px' }}>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
          Recent Activity Feed
        </Typography>
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {data.slice(0, 6).map((row, index) => (
            <React.Fragment key={index}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: getBgColor(row.type), width: 40, height: 40 }}>
                  {getIcon(row.type)}
                </Avatar>
                <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                  <Typography variant="subtitle2" noWrap sx={{ fontWeight: 600 }}>
                    {row.entity}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>
                    {row.type} • {new Date(row.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: row.type.includes('Collection') ? 'text.primary' : (row.type.includes('Sale') ? '#059669' : '#E11D48') }}>
                    {row.amount}
                  </Typography>
                  <Typography variant="caption" sx={{ 
                    color: row.status === 'Success' ? '#059669' : '#D97706',
                    bgcolor: row.status === 'Success' ? 'rgba(5,150,105,0.1)' : 'rgba(217,119,6,0.1)',
                    px: 1,
                    py: 0.2,
                    borderRadius: '4px',
                    fontWeight: 600
                  }}>
                    {row.status}
                  </Typography>
                </Box>
              </Box>
              {index < data.slice(0, 6).length - 1 && <Divider sx={{ borderColor: 'rgba(0,0,0,0.04)' }} />}
            </React.Fragment>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
}
