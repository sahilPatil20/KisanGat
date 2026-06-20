import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

export default function RevenueChart({ data }) {
  if (!data || data.length === 0) return null;

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Revenue & Collection (Last 7 Days)
        </Typography>
        <Box sx={{ width: '100%', height: 300 }}>
          <ResponsiveContainer>
            <LineChart
              data={data}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="#2e7d32" activeDot={{ r: 8 }} name="Sales Revenue (₹)" />
              <Line type="monotone" dataKey="collection" stroke="#1976d2" name="Milk Collection (Liters)" />
            </LineChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
}
