import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
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
  useMediaQuery,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Tooltip,
  Collapse,
  Badge,
} from '@mui/material';
import { axiosPrivate } from '../api/axios';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  LocalShipping as MilkIcon,
  AttachMoney as SalesIcon,
  AccountBalanceWallet as PaymentsIcon,
  Storefront as StorefrontIcon,
  Inventory as InventoryIcon,
  Receipt as ReceiptIcon,
  Settings as SettingsIcon,
  ChevronLeft as ChevronLeftIcon,
  NotificationsOutlined as NotificationsIcon,
  Search as SearchIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';

const drawerWidth = 260;
const collapsedDrawerWidth = 80;

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
  { text: 'Farmer Payments', icon: <Badge badgeContent={3} color="error" sx={{ '& .MuiBadge-badge': { fontSize: '10px', height: '16px', minWidth: '16px', transform: 'translate(30%, -20%)' } }}><PaymentsIcon /></Badge>, path: '/payments' },
  { text: 'Billing & Invoices', icon: <ReceiptIcon />, path: '/billing' },
  { text: 'Customer Dues', icon: <StorefrontIcon />, path: '/dues' },
  { text: 'Expenses', icon: <SalesIcon />, path: '/expenses' },
];

export default function MainLayout() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  const [anchorEl, setAnchorEl] = useState(null);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [profile, setProfile] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { refreshToken } = useSelector((state) => state.auth);

  useEffect(() => {
    fetchProfile();
    // Auto collapse on tablet
    if (isTablet && !isMobile) {
      setIsCollapsed(true);
    } else {
      setIsCollapsed(false);
    }
  }, [isTablet, isMobile]);

  const fetchProfile = async () => {
    try {
      const response = await axiosPrivate.get('/profile/');
      setProfile(response.data.account);
    } catch (err) {
      console.error('Failed to fetch profile', err);
    }
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const confirmLogout = async () => {
    try {
      await axiosPrivate.post('/auth/logout/', { refresh: refreshToken });
    } catch (err) {
      console.error('Logout failed on backend', err);
    } finally {
      dispatch(logout());
      navigate('/login');
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const currentDrawerWidth = isCollapsed ? collapsedDrawerWidth : drawerWidth;

  const renderNavItems = (items) => (
    items.map((item) => {
      const isSelected = location.pathname.startsWith(item.path);
      return (
        <ListItem key={item.text} disablePadding sx={{ display: 'block', mb: 0.5 }}>
          <Tooltip title={isCollapsed ? item.text : ""} placement="right">
            <ListItemButton
              selected={isSelected}
              onClick={() => {
                navigate(item.path);
                if (isMobile) setMobileOpen(false);
              }}
              sx={{
                minHeight: 48,
                justifyContent: isCollapsed ? 'center' : 'initial',
                px: 2.5,
                mx: 1,
                borderRadius: '8px',
                transition: 'all 0.2s',
                '&.Mui-selected': {
                  backgroundColor: 'primary.main',
                  color: 'white',
                  boxShadow: '0 4px 6px -1px rgb(37 99 235 / 0.4)',
                  '&:hover': {
                    backgroundColor: 'primary.dark',
                  },
                  '& .MuiListItemIcon-root': {
                    color: 'white',
                  }
                },
                '&:hover': {
                  backgroundColor: isSelected ? 'primary.dark' : 'rgba(37, 99, 235, 0.08)',
                  color: isSelected ? 'white' : 'primary.main',
                  '& .MuiListItemIcon-root': {
                    color: isSelected ? 'white' : 'primary.main',
                  }
                }
              }}
            >
              <ListItemIcon 
                sx={{ 
                  minWidth: 0, 
                  mr: isCollapsed ? 0 : 2, 
                  justifyContent: 'center',
                  color: isSelected ? 'white' : 'text.secondary',
                  transition: 'color 0.2s',
                }}
              >
                {item.icon}
              </ListItemIcon>
              {!isCollapsed && (
                <ListItemText 
                  primary={item.text} 
                  primaryTypographyProps={{ 
                    fontWeight: isSelected ? 600 : 500,
                    fontSize: '0.9rem'
                  }} 
                />
              )}
            </ListItemButton>
          </Tooltip>
        </ListItem>
      );
    })
  );

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Toolbar sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: isCollapsed ? 'center' : 'space-between',
        px: [1, 2, 2],
        py: 1
      }}>
        {!isCollapsed && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ 
              width: 32, 
              height: 32, 
              borderRadius: '8px', 
              bgcolor: 'primary.main', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              color: 'white',
              fontWeight: 'bold'
            }}>
              K
            </Box>
            <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 800, color: 'text.primary', letterSpacing: '-0.5px' }}>
              KisanGat
            </Typography>
          </Box>
        )}
        {isCollapsed && (
          <Box sx={{ 
            width: 32, 
            height: 32, 
            borderRadius: '8px', 
            bgcolor: 'primary.main', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            color: 'white',
            fontWeight: 'bold'
          }}>
            K
          </Box>
        )}
        {!isMobile && (
          <IconButton onClick={toggleCollapse} size="small" sx={{ color: 'text.secondary', ml: isCollapsed ? 0 : 1, mt: isCollapsed ? 1 : 0 }}>
            {isCollapsed ? <MenuIcon fontSize="small" /> : <ChevronLeftIcon fontSize="small" />}
          </IconButton>
        )}
      </Toolbar>
      
      <Box sx={{ overflowY: 'auto', overflowX: 'hidden', flexGrow: 1, py: 2, '&::-webkit-scrollbar': { width: '4px' }, '&::-webkit-scrollbar-thumb': { backgroundColor: 'rgba(0,0,0,0.1)', borderRadius: '4px' } }}>
        <List>
          <ListItem disablePadding sx={{ display: 'block', mb: 0.5 }}>
             <Tooltip title={isCollapsed ? "Dashboard" : ""} placement="right">
                <ListItemButton 
                  selected={location.pathname === '/dashboard' || location.pathname === '/'} 
                  onClick={() => { navigate('/dashboard'); if (isMobile) setMobileOpen(false); }}
                  sx={{
                    minHeight: 48,
                    justifyContent: isCollapsed ? 'center' : 'initial',
                    px: 2.5,
                    mx: 1,
                    borderRadius: '8px',
                    transition: 'all 0.2s',
                    '&.Mui-selected': {
                      backgroundColor: 'primary.main',
                      color: 'white',
                      boxShadow: '0 4px 6px -1px rgb(37 99 235 / 0.4)',
                      '&:hover': { backgroundColor: 'primary.dark' },
                      '& .MuiListItemIcon-root': { color: 'white' }
                    },
                    '&:hover': {
                      backgroundColor: (location.pathname === '/dashboard' || location.pathname === '/') ? 'primary.dark' : 'rgba(37, 99, 235, 0.08)',
                      color: (location.pathname === '/dashboard' || location.pathname === '/') ? 'white' : 'primary.main',
                      '& .MuiListItemIcon-root': {
                        color: (location.pathname === '/dashboard' || location.pathname === '/') ? 'white' : 'primary.main',
                      }
                    }
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 0, mr: isCollapsed ? 0 : 2, justifyContent: 'center', color: (location.pathname === '/dashboard' || location.pathname === '/') ? 'white' : 'text.secondary' }}>
                    <DashboardIcon />
                  </ListItemIcon>
                  {!isCollapsed && (
                    <ListItemText primary="Dashboard" primaryTypographyProps={{ fontWeight: (location.pathname === '/dashboard' || location.pathname === '/') ? 600 : 500, fontSize: '0.9rem' }} />
                  )}
                </ListItemButton>
             </Tooltip>
          </ListItem>
          
          <Divider sx={{ my: 2, mx: 2, borderColor: 'rgba(0,0,0,0.04)' }} />
          
          {!isCollapsed && (
            <Typography variant="overline" sx={{ px: 3, color: 'text.secondary', fontWeight: 700, letterSpacing: '1px', fontSize: '0.7rem' }}>
              OPERATIONS
            </Typography>
          )}
          
          {renderNavItems(operationsMenu)}

          <Divider sx={{ my: 2, mx: 2, borderColor: 'rgba(0,0,0,0.04)' }} />
          
          {!isCollapsed && (
            <Typography variant="overline" sx={{ px: 3, color: 'text.secondary', fontWeight: 700, letterSpacing: '1px', fontSize: '0.7rem' }}>
              FINANCE
            </Typography>
          )}

          {renderNavItems(financeMenu)}

          <Divider sx={{ my: 2, mx: 2, borderColor: 'rgba(0,0,0,0.04)' }} />

          <ListItem disablePadding sx={{ display: 'block', mb: 0.5 }}>
             <Tooltip title={isCollapsed ? "Settings" : ""} placement="right">
                <ListItemButton 
                  selected={location.pathname === '/settings'} 
                  onClick={() => { navigate('/settings'); if (isMobile) setMobileOpen(false); }}
                  sx={{
                    minHeight: 48,
                    justifyContent: isCollapsed ? 'center' : 'initial',
                    px: 2.5,
                    mx: 1,
                    borderRadius: '8px',
                    transition: 'all 0.2s',
                    '&.Mui-selected': {
                      backgroundColor: 'primary.main',
                      color: 'white',
                      boxShadow: '0 4px 6px -1px rgb(37 99 235 / 0.4)',
                      '&:hover': { backgroundColor: 'primary.dark' },
                      '& .MuiListItemIcon-root': { color: 'white' }
                    },
                    '&:hover': {
                      backgroundColor: location.pathname === '/settings' ? 'primary.dark' : 'rgba(37, 99, 235, 0.08)',
                      color: location.pathname === '/settings' ? 'white' : 'primary.main',
                      '& .MuiListItemIcon-root': {
                        color: location.pathname === '/settings' ? 'white' : 'primary.main',
                      }
                    }
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 0, mr: isCollapsed ? 0 : 2, justifyContent: 'center', color: location.pathname === '/settings' ? 'white' : 'text.secondary' }}>
                    <SettingsIcon />
                  </ListItemIcon>
                  {!isCollapsed && (
                    <ListItemText primary="Settings" primaryTypographyProps={{ fontWeight: location.pathname === '/settings' ? 600 : 500, fontSize: '0.9rem' }} />
                  )}
                </ListItemButton>
             </Tooltip>
          </ListItem>
        </List>
      </Box>
      
      {!isCollapsed && profile && (
        <Box sx={{ p: 2, borderTop: '1px solid rgba(226, 232, 240, 1)' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1, borderRadius: '8px', '&:hover': { bgcolor: 'rgba(0,0,0,0.02)' } }}>
            <Avatar sx={{ bgcolor: 'primary.light', width: 36, height: 36, fontSize: '0.9rem', fontWeight: 'bold' }}>
              {getInitials(profile.first_name ? `${profile.first_name} ${profile.last_name}` : profile.username)}
            </Avatar>
            <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
              <Typography variant="subtitle2" noWrap sx={{ fontWeight: 600, lineHeight: 1.2 }}>
                {profile.first_name ? `${profile.first_name} ${profile.last_name}` : profile.username}
              </Typography>
              <Typography variant="caption" color="text.secondary" noWrap>
                {profile.role || 'Admin'}
              </Typography>
            </Box>
            <IconButton size="small" onClick={() => setLogoutModalOpen(true)} sx={{ color: 'text.secondary' }}>
              <LogoutIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>
      )}
      {isCollapsed && profile && (
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'center', borderTop: '1px solid rgba(226, 232, 240, 1)' }}>
          <Avatar 
            onClick={() => setLogoutModalOpen(true)}
            sx={{ bgcolor: 'primary.light', width: 36, height: 36, fontSize: '0.9rem', fontWeight: 'bold', cursor: 'pointer' }}
          >
            {getInitials(profile.first_name ? `${profile.first_name} ${profile.last_name}` : profile.username)}
          </Avatar>
        </Box>
      )}
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { sm: `calc(100% - ${currentDrawerWidth}px)` },
          ml: { sm: `${currentDrawerWidth}px` },
          bgcolor: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(226, 232, 240, 0.8)',
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' }, color: 'text.primary' }}
          >
            <MenuIcon />
          </IconButton>
          
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 700, color: 'text.primary' }}>
              {[...operationsMenu, ...financeMenu].find(i => location.pathname.startsWith(i.path))?.text || 'Dashboard'}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton sx={{ color: 'text.secondary', bgcolor: 'background.default' }}>
              <SearchIcon />
            </IconButton>
            <IconButton sx={{ color: 'text.secondary', bgcolor: 'background.default' }}>
              <NotificationsIcon />
            </IconButton>
            <IconButton
              onClick={handleMenu}
              sx={{ ml: 1, p: 0.5, border: '2px solid transparent', '&:hover': { borderColor: 'primary.light' } }}
            >
              {profile ? (
                <Avatar sx={{ bgcolor: 'primary.main', width: 34, height: 34, fontSize: '0.9rem', fontWeight: 'bold' }}>
                  {getInitials(profile.first_name ? `${profile.first_name} ${profile.last_name}` : profile.username)}
                </Avatar>
              ) : (
                <Avatar sx={{ width: 34, height: 34 }} />
              )}
            </IconButton>
            
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              keepMounted
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              open={Boolean(anchorEl)}
              onClose={handleClose}
              PaperProps={{
                elevation: 0,
                sx: {
                  overflow: 'visible',
                  filter: 'drop-shadow(0px 4px 20px rgba(0,0,0,0.1))',
                  mt: 1.5,
                  borderRadius: 3,
                  minWidth: 200,
                  '& .MuiAvatar-root': {
                    width: 32,
                    height: 32,
                    ml: -0.5,
                    mr: 1,
                  },
                  '&:before': {
                    content: '""',
                    display: 'block',
                    position: 'absolute',
                    top: 0,
                    right: 14,
                    width: 10,
                    height: 10,
                    bgcolor: 'background.paper',
                    transform: 'translateY(-50%) rotate(45deg)',
                    zIndex: 0,
                  },
                },
              }}
            >
              {profile && (
                <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid rgba(226, 232, 240, 1)', mb: 1 }}>
                  <Typography variant="subtitle2" fontWeight="700" color="text.primary">
                    {profile.first_name ? `${profile.first_name} ${profile.last_name}` : profile.username}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {profile.email || profile.role || 'Administrator'}
                  </Typography>
                </Box>
              )}
              <MenuItem onClick={() => { handleClose(); navigate('/profile'); }} sx={{ fontSize: '0.9rem', fontWeight: 500 }}>
                Profile Settings
              </MenuItem>
              <MenuItem onClick={() => { handleClose(); navigate('/settings'); }} sx={{ fontSize: '0.9rem', fontWeight: 500 }}>
                Dairy Preferences
              </MenuItem>
              <Divider />
              <MenuItem onClick={() => { handleClose(); setLogoutModalOpen(true); }} sx={{ color: 'error.main', fontSize: '0.9rem', fontWeight: 500 }}>
                <LogoutIcon fontSize="small" sx={{ mr: 1 }} /> Logout
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>
      
      <Box
        component="nav"
        sx={{ width: { sm: currentDrawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
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
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: currentDrawerWidth,
              transition: theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
              }),
              overflowX: 'hidden'
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{ 
          flexGrow: 1, 
          p: { xs: 2, md: 4 }, 
          width: { sm: `calc(100% - ${currentDrawerWidth}px)` }, 
          bgcolor: 'background.default', 
          minHeight: '100vh',
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>

      {/* Logout Confirmation Modal */}
      <Dialog 
        open={logoutModalOpen} 
        onClose={() => setLogoutModalOpen(false)}
        PaperProps={{ sx: { borderRadius: 3, p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 800, fontSize: '1.25rem' }}>Confirm Logout</DialogTitle>
        <DialogContent>
          <Typography color="text.secondary">Are you sure you want to end your session?</Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setLogoutModalOpen(false)} color="inherit" sx={{ fontWeight: 600 }}>Cancel</Button>
          <Button onClick={confirmLogout} variant="contained" color="error" disableElevation sx={{ fontWeight: 600 }}>Logout</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
