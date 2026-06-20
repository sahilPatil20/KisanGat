import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Tabs, Tab, Button, Grid, Card, CardContent,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  CircularProgress, Chip
} from '@mui/material';
import { Add as AddIcon, Inventory as InventoryIcon, Opacity as DropsIcon } from '@mui/icons-material';
import { axiosPrivate } from '../../api/axios';
import ErrorBoundary from '../../components/ErrorBoundary';
import AddAdjustmentModal from './AddAdjustmentModal';

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && (
        <Box sx={{ pt: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function InventoryModule() {
  const [tabValue, setTabValue] = useState(0);
  const [dashboard, setDashboard] = useState(null);
  const [history, setHistory] = useState([]);
  const [adjustments, setAdjustments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchInventoryData = async () => {
    setLoading(true);
    try {
      const [dashRes, histRes, adjRes] = await Promise.all([
        axiosPrivate.get('/inventory/dashboard/'),
        axiosPrivate.get('/inventory/history/'),
        axiosPrivate.get('/inventory/adjustments/')
      ]);
      setDashboard(dashRes.data);
      setHistory(Array.isArray(histRes.data) ? histRes.data : []);
      
      const adjData = adjRes.data.results !== undefined ? adjRes.data.results : adjRes.data;
      setAdjustments(Array.isArray(adjData) ? adjData : []);
    } catch (err) {
      console.error("Failed to load inventory data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventoryData();
  }, []);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleAdjustmentSuccess = () => {
    setModalOpen(false);
    fetchInventoryData(); // Refresh all data across tabs
  };

  if (loading && !dashboard) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold" color="primary">
          Inventory Management
        </Typography>
        <Button 
          variant="contained" 
          color="error" 
          startIcon={<AddIcon />}
          onClick={() => setModalOpen(true)}
        >
          Record Adjustment
        </Button>
      </Box>

      {/* KPI Cards */}
      {dashboard && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={4}>
            <Card sx={{ bgcolor: 'primary.main', color: 'white' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <InventoryIcon /> Current Total Stock
                </Typography>
                <Typography variant="h3" fontWeight="bold">
                  {dashboard.current_stock.total} L
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                  <Typography variant="body2">Cow: {dashboard.current_stock.cow} L</Typography>
                  <Typography variant="body2">Buffalo: {dashboard.current_stock.buffalo} L</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={8}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>Today's Collection</Typography>
                    <Typography variant="h5" color="success.main" fontWeight="bold">
                      +{dashboard.today_collection} L
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>Today's Sales</Typography>
                    <Typography variant="h5" color="info.main" fontWeight="bold">
                      -{dashboard.today_sales} L
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>Today's Adjustments</Typography>
                    <Typography variant="h5" color="error.main" fontWeight="bold">
                      {dashboard.today_adjustments > 0 ? '+' : ''}{dashboard.today_adjustments} L
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      )}

      {/* Tabs */}
      <Paper sx={{ width: '100%', mb: 2 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="Inventory History" />
            <Tab label="Adjustment Logs" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell align="right">Opening Stock (L)</TableCell>
                  <TableCell align="right">Collections (+)</TableCell>
                  <TableCell align="right">Sales (-)</TableCell>
                  <TableCell align="right">Adjustments</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>Closing Stock (L)</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {history.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 3 }}>No inventory history found.</TableCell>
                  </TableRow>
                ) : (
                  history.map((row, index) => (
                    <TableRow hover key={index}>
                      <TableCell>{new Date(row.date).toLocaleDateString()}</TableCell>
                      <TableCell align="right">{row.opening_stock}</TableCell>
                      <TableCell align="right" sx={{ color: 'success.main' }}>{row.collection}</TableCell>
                      <TableCell align="right" sx={{ color: 'info.main' }}>{row.sales}</TableCell>
                      <TableCell align="right" sx={{ color: row.adjustments < 0 ? 'error.main' : 'inherit' }}>
                        {row.adjustments}
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold' }}>{row.closing_stock}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Milk Type</TableCell>
                  <TableCell>Reason</TableCell>
                  <TableCell align="right">Quantity (L)</TableCell>
                  <TableCell>Logged By</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {adjustments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 3 }}>No manual adjustments recorded.</TableCell>
                  </TableRow>
                ) : (
                  adjustments.map((adj) => (
                    <TableRow hover key={adj.id}>
                      <TableCell>{new Date(adj.created_at).toLocaleString()}</TableCell>
                      <TableCell>
                        <Chip 
                          label={adj.adjustment_type} 
                          color={adj.adjustment_type === 'ADD' ? 'success' : 'error'} 
                          size="small" 
                        />
                      </TableCell>
                      <TableCell>{adj.milk_type}</TableCell>
                      <TableCell>{adj.reason.replace('_', ' ')}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold' }}>{adj.quantity}</TableCell>
                      <TableCell>{adj.created_by_name || 'System'}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>
      </Paper>

      <AddAdjustmentModal 
        open={modalOpen} 
        onClose={() => setModalOpen(false)} 
        onSuccess={handleAdjustmentSuccess} 
      />
    </Box>
  );
}

export default function InventoryModuleWithErrorBoundary() {
  return (
    <ErrorBoundary>
      <InventoryModule />
    </ErrorBoundary>
  );
}
