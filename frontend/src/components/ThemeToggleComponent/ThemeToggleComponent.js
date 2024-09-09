import React, { useState } from 'react';
import { Box, IconButton } from '@mui/material';
import { Brightness4 as Brightness4Icon, Brightness7 as Brightness7Icon } from '@mui/icons-material';

const ThemeToggleComponent = ({onThemeChange}) => {
  const [darkMode, setDarkMode] = useState(false);

  const handleToggle = () => {
    setDarkMode(prevMode => !prevMode);
    if (onThemeChange)
      onThemeChange();
  };

  return (
    <Box sx={{
      display: 'flex',
      alignItems: 'center',
      border: '1px solid lightgray',
      borderRadius: '15%',
      height: '30px', 
      width: '87px',
      p: '1px',
      mr: '3%',
      bgcolor: !darkMode ? '#f2f2f2' : 'black',
    }}>
      <IconButton
        sx={{
          color: !darkMode ? 'gray' : 'green',
          border: !darkMode ? 'none' : '1px solid lightgray',
          bgcolor: !darkMode ? 'transparent' : 'black',
          borderRadius: '20%',
          height: '25px',
          p: 1,
          // '&:hover': {
          //   bgcolor: !darkMode ? 'transparent' : 'transparent'
          // }
        }}
        onClick={() => handleToggle()}
      >
        <Brightness4Icon />
      </IconButton>
      <IconButton
        sx={{
          color: darkMode ? 'gray' : 'green',
          border: darkMode ? 'none' : '1px solid lightgray',
          bgcolor: !darkMode ? 'transparent' : 'black',
          borderRadius: '20%',
          height: '25px',
          p: 1,
          mt: '5px',
          mb: '5px',
          // '&:hover': {
          //   bgcolor: darkMode ? 'transparent' : 'transparent'
          // }
        }}
        onClick={() => handleToggle()}
      >
        <Brightness7Icon />
      </IconButton>
    </Box>
  );
};

export default ThemeToggleComponent;
