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
  Avatar,
  Box,
  CircularProgress,
  useMediaQuery,
  useTheme
} from '@mui/material';
import {
  Search as SearchIcon,
  // Notifications as NotificationsIcon,
  Brightness4 as Brightness4Icon,
  Brightness7 as Brightness7Icon,
  MoreVert as MoreVertIcon,
  Menu as MenuIcon
} from '@mui/icons-material';
import { Bell } from 'react-bootstrap-icons';
import { Link, useLocation } from 'react-router-dom';
import ThemeToggleComponent from '../ThemeToggleComponent/ThemeToggleComponent';
import { SearchContext } from '../SearchContextComponent/SearchContextComponent';
import Swal from 'sweetalert2';
// import './NavbarComponent.css';


const NavbarComponent = ({ user, onThemeChange }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const { searchTermGlobal, setSearchTermGlobal } = useContext(SearchContext);
  const [labelSearch, setLabelSearch] = useState('');
  const [visibleSearch, setVisibleSearch] = useState(false);
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    setSearchTermGlobal(''); // Resetear el valor cuando la ruta cambie
    const currentPath = location.pathname;
    if (currentPath.includes('stock')) {
      setLabelSearch('Search Items in Stock (/)');
      setVisibleSearch(true);
    } else if (currentPath.includes('quotes')) {
      setLabelSearch('Search Quotes (/)');
      setVisibleSearch(true);
    } else if (currentPath.includes('quote_details')) {
      setLabelSearch('Search Products (/)');
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

  const showAlert = () => {
    handleMenuClose();
    Swal.fire({
      title: 'Hello World!',
      text: 'This is a small alert!',
      icon: 'success',
      confirmButtonText: 'Cool',
      customClass: {
        popup: 'small-popup',
        title: 'small-title',
        icon: 'custom-icon',
        content: 'small-content',
        confirmButton: 'small-confirm-button'
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
      mt: -10,
      ml: '-2%',
      width: '103.2%',
    }}>
      <Toolbar sx={{ bgcolor: 'background.paper' }}>
        {isMobile ? (
          <IconButton edge="start" color="inherit" aria-label="menu">
            <MenuIcon />
          </IconButton>
        ) : (
          <Typography variant="h6" component="div"></Typography>
        )}


        <Box sx={{ flexGrow: 0, ml: visibleSearch ? 0 : 145 }}>
          {visibleSearch && (
            <InputBase
              placeholder={labelSearch}
              value={searchTermGlobal}
              onChange={(e) => setSearchTermGlobal(e.target.value)}
              startAdornment={<SearchIcon sx={{ mr: 1, ml: 1 }} />}
              sx={{
                ml: 0,
                mr: 130,
                width: '30%',
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

        {!isMobile && (
          // <>
          //   <IconButton color="gray">
          //     <Brightness4Icon />
          //   </IconButton>
          //   <IconButton color="gray">
          //     <Brightness7Icon />
          //   </IconButton>
          // </>
          <ThemeToggleComponent onThemeChange={onThemeChange} />
        )}

        <IconButton color="gray" sx={{
          size: 'sm',
        }}>
          <Badge badgeContent="0" color="error">
            <Bell />
          </Badge>
        </IconButton>

        <Box sx={{
          borderRadius: '20%',
          border: '1px solid lightgray',
          display: 'flex',
          alignItems: 'center',
          borderRadius: '10px',
          border: '1px solid lightgray',
          width: '200px',
          height: '50px',
          bgcolor: '#f2f2f2',
          ml: 5,
          p: 0,
        }}>
          <div style={{ marginLeft: '1%', marginTop: '3%', marginBottom: '4%' }}>
            <Link to="/">
              <img src="https://nws-dealer-portal.s3.amazonaws.com/profile-pic.png" alt="Logo" style={{ width: '47%' }} />
            </Link>
          </div>
          <Typography component="div" sx={{ fontSize: '11px', color: 'gray', ml: 0, p: 0, width: 200 }}>
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
              marginTop: '15px',
              width: '400px',
              '& .MuiPaper-root': {
                backgroundColor: '#f0f0f0',
                border: '1px solid #ddd',
                boxShadow: 'none'
              },
            }}
          >
            <MenuItem component={Link} to="/profile" onClick={handleMenuClose}>
              View Profile
            </MenuItem>
            <MenuItem component={Link} to="/edit-profile" onClick={handleMenuClose}>
              Edit Profile
            </MenuItem>
            <MenuItem onClick={() => showAlert()}>
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
