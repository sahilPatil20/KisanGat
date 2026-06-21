import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Button, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, CircularProgress, Chip, Divider, Grid, Alert, Card, CardContent
} from '@mui/material';
import { Add as AddIcon, Print as PrintIcon, Receipt as ReceiptIcon, Visibility as VisibilityIcon } from '@mui/icons-material';
import { axiosPrivate } from '../../api/axios';
import ErrorBoundary from '../../components/ErrorBoundary';

function BillingModule() {
  const [invoices, setInvoices] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [generateModalOpen, setGenerateModalOpen] = useState(false);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [previewData, setPreviewData] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [generateLoading, setGenerateLoading] = useState(false);
  const [generateError, setGenerateError] = useState('');

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

  const handlePreview = async (e) => {
    e.preventDefault();
    setPreviewLoading(true);
    setGenerateError('');
    try {
      const res = await axiosPrivate.post('/billing/preview/', form);
      setPreviewData(res.data);
      setGenerateModalOpen(false);
      setPreviewModalOpen(true);
    } catch (err) {
      console.error(err);
      setGenerateError(err.response?.data?.error || 'Failed to generate preview');
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleGenerate = async () => {
    setGenerateLoading(true);
    try {
      const res = await axiosPrivate.post('/billing/generate/', form);
      setPreviewModalOpen(false);
      fetchData();
      // Auto open the newly generated invoice
      handleViewInvoice(res.data.invoice.id);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || 'Failed to generate invoice');
    } finally {
      setGenerateLoading(false);
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
    <Box sx={{ p: { xs: 1, md: 2 } }}>
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' }, mb: 4, gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary' }}>Billing & Invoices</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>Generate aggregated bills and track payment status.</Typography>
        </Box>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />} 
          onClick={() => setGenerateModalOpen(true)}
          sx={{ borderRadius: '8px', px: 3, py: 1 }}
        >
          Generate Invoice
        </Button>
      </Box>

      {/* Invoices List */}
      <Card sx={{ borderRadius: '16px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }}>
        <TableContainer sx={{ maxHeight: 'calc(100vh - 250px)' }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, color: 'text.secondary', bgcolor: 'background.paper' }}>Invoice #</TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'text.secondary', bgcolor: 'background.paper' }}>Customer</TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'text.secondary', bgcolor: 'background.paper' }}>Billing Period</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700, color: 'text.secondary', bgcolor: 'background.paper' }}>Invoice Amount</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700, color: 'text.secondary', bgcolor: 'background.paper' }}>Outstanding</TableCell>
                <TableCell align="center" sx={{ fontWeight: 700, color: 'text.secondary', bgcolor: 'background.paper' }}>Status</TableCell>
                <TableCell align="center" sx={{ fontWeight: 700, color: 'text.secondary', bgcolor: 'background.paper' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {invoices.map((inv) => (
                <TableRow key={inv.id} hover>
                  <TableCell>
                    <Typography sx={{ fontWeight: 800 }}>{inv.invoice_number}</Typography>
                    <Typography variant="caption" color="text.secondary">Issued: {new Date(inv.issue_date).toLocaleDateString()}</Typography>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{inv.customer_name}</TableCell>
                  <TableCell sx={{ color: 'text.secondary', fontSize: '0.9rem' }}>
                    {new Date(inv.start_date).toLocaleDateString()} - {new Date(inv.end_date).toLocaleDateString()}
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700, fontSize: '1.05rem' }}>
                    ₹ {parseFloat(inv.total_amount).toLocaleString('en-IN', {maximumFractionDigits: 2})}
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 800, color: 'error.main', fontSize: '1.05rem' }}>
                    ₹ {parseFloat(inv.outstanding_amount).toLocaleString('en-IN', {maximumFractionDigits: 2})}
                  </TableCell>
                  <TableCell align="center">
                    <Chip 
                      label={inv.status} 
                      color={inv.status === 'PAID' ? 'success' : inv.status === 'UNPAID' ? 'error' : 'warning'} 
                      size="small" 
                      sx={{ fontWeight: 700 }}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Button 
                      size="small" 
                      variant="outlined" 
                      startIcon={<ReceiptIcon />} 
                      onClick={() => handleViewInvoice(inv.id)}
                      sx={{ borderRadius: 2, fontWeight: 600, textTransform: 'none' }}
                    >
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {invoices.length === 0 && <TableRow><TableCell colSpan={7} align="center" sx={{ py: 6 }}><Typography color="text.secondary">No invoices generated yet.</Typography></TableCell></TableRow>}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Generate Invoice Modal */}
      <Dialog open={generateModalOpen} onClose={() => setGenerateModalOpen(false)} PaperProps={{ sx: { borderRadius: 3, maxWidth: 500, width: '100%' } }}>
        <DialogTitle sx={{ fontWeight: 800, fontSize: '1.5rem', pb: 1 }}>Create Invoice</DialogTitle>
        <form onSubmit={handlePreview}>
          <DialogContent dividers sx={{ p: 4 }}>
            {generateError && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{generateError}</Alert>}
            
            <TextField select label="Select Customer" fullWidth required margin="normal" value={form.customer} onChange={e => setForm({...form, customer: e.target.value})} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}>
              {customers.map(c => <MenuItem key={c.id} value={c.id}>{c.name} ({c.phone || 'No Phone'})</MenuItem>)}
            </TextField>
            <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
              <TextField label="Start Date" type="date" fullWidth required InputLabelProps={{ shrink: true }} value={form.start_date} onChange={e => setForm({...form, start_date: e.target.value})} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
              <TextField label="End Date" type="date" fullWidth required InputLabelProps={{ shrink: true }} value={form.end_date} onChange={e => setForm({...form, end_date: e.target.value})} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
            </Box>
            <Box sx={{ mt: 3, p: 2, bgcolor: 'rgba(37,99,235,0.05)', borderRadius: 2 }}>
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 1 }}>
                The system will aggregate all sales (milk and products) for this customer automatically based on the selected dates.
              </Typography>
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 2, justifyContent: 'space-between' }}>
            <Button onClick={() => setGenerateModalOpen(false)} sx={{ fontWeight: 600, color: 'text.secondary' }}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={previewLoading} startIcon={previewLoading ? <CircularProgress size={20} color="inherit" /> : <VisibilityIcon />} sx={{ px: 3, py: 1.5, borderRadius: 2, fontWeight: 700 }}>
              Preview Invoice
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Preview Invoice Modal */}
      <Dialog open={previewModalOpen} onClose={() => setPreviewModalOpen(false)} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 800 }}>
          Invoice Preview
        </DialogTitle>
        <DialogContent dividers sx={{ p: { xs: 2, md: 5 }, backgroundColor: '#fff', color: '#000' }}>
          {previewData && (
            <Box>
              <Alert severity="warning" sx={{ mb: 4, borderRadius: 2, fontWeight: 600 }}>
                This is a preview. The invoice has <strong>not</strong> been saved yet. Please verify the details before generation.
              </Alert>
              
              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={6}>
                  <Typography variant="h4" fontWeight="900" color="primary" sx={{ letterSpacing: -0.5 }}>KisanGat Dairy</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>Premium Dairy Operations</Typography>
                </Grid>
                <Grid item xs={6} sx={{ textAlign: 'right' }}>
                  <Typography variant="h4" fontWeight="800" sx={{ color: '#E2E8F0', letterSpacing: 2 }}>PREVIEW</Typography>
                  <Typography variant="body2" sx={{ mt: 1, fontWeight: 600 }}>Period: {previewData.invoice_preview.start_date} to {previewData.invoice_preview.end_date}</Typography>
                </Grid>
              </Grid>

              <Divider sx={{ mb: 4 }} />

              <Box sx={{ mb: 5, p: 3, bgcolor: '#f8fafc', borderRadius: 2 }}>
                <Typography variant="overline" fontWeight="700" color="text.secondary">Bill To</Typography>
                <Typography variant="h6" sx={{ fontWeight: 800 }}>{previewData.invoice_preview.customer_name}</Typography>
                <Typography variant="body2" color="text.secondary">{previewData.invoice_preview.customer_phone}</Typography>
              </Box>

              <TableContainer sx={{ border: '1px solid #e2e8f0', borderRadius: '12px', mb: 4 }}>
                <Table size="medium">
                  <TableHead sx={{ bgcolor: '#f1f5f9' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>Date</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>Description</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700, color: 'text.secondary' }}>Quantity</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700, color: 'text.secondary' }}>Rate</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700, color: 'text.secondary' }}>Total</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {previewData.line_items.map((item, idx) => (
                      <TableRow key={idx} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                        <TableCell sx={{ fontWeight: 500 }}>{item.date}</TableCell>
                        <TableCell>{item.description}</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>{item.quantity} {item.unit}</TableCell>
                        <TableCell align="right">₹ {item.unit_price.toFixed(2)}</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700 }}>₹ {item.total.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
                <Box sx={{ width: '300px', p: 3, bgcolor: 'primary.main', color: 'white', borderRadius: 3, boxShadow: '0 10px 15px -3px rgba(37,99,235,0.3)' }}>
                  <Grid container spacing={1} alignItems="center">
                    <Grid item xs={6}><Typography variant="h6" fontWeight="600" sx={{ opacity: 0.9 }}>Total Amount</Typography></Grid>
                    <Grid item xs={6} sx={{ textAlign: 'right' }}>
                      <Typography variant="h4" fontWeight="800">
                        ₹{parseFloat(previewData.invoice_preview.total_amount).toLocaleString('en-IN', {maximumFractionDigits: 2})}
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 2, display: 'flex', justifyContent: 'space-between', bgcolor: 'background.paper' }}>
          <Button onClick={() => { setPreviewModalOpen(false); setGenerateModalOpen(true); }} disabled={generateLoading} sx={{ fontWeight: 600 }}>
            Modify Details
          </Button>
          <Button onClick={handleGenerate} variant="contained" color="success" disabled={generateLoading} startIcon={generateLoading ? <CircularProgress size={20} color="inherit" /> : null} sx={{ px: 4, py: 1.5, borderRadius: 2, fontWeight: 700 }}>
            {generateLoading ? 'Generating...' : 'Confirm & Generate'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* View/Print Invoice Modal */}
      <Dialog open={viewModalOpen} onClose={() => setViewModalOpen(false)} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>Invoice Document</Typography>
          <Button variant="outlined" startIcon={<PrintIcon />} onClick={handlePrint} sx={{ '@media print': { display: 'none' }, borderRadius: 2, fontWeight: 700 }}>Print PDF</Button>
        </DialogTitle>
        <Divider sx={{ '@media print': { display: 'none' } }} />
        <DialogContent sx={{ p: { xs: 2, md: 5 }, backgroundColor: '#fff', color: '#000' }}>
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
                  <Typography variant="h4" fontWeight="900" color="primary" sx={{ letterSpacing: -0.5 }}>KisanGat Dairy</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>Premium Dairy Operations</Typography>
                  <Typography variant="body2" color="text.secondary">Phone: +91 98765 43210</Typography>
                </Grid>
                <Grid item xs={6} sx={{ textAlign: 'right' }}>
                  <Typography variant="h4" fontWeight="800" sx={{ color: '#94A3B8', letterSpacing: 2 }}>INVOICE</Typography>
                  <Typography variant="subtitle1" sx={{ mt: 1 }}><b># {selectedInvoice.invoice.invoice_number}</b></Typography>
                  <Typography variant="body2" color="text.secondary">Date: {new Date(selectedInvoice.invoice.issue_date).toLocaleDateString()}</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>Period: {selectedInvoice.invoice.start_date} to {selectedInvoice.invoice.end_date}</Typography>
                </Grid>
              </Grid>

              <Box sx={{ mb: 5, p: 3, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0' }}>
                <Typography variant="overline" fontWeight="700" color="text.secondary">Billed To</Typography>
                <Typography variant="h6" sx={{ fontWeight: 800 }}>{selectedInvoice.invoice.customer_name}</Typography>
                <Typography variant="body2" color="text.secondary">{selectedInvoice.invoice.customer_phone}</Typography>
              </Box>

              <TableContainer sx={{ border: '1px solid #e2e8f0', borderRadius: '12px', mb: 4 }}>
                <Table size="medium">
                  <TableHead sx={{ bgcolor: '#f1f5f9' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>Date</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>Description</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700, color: 'text.secondary' }}>Quantity</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700, color: 'text.secondary' }}>Rate</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700, color: 'text.secondary' }}>Total</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedInvoice.line_items.map((item, idx) => (
                      <TableRow key={idx} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                        <TableCell sx={{ fontWeight: 500 }}>{item.date}</TableCell>
                        <TableCell>{item.description}</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>{item.quantity} {item.unit}</TableCell>
                        <TableCell align="right">₹ {item.unit_price.toFixed(2)}</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700 }}>₹ {item.total.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
                <Box sx={{ width: '350px', p: 3, bgcolor: '#f8fafc', borderRadius: 3, border: '1px solid #e2e8f0' }}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={6}><Typography sx={{ fontWeight: 600, color: 'text.secondary' }}>Subtotal:</Typography></Grid>
                    <Grid item xs={6} sx={{ textAlign: 'right' }}>
                      <Typography sx={{ fontWeight: 700 }}>₹ {parseFloat(selectedInvoice.invoice.total_amount).toLocaleString('en-IN', {maximumFractionDigits: 2})}</Typography>
                    </Grid>
                    
                    <Grid item xs={6}><Typography sx={{ fontWeight: 600, color: 'text.secondary' }}>Status:</Typography></Grid>
                    <Grid item xs={6} sx={{ textAlign: 'right' }}>
                      <Chip 
                        label={selectedInvoice.invoice.status} 
                        size="small" 
                        color={selectedInvoice.invoice.status === 'UNPAID' ? 'error' : 'success'} 
                        sx={{ fontWeight: 700 }}
                      />
                    </Grid>

                    <Grid item xs={12}><Divider sx={{ my: 1 }} /></Grid>
                    
                    <Grid item xs={6}><Typography variant="h6" fontWeight="700">Outstanding:</Typography></Grid>
                    <Grid item xs={6} sx={{ textAlign: 'right' }}>
                      <Typography variant="h5" fontWeight="800" color="error.main">
                        ₹ {parseFloat(selectedInvoice.invoice.outstanding_amount).toLocaleString('en-IN', {maximumFractionDigits: 2})}
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>
              </Box>

              <Box sx={{ mt: 8, textAlign: 'center', p: 3, bgcolor: 'rgba(37,99,235,0.05)', borderRadius: 2 }}>
                <Typography variant="body1" sx={{ fontWeight: 600, color: 'primary.main' }}>Thank you for your business!</Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, '@media print': { display: 'none' } }}>
          <Button onClick={() => setViewModalOpen(false)} sx={{ fontWeight: 600 }}>Close Document</Button>
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
