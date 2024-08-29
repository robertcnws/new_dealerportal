import React from 'react';
import { Container, Box } from '@mui/material';
import '../MainLoginComponent/MainLoginComponent.css';

const MainLoginComponent = ({ children }) => {
  

  return (
    <Box className="containerMain">
      <Container className="container" maxWidth="xs">
        <Box>
          {children}
        </Box>
      </Container>
    </Box>
  );
};

export default MainLoginComponent;
