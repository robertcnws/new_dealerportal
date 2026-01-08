import React, { useState, useEffect, useCallback } from 'react';
import { Box, Typography, Grid, IconButton, useTheme, useMediaQuery } from '@mui/material';
import { apiUrl } from '../../../../../../config';
import { fetchWithToken } from '../../../../../../utils'
import { Modal } from 'react-bootstrap';
import ModalSendNewUserComponent from '../ModalSendNewUserComponent/ModalSendNewUserComponent';

const DealershipAccountInfoComponent = ({ dealership }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [data, setData] = useState(null);
  const user = JSON.parse(localStorage.getItem('userLogged') || '{}');

  const fetchInfo = useCallback(async (payload) => {
    try {
      const response = await fetchWithToken(`${apiUrl}/dealerportal/dealerships/dealership-stats/${dealership.id}/`, 'GET', payload, {}, apiUrl);
      if (response.status === 200) {
        setData(response.data.data);
      } else {
        throw new Error(`Failed to fetch data`);
      }
    } catch (err) {
      console.error(err.message);
    }
  }, [dealership?.id]);

  useEffect(() => {
    if (user?.data?.id && dealership?.id) {
      const payload = {
        user_id: user.data.id
      };
      fetchInfo(payload);
    }
  }, [fetchInfo, dealership?.id, user?.data?.id]);

  return data && (
    <Grid container spacing={0}>
      <Grid item xs={12}>
        <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          flexGrow: 1,
          justifyContent: 'space-between',
          ml: isMobile ? 0 : 3,
          mt: isMobile ? 5 : 0,
          mb: 3,
          p: 1,
          bgcolor: 'white',
          borderRadius: '10px',
        }}>
          <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            flexGrow: 1,
            justifyContent: 'space-between',
            bgcolor: '#f1f1f1',
            p: 1,
            borderRadius: '10px',
          }}>
            <Typography variant="body1">
              Here you can manage your Dealership, set your account details, preferences and add new users etc..
            </Typography>
          </Box>
        </Box>
      </Grid>

      <Grid item xs={12}>
        <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          flexGrow: 1,
          justifyContent: 'space-between',
          ml: isMobile ? 0 : 3,
          mb: 2,
          p: 1,
          bgcolor: 'white',
          borderRadius: '10px',
        }}>
          <Grid container spacing={1}>
            <Grid item xs={10}>
              <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                flexGrow: 1,
                justifyContent: 'space-between',
                mb: 0,
                p: 1,
                bgcolor: 'white',
                borderRadius: '10px',
              }}>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  Total Quotes
                </Typography>
                <Typography variant="body1" sx={{ mb: 0 }}>
                  <b style={{ fontSize: '22px' }}>{data.total_quotes}</b>
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={2}>
              <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                flexGrow: 1,
                justifyContent: 'space-between',
                p: 1,
                bgcolor: 'white',
                borderRadius: '10px',
              }}>
                <IconButton color="gray" sx={{ p: 0, borderRadius: '5px', minWidth: '100%', mt: 2 }}>
                  <i className="bi bi-journal-bookmark" style={{ fontSize: '25px', color: '#4CAF50' }}></i>
                </IconButton>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Grid>

      <Grid item xs={12}>
        <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          flexGrow: 1,
          justifyContent: 'space-between',
          ml: isMobile ? 0 : 3,
          mb: 2,
          p: 1,
          bgcolor: 'white',
          borderRadius: '10px',
        }}>
          <Grid container spacing={1}>
            <Grid item xs={10}>
              <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                flexGrow: 1,
                justifyContent: 'space-between',
                mb: 0,
                p: 1,
                bgcolor: 'white',
                borderRadius: '10px',
              }}>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  Confirmed Orders
                </Typography>
                <Typography variant="body1" sx={{ mb: 0 }}>
                  <b style={{ fontSize: '22px' }}>{data.confirmed_orders_count}</b>
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={2}>
              <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                flexGrow: 1,
                justifyContent: 'space-between',
                p: 1,
                bgcolor: 'white',
                borderRadius: '10px',
              }}>
                <IconButton color="gray" sx={{ p: 0, borderRadius: '5px', minWidth: '100%', mt: 2 }}>
                  <i className="bi bi-cart" style={{ fontSize: '25px', color: '#4CAF50' }}></i>
                </IconButton>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Grid>

      <Grid item xs={12}>
        <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          flexGrow: 1,
          justifyContent: 'space-between',
          ml: isMobile ? 0 : 3,
          mb: 2,
          p: 1,
          bgcolor: 'white',
          borderRadius: '10px',
        }}>
          <Grid container spacing={1}>
            <Grid item xs={10}>
              <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                flexGrow: 1,
                justifyContent: 'space-between',
                mb: 0,
                p: 1,
                bgcolor: 'white',
                borderRadius: '10px',
              }}>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  Pending Orders
                </Typography>
                <Typography variant="body1" sx={{ mb: 0 }}>
                  <b style={{ fontSize: '22px' }}>{data.pending_orders_count}</b>
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={2}>
              <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                flexGrow: 1,
                justifyContent: 'space-between',
                p: 1,
                bgcolor: 'white',
                borderRadius: '10px',
              }}>
                <IconButton color="gray" sx={{ p: 0, borderRadius: '5px', minWidth: '100%', mt: 2 }}>
                  <i className="bi bi-clock" style={{ fontSize: '25px', color: '#4CAF50' }}></i>
                </IconButton>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Grid>
    </Grid>
  );
}

export default DealershipAccountInfoComponent;
