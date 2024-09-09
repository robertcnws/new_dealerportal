import React from 'react';
import { Container, Box, useTheme, useMediaQuery } from '@mui/material';
import '../MainLoginComponent/MainLoginComponent.css';

const MainLoginComponent = ({ children }) => {

  document.title = 'Login | Dealer Portal';

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Box className="containerMain">
      <Container className="container" maxWidth={isMobile ? '' : 'xs'} sx={{ maxWidth : isMobile ? '80%' : '100%' }}>
        <Box>
          {children}
        </Box>
      </Container>
    </Box>
  );
};

export default MainLoginComponent;
