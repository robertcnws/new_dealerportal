import React from 'react';
import { Box, Typography } from '@mui/material';

const FooterComponent = () => {

  const currentYear = new Date().getFullYear();

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        width: '100%',
        backgroundColor: '#f8f8f8',
        borderTop: '1px solid #ddd',
        py: 1,
        textAlign: 'center',
        zIndex: 1300,
        mb: 0
      }}
    >
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ fontSize: '12px', fontWeight: 'bold' }}
      >
        © {currentYear} API Dealerportal. All rights reserved.
      </Typography>
    </Box>
  )
};

export default FooterComponent;