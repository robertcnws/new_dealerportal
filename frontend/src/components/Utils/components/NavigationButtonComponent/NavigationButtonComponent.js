import React, { useEffect, useState } from 'react';
import { Grid, IconButton, Menu, MenuItem, useTheme, useMediaQuery } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { Link } from 'react-router-dom';

const NavigationButtonComponent = ({ children, bgcolor, row }) => {

  const [anchorEl, setAnchorEl] = useState(null);
  const [border, setBorder] = useState('1px solid #ddd');
  const [borderRadius, setBorderRadius] = useState('');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    if (children[0].noBorder) {
      setBorder('none');
      // setBorderRight('1px solid #ddd');
      setBorderRadius('0px 0px 0px 0px');
    }
    else {
      setBorder('1px solid #ddd');
      // setBorderRight('1px solid #ddd');
      setBorderRadius('5px 5px 5px 5px');
    }
  }, [border]);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = (onClick) => {
    if (onClick) {
      if (typeof onClick === 'function') {
        if (row) {
          onClick(row);
        }
        else {
          onClick();
        }
      }
    }
    setAnchorEl(null);
  };

  return (
    <Grid item>
      <IconButton onClick={handleClick}
        style={{ backgroundColor: bgcolor, borderRadius: borderRadius, border: border }}
        sx={{
          maxHeight: isMobile ? '100%' : '40px',
          maxWidth: isMobile ? '100%' : '40px',
          minWidth: isMobile ? '100%' : '40px',
          minHeight: isMobile ? '100%' : '40px',
          padding: '0px 0px 0px 0px',
        }}
      >
        <MoreVertIcon />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        sx={{
          '& .MuiMenuItem-root': {
            color: 'black', // Color de texto por defecto
            '&:hover': {
              backgroundColor: '#f1f1f1', // Color azul en hover
              borderRadius: '5px 5px 5px 5px',
              marginLeft: '2px',
              maxWidth: isMobile ? '100%' : '95%',
              minWidth: isMobile ? '100%' : '95%',
            },
            '&.Mui-selected': {
              backgroundColor: '#f1f1f1', // Color azul cuando seleccionado
              borderRadius: '5px 5px 5px 5px',
              marginLeft: '2px',
              maxWidth: isMobile ? '100%' : '95%',
              minWidth: isMobile ? '100%' : '95%',
            },
          },
        }}
      >

        {
          children.map((child, index) => {
            return child.visibility &&
              (
                <MenuItem
                  key={index}
                  onClick={() => handleClose(child.onClick)}
                  component={child.route ? Link : null}
                  to={child.route ? child.route : null}

                >
                  {child.icon} {child.label}
                </MenuItem>
              );
          })
        }
      </Menu>
    </Grid>
  )

};


export default NavigationButtonComponent;