import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Tabs, Tab, Button, Grid, Card, CardContent,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  CircularProgress, Chip, TextField, Dialog, DialogTitle, DialogContent,
  DialogActions, MenuItem
} from '@mui/material';
import { Add as AddIcon, Inventory as InventoryIcon, Storefront as StoreIcon } from '@mui/icons-material';
import { axiosPrivate } from '../../api/axios';
import ErrorBoundary from '../../components/ErrorBoundary';

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

function ProductsModule() {
  const [tabValue, setTabValue] = useState(0);
  const [catalog, setCatalog] = useState([]);
  const [inventoryDashboard, setInventoryDashboard] = useState([]);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [catalogModalOpen, setCatalogModalOpen] = useState(false);
  const [inventoryModalOpen, setInventoryModalOpen] = useState(false);
  const [saleModalOpen, setSaleModalOpen] = useState(false);

  // Form states
  const [catalogForm, setCatalogForm] = useState({ name: '', description: '', unit_of_measure: 'kg', unit_price: '' });
  const [inventoryForm, setInventoryForm] = useState({ product: '', transaction_type: 'ADDITION', quantity: '', remarks: '' });
  const [saleForm, setSaleForm] = useState({ customer: '', product: '', quantity: '', unit_price: '', paid_amount: '', remarks: '' });
  
  const [customers, setCustomers] = useState([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [catRes, invRes, saleRes, custRes] = await Promise.all([
        axiosPrivate.get('/products/catalog/'),
        axiosPrivate.get('/products/catalog/inventory-dashboard/'),
        axiosPrivate.get('/products/sales/'),
        axiosPrivate.get('/customers/')
      ]);
      setCatalog(catRes.data.results || catRes.data);
      setInventoryDashboard(invRes.data);
      setSales(saleRes.data.results || saleRes.data);
      setCustomers(custRes.data.results || custRes.data);
    } catch (err) {
      console.error("Failed to fetch products data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // --- Submit Handlers ---
  const handleCatalogSubmit = async (e) => {
    e.preventDefault();
    try {
      await axiosPrivate.post('/products/catalog/', catalogForm);
      setCatalogModalOpen(false);
      setCatalogForm({ name: '', description: '', unit_of_measure: 'kg', unit_price: '' });
      fetchData();
    } catch (err) {
      console.error(err);
      alert('Failed to save product');
    }
  };

  const handleInventorySubmit = async (e) => {
    e.preventDefault();
    try {
      await axiosPrivate.post('/products/inventory/', inventoryForm);
      setInventoryModalOpen(false);
      setInventoryForm({ product: '', transaction_type: 'ADDITION', quantity: '', remarks: '' });
      fetchData();
    } catch (err) {
      console.error(err);
      alert('Failed to save inventory transaction');
    }
  };

  const handleSaleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axiosPrivate.post('/products/sales/', saleForm);
      setSaleModalOpen(false);
      setSaleForm({ customer: '', product: '', quantity: '', unit_price: '', paid_amount: '', remarks: '' });
      fetchData();
    } catch (err) {
      console.error(err);
      alert('Failed to record sale');
    }
  };

  // --- Auto-fill unit price on product select for sale ---
  const handleSaleProductChange = (e) => {
    const pId = e.target.value;
    const prod = catalog.find(p => p.id === pId);
    setSaleForm({ ...saleForm, product: pId, unit_price: prod ? prod.unit_price : '' });
  };

  if (loading && catalog.length === 0) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress /></Box>;
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold" color="primary">
          Dairy Products
        </Typography>
      </Box>

      <Paper sx={{ width: '100%', mb: 2 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="Product Catalog" />
            <Tab label="Inventory Dashboard" />
            <Tab label="Product Sales" />
          </Tabs>
        </Box>

        {/* TAB 0: CATALOG */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setCatalogModalOpen(true)}>
              Add Product
            </Button>
          </Box>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Unit</TableCell>
                  <TableCell align="right">Unit Price (₹)</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {catalog.map(prod => (
                  <TableRow key={prod.id}>
                    <TableCell fontWeight="bold">{prod.name}</TableCell>
                    <TableCell>{prod.description}</TableCell>
                    <TableCell>{prod.unit_of_measure}</TableCell>
                    <TableCell align="right">{prod.unit_price}</TableCell>
                    <TableCell>
                      <Chip label={prod.is_active ? 'Active' : 'Inactive'} color={prod.is_active ? 'success' : 'default'} size="small"/>
                    </TableCell>
                  </TableRow>
                ))}
                {catalog.length === 0 && (
                  <TableRow><TableCell colSpan={5} align="center">No products found in catalog.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* TAB 1: INVENTORY DASHBOARD */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <Button variant="contained" color="secondary" startIcon={<InventoryIcon />} onClick={() => setInventoryModalOpen(true)}>
              Record Stock Movement
            </Button>
          </Box>
          <Grid container spacing={3}>
            {inventoryDashboard.map(item => (
              <Grid item xs={12} sm={6} md={4} key={item.product_id}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" color="primary">{item.product_name}</Typography>
                    <Typography variant="h3" sx={{ my: 2 }}>
                      {item.current_stock} <Typography component="span" variant="h6" color="textSecondary">{item.unit}</Typography>
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: 'text.secondary' }}>
                      <span>In: {item.total_additions}</span>
                      <span>Sold: {item.total_sales}</span>
                      <span>Spoiled: {item.total_spoilage}</span>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
            {inventoryDashboard.length === 0 && (
              <Grid item xs={12}><Typography align="center" sx={{ py: 3 }}>No active products to display inventory for.</Typography></Grid>
            )}
          </Grid>
        </TabPanel>

        {/* TAB 2: PRODUCT SALES */}
        <TabPanel value={tabValue} index={2}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <Button variant="contained" color="success" startIcon={<StoreIcon />} onClick={() => setSaleModalOpen(true)}>
              Record Sale
            </Button>
          </Box>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Customer</TableCell>
                  <TableCell>Product</TableCell>
                  <TableCell align="right">Quantity</TableCell>
                  <TableCell align="right">Rate (₹)</TableCell>
                  <TableCell align="right">Total (₹)</TableCell>
                  <TableCell>Recorded By</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sales.map(sale => (
                  <TableRow key={sale.id}>
                    <TableCell>{new Date(sale.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>{sale.customer_name}</TableCell>
                    <TableCell>{sale.product_name}</TableCell>
                    <TableCell align="right" fontWeight="bold">{sale.quantity}</TableCell>
                    <TableCell align="right">{sale.unit_price}</TableCell>
                    <TableCell align="right" sx={{ color: 'success.main', fontWeight: 'bold' }}>{sale.total_amount}</TableCell>
                    <TableCell>{sale.recorded_by_name || 'System'}</TableCell>
                  </TableRow>
                ))}
                {sales.length === 0 && (
                  <TableRow><TableCell colSpan={7} align="center">No sales recorded.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>
      </Paper>

      {/* --- MODALS --- */}
      
      {/* Catalog Modal */}
      <Dialog open={catalogModalOpen} onClose={() => setCatalogModalOpen(false)}>
        <DialogTitle>Add New Product</DialogTitle>
        <form onSubmit={handleCatalogSubmit}>
          <DialogContent dividers>
            <TextField label="Product Name" fullWidth required margin="normal" value={catalogForm.name} onChange={e => setCatalogForm({...catalogForm, name: e.target.value})} />
            <TextField label="Description" fullWidth multiline rows={2} margin="normal" value={catalogForm.description} onChange={e => setCatalogForm({...catalogForm, description: e.target.value})} />
            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              <TextField label="Unit of Measure (kg, packet, L)" fullWidth required value={catalogForm.unit_of_measure} onChange={e => setCatalogForm({...catalogForm, unit_of_measure: e.target.value})} />
              <TextField label="Unit Price (₹)" type="number" inputProps={{ step: "0.01" }} fullWidth required value={catalogForm.unit_price} onChange={e => setCatalogForm({...catalogForm, unit_price: e.target.value})} />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCatalogModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained">Save</Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Inventory Modal */}
      <Dialog open={inventoryModalOpen} onClose={() => setInventoryModalOpen(false)}>
        <DialogTitle>Record Stock Movement</DialogTitle>
        <form onSubmit={handleInventorySubmit}>
          <DialogContent dividers>
            <TextField select label="Product" fullWidth required margin="normal" value={inventoryForm.product} onChange={e => setInventoryForm({...inventoryForm, product: e.target.value})}>
              {catalog.map(p => <MenuItem key={p.id} value={p.id}>{p.name} ({p.unit_of_measure})</MenuItem>)}
            </TextField>
            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              <TextField select label="Movement Type" fullWidth required value={inventoryForm.transaction_type} onChange={e => setInventoryForm({...inventoryForm, transaction_type: e.target.value})}>
                <MenuItem value="ADDITION">Stock Addition (+)</MenuItem>
                <MenuItem value="SPOILAGE">Spoilage (-)</MenuItem>
                <MenuItem value="ADJUSTMENT">Manual Adjustment</MenuItem>
              </TextField>
              <TextField label="Quantity" type="number" inputProps={{ step: "0.01" }} fullWidth required value={inventoryForm.quantity} onChange={e => setInventoryForm({...inventoryForm, quantity: e.target.value})} />
            </Box>
            <TextField label="Remarks" fullWidth margin="normal" value={inventoryForm.remarks} onChange={e => setInventoryForm({...inventoryForm, remarks: e.target.value})} />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setInventoryModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained" color="secondary">Record Movement</Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Sale Modal */}
      <Dialog open={saleModalOpen} onClose={() => setSaleModalOpen(false)}>
        <DialogTitle>Record Product Sale</DialogTitle>
        <form onSubmit={handleSaleSubmit}>
          <DialogContent dividers>
            <TextField select label="Customer" fullWidth required margin="normal" value={saleForm.customer} onChange={e => setSaleForm({...saleForm, customer: e.target.value})}>
              {customers.map(c => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
            </TextField>
            <TextField select label="Product" fullWidth required margin="normal" value={saleForm.product} onChange={handleSaleProductChange}>
              {catalog.map(p => <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>)}
            </TextField>
            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              <TextField label="Quantity" type="number" inputProps={{ step: "0.01" }} fullWidth required value={saleForm.quantity} onChange={e => setSaleForm({...saleForm, quantity: e.target.value})} />
              <TextField label="Unit Price (₹)" type="number" inputProps={{ step: "0.01" }} fullWidth required value={saleForm.unit_price} onChange={e => setSaleForm({...saleForm, unit_price: e.target.value})} />
            </Box>
            <TextField label="Paid Amount (Optional)" type="number" inputProps={{ step: "0.01" }} fullWidth margin="normal" value={saleForm.paid_amount} onChange={e => setSaleForm({...saleForm, paid_amount: e.target.value})} helperText="Leave empty if adding to dues." />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setSaleModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained" color="success">Record Sale</Button>
          </DialogActions>
        </form>
      </Dialog>

    </Box>
  );
}

export default function ProductsModuleWithErrorBoundary() {
  return (
    <ErrorBoundary>
      <ProductsModule />
    </ErrorBoundary>
  );
}
