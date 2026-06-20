import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Button, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, CircularProgress, Chip, Divider, Grid
} from '@mui/material';
import { Add as AddIcon, Print as PrintIcon, Receipt as ReceiptIcon } from '@mui/icons-material';
import { axiosPrivate } from '../../api/axios';
import ErrorBoundary from '../../components/ErrorBoundary';

function BillingModule() {
  const [invoices, setInvoices] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [generateModalOpen, setGenerateModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  // Forms
  const [form, setForm] = useState({
    customer: '',
    start_date: new Date(new Date().setDate(1)).toISOString().split('T')[0], // 1st of month
    end_date: new Date().toISOString().split('T')[0]
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [invRes, custRes] = await Promise.all([
        axiosPrivate.get('/billing/'),
        axiosPrivate.get('/customers/')
      ]);
      setInvoices(invRes.data.results || invRes.data);
      setCustomers(custRes.data.results || custRes.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleGenerate = async (e) => {
    e.preventDefault();
    try {
      const res = await axiosPrivate.post('/billing/generate/', form);
      setGenerateModalOpen(false);
      fetchData();
      // Auto open the newly generated invoice
      handleViewInvoice(res.data.invoice.id);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || 'Failed to generate invoice');
    }
  };

  const handleViewInvoice = async (invoiceId) => {
    try {
      const res = await axiosPrivate.get(`/billing/${invoiceId}/details/`);
      setSelectedInvoice(res.data);
      setViewModalOpen(true);
    } catch (err) {
      console.error(err);
      alert('Failed to fetch invoice details');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading && invoices.length === 0) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 10 }}><CircularProgress /></Box>;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold" color="primary">Billing & Invoices</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setGenerateModalOpen(true)}>
          Generate Invoice
        </Button>
      </Box>

      {/* Invoices List */}
      <Paper sx={{ width: '100%', mb: 2 }}>
        <TableContainer sx={{ maxHeight: 600 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Invoice #</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell>Billing Period</TableCell>
                <TableCell align="right">Invoice Amount</TableCell>
                <TableCell align="right">Outstanding</TableCell>
                <TableCell align="center">Status</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {invoices.map((inv) => (
                <TableRow key={inv.id} hover>
                  <TableCell fontWeight="bold">{inv.invoice_number}</TableCell>
                  <TableCell>{inv.issue_date}</TableCell>
                  <TableCell>{inv.customer_name}</TableCell>
                  <TableCell>{inv.start_date} to {inv.end_date}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>{parseFloat(inv.total_amount).toLocaleString('en-IN')}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold', color: 'primary.main' }}>{parseFloat(inv.outstanding_amount).toLocaleString('en-IN')}</TableCell>
                  <TableCell>
                    <Chip 
                      label={inv.status} 
                      color={inv.status === 'PAID' ? 'success' : inv.status === 'UNPAID' ? 'error' : 'warning'} 
                      size="small" 
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Button size="small" variant="outlined" startIcon={<ReceiptIcon />} onClick={() => handleViewInvoice(inv.id)}>
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {invoices.length === 0 && <TableRow><TableCell colSpan={7} align="center">No invoices generated yet.</TableCell></TableRow>}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Generate Invoice Modal */}
      <Dialog open={generateModalOpen} onClose={() => setGenerateModalOpen(false)}>
        <DialogTitle>Generate New Invoice</DialogTitle>
        <form onSubmit={handleGenerate}>
          <DialogContent dividers>
            <TextField select label="Select Customer" fullWidth required margin="normal" value={form.customer} onChange={e => setForm({...form, customer: e.target.value})}>
              {customers.map(c => <MenuItem key={c.id} value={c.id}>{c.name} ({c.phone})</MenuItem>)}
            </TextField>
            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              <TextField label="Start Date" type="date" fullWidth required InputLabelProps={{ shrink: true }} value={form.start_date} onChange={e => setForm({...form, start_date: e.target.value})} />
              <TextField label="End Date" type="date" fullWidth required InputLabelProps={{ shrink: true }} value={form.end_date} onChange={e => setForm({...form, end_date: e.target.value})} />
            </Box>
            <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: 2 }}>
              The system will automatically aggregate all milk and product sales for this customer within the selected date range.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setGenerateModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained">Generate</Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* View/Print Invoice Modal */}
      <Dialog open={viewModalOpen} onClose={() => setViewModalOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Invoice Details</span>
          <Button variant="outlined" startIcon={<PrintIcon />} onClick={handlePrint} sx={{ '@media print': { display: 'none' } }}>Print</Button>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 4, backgroundColor: '#fff', color: '#000' }}>
          {selectedInvoice && (
            <Box className="printable-invoice">
              <style>
                {`
                  @media print {
                    body * { visibility: hidden; }
                    .printable-invoice, .printable-invoice * { visibility: visible; }
                    .printable-invoice { position: absolute; left: 0; top: 0; width: 100%; padding: 20px; }
                  }
                `}
              </style>
              
              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={6}>
                  <Typography variant="h4" fontWeight="bold" color="primary">KisanGat Dairy</Typography>
                  <Typography variant="body2" color="textSecondary">123 Dairy Lane, Milk City, 400001</Typography>
                  <Typography variant="body2" color="textSecondary">Phone: +91 98765 43210</Typography>
                </Grid>
                <Grid item xs={6} sx={{ textAlign: 'right' }}>
                  <Typography variant="h4" fontWeight="bold" sx={{ color: '#555' }}>INVOICE</Typography>
                  <Typography variant="subtitle1"><b># {selectedInvoice.invoice.invoice_number}</b></Typography>
                  <Typography variant="body2">Issue Date: {selectedInvoice.invoice.issue_date}</Typography>
                  <Typography variant="body2">Period: {selectedInvoice.invoice.start_date} to {selectedInvoice.invoice.end_date}</Typography>
                </Grid>
              </Grid>

              <Divider sx={{ mb: 3 }} />

              <Box sx={{ mb: 4 }}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>Bill To:</Typography>
                <Typography variant="body1">{selectedInvoice.invoice.customer_name}</Typography>
                <Typography variant="body2">{selectedInvoice.invoice.customer_phone}</Typography>
              </Box>

              <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #eee', mb: 4 }}>
                <Table size="small">
                  <TableHead sx={{ backgroundColor: '#f9f9f9' }}>
                    <TableRow>
                      <TableCell><b>Date</b></TableCell>
                      <TableCell><b>Description</b></TableCell>
                      <TableCell align="right"><b>Quantity</b></TableCell>
                      <TableCell align="right"><b>Unit Price (₹)</b></TableCell>
                      <TableCell align="right"><b>Total (₹)</b></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedInvoice.line_items.map((item, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{item.date}</TableCell>
                        <TableCell>{item.description}</TableCell>
                        <TableCell align="right">{item.quantity} {item.unit}</TableCell>
                        <TableCell align="right">{item.unit_price.toFixed(2)}</TableCell>
                        <TableCell align="right">{item.total.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Box sx={{ width: '300px' }}>
                  <Grid container spacing={1}>
                    <Grid item xs={6}><Typography fontWeight="bold">Subtotal:</Typography></Grid>
                    <Grid item xs={6} sx={{ textAlign: 'right' }}><Typography>₹{parseFloat(selectedInvoice.invoice.total_amount).toLocaleString('en-IN')}</Typography></Grid>
                    
                    <Grid item xs={6}><Typography fontWeight="bold">Status:</Typography></Grid>
                    <Grid item xs={6} sx={{ textAlign: 'right' }}><Typography color={selectedInvoice.invoice.status === 'UNPAID' ? 'error' : 'success'}>{selectedInvoice.invoice.status}</Typography></Grid>

                    <Grid item xs={12}><Divider sx={{ my: 1 }} /></Grid>
                    
                    <Grid item xs={6}><Typography variant="h6" fontWeight="bold">Outstanding:</Typography></Grid>
                    <Grid item xs={6} sx={{ textAlign: 'right' }}><Typography variant="h6" fontWeight="bold" color="primary">₹{parseFloat(selectedInvoice.invoice.outstanding_amount).toLocaleString('en-IN')}</Typography></Grid>
                  </Grid>
                </Box>
              </Box>

              <Box sx={{ mt: 8, textAlign: 'center', color: '#777' }}>
                <Typography variant="body2">Thank you for your business!</Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ '@media print': { display: 'none' } }}>
          <Button onClick={() => setViewModalOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default function BillingModuleWithErrorBoundary() {
  return (
    <ErrorBoundary>
      <BillingModule />
    </ErrorBoundary>
  );
}
