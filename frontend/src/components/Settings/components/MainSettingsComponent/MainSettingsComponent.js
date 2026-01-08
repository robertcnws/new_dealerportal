import React, { useCallback, useEffect, useState } from 'react';
import { Box, Grid, useTheme, useMediaQuery } from '@mui/material';
import QuickActionsButtonsComponent from '../QuickActionsButtonsComponent/QuickActionsButtonsComponent';
import InviteAppManagerComponent from '../InviteAppManagerComponent/InviteAppManagerComponent';
import TableAppManagersComponent from '../TableAppManagersComponent/TableAppManagersComponent';
import { fetchWithToken } from '../../../../utils';
import { apiUrl } from '../../../../config';

const MainSettingsComponent = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [managers, setManagers] = useState(null);

  const fetchManagers = useCallback(async (payload) => {
    try {
      const response = await fetchWithToken(`${apiUrl}/app_settings/dealeportal/settings/`, 'GET', payload, {}, apiUrl);
      if (response.status === 200) {
        setManagers(response.data.managers);
        return;
      }
      throw new Error('Failed to fetch managers');
    } catch (err) {
      console.error(err?.message || err);
    }
  }, []);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('userLogged') || '{}');
    const payload = { user_id: user?.data?.id };
    if (payload.user_id) fetchManagers(payload);
  }, [fetchManagers]);

  return (
    <Box sx={{ mt: isMobile ? 1 : -3, minWidth: '100%', bgcolor: '#f1f1f1' }}>
      <Grid container spacing={1} sx={{ ml: isMobile ? 0 : 2 }}>
        <QuickActionsButtonsComponent />
      </Grid>
      <Grid container spacing={1} sx={{ ml: isMobile ? 0 : 2 }}>
        <Grid item xs={isMobile ? 12 : 4}>
          <InviteAppManagerComponent />
        </Grid>
        <Grid item xs={isMobile ? 12 : 8}>
          <TableAppManagersComponent managers={managers} setManagers={setManagers} onSyncComplete={fetchManagers} />
        </Grid>
      </Grid>
    </Box>
  );
};

export default MainSettingsComponent;
