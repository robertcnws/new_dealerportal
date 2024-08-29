import React, { useEffect, useState } from 'react';
import { Container, Box, Typography } from '@mui/material';
import { Outlet } from 'react-router-dom';
import SidebarComponent from '../SidebarComponent/SidebarComponent';
import NavbarComponent from '../NavbarComponent/NavbarComponent';
import FooterComponent from '../FooterComponent/FooterComponent';
import { fetchWithToken } from '../../utils';
import { apiUrl } from '../../config';

const MainContentComponent = ({ onThemeChange }) => {
  const [contextDashboard, setContextDashboard] = useState(null);
  const [userLogged, setUserLogged] = useState(null);
  const [activePage, setActivePage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
      const response = await fetchWithToken(`${apiUrl}/api-dealerportal-home/`, 'GET', payload, {}, apiUrl);
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
    <Box sx={{ display: 'flex', bgcolor: '#f1f1f1' }}>
      {/* <Typography variant="h6" component="h1" sx={{ flexGrow: 1, p: 2 }}>{ userLogged.role }</Typography> */}
      {userLogged && contextDashboard && (
        <>
          <SidebarComponent activePage={contextDashboard.active_page} user={userLogged} />
          <Box
            component="main"
            sx={{ flexGrow: 1, p: 3, display: 'flex', flexDirection: 'column', width: '100%', bgcolor: '#f1f1f1' }}
          >
            <NavbarComponent user={userLogged} onThemeChange={onThemeChange} />
            <Box sx={{
              mt: 5,
              ml: -1,
              // border: '1px solid #ddd',
              width: '101%',
              display: 'flex',
              bgcolor: '#f1f1f1',
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
