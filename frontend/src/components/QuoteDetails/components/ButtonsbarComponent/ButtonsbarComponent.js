import React from 'react';
import { AddShoppingCartOutlined, Print, PrintTwoTone } from '@mui/icons-material';
import { Box, Button, Grid } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { alpha } from '@mui/material/styles';
import { useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { apiUrl } from '../../../../config';
import { fetchWithToken } from '../../../../utils';

const ButtonsbarComponent = ({ quote, onClose, isOrder=false }) => {

  const theme = useTheme();
  // const isMobile = useMediaQuery(theme.breakpoints.down('sm')); 
  const navigate = useNavigate();

  const handlePrint = async (route) => {
    let url = '';
    try {
      const response = await fetchWithToken(`${apiUrl}/${route}/${quote.id}/`, 'GET', null, {}, apiUrl);
      if (response.status !== 200) {
        throw new Error('Network response was not ok');
      }
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
    } catch (error) {
      console.error('Error opening the PDF:', error);
    } finally {
      window.URL.revokeObjectURL(url);
    }
  }

  const handleDeleteQuote = async (quote) => {
    const customClassSwal = {
      popup: 'small-popup',
      title: 'small-title',
      icon: 'custom-icon',
      content: 'small-content',
      confirmButton: 'small-confirm-button'
    }
    try {
      Swal.fire({
        title: 'Are you sure?',
        text: `You will not be able to recover quote # ${quote.id}!`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'No, keep it',
        customClass: customClassSwal
      }).then(async (result) => {
        if (result.isConfirmed) {
          const user = JSON.parse(localStorage.getItem('userLogged'));
          const payload = {
            user_id: user.data.id
          };
          const response = await fetchWithToken(`${apiUrl}/api-dealerportal/quotes/delete/${quote.id}/`, 'POST', payload, {}, apiUrl);
          if (response.status === 200) {
            Swal.fire({
              title: `${response.data.data.info}`,
              text: `${response.data.data.message}`,
              icon: 'success',
              confirmButtonText: 'OK',
              customClass: customClassSwal,
              willClose: () => {
                navigate('/api-dealerportal/quotes');
              }
            });
          } else {
            throw new Error('Failed to delete quote');
          }
        }
      });
    } catch (err) {
      Swal.fire({
        title: 'Error',
        text: 'Failed to delete quote',
        icon: 'error',
        confirmButtonText: 'Cool',
        customClass: customClassSwal
      });
    }
  };

  const handlePlaceOrder = async (quote) => {
    const customClassSwal = {
      popup: 'small-popup',
      title: 'small-title',
      icon: 'custom-icon',
      content: 'small-content',
      confirmButton: 'small-confirm-button'
    }
    try {
      Swal.fire({
        title: 'Are you sure?',
        text: `You are about to place an order for quote # ${quote.id}!`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, place order!',
        cancelButtonText: 'No, keep it',
        customClass: customClassSwal
      }).then(async (result) => {
        if (result.isConfirmed) {
          const user = JSON.parse(localStorage.getItem('userLogged'));
          const payload = {
            user_id: user.data.id
          };
          const response = await fetchWithToken(`${apiUrl}/api-dealerportal/orders/create/${quote.id}/`, 'POST', payload, {}, apiUrl);
          if (response.status === 200) {
            const error = response.data.data.error;
            if (error) {
              Swal.fire({
                title: `${response.data.data.error}`,
                text: `${response.data.data.info}`,
                icon: 'error',
                confirmButtonText: 'OK',
                customClass: customClassSwal
              });
              return;
            }
            else {
              Swal.fire({
                title: `${response.data.data.info}`,
                text: `${response.data.data.message}`,
                icon: 'success',
                confirmButtonText: 'OK',
                customClass: customClassSwal,
                willClose: () => {
                  navigate('/api-dealerportal/orders');
                }
              });
            }
          } else {
            throw new Error('Failed to place order');
          }
        }
      });
    } catch (err) {
      Swal.fire({
        title: 'Error',
        text: 'Failed to place order',
        icon: 'error',
        confirmButtonText: 'Cool',
        customClass: customClassSwal
      });
    }
  }


  return (
    <Box className="buttons-bar">
      <Grid container spacing={1}>
        <Grid item>
          <Button sx={{
            bgcolor: 'white',
            color: 'black',
            boxShadow: '0px 1px 1px rgba(0, 0, 0, 0.1)'
          }}
            fullWidth
            onClick={() => handlePrint('utils/api-dealerportal/quote/pdf-view')}
          >
            <Print />
            Print Sell
          </Button>
        </Grid>
        <Grid item>
          <Button sx={{
            bgcolor: 'white',
            color: 'black',
            boxShadow: '0px 1px 1px rgba(0, 0, 0, 0.1)'
          }}
            fullWidth
            onClick={() => handlePrint('utils/api-dealerportal/quote/pdf-view-cost')}
          >
            <PrintTwoTone />
            Print Cost
          </Button>
        </Grid>
        {!isOrder && quote.status === 'active' && (
          <>
            <Grid item>
              <Button sx={{
                bgcolor: 'white',
                color: 'black',
                boxShadow: '0px 1px 1px rgba(0, 0, 0, 0.1)'
              }}
                fullWidth
                onClick={() => handleDeleteQuote(quote)}
              >
                <i className="bi bi-trash me-2"></i>
                Delete
              </Button>
            </Grid>
            <Grid item>
              <Button sx={{
                bgcolor: alpha(theme.palette.success.main, 0.1),
                color: 'black',
                boxShadow: '0px 1px 1px rgba(0, 0, 0, 0.1)'
              }}
                fullWidth
                onClick={() => handlePlaceOrder(quote)}
              >
                <AddShoppingCartOutlined sx={{ color: 'success.main' }} />
                Place Order
              </Button>
            </Grid>
          </>
        )}
        {/* <Grid item>
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
        </Grid> */}
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