import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Grid, Card, CardContent, Button,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem,
  CircularProgress, Chip
} from '@mui/material';
import { Add as AddIcon, ReceiptLong as ReceiptIcon, TrendingUp as TrendUp, TrendingDown as TrendDown } from '@mui/icons-material';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { axiosPrivate } from '../../api/axios';
import ErrorBoundary from '../../components/ErrorBoundary';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#ff6b6b'];

const CATEGORY_CHOICES = [
  { value: 'FUEL', label: 'Fuel' },
  { value: 'UTILITIES', label: 'Utilities (Electricity/Water)' },
  { value: 'MAINTENANCE', label: 'Equipment Maintenance' },
  { value: 'TRANSPORT', label: 'Transport/Logistics' },
  { value: 'OFFICE', label: 'Office Supplies' },
  { value: 'MISC', label: 'Miscellaneous' },
];

function ExpensesModule() {
  const [expenses, setExpenses] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    category: 'FUEL',
    amount: '',
    payment_method: 'CASH',
    remarks: ''
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [listRes, summaryRes] = await Promise.all([
        axiosPrivate.get('/expenses/'),
        axiosPrivate.get('/expenses/summary/')
      ]);
      setExpenses(listRes.data.results || listRes.data);
      setSummary(summaryRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axiosPrivate.post('/expenses/', form);
      setModalOpen(false);
      setForm({
        date: new Date().toISOString().split('T')[0],
        category: 'FUEL',
        amount: '',
        payment_method: 'CASH',
        remarks: ''
      });
      fetchData();
    } catch (err) {
      console.error(err);
      alert('Failed to record expense');
    }
  };

  if (loading && !summary) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', p: 10 }}><CircularProgress /></Box>;
  }

  const currentTotal = parseFloat(summary?.current_month_total || 0);
  const lastTotal = parseFloat(summary?.last_month_total || 0);
  const diff = currentTotal - lastTotal;
  const isUp = diff > 0;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold" color="primary">Expense Management</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setModalOpen(true)}>
          Record Expense
        </Button>
      </Box>

      {/* Analytics Dashboard */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                Current Month Expenses
              </Typography>
              <Typography variant="h3" fontWeight="bold" sx={{ mb: 1 }}>
                ₹{currentTotal.toLocaleString('en-IN')}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', color: isUp ? 'error.main' : 'success.main' }}>
                {isUp ? <TrendUp fontSize="small" /> : <TrendDown fontSize="small" />}
                <Typography variant="body2" sx={{ ml: 1, fontWeight: 'bold' }}>
                  {isUp ? '+' : ''}₹{Math.abs(diff).toLocaleString('en-IN')} vs Last Month
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Card sx={{ height: '100%', minHeight: 300 }}>
            <CardContent>
              <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                Category Breakdown (This Month)
              </Typography>
              {summary?.category_breakdown && summary.category_breakdown.length > 0 ? (
                <Box sx={{ height: 250 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={summary.category_breakdown}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {summary.category_breakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `₹${value}`} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 250, color: 'text.disabled' }}>
                  No expenses recorded this month.
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Expense List */}
      <Paper sx={{ width: '100%', mb: 2 }}>
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', display: 'flex', alignItems: 'center' }}>
          <ReceiptIcon color="action" sx={{ mr: 1 }} />
          <Typography variant="h6">Recent Expenses</Typography>
        </Box>
        <TableContainer sx={{ maxHeight: 500 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Remarks</TableCell>
                <TableCell>Payment Method</TableCell>
                <TableCell align="right">Amount (₹)</TableCell>
                <TableCell>Recorded By</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {expenses.map((exp) => (
                <TableRow key={exp.id} hover>
                  <TableCell>{exp.date}</TableCell>
                  <TableCell><Chip label={exp.category_display} size="small" variant="outlined" color="primary" /></TableCell>
                  <TableCell>{exp.remarks || '-'}</TableCell>
                  <TableCell>{exp.payment_method}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold', color: 'error.main' }}>
                    {parseFloat(exp.amount).toLocaleString('en-IN')}
                  </TableCell>
                  <TableCell>{exp.recorded_by_name || 'System'}</TableCell>
                </TableRow>
              ))}
              {expenses.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                    No expenses found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Add Expense Modal */}
      <Dialog open={modalOpen} onClose={() => setModalOpen(false)}>
        <DialogTitle>Record New Expense</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent dividers>
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <TextField label="Date" type="date" fullWidth required InputLabelProps={{ shrink: true }} value={form.date} onChange={e => setForm({...form, date: e.target.value})} />
              <TextField select label="Category" fullWidth required value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
                {CATEGORY_CHOICES.map(c => <MenuItem key={c.value} value={c.value}>{c.label}</MenuItem>)}
              </TextField>
            </Box>
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <TextField label="Amount (₹)" type="number" inputProps={{ step: "0.01" }} fullWidth required value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} />
              <TextField select label="Payment Method" fullWidth required value={form.payment_method} onChange={e => setForm({...form, payment_method: e.target.value})}>
                <MenuItem value="CASH">Cash</MenuItem>
                <MenuItem value="UPI">UPI</MenuItem>
                <MenuItem value="BANK_TRANSFER">Bank Transfer</MenuItem>
                <MenuItem value="CHEQUE">Cheque</MenuItem>
              </TextField>
            </Box>
            <TextField label="Remarks / Description" fullWidth multiline rows={2} value={form.remarks} onChange={e => setForm({...form, remarks: e.target.value})} />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained">Save Expense</Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}

export default function ExpensesModuleWithErrorBoundary() {
  return (
    <ErrorBoundary>
      <ExpensesModule />
    </ErrorBoundary>
  );
}
