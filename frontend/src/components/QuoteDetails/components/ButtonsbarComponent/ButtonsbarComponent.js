import React from 'react';
import { AddShoppingCartOutlined, Print, PrintTwoTone } from '@mui/icons-material';
import { Box, Button, Grid, Icon, IconButton } from '@mui/material';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import { Close as CloseIcon } from '@mui/icons-material';
import { alpha } from '@mui/material/styles';
import { useTheme } from '@mui/material/styles';

const ButtonsbarComponent = ({ quote, onClose }) => {

  const theme = useTheme();

  return (
    <Box className="buttons-bar">
      <Grid container spacing={2}>
        <Grid item>
          <Button sx={{ bgcolor: 'white', color: 'black', boxShadow: '0px 1px 1px rgba(0, 0, 0, 0.1)' }} fullWidth>
            <Print />
            Print Sell
          </Button>
        </Grid>
        <Grid item>
          <Button sx={{ bgcolor: 'white', color: 'black', boxShadow: '0px 1px 1px rgba(0, 0, 0, 0.1)' }} fullWidth>
            <PrintTwoTone />
            Print Cost
          </Button>
        </Grid>
        <Grid item>
          <Button sx={{ bgcolor: 'white', color: 'black', boxShadow: '0px 1px 1px rgba(0, 0, 0, 0.1)' }} fullWidth>
            <i className="bi bi-trash me-2"></i>
            Delete
          </Button>
        </Grid>
        <Grid item>
          <Button sx={{ bgcolor: 'white', color: 'black', boxShadow: '0px 1px 1px rgba(0, 0, 0, 0.1)' }} fullWidth>
            <i className="bi bi-pencil-square me-2"></i>
            Edit
          </Button>
        </Grid>
        <Grid item>
          <Button sx={{ bgcolor: alpha(theme.palette.success.main, 0.1), color: 'black', boxShadow: '0px 1px 1px rgba(0, 0, 0, 0.1)' }} fullWidth>
            <AddShoppingCartOutlined sx={{ color: 'success.main' }} />
            Place Order
          </Button>
        </Grid>
        <Grid item>
          <Button sx={{ bgcolor: alpha(theme.palette.warning.main, 0.1), color: 'black', boxShadow: '0px 1px 1px rgba(0, 0, 0, 0.1)' }} fullWidth>
            <i className="bi bi-robot me-2" style={{ color: alpha(theme.palette.warning.main, 1) }}></i>
            Smart Quote
          </Button>
        </Grid>
        <Grid item>
          <Button sx={{ bgcolor: alpha(theme.palette.info.main, 0.1), color: 'black', boxShadow: '0px 1px 1px rgba(0, 0, 0, 0.1)' }} fullWidth>
            <FlashOnIcon sx={{ color: 'info.main' }} />
            Suggest Alternatives
          </Button>
        </Grid>
        <Grid item>
          <Button sx={{
            bgcolor: alpha(theme.palette.error.main, 0.1),
            color: 'black',
            boxShadow: '0px 1px 1px rgba(0, 0, 0, 0.1)'
          }} 
          onClick={onClose}
          fullWidth>
            <CloseIcon sx={{ color: 'error.main' }} />
            Close
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
}

export default ButtonsbarComponent;