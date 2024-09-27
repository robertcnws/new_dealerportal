import React from 'react';
import { Container, Box, useTheme, useMediaQuery } from '@mui/material';
import '../MainLoginComponent/MainLoginComponent.css';

const MainLoginComponent = ({ children }) => {

  document.title = 'Login | Dealer Portal';

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery('(min-width: 600px) and (max-width: 1024px)');
  // const isMobile = useMediaQuery('(max-width:999px)');

  return (
    <Box className="containerMain">
      <Container className="container" maxWidth={isMobile || isTablet ? '' : 'xs'} sx={{ maxWidth : isMobile || isTablet ? '80%' : '100%' }}>
        <Box>
          {children}
        </Box>
      </Container>
    </Box>
  );
};

export default MainLoginComponent;
