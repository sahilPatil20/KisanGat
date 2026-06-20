import React from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Chip
} from '@mui/material';

// We'll use static mock data here as a placeholder until the API provides it
const mockTransactions = [
  { id: 1, type: 'Collection', entity: 'Ramesh Singh', amount: '45.5 L', time: '10:30 AM', status: 'Completed' },
  { id: 2, type: 'Sale', entity: 'Local Dairy Outlet', amount: '₹ 12,000', time: '09:15 AM', status: 'Completed' },
  { id: 3, type: 'Collection', entity: 'Suresh Patil', amount: '30.0 L', time: '08:45 AM', status: 'Pending' },
  { id: 4, type: 'Sale', entity: 'Walk-in Customer', amount: '₹ 250', time: '08:10 AM', status: 'Completed' },
];

export default function RecentTransactionsTable() {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Recent Transactions
        </Typography>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Type</TableCell>
                <TableCell>Entity</TableCell>
                <TableCell>Amount/Qty</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {mockTransactions.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>
                    <Chip 
                      label={row.type} 
                      size="small" 
                      color={row.type === 'Collection' ? 'primary' : 'success'} 
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>{row.entity}</TableCell>
                  <TableCell>{row.amount}</TableCell>
                  <TableCell>
                    <Chip 
                      label={row.status} 
                      size="small" 
                      color={row.status === 'Completed' ? 'success' : 'warning'} 
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
}
