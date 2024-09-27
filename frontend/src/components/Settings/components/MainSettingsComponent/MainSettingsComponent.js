import React from 'react';
import { Box, Grid, useTheme, useMediaQuery } from '@mui/material';
import QuickActionsButtonsComponent from '../QuickActionsButtonsComponent/QuickActionsButtonsComponent';
import InviteAppManagerComponent from '../InviteAppManagerComponent/InviteAppManagerComponent';
import TableAppManagersComponent from '../TableAppManagersComponent/TableAppManagersComponent';

const MainSettingsComponent = () => {

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));


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
          <TableAppManagersComponent />
        </Grid>
      </Grid>
    </Box>
  );
}

export default MainSettingsComponent;
