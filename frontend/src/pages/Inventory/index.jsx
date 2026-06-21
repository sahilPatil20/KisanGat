import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Tabs, Tab, Button, Grid, Card, CardContent,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  CircularProgress, Chip, Avatar
} from '@mui/material';
import { Add as AddIcon, Inventory as InventoryIcon, Opacity as DropsIcon, TrendingUp as UpIcon, TrendingDown as DownIcon } from '@mui/icons-material';
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
    <Box sx={{ p: { xs: 1, md: 2 } }}>
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' }, mb: 4, gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary' }}>
            Inventory Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Monitor live stock movements, record adjustments, and audit inventory history.
          </Typography>
        </Box>
        <Button 
          variant="contained" 
          color="error" 
          startIcon={<AddIcon />}
          onClick={() => setModalOpen(true)}
          sx={{ borderRadius: '8px', px: 3, py: 1, fontWeight: 700 }}
        >
          Record Stock Adjustment
        </Button>
      </Box>

      {/* KPI Cards */}
      {dashboard && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={4}>
            <Card sx={{ borderRadius: '16px', border: '1px solid rgba(37,99,235,0.1)', boxShadow: '0 4px 12px rgba(37,99,235,0.05)', bgcolor: 'primary.main', color: 'white', height: '100%' }}>
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, opacity: 0.9 }}>Current Total Stock</Typography>
                  <InventoryIcon sx={{ opacity: 0.8 }} />
                </Box>
                <Typography variant="h2" sx={{ fontWeight: 800, mb: 1 }}>{dashboard.current_stock.total} <Typography component="span" variant="h5" sx={{ opacity: 0.8 }}>L</Typography></Typography>
                
                <Box sx={{ mt: 4, p: 2, bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 2, display: 'flex', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="caption" sx={{ opacity: 0.8, fontWeight: 600 }}>Cow Milk</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>{dashboard.current_stock.cow} L</Typography>
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="caption" sx={{ opacity: 0.8, fontWeight: 600 }}>Buffalo Milk</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>{dashboard.current_stock.buffalo} L</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={8}>
            <Grid container spacing={3} sx={{ height: '100%' }}>
              <Grid item xs={12} sm={4}>
                <Card sx={{ borderRadius: '16px', border: '1px solid rgba(16,185,129,0.1)', boxShadow: '0 4px 12px rgba(16,185,129,0.05)', height: '100%' }}>
                  <CardContent sx={{ display: 'flex', flexDirection: 'column', height: '100%', p: 3 }}>
                    <Avatar sx={{ bgcolor: 'rgba(16,185,129,0.1)', color: '#10B981', mb: 2 }}>
                      <UpIcon />
                    </Avatar>
                    <Typography color="text.secondary" variant="caption" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>Today's Intake</Typography>
                    <Typography variant="h4" sx={{ fontWeight: 800, color: '#10B981', mt: 'auto' }}>
                      +{dashboard.today_collection} L
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Card sx={{ borderRadius: '16px', border: '1px solid rgba(245,158,11,0.1)', boxShadow: '0 4px 12px rgba(245,158,11,0.05)', height: '100%' }}>
                  <CardContent sx={{ display: 'flex', flexDirection: 'column', height: '100%', p: 3 }}>
                    <Avatar sx={{ bgcolor: 'rgba(245,158,11,0.1)', color: '#F59E0B', mb: 2 }}>
                      <DownIcon />
                    </Avatar>
                    <Typography color="text.secondary" variant="caption" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>Today's Dispatch</Typography>
                    <Typography variant="h4" sx={{ fontWeight: 800, color: '#F59E0B', mt: 'auto' }}>
                      -{dashboard.today_sales} L
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Card sx={{ borderRadius: '16px', border: '1px solid rgba(225,29,72,0.1)', boxShadow: '0 4px 12px rgba(225,29,72,0.05)', height: '100%' }}>
                  <CardContent sx={{ display: 'flex', flexDirection: 'column', height: '100%', p: 3 }}>
                    <Avatar sx={{ bgcolor: 'rgba(225,29,72,0.1)', color: '#E11D48', mb: 2 }}>
                      <DropsIcon />
                    </Avatar>
                    <Typography color="text.secondary" variant="caption" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>Net Adjustments</Typography>
                    <Typography variant="h4" sx={{ fontWeight: 800, color: dashboard.today_adjustments < 0 ? '#E11D48' : '#10B981', mt: 'auto' }}>
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
      <Card sx={{ borderRadius: '16px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'rgba(248, 250, 252, 0.8)' }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange}
            sx={{
              '& .MuiTabs-indicator': { height: 3, borderRadius: '3px 3px 0 0' },
              '& .MuiTab-root': { fontWeight: 700, fontSize: '0.95rem', py: 2.5 }
            }}
          >
            <Tab label="Daily Inventory Audit" />
            <Tab label="Manual Adjustment Logs" />
          </Tabs>
        </Box>

        <CardContent sx={{ p: 0 }}>
          <TabPanel value={tabValue} index={0} sx={{ pt: 0 }}>
            <TableContainer sx={{ maxHeight: 'calc(100vh - 450px)' }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, color: 'text.secondary', bgcolor: 'background.paper' }}>Audit Date</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, color: 'text.secondary', bgcolor: 'background.paper' }}>Opening Balance (L)</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, color: 'text.secondary', bgcolor: 'background.paper' }}>Procurement (+)</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, color: 'text.secondary', bgcolor: 'background.paper' }}>Sales (-)</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, color: 'text.secondary', bgcolor: 'background.paper' }}>Adjustments</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, color: 'text.secondary', bgcolor: 'background.paper' }}>Closing Balance (L)</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {history.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 6 }}><Typography color="text.secondary">No inventory history found.</Typography></TableCell>
                    </TableRow>
                  ) : (
                    history.map((row, index) => (
                      <TableRow hover key={index}>
                        <TableCell sx={{ fontWeight: 600 }}>{new Date(row.date).toLocaleDateString()}</TableCell>
                        <TableCell align="right" sx={{ color: 'text.secondary', fontWeight: 600 }}>{row.opening_stock}</TableCell>
                        <TableCell align="right" sx={{ color: '#10B981', fontWeight: 700 }}>+{row.collection}</TableCell>
                        <TableCell align="right" sx={{ color: '#F59E0B', fontWeight: 700 }}>-{row.sales}</TableCell>
                        <TableCell align="right" sx={{ color: row.adjustments < 0 ? '#E11D48' : row.adjustments > 0 ? '#10B981' : 'text.secondary', fontWeight: 700 }}>
                          {row.adjustments > 0 ? '+' : ''}{row.adjustments}
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 800, fontSize: '1.05rem', color: 'primary.main' }}>{row.closing_stock}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>

          <TabPanel value={tabValue} index={1} sx={{ pt: 0 }}>
            <TableContainer sx={{ maxHeight: 'calc(100vh - 450px)' }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, color: 'text.secondary', bgcolor: 'background.paper' }}>Timestamp</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: 'text.secondary', bgcolor: 'background.paper' }}>Action</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: 'text.secondary', bgcolor: 'background.paper' }}>Product</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: 'text.secondary', bgcolor: 'background.paper' }}>Reason Code</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, color: 'text.secondary', bgcolor: 'background.paper' }}>Quantity (L)</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: 'text.secondary', bgcolor: 'background.paper' }}>Authorized By</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {adjustments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 6 }}><Typography color="text.secondary">No manual adjustments recorded.</Typography></TableCell>
                    </TableRow>
                  ) : (
                    adjustments.map((adj) => (
                      <TableRow hover key={adj.id}>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>{new Date(adj.created_at).toLocaleDateString()}</Typography>
                          <Typography variant="caption" color="text.secondary">{new Date(adj.created_at).toLocaleTimeString()}</Typography>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={adj.adjustment_type} 
                            sx={{ 
                              bgcolor: adj.adjustment_type === 'ADD' ? 'rgba(16,185,129,0.1)' : 'rgba(225,29,72,0.1)',
                              color: adj.adjustment_type === 'ADD' ? '#10B981' : '#E11D48',
                              fontWeight: 700
                            }} 
                            size="small" 
                          />
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>{adj.milk_type}</TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>{adj.reason.replace('_', ' ')}</Typography>
                          {adj.notes && <Typography variant="caption" color="text.secondary" display="block">{adj.notes}</Typography>}
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 800, fontSize: '1.05rem' }}>{adj.quantity}</TableCell>
                        <TableCell sx={{ color: 'text.secondary' }}>{adj.created_by_name || 'System Auto'}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>
        </CardContent>
      </Card>

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
