import React, { useMemo, useState, useCallback } from 'react';
import { Grid, IconButton, Menu, MenuItem, useTheme, useMediaQuery } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { Link } from 'react-router-dom';

const NavigationButtonComponent = ({ children = [], bgcolor, row }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const { border, borderRadius } = useMemo(() => {
    const noBorder = Boolean(children?.[0]?.noBorder);
    return {
      border: noBorder ? 'none' : '1px solid #ddd',
      borderRadius: noBorder ? '0px 0px 0px 0px' : '5px 5px 5px 5px',
    };
  }, [children]);

  const handleClick = useCallback((event) => {
    setAnchorEl(event.currentTarget);
  }, []);

  const handleClose = useCallback(
    (onClick) => {
      if (typeof onClick === 'function') {
        row ? onClick(row) : onClick();
      }
      setAnchorEl(null);
    },
    [row]
  );

  const menuItemSx = useMemo(
    () => ({
      color: 'black',
      '&:hover': {
        backgroundColor: '#f1f1f1',
        borderRadius: '5px 5px 5px 5px',
        marginLeft: '2px',
        maxWidth: isMobile ? '100%' : '95%',
        minWidth: isMobile ? '100%' : '95%',
      },
      '&.Mui-selected': {
        backgroundColor: '#f1f1f1',
        borderRadius: '5px 5px 5px 5px',
        marginLeft: '2px',
        maxWidth: isMobile ? '100%' : '95%',
        minWidth: isMobile ? '100%' : '95%',
      },
    }),
    [isMobile]
  );

  return (
    <Grid item>
      <IconButton
        onClick={handleClick}
        style={{ backgroundColor: bgcolor, borderRadius, border }}
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
        onClose={() => handleClose()}
        sx={{ '& .MuiMenuItem-root': menuItemSx }}
      >
        {(children || []).map((child, index) =>
          child?.visibility ? (
            <MenuItem
              key={`${child.label || 'item'}-${index}`}
              onClick={() => handleClose(child.onClick)}
              component={child.route ? Link : undefined}
              to={child.route || undefined}
            >
              {child.icon} {child.label}
            </MenuItem>
          ) : null
        )}
      </Menu>
    </Grid>
  );
};

export default NavigationButtonComponent;
