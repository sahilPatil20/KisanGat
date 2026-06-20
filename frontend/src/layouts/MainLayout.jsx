import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  LocalShipping as MilkIcon,
  AttachMoney as SalesIcon,
  AccountCircle,
  AccountBalanceWallet as PaymentsIcon,
  Storefront as StorefrontIcon,
  Inventory as InventoryIcon,
  Receipt as ReceiptIcon
} from '@mui/icons-material';

const drawerWidth = 240;

const operationsMenu = [
  { text: 'Farmers', icon: <PeopleIcon />, path: '/farmers' },
  { text: 'Milk Collection', icon: <MilkIcon />, path: '/collections' },
  { text: 'Customers', icon: <StorefrontIcon />, path: '/customers' },
  { text: 'Milk Sales', icon: <SalesIcon />, path: '/sales' },
  { text: 'Dairy Products', icon: <StorefrontIcon />, path: '/products' },
  { text: 'Inventory', icon: <InventoryIcon />, path: '/inventory' },
  { text: 'Employees', icon: <PeopleIcon />, path: '/employees' },
];

const financeMenu = [
  { text: 'Farmer Payments', icon: <PaymentsIcon />, path: '/payments' },
  { text: 'Billing & Invoices', icon: <ReceiptIcon />, path: '/billing' },
  { text: 'Customer Dues', icon: <StorefrontIcon />, path: '/customers' }, // Using customers page for dues
  { text: 'Expenses', icon: <SalesIcon />, path: '/expenses' },
];

export default function MainLayout() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const drawer = (
    <div>
      <Toolbar>
        <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          KisanGat
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        <ListItem disablePadding>
          <ListItemButton selected={location.pathname === '/'} onClick={() => { navigate('/'); if (isMobile) setMobileOpen(false); }}>
            <ListItemIcon sx={{ color: location.pathname === '/' ? 'primary.main' : 'inherit' }}><DashboardIcon /></ListItemIcon>
            <ListItemText primary="Dashboard" primaryTypographyProps={{ fontWeight: location.pathname === '/' ? 'bold' : 'normal' }} />
          </ListItemButton>
        </ListItem>
        
        <Divider sx={{ my: 1 }} />
        <Typography variant="overline" sx={{ px: 3, color: 'text.secondary', fontWeight: 'bold' }}>OPERATIONS</Typography>
        
        {operationsMenu.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => {
                navigate(item.path);
                if (isMobile) setMobileOpen(false);
              }}
            >
              <ListItemIcon sx={{ color: location.pathname === item.path ? 'primary.main' : 'inherit' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.text} 
                primaryTypographyProps={{ 
                  fontWeight: location.pathname === item.path ? 'bold' : 'normal' 
                }} 
              />
            </ListItemButton>
          </ListItem>
        ))}

        <Divider sx={{ my: 1 }} />
        <Typography variant="overline" sx={{ px: 3, color: 'text.secondary', fontWeight: 'bold' }}>FINANCE</Typography>

        {financeMenu.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => {
                navigate(item.path);
                if (isMobile) setMobileOpen(false);
              }}
            >
              <ListItemIcon sx={{ color: location.pathname === item.path ? 'primary.main' : 'inherit' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.text} 
                primaryTypographyProps={{ 
                  fontWeight: location.pathname === item.path ? 'bold' : 'normal' 
                }} 
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          bgcolor: 'background.paper',
          color: 'text.primary',
          boxShadow: 1
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {[...operationsMenu, ...financeMenu].find(i => i.path === location.pathname)?.text || 'Dashboard'}
          </Typography>
          
          <div>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleMenu}
              color="inherit"
            >
              <AccountCircle color="primary" />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              <MenuItem onClick={handleClose}>Profile</MenuItem>
              <MenuItem onClick={handleClose}>Settings</MenuItem>
              <MenuItem onClick={handleLogout}>Logout</MenuItem>
            </Menu>
          </div>
        </Toolbar>
      </AppBar>
      
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        aria-label="mailbox folders"
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{ flexGrow: 1, p: 3, width: { sm: `calc(100% - ${drawerWidth}px)` }, bgcolor: '#f5f5f5', minHeight: '100vh' }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
}
