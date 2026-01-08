import React, { useState, useEffect, useContext, useCallback } from 'react';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  InputBase,
  Menu,
  MenuItem,
  Badge,
  Box,
  useMediaQuery,
  useTheme,
  Grid,
  Drawer,
  List,
  ListItemText,
  ListItemButton,
  ListItemIcon,
} from '@mui/material';
import {
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
} from '@mui/icons-material';
import { Bell } from 'react-bootstrap-icons';
import LogoutIcon from '@mui/icons-material/Logout';
import { Link, useLocation } from 'react-router-dom';
import ThemeToggleComponent from '../ThemeToggleComponent/ThemeToggleComponent';
import { SearchContext } from '../SearchContextComponent/SearchContextComponent';
import { useAuth } from '../AuthContextComponent/AuthContextComponent';
import Swal from 'sweetalert2';
import SidebarComponent from '../SidebarComponent/SidebarComponent';
import './NavbarComponent.css';
import { fetchWithToken, calculateDateDifference } from '../../utils';
import { apiUrl } from '../../config';
import DateDifferenceComponent from '../Utils/components/DateDifferenceComponent/DateDifferenceComponent';

const NavbarComponent = ({ activePage, user, onThemeChange }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const { searchTermGlobal, setSearchTermGlobal } = useContext(SearchContext);
  const [labelSearch, setLabelSearch] = useState('');
  const [visibleSearch, setVisibleSearch] = useState(false);
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const { logout } = useAuth();

  const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false);
  const [notifications, setNotifications] = useState(null);
  const [notificationIconClasses, setNotificationIconClasses] = useState(null);

  const NOTIFICATION_COLORS = {
    system_Alert: '#f44336',
    system_user_alert: '#ff9800',
    estimate: '#2196f3',
    order: '#4caf50',
    default: '#555555',
  };

  const fetchNotifications = useCallback(async (payload) => {
    try {
      const response = await fetchWithToken(`${apiUrl}/notifications/dealerportal/get-all-notifications/`, 'GET', payload, {}, apiUrl);
      if (response.status === 200) {
        setNotifications(response.data.notifications);
        setNotificationIconClasses(response.data.NOTIFICATION_ICON_CLASSES);
      } else {
        throw new Error(`Failed to fetch data`);
      }
    } catch (err) {
      console.error(err.message);
    }
  }, []);

  useEffect(() => {
    if (!user?.id) return;
    const payload = {
      user_id: user.id,
    };
    fetchNotifications(payload);
  }, [fetchNotifications, user?.id]);

  useEffect(() => {
    setSearchTermGlobal('');
    const currentPath = location.pathname;

    if (currentPath.includes('stock')) {
      setLabelSearch('Search Items in Stock (/)');
      setVisibleSearch(true);
    } else if (currentPath.includes('quotes')) {
      setLabelSearch('Search Quotes (/)');
      setVisibleSearch(true);
    } else if (currentPath.includes('quote-details')) {
      setLabelSearch('Search Products (/)');
      setVisibleSearch(true);
    } else if (currentPath.includes('orders')) {
      setLabelSearch('Search Orders (/)');
      setVisibleSearch(true);
    } else if (currentPath.includes('dealerships')) {
      setLabelSearch('Search Dealerships (/)');
      setVisibleSearch(true);
    } else {
      setLabelSearch('Search...');
      setVisibleSearch(false);
    }
  }, [location.pathname, setSearchTermGlobal]);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationClick = () => {
    setIsNotificationPanelOpen(true);
    if (isMobile) {
      handleMenuClose();
    }
  };

  const handleReadNotification = useCallback((notification) => {
    const customClassSwal = {
      popup: 'small-popup',
      title: 'small-title',
      icon: 'custom-icon',
      content: 'small-content',
      confirmButton: 'small-confirm-button',
    };

    try {
      setIsNotificationPanelOpen(false);
      const dateDifference = calculateDateDifference(notification.date);

      Swal.fire({
        title: 'NOTIFICATION READ',
        html: `
          <div>${notification.message}</div>
          <div style="font-size: 12px; color: gray; margin-top: 8px;">${dateDifference}</div>
        `,
        icon: 'success',
        confirmButtonText: 'OK',
        customClass: customClassSwal,
        willClose: async () => {
          const response = await fetchWithToken(
            `${apiUrl}/notifications/dealerportal/read-notification/`,
            'POST',
            { notification_id: notification.id },
            {},
            apiUrl
          );
          if (response.status === 200) {
            const payload = {
              user_id: user.id,
            };
            fetchNotifications(payload);
          } else {
            throw new Error(`Failed to read notification`);
          }
        }
      });
    } catch (err) {
      console.error(err.message);
    }
  }, [fetchNotifications, user?.id]);

  const handleLogout = () => {
    handleMenuClose();
    Swal.fire({
      title: 'Are you sure?',
      text: 'You are about to log out',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, log out',
      cancelButtonText: 'No, cancel',
      customClass: {
        popup: 'small-popup',
        title: 'small-title',
        icon: 'custom-icon',
        content: 'small-content',
        confirmButton: 'small-confirm-button',
        cancelButton: 'small-cancel-button',
      },
    }).then((result) => {
      if (result.isConfirmed) {
        logout();
      }
    });
  };

  return (
    <Box
      sx={{
        flexGrow: 0,
        display: 'flex',
        mt: isMobile ? 2 : -3,
        ml: isMobile ? '-5%' : isTablet ? '-2%' : '0px',
        mb: 8,
        width: isMobile ? '110%' : isTablet ? '110%' : '101%',
      }}
    >
      <AppBar
        position="fixed"
        sx={{
          zIndex: theme.zIndex.drawer - 1,
          bgcolor: 'background.paper',
          boxShadow: 'none',
          borderBottom: '1px solid #d0d0d0',
        }}
      >
        <Toolbar sx={{ bgcolor: 'background.paper' }}>
          {isMobile || isTablet ? (
            <Box sx={{ ml: isMobile || isTablet ? -2 : 1, mr: isMobile || isTablet ? 13 : 0 }}>
              <SidebarComponent activePage={activePage} user={user} />
            </Box>
          ) : (
            <Typography variant="h6" component="div"></Typography>
          )}

          <Grid container>
            {!isMobile && (
              <Grid item xs={12} sm={6} md={6} lg={6} xl={6}>
                <Box sx={{ flexGrow: 1 }}>
                  {visibleSearch && (
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        bgcolor: 'background.paper',
                        borderRadius: 5,
                        px: 1,
                        py: 1,
                        width: isMobile || isTablet ? '100%' : '50%',
                        ml: isMobile || isTablet ? 0 : 2,
                      }}
                    >
                      <InputBase
                        placeholder={labelSearch}
                        value={searchTermGlobal}
                        onFocus={(e) => {
                          e.target.select();
                        }}
                        onChange={(e) => setSearchTermGlobal(e.target.value)}
                        startAdornment={<SearchIcon sx={{ mr: 1, ml: 1 }} />}
                        sx={{
                          ml: 25,
                          minWidth: '300px',
                          flexGrow: 1,
                          bgcolor: 'background.paper',
                          borderRadius: 1,
                          border: '1px solid #ccc',
                          display: isTablet ? 'none' : 'flex',
                          alignItems: 'center',
                          '&:hover': {
                            border: '1px solid gray',
                          },
                        }}
                      />
                    </Box>
                  )}
                </Box>
              </Grid>
            )}
            <Grid item xs={12} sm={6} md={6} lg={6} xl={6}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Box
                  sx={{
                    borderRadius: '10px',
                    border: '1px solid lightgray',
                    display: 'flex',
                    alignItems: 'center',
                    width: isMobile ? '150px' : '200px',
                    height: '40px',
                    bgcolor: '#f2f2f2',
                    mt: 0,
                    p: 1,
                  }}
                >
                  {!isMobile && !isTablet && (
                    <>
                      {notifications && (
                        <Box sx={{ ml: 1 }}>
                          <IconButton
                            color="gray"
                            sx={{
                              p: 0.5,
                              width: '14px',
                              height: '14px',
                            }}
                            onClick={handleNotificationClick}
                          >
                            <Badge badgeContent={notifications.length} color="error">
                              <Bell />
                            </Badge>
                          </IconButton>
                        </Box>
                      )}
                    </>
                  )}
                  <Box sx={{ ml: isMobile ? 0 : 3, mr: isMobile ? 1 : 0 }}>
                    <Link to="/">
                      <img
                        src="https://nws-dealer-portal.s3.amazonaws.com/profile-pic.png"
                        alt="Logo"
                        style={{ width: isMobile ? '38px' : '97%' }}
                      />
                    </Link>
                  </Box>
                  <Typography
                    component="div"
                    sx={{
                      fontSize: '11px',
                      color: 'gray',
                      ml: 0,
                      p: 0,
                      width: isMobile ? '100%' : 200,
                    }}
                  >
                    {user.username} {user.role}
                  </Typography>
                  <IconButton edge="end" color="gray" onClick={handleMenuOpen} sx={{ mr: 0.5 }}>
                    <MoreVertIcon />
                  </IconButton>
                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleMenuClose}
                    anchorOrigin={{
                      vertical: 'bottom',
                      horizontal: 'right',
                    }}
                    transformOrigin={{
                      vertical: 'top',
                      horizontal: 'right',
                    }}
                    sx={{
                      '& .MuiPaper-root': {
                        backgroundColor: '#f0f0f0',
                        border: '1px solid #ddd',
                        boxShadow: 'none',
                      },
                    }}
                  >
                    {(isMobile || isTablet) && notifications && (
                      <MenuItem onClick={handleNotificationClick}>
                        <Badge badgeContent={notifications.length} color="error" sx={{ mr: 2 }}>
                          <Bell sx={{ mr: 1 }} />
                        </Badge>
                        Notifications
                      </MenuItem>
                    )}
                    <MenuItem onClick={handleLogout}>
                      <LogoutIcon sx={{ mr: 1 }} /> Logout
                    </MenuItem>
                  </Menu>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Toolbar>
      </AppBar>

      {notifications && notificationIconClasses && (
        <Drawer
          anchor="right"
          open={isNotificationPanelOpen}
          onClose={() => setIsNotificationPanelOpen(false)}
        >
          <Box
            sx={{
              width: { xs: '75vw', sm: 500 },
              overflow: 'auto',
            }}
            role="presentation"
          >
            <Typography
              variant="h6"
              sx={{
                p: 2,
                position: 'sticky',
                top: 0,
                backgroundColor: '#F1F1F1',
                zIndex: 1,
              }}
            >
              Notifications
            </Typography>
            <List>
              {notifications.map((notification, index) => {
                const iconClass = notificationIconClasses[notification.notification_type];

                return (
                  <ListItemButton
                    key={notification.id}
                    sx={{ borderTop: index === 0 ? 'none' : '1px solid #ddd' }}
                    onClick={() => handleReadNotification(notification)}
                  >
                    <ListItemIcon sx={{ minWidth: '40px' }}>
                      <i
                        className={iconClass}
                        style={{
                          fontSize: '20px',
                          color: NOTIFICATION_COLORS[notification.notification_type],
                        }}
                      ></i>
                    </ListItemIcon>
                    <ListItemText
                      primary={notification.message}
                      secondary={new Date(notification.date).toLocaleString('es-ES', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                      primaryTypographyProps={{ fontSize: '16px' }}
                      secondaryTypographyProps={{ fontSize: '12px', color: 'gray' }}
                    />
                  </ListItemButton>
                );
              })}
            </List>
          </Box>
        </Drawer>
      )}
    </Box>
  );
};

export default NavbarComponent;
