import React, { useEffect, useState } from 'react';
import { Box, useTheme, useMediaQuery } from '@mui/material';
import { Outlet } from 'react-router-dom';
import SidebarComponent from '../SidebarComponent/SidebarComponent';
import NavbarComponent from '../NavbarComponent/NavbarComponent';
import FooterComponent from '../FooterComponent/FooterComponent';
import { fetchWithToken } from '../../utils';
import { apiUrl } from '../../config';

const MainContentComponent = ({ onThemeChange }) => {

  const [contextDashboard, setContextDashboard] = useState(null);
  const [userLogged, setUserLogged] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));

  useEffect(() => {
    document.title = 'Dealer Portal | Home';
    const user = localStorage.getItem('userLogged') ? JSON.parse(localStorage.getItem('userLogged')) : {};
    if (user.data.id) {
      const payload = {
        user_id: user.data.id,
      }
      fetchStats(payload);
    }
  }, []);

  const fetchStats = async (payload) => {
    try {
      const response = await fetchWithToken(`${apiUrl}/dealerportal-home/`, 'GET', payload, {}, apiUrl);
      if (response.status !== 200) {
        throw new Error(`Failed to fetch data`);
      }
      setContextDashboard(response.data);
      const user = localStorage.getItem('userLogged') ? JSON.parse(localStorage.getItem('userLogged')) : {};
      setUserLogged(user.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', bgcolor: '#f1f1f1', width: '100%', minHeight: '100%' }}>
      {userLogged && contextDashboard && (
        <>
          <Box
            component="main"
            sx={{
              flexGrow: 0,
              p: isMobile ? 2 : 3,
              display: 'flex',
              flexDirection: 'column',
              width: '100%',
              bgcolor: '#f1f1f1',
              mt: isMobile ? -4 : 0, // Adjust margin for mobile view
              ml: isMobile  ? 0 : 'auto', // Adjust margin for mobile view
              maxWidth: isMobile || isTablet ? '100%' : 'calc(100% - 200px)', // Adjust max width for mobile view
            }}
          >
            {!isMobile && !isTablet && (
              <SidebarComponent activePage={contextDashboard.active_page} user={userLogged} />
            )}
            <NavbarComponent activePage={contextDashboard.active_page} user={userLogged} onThemeChange={onThemeChange} />
            <Box sx={{
              mt: isMobile || isTablet ? 0 : 5,
              ml: isMobile || isTablet ? 0 : -1, // Adjust margin for mobile view
              width: '100%', // Adjust width for mobile view
              display: 'flex',
              bgcolor: '#f1f1f1',
              minHeight: isMobile || isTablet ? 'calc(100vh - 80px)' : 'calc(100vh - 150px)',

            }}>
              <Outlet />
            </Box>
            <FooterComponent />
          </Box>
        </>
      )}
    </Box>
  )
};

export default MainContentComponent;
