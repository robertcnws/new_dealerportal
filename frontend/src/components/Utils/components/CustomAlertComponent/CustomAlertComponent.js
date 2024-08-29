import React from 'react';
import { Alert, AlertTitle } from '@mui/material';

const CustomAlertComponent = ({ severity, title, message, sx }) => {
  return (
    <Alert severity={severity} sx={sx ? sx : ''}>
      <AlertTitle>{title ? title : ''}</AlertTitle>
      {message ? message : ''}
    </Alert>
  );
}

export default CustomAlertComponent;