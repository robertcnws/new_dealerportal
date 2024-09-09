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
  useTheme
} from '@mui/material';
import {
  Search as SearchIcon,
  MoreVert as MoreVertIcon} from '@mui/icons-material';
import { Bell } from 'react-bootstrap-icons';
import { Link, useLocation } from 'react-router-dom';
import ThemeToggleComponent from '../ThemeToggleComponent/ThemeToggleComponent';
import { SearchContext } from '../SearchContextComponent/SearchContextComponent';
import { useAuth } from '../AuthContextComponent/AuthContextComponent';
import Swal from 'sweetalert2';
import SidebarComponent from '../SidebarComponent/SidebarComponent';
// import './NavbarComponent.css';


const NavbarComponent = ({ activePage, user, onThemeChange }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const { searchTermGlobal, setSearchTermGlobal } = useContext(SearchContext);
  const [labelSearch, setLabelSearch] = useState('');
  const [visibleSearch, setVisibleSearch] = useState(false);
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isIpad = useMediaQuery('(max-width: 1024px)');
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
    <AppBar position="sticky" sx={{
      display: 'flex',
      alignItems: 'center',
      bgcolor: 'background.paper',
      boxShadow: 'none',
      borderBottom: '1px solid #d0d0d0',
      mt: isMobile ? 0 : -10,  // Ajuste para mobile
      ml: isMobile || isIpad ? '-5%' : '-2%',  // Ajuste para mobile
      width: isMobile || isIpad ? '110%' : '103.2%',  // Ajuste para mobile
    }}>
      <Toolbar sx={{ bgcolor: 'background.paper' }}>
        {isMobile ? (
          <Box sx={{ ml: -2, mr: 13 }}>
            <SidebarComponent activePage={activePage} user={user} />
          </Box>
        ) : (
          <Typography variant="h6" component="div"></Typography>
        )}


        <Box sx={{ flexGrow: 0, ml: isMobile ? 1 : (visibleSearch ? 0 : ( isIpad ? '46%' : 145)) }}>
          {visibleSearch && (
            <InputBase
              placeholder={labelSearch}
              value={searchTermGlobal}
              onChange={(e) => setSearchTermGlobal(e.target.value)}
              startAdornment={<SearchIcon sx={{ mr: 1, ml: 1 }} />}
              sx={{
                ml: 0,
                mr: isMobile ? 0 : ( isIpad ? '40%' : 130),
                width: isIpad ? '100%' : '30%',
                flexGrow: 1,
                bgcolor: 'background.paper',
                borderRadius: 1,
                border: '1px solid #ccc',
                display: isMobile ? 'none' : 'flex',
                alignItems: 'center',
                '&:hover': {
                  border: '1px solid gray'
                }
              }}
            />
          )}
        </Box>

        {!isMobile && !isIpad && (
          // <ThemeToggleComponent onThemeChange={onThemeChange} />
          <ThemeToggleComponent onThemeChange={null} />
        )}

        <IconButton color="gray" sx={{
          size: 'sm',
        }}>
          <Badge badgeContent="0" color="error">
            <Bell />
          </Badge>
        </IconButton>

        <Box sx={{
          borderRadius: '10px',
          border: '1px solid lightgray',
          display: 'flex',
          alignItems: 'center',
          width: isMobile ? '100%' : '200px', // Ajuste de ancho según si es mobile o no
          height: '50px',
          bgcolor: '#f2f2f2',
          ml: isMobile ? 0 : 5, // Ajuste de margen según si es mobile o no
          p: 1,
        }}>
          <div style={{ marginLeft: '1%', marginTop: '3%', marginBottom: '4%' }}>
            <Link to="/">
              <img src="https://nws-dealer-portal.s3.amazonaws.com/profile-pic.png" alt="Logo" style={{ width: isMobile ? '40%': '47%' }} />
            </Link>
          </div>
          <Typography component="div" sx={{ fontSize: '11px', color: 'gray', ml: 0, p: 0, width: isMobile ? '100%' : 200 }}>
            {user.username} - {user.role}
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
              marginTop: isMobile ? '10px' : '15px',
              width: isMobile ? '100%' : '400px',
              '& .MuiPaper-root': {
                backgroundColor: '#f0f0f0',
                border: '1px solid #ddd',
                boxShadow: 'none'
              },
            }}
          >
            {/* <MenuItem component={Link} to="/profile" onClick={handleMenuClose}>
              View Profile
            </MenuItem>
            <MenuItem component={Link} to="/edit-profile" onClick={handleMenuClose}>
              Edit Profile
            </MenuItem> */}
            <MenuItem onClick={() => handleLogout()}>
              Logout
            </MenuItem>
          </Menu>
        </Box>


        {/* {loading && <CircularProgress color="inherit" sx={{ ml: 2 }} />} */}
      </Toolbar>
    </AppBar>
  );
};

export default NavbarComponent;
