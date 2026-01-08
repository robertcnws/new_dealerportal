import React, { useEffect, useState } from 'react';
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
    Box
} from '@mui/material';
import {
    Menu as MenuIcon
} from '@mui/icons-material';
import {
    Cart,
    GraphUp,
    JournalBookmark,
    Grid,
    Building,
    Gear
} from 'react-bootstrap-icons';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import logo from '../../static/styles/img/logo13.png';
import { fetchWithToken } from '../../utils';
import { apiUrl, apiFrontendRoot } from '../../config';

const SidebarComponent = ({ activePage, user }) => {
    const [mobileOpen, setMobileOpen] = useState(false);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
    // const isMobile = useMediaQuery('(max-width:999px)');
    const hasRole = (role) => user.role.includes(role);
    const [dealer, setDealer] = useState(null);
    const [row, setRow] = useState(null);

    const location = useLocation();
    const navigate = useNavigate();
    const currentPath = location.pathname;

    const isActive = (path) => {
        if (currentPath === path) return true;
        else if (currentPath.includes('quote-details')) {
            if (path.includes('quotes')) return true;
        }
        else if (currentPath.includes('order-details')) {
            if (path.includes('orders')) return true;
        }
        else if (currentPath.includes('dealership-details')) {
            if (path.includes('dealerships')) return true;
        }
        else if (currentPath.includes('z-integration')) {
            if (path.includes('settings')) return true;
        }
        return false;
    };

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const getListButtonStyles = (active) => ({
        color: active ? 'white' : 'inherit',
        backgroundColor: active ? '#669a41' : 'inherit',
        borderRadius: active ? 1 : 0,
        marginX: 1, // Agrega márgenes horizontales para crear padding alrededor del fondo
        '&:hover': {
            backgroundColor: active ? '#669a41' : 'rgba(102, 154, 65, 0.1)', // Color de fondo en hover
            borderRadius: 1, // Mantiene el borde redondeado en hover
        },
    });

    const getDealer = async () => {
        if (hasRole('DealerAdmin')) {
            try {
                const user = JSON.parse(localStorage.getItem('userLogged') || '{}');
                const url = `${apiUrl}/dealerportal/dealership/${user.data.id}/`;
                const response = await fetchWithToken(url, 'GET', null, {}, apiUrl);
                if (response.status === 200) {
                    console.log('Dealer:', response.data.data);
                    setDealer(response.data.data);
                }
            } catch (error) {
                console.log('Error:', error);
            }
        }
        return '';
    };

    const handleManageDealer = () => {
        if (isMobile || isTablet) handleDrawerToggle();
        if (dealer && row) navigate(`${apiFrontendRoot}/dealership-details`, { state: { dealership: row } });
    };


    useEffect(() => {
        getDealer();
    }, [apiUrl]);

    useEffect(() => {
        const data = {
          id: dealer?.id,
          status: dealer?.is_active ? 'active' : 'inactive',
          logo: dealer?.logo,
          account_name: dealer?.name,
          phone: dealer?.company_phone,
          tier: dealer?.pricing_tier,
          dealer_admin: `${dealer?.dealer_admin?.first_name ? dealer?.dealer_admin?.first_name : ''} ${dealer?.dealer_admin?.last_name ? dealer?.dealer_admin?.last_name : ''}`,
          address: dealer?.company_address,
          email: dealer?.zoho_email,
          zoho_id: dealer?.zoho_id,
        };
        setRow(data);
      }, [dealer]);


    const drawerContent = (
        <Box>
            <div style={{ padding: '16px' }}>
                <Link to="/">
                    <img src={logo} alt="Logo" style={{ width: '100%' }} />
                </Link>
            </div>
            <Divider />
            <List sx={{ color: '#677488', p: 0 }}>
                <ListItemButton component={Link} to={apiFrontendRoot}
                    onClick={isMobile || isTablet ? handleDrawerToggle : undefined}
                    sx={getListButtonStyles(isActive(apiFrontendRoot))}
                >
                    <ListItemIcon sx={{ color: isActive(apiFrontendRoot) ? 'white' : 'inherit' }}>
                        <Grid />
                    </ListItemIcon>
                    <ListItemText primary="Dashboard" />
                </ListItemButton>
                <ListItemButton component={Link} to={`${apiFrontendRoot}/quotes`}
                    onClick={isMobile || isTablet ? handleDrawerToggle : undefined}
                    sx={getListButtonStyles(isActive(`${apiFrontendRoot}/quotes`))}
                >
                    <ListItemIcon sx={{ color: isActive(`${apiFrontendRoot}/quotes`) ? 'white' : 'inherit' }}>
                        <JournalBookmark />
                    </ListItemIcon>
                    <ListItemText primary="Quotes" />
                </ListItemButton>
                <ListItemButton component={Link} to={`${apiFrontendRoot}/orders`}
                    onClick={isMobile || isTablet  ? handleDrawerToggle : undefined}
                    sx={getListButtonStyles(isActive(`${apiFrontendRoot}/orders`))}
                >
                    <ListItemIcon sx={{ color: isActive(`${apiFrontendRoot}/orders`) ? 'white' : 'inherit' }}>
                        <Cart />
                    </ListItemIcon>
                    <ListItemText primary="Orders" />
                </ListItemButton>
                <ListItemButton component={Link} to={`${apiFrontendRoot}/check-stock`}
                    onClick={isMobile || isTablet  ? handleDrawerToggle : undefined}
                    sx={getListButtonStyles(isActive(`${apiFrontendRoot}/check-stock`))}
                >
                    <ListItemIcon sx={{ color: isActive(`${apiFrontendRoot}/check-stock`) ? 'white' : 'inherit' }}>
                        <GraphUp />
                    </ListItemIcon>
                    <ListItemText primary="Stock" />
                </ListItemButton>

                {hasRole('AppManager') && (
                    <ListItemButton component={Link} to="/manage-dealers"
                        onClick={isMobile || isTablet  ? handleDrawerToggle : undefined}
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
                        <ListItemButton component={Link} to={`${apiFrontendRoot}/dealerships`}
                            onClick={isMobile || isTablet  ? handleDrawerToggle : undefined}
                            sx={getListButtonStyles(isActive(`${apiFrontendRoot}/dealerships`))}
                        >
                            <ListItemIcon sx={{ color: isActive(`${apiFrontendRoot}/dealerships`) ? 'white' : 'inherit' }}>
                                <Building />
                            </ListItemIcon>
                            <ListItemText primary="Manage Dealerships" />
                        </ListItemButton>
                        <ListItemButton component={Link} to={`${apiFrontendRoot}/settings`} 
                        onClick={isMobile ? handleDrawerToggle : undefined} 
                        sx={getListButtonStyles(isActive(`${apiFrontendRoot}/settings`))}>
                            <ListItemIcon>
                                <Gear />
                            </ListItemIcon>
                            <ListItemText primary="Settings" />
                        </ListItemButton>
                    </>
                )}

                {hasRole('DealerAdmin') && (
                    <ListItemButton onClick={() => handleManageDealer()}
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
    );

    return (
        <Box component="nav" sx={{ width: { sm: 240, md: 240 }, flexShrink: { sm: 0, md: 0 } }}>
            {isMobile || isTablet ? (
                <>
                    <IconButton
                        // color="black"
                        aria-label="open drawer"
                        edge="start"
                        onClick={handleDrawerToggle}
                        sx={{ 
                            mr: 0, 
                            ml: isMobile || isTablet ? 1 : 20, 
                            display: { xs: 'block', md: 'none' }, 
                            bgcolor: '#669A41',
                            color: 'white',
                            height: '40px',
                            borderRadius: '15px',
                        }}
                    >
                        <MenuIcon sx={{ mb: 2 }}/>
                    </IconButton>
                    <Drawer
                        variant="temporary"
                        open={mobileOpen}
                        onClose={handleDrawerToggle}
                        ModalProps={{
                            keepMounted: true, // Better open performance on mobile.
                        }}
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
