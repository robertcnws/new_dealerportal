import React, { useState } from 'react';
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
    Grid
} from 'react-bootstrap-icons';
import { Link } from 'react-router-dom';
import { apiFrontendRoot } from '../../config';
import logo from '../../static/styles/img/logo13.png';

const SidebarComponent = ({ activePage, user }) => {
    const [mobileOpen, setMobileOpen] = useState(false);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const isActive = (page) => activePage === page ? 'active' : '';
    const hasRole = (role) => user.role.includes(role);

    const drawerContent = (
        <Box>
            <div style={{ padding: '16px' }}>
                <Link to="/">
                    <img src={logo} alt="Logo" style={{ width: '100%' }} />
                </Link>
            </div>
            <Divider />
            <List sx={{ color: '#677488'}}>
                <ListItemButton component={Link} to="/" className={isActive('dashboard')} onClick={isMobile ? handleDrawerToggle : undefined}>
                    <ListItemIcon>
                        <Grid />
                    </ListItemIcon>
                    <ListItemText primary="Dashboard"/>
                </ListItemButton>
                <ListItemButton component={Link} to={`${apiFrontendRoot}/quotes`} className={isActive('quotes')} onClick={isMobile ? handleDrawerToggle : undefined}>
                    <ListItemIcon>
                        <JournalBookmark />
                    </ListItemIcon>
                    <ListItemText primary="Quotes" />
                </ListItemButton>
                <ListItemButton component={Link} to={`${apiFrontendRoot}/orders`} className={isActive('orders')} onClick={isMobile ? handleDrawerToggle : undefined}>
                    <ListItemIcon>
                        <Cart />
                    </ListItemIcon>
                    <ListItemText primary="Orders" />
                </ListItemButton>
                <ListItemButton component={Link} to={`${apiFrontendRoot}/check-stock`} className={isActive('stock')} onClick={isMobile ? handleDrawerToggle : undefined}>
                    <ListItemIcon>
                        <GraphUp />
                    </ListItemIcon>
                    <ListItemText primary="Stock" />
                </ListItemButton>

                {/* {hasRole('AppManager') && (
                    <ListItemButton component={Link} to="/manage-dealers" className={isActive('dealerships')} onClick={isMobile ? handleDrawerToggle : undefined}>
                        <ListItemIcon>
                            <Building />
                        </ListItemIcon>
                        <ListItemText primary="Manage Dealerships" />
                    </ListItemButton>
                )} */}

                {/* {hasRole('AppAdmin') && (
                    <>
                        <ListItemButton component={Link} to="/manage-dealers" className={isActive('dealerships')} onClick={isMobile ? handleDrawerToggle : undefined}>
                            <ListItemIcon>
                                <Building />
                            </ListItemIcon>
                            <ListItemText primary="Manage Dealerships" />
                        </ListItemButton>
                        <ListItemButton component={Link} to="/settings" className={isActive('settings')} onClick={isMobile ? handleDrawerToggle : undefined}>
                            <ListItemIcon>
                                <Gear />
                            </ListItemIcon>
                            <ListItemText primary="Settings" />
                        </ListItemButton>
                    </>
                )} */}

                {/* {hasRole('DealerAdmin') && (
                    <ListItemButton component={Link} to={`/manage-dealership/${user.dealerAccountId}`} className={isActive('dealerships')} onClick={isMobile ? handleDrawerToggle : undefined}>
                        <ListItemIcon>
                            <Gear />
                        </ListItemIcon>
                        <ListItemText primary="Manage Dealership" />
                    </ListItemButton>
                )} */}
            </List>
        </Box>
    );

    return (
        <Box component="nav" sx={{ width: { sm: 240 }, flexShrink: { sm: 0 } }}>
            {isMobile ? (
                <>
                    <IconButton
                        color="black"
                        aria-label="open drawer"
                        edge="start"
                        onClick={handleDrawerToggle}
                        sx={{ mr: 0, ml: 1, display: { sm: 'none' } }}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Drawer
                        variant="temporary"
                        open={mobileOpen}
                        onClose={handleDrawerToggle}
                        ModalProps={{
                            keepMounted: true, // Better open performance on mobile.
                        }}
                        sx={{
                            display: { xs: 'block', sm: 'none' },
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
