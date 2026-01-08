import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Drawer,
  List,
  ListItemIcon,
  ListItemText,
  Divider,
  IconButton,
  ListItemButton,
  useMediaQuery,
  useTheme,
  Box,
} from '@mui/material';
import { Menu as MenuIcon } from '@mui/icons-material';
import { Cart, GraphUp, JournalBookmark, Grid, Building, Gear } from 'react-bootstrap-icons';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import logo from '../../static/styles/img/logo13.png';
import { fetchWithToken } from '../../utils';
import { apiUrl, apiFrontendRoot } from '../../config';

const SidebarComponent = ({ user }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dealer, setDealer] = useState(null);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));

  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;

  const hasRole = useCallback((role) => (user?.role || '').includes(role), [user]);

  const isActive = useCallback(
    (path) => {
      if (currentPath === path) return true;
      if (currentPath.includes('quote-details')) return path.includes('quotes');
      if (currentPath.includes('order-details')) return path.includes('orders');
      if (currentPath.includes('dealership-details')) return path.includes('dealerships') || path.includes('manage-dealership');
      if (currentPath.includes('z-integration')) return path.includes('settings');
      return false;
    },
    [currentPath]
  );

  const getListButtonStyles = useCallback(
    (active) => ({
      color: active ? 'white' : 'inherit',
      backgroundColor: active ? '#669a41' : 'inherit',
      borderRadius: active ? 1 : 0,
      marginX: 1,
      '&:hover': {
        backgroundColor: active ? '#669a41' : 'rgba(102, 154, 65, 0.1)',
        borderRadius: 1,
      },
    }),
    []
  );

  const dealerRow = useMemo(() => {
    if (!dealer) return null;
    return {
      id: dealer?.id,
      status: dealer?.is_active ? 'active' : 'inactive',
      logo: dealer?.logo,
      account_name: dealer?.name,
      phone: dealer?.company_phone,
      tier: dealer?.pricing_tier,
      dealer_admin: `${dealer?.dealer_admin?.first_name || ''} ${dealer?.dealer_admin?.last_name || ''}`.trim(),
      address: dealer?.company_address,
      email: dealer?.zoho_email,
      zoho_id: dealer?.zoho_id,
    };
  }, [dealer]);

  const handleDrawerToggle = useCallback(() => {
    setMobileOpen((v) => !v);
  }, []);

  const closeDrawerIfNeeded = useCallback(() => {
    if (isMobile || isTablet) setMobileOpen(false);
  }, [isMobile, isTablet]);

  const fetchDealer = useCallback(async () => {
    if (!hasRole('DealerAdmin')) return;
    try {
      const u = JSON.parse(localStorage.getItem('userLogged') || '{}');
      const userId = u?.data?.id;
      if (!userId) return;
      const url = `${apiUrl}/dealerportal/dealership/${userId}/`;
      const response = await fetchWithToken(url, 'GET', null, {}, apiUrl);
      if (response?.status === 200) setDealer(response.data.data);
    } catch (e) {
      console.log(e);
    }
  }, [hasRole]);

  useEffect(() => {
    fetchDealer();
  }, [fetchDealer]);

  const handleManageDealer = useCallback(() => {
    closeDrawerIfNeeded();
    if (dealerRow) navigate(`${apiFrontendRoot}/dealership-details`, { state: { dealership: dealerRow } });
  }, [closeDrawerIfNeeded, dealerRow, navigate]);

  const drawerContent = useMemo(
    () => (
      <Box>
        <Box sx={{ p: 2 }}>
          <Link to={apiFrontendRoot}>
            <img src={logo} alt="Logo" style={{ width: '100%' }} />
          </Link>
        </Box>
        <Divider />
        <List sx={{ color: '#677488', p: 0 }}>
          <ListItemButton
            component={Link}
            to={apiFrontendRoot}
            onClick={closeDrawerIfNeeded}
            sx={getListButtonStyles(isActive(apiFrontendRoot))}
          >
            <ListItemIcon sx={{ color: isActive(apiFrontendRoot) ? 'white' : 'inherit' }}>
              <Grid />
            </ListItemIcon>
            <ListItemText primary="Dashboard" />
          </ListItemButton>

          <ListItemButton
            component={Link}
            to={`${apiFrontendRoot}/quotes`}
            onClick={closeDrawerIfNeeded}
            sx={getListButtonStyles(isActive(`${apiFrontendRoot}/quotes`))}
          >
            <ListItemIcon sx={{ color: isActive(`${apiFrontendRoot}/quotes`) ? 'white' : 'inherit' }}>
              <JournalBookmark />
            </ListItemIcon>
            <ListItemText primary="Quotes" />
          </ListItemButton>

          <ListItemButton
            component={Link}
            to={`${apiFrontendRoot}/orders`}
            onClick={closeDrawerIfNeeded}
            sx={getListButtonStyles(isActive(`${apiFrontendRoot}/orders`))}
          >
            <ListItemIcon sx={{ color: isActive(`${apiFrontendRoot}/orders`) ? 'white' : 'inherit' }}>
              <Cart />
            </ListItemIcon>
            <ListItemText primary="Orders" />
          </ListItemButton>

          <ListItemButton
            component={Link}
            to={`${apiFrontendRoot}/check-stock`}
            onClick={closeDrawerIfNeeded}
            sx={getListButtonStyles(isActive(`${apiFrontendRoot}/check-stock`))}
          >
            <ListItemIcon sx={{ color: isActive(`${apiFrontendRoot}/check-stock`) ? 'white' : 'inherit' }}>
              <GraphUp />
            </ListItemIcon>
            <ListItemText primary="Stock" />
          </ListItemButton>

          {hasRole('AppManager') && (
            <ListItemButton
              component={Link}
              to={`${apiFrontendRoot}/manage-dealers`}
              onClick={closeDrawerIfNeeded}
              sx={getListButtonStyles(isActive(`${apiFrontendRoot}/manage-dealers`))}
            >
              <ListItemIcon sx={{ color: isActive(`${apiFrontendRoot}/manage-dealers`) ? 'white' : 'inherit' }}>
                <Building />
              </ListItemIcon>
              <ListItemText primary="Manage Dealerships" />
            </ListItemButton>
          )}

          {hasRole('AppAdmin') && (
            <>
              <ListItemButton
                component={Link}
                to={`${apiFrontendRoot}/dealerships`}
                onClick={closeDrawerIfNeeded}
                sx={getListButtonStyles(isActive(`${apiFrontendRoot}/dealerships`))}
              >
                <ListItemIcon sx={{ color: isActive(`${apiFrontendRoot}/dealerships`) ? 'white' : 'inherit' }}>
                  <Building />
                </ListItemIcon>
                <ListItemText primary="Manage Dealerships" />
              </ListItemButton>

              <ListItemButton
                component={Link}
                to={`${apiFrontendRoot}/settings`}
                onClick={closeDrawerIfNeeded}
                sx={getListButtonStyles(isActive(`${apiFrontendRoot}/settings`))}
              >
                <ListItemIcon sx={{ color: isActive(`${apiFrontendRoot}/settings`) ? 'white' : 'inherit' }}>
                  <Gear />
                </ListItemIcon>
                <ListItemText primary="Settings" />
              </ListItemButton>
            </>
          )}

          {hasRole('DealerAdmin') && (
            <ListItemButton
              onClick={handleManageDealer}
              sx={getListButtonStyles(isActive(`${apiFrontendRoot}/manage-dealership`))}
            >
              <ListItemIcon sx={{ color: isActive(`${apiFrontendRoot}/manage-dealership`) ? 'white' : 'inherit' }}>
                <Gear />
              </ListItemIcon>
              <ListItemText primary="Manage Dealership" />
            </ListItemButton>
          )}
        </List>
      </Box>
    ),
    [closeDrawerIfNeeded, getListButtonStyles, handleManageDealer, hasRole, isActive]
  );

  return (
    <Box component="nav" sx={{ width: { sm: 240, md: 240 }, flexShrink: { sm: 0, md: 0 } }}>
      {isMobile || isTablet ? (
        <>
          <IconButton
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{
              mr: 0,
              ml: 1,
              display: { xs: 'block', md: 'none' },
              bgcolor: '#669A41',
              color: 'white',
              height: '40px',
              borderRadius: '15px',
            }}
          >
            <MenuIcon />
          </IconButton>
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{ keepMounted: true }}
            sx={{
              display: { xs: 'block', md: 'none' },
              '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 240 },
            }}
          >
            {drawerContent}
          </Drawer>
        </>
      ) : (
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 240 },
          }}
          open
        >
          {drawerContent}
        </Drawer>
      )}
    </Box>
  );
};

export default SidebarComponent;
