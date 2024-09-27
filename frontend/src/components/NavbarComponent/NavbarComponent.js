import React, { useState, useEffect, useContext } from 'react';
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
  Grid
} from '@mui/material';
import {
  Search as SearchIcon,
  MoreVert as MoreVertIcon
} from '@mui/icons-material';
import { Bell } from 'react-bootstrap-icons';
import { Link, useLocation } from 'react-router-dom';
import ThemeToggleComponent from '../ThemeToggleComponent/ThemeToggleComponent';
import { SearchContext } from '../SearchContextComponent/SearchContextComponent';
import { useAuth } from '../AuthContextComponent/AuthContextComponent';
import Swal from 'sweetalert2';
import SidebarComponent from '../SidebarComponent/SidebarComponent';
import './NavbarComponent.css';


const NavbarComponent = ({ activePage, user, onThemeChange }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const { searchTermGlobal, setSearchTermGlobal } = useContext(SearchContext);
  const [labelSearch, setLabelSearch] = useState('');
  const [visibleSearch, setVisibleSearch] = useState(false);
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  // const isMobile = useMediaQuery('(max-width:999px)');
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const { logout } = useAuth();

  useEffect(() => {
    setSearchTermGlobal(''); // Resetear el valor cuando la ruta cambie
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
  }, [location, setSearchTermGlobal]);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

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
      }
    }).then((result) => {
      if (result.isConfirmed) {
        logout();
      }
    });
  };

  return (
    <Box sx={{
      flexGrow: 0,
      display: 'flex',
      // alignItems: 'center',
      mt: isMobile ? 2 : -3,  // Ajuste para mobile
      ml: isMobile ? '-5%' : (isTablet ? '-2%' : '0px'),  // Ajuste para mobile
      mb: 8,
      width: isMobile ? '110%' : (isTablet ? '110%' : '101%')
    }}>
      <AppBar position="fixed"
        sx={{
          zIndex: theme.zIndex.drawer - 1,
          bgcolor: 'background.paper',
          boxShadow: 'none',
          borderBottom: '1px solid #d0d0d0',

        }}>
        <Toolbar sx={{ bgcolor: 'background.paper' }}>
          {isMobile || isTablet ? (
            <Box sx={{ ml: isMobile || isTablet ? -2 : 1, mr: isMobile || isTablet ? 13 : 0 }}>
              <SidebarComponent activePage={activePage} user={user} />
            </Box>
          ) : (
            <Typography variant="h6" component="div"></Typography>
          )}

          <Grid container>
            {!isMobile  && (
              <Grid item xs={12} sm={6} md={6} lg={6} xl={6}>
                <Box sx={{ flexGrow: 1 }}>
                  {visibleSearch && (
                    <Box sx={{
                      display: 'flex',
                      alignItems: 'center',
                      bgcolor: 'background.paper',
                      borderRadius: 5,
                      px: 1,
                      py: 1,
                      width: isMobile || isTablet ? '100%' : '50%',
                      ml: isMobile || isTablet ? 0 : 2,
                    }}>
                      <InputBase
                        placeholder={labelSearch}
                        value={searchTermGlobal}
                        onFocus={(e) => { e.target.select(); }}
                        onChange={(e) => setSearchTermGlobal(e.target.value)}
                        startAdornment={<SearchIcon sx={{ mr: 1, ml: 1 }} />}
                        sx={{
                          ml: 25,
                          // mr: isMobile ? 0 : (isTablet ? '40%' : 130),
                          minWidth: '300px',
                          flexGrow: 1,
                          bgcolor: 'background.paper',
                          borderRadius: 1,
                          border: '1px solid #ccc',
                          display: isTablet ? 'none' : 'flex',
                          alignItems: 'center',
                          '&:hover': {
                            border: '1px solid gray'
                          }
                        }}
                      />
                    </Box>
                  )}
                </Box>
              </Grid>
            )}
            <Grid item xs={12} sm={6} md={6} lg={6} xl={6}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', }}>

                {/* {!isMobile && !isTablet && (
                  <ThemeToggleComponent onThemeChange={onThemeChange} />
                  <ThemeToggleComponent onThemeChange={null} />
                )} */}

                <Box sx={{
                  borderRadius: '10px',
                  border: '1px solid lightgray',
                  display: 'flex',
                  alignItems: 'center',
                  width: '200px', // Ajuste de ancho según si es mobile o no
                  height: '40px',
                  bgcolor: '#f2f2f2',
                  mt: 0, // Ajuste de margen según si es mobile o no
                  p: 1,
                }}>
                  <Box sx={{ ml: 1}}>
                    <IconButton color="gray" sx={{
                      p: 0.5, // Reduce el padding para que el botón sea más pequeño
                      width: '14px', // Ajusta el ancho
                      height: '14px', // Ajusta la altura
                    }}>
                      <Badge badgeContent="0" color="error">
                        <Bell />
                      </Badge>
                    </IconButton>
                  </Box>
                  <Box sx={{ ml: 3 }}>
                    <Link to="/">
                      <img src="https://nws-dealer-portal.s3.amazonaws.com/profile-pic.png" alt="Logo" style={{ width: isMobile ? '90%' : '97%' }} />
                    </Link>
                  </Box>
                  <Typography component="div" sx={{ fontSize: '11px', color: 'gray', ml: 0, p: 0, width: isMobile ? '100%' : 200 }}>
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
                      // marginTop: isMobile ? '10px' : '15px',
                      // width: isMobile ? '100%' : '400px',
                      '& .MuiPaper-root': {
                        backgroundColor: '#f0f0f0',
                        border: '1px solid #ddd',
                        boxShadow: 'none'
                      },
                    }}
                  >
                    <MenuItem onClick={() => handleLogout()}>
                      Logout
                    </MenuItem>
                  </Menu>
                </Box>
              </Box>
            </Grid>
          </Grid>


          {/* {loading && <CircularProgress color="inherit" sx={{ ml: 2 }} />} */}
        </Toolbar>
      </AppBar>
    </Box>
  );
};

export default NavbarComponent;
