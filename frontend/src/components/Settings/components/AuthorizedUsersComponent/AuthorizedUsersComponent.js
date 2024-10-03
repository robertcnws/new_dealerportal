import React from 'react';
import { Box, useTheme, useMediaQuery } from '@mui/material';
import ManageAppAccessComponent from './components/ManageAppAccessComponent/ManageAppAccessComponent';
import AppAdminsManagersComponent from './components/AppAdminsManagersComponent/AppAdminsManagersComponent';

const AuthorizedUsersComponent = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <>
      <Box sx={{ mt: isMobile ? 1 : -3, minWidth: '100%', bgcolor: '#f1f1f1', display: 'flex', flexDirection: 'column' }}>
        <ManageAppAccessComponent />
        <AppAdminsManagersComponent />
      </Box>
    </>
  );
}

export default AuthorizedUsersComponent;
