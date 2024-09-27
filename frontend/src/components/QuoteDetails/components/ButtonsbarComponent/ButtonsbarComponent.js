import React, { useState } from 'react';
import { AddShoppingCartOutlined, Edit, Print, PrintRounded, PrintTwoTone, ExpandLess, ExpandMore, Delete, DeleteOutline, EditOutlined, Settings, ConfirmationNumberTwoTone } from '@mui/icons-material';
import { Box, Button, Grid, Menu, MenuItem, Popover, useMediaQuery, useTheme } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { alpha } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { apiUrl } from '../../../../config';
import { fetchWithToken } from '../../../../utils';
import { set } from 'date-fns';

const ButtonsbarComponent = ({ quote, onClose, isOrder = false, onEdit, setMenuOpened = null, order = null }) => {

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  // const isMobile = useMediaQuery('(max-width:999px)');
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMenuManageOpen, setIsMenuManageOpen] = useState(false);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
    setIsMenuOpen(!isMenuOpen);
    if (!isOrder && isMobile) {
      setMenuOpened(!isMenuOpen);
    }
  };

  const handleClose = () => {
    setAnchorEl(null);
    setIsMenuOpen(false);
    if (!isOrder && isMobile) {
      setMenuOpened(false);
    }
  };

  const handleManageClick = (event) => {
    setAnchorEl(event.currentTarget);
    setIsMenuManageOpen(!isMenuManageOpen);
  };

  const handleManageClose = () => {
    setAnchorEl(null);
    setIsMenuManageOpen(false);
  };

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

  const onEditManage = (quote) => {
    setIsMenuManageOpen(false);
    onEdit(quote);
  }

  const handleDeleteQuote = async (quote) => {
    setIsMenuManageOpen(false);
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
          const response = await fetchWithToken(`${apiUrl}/dealerportal/quotes/delete/${quote.id}/`, 'POST', payload, {}, apiUrl);
          if (response.status === 200) {
            Swal.fire({
              title: `${response.data.data.info}`,
              text: `${response.data.data.message}`,
              icon: 'success',
              confirmButtonText: 'OK',
              customClass: customClassSwal,
              willClose: () => {
                navigate('/dealerportal/quotes');
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
    setIsMenuManageOpen(false);
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
          const response = await fetchWithToken(`${apiUrl}/dealerportal/orders/create/${quote.id}/`, 'POST', payload, {}, apiUrl);
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
                  navigate('/dealerportal/orders');
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


  const handleStatusOrder = async (order, newStatus) => {
    setIsMenuManageOpen(false);
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
        text: `You want to change status order # ${order.id} to ${newStatus}!`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, change it!',
        cancelButtonText: 'No, keep it',
        customClass: customClassSwal
      }).then(async (result) => {
        if (result.isConfirmed) {
          const user = JSON.parse(localStorage.getItem('userLogged'));
          const payload = {
            id: order.id,
            status: newStatus,
            user_id: user.data.id,
          };
          const response = await fetchWithToken(`${apiUrl}/dealerportal/update_order_status/`, 'POST', payload, {}, apiUrl);
          if (response.status === 200) {
            if (response.data.error) {
              Swal.fire({
                title: `${response.data.error}`,
                text: `${response.data.message}`,
                icon: 'error',
                confirmButtonText: 'OK',
                customClass: customClassSwal
              });
              return;
            }
            Swal.fire({
              title: 'Success',
              text: `${response.data.message}`,
              icon: 'success',
              confirmButtonText: 'OK',
              customClass: customClassSwal,
              willClose: () => {
                navigate('/dealerportal/orders');
              }
            });
          } else {
            throw new Error('Failed to change status order');
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


  return (
    <Box className="buttons-bar" sx={{ display: 'flex', alignContent: 'flex-end' }}>
      <Grid container spacing={1}>
        <Grid item>
          <Button sx={{
            bgcolor: isMobile ? '#F2F2F2' : 'white',
            color: 'black',
            boxShadow: '1px 2px 2px rgba(0, 0, 0, 0.1)',
          }}
            fullWidth
            onClick={handleClick}
            endIcon={isMenuOpen ? <ExpandLess /> : <ExpandMore />}
          >
            <Print />
            {isMobile ? '' : 'Print'}
          </Button>
          <Menu
            anchorEl={anchorEl}
            open={isMenuOpen}
            onClose={handleClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'left',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'left',
            }}
            sx={{
              '& .MuiPaper-root': {
                backgroundColor: '#f0f0f0',
                border: '1px solid #ddd',
                boxShadow: 'none',
                zIndex: 9999,
                // maxWidth: '100%', // Ajusta según necesites
              },
            }}
          >
            <MenuItem onClick={() => handlePrint('utils/dealerportal/quote/pdf-view')}>
              <Print /> Print Sell
            </MenuItem>
            <MenuItem onClick={() => handlePrint('utils/dealerportal/quote/pdf-view-cost')}>
              <PrintRounded /> Print Cost
            </MenuItem>
            <MenuItem onClick={() => handlePrint('utils/dealerportal/quote/pdf-view-total')}>
              <PrintTwoTone /> Print Total
            </MenuItem>
          </Menu>
        </Grid>


        {/* <Grid item>
          <Button sx={{
            bgcolor: 'white',
            color: 'black',
            boxShadow: '0px 1px 1px rgba(0, 0, 0, 0.1)'
          }}
            fullWidth
            onClick={() => handlePrint('utils/dealerportal/quote/pdf-view')}
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
            onClick={() => handlePrint('utils/dealerportal/quote/pdf-view-cost')}
          >
            <PrintTwoTone />
            Print Cost
          </Button>
        </Grid> */}
        {!isOrder && quote.status === 'active' && (
          !isMobile ? (
            <>
              <Grid item>
                <Button sx={{
                  bgcolor: isMobile ? '#F2F2F2' : 'white',
                  color: 'black',
                  boxShadow: '1px 2px 2px rgba(0, 0, 0, 0.1)'
                }}
                  fullWidth
                  onClick={() => onEdit(quote)}
                >
                  <EditOutlined />
                  {isMobile ? '' : 'Edit'}
                </Button>
              </Grid>
              <Grid item>
                <Button sx={{
                  bgcolor: isMobile ? '#F2F2F2' : 'white',
                  color: 'black',
                  boxShadow: '1px 2px 2px rgba(0, 0, 0, 0.1)'
                }}
                  fullWidth
                  onClick={() => handleDeleteQuote(quote)}
                >
                  <DeleteOutline />
                  {isMobile ? '' : 'Delete'}
                </Button>
              </Grid>
              <Grid item>
                <Button sx={{
                  bgcolor: alpha(theme.palette.success.main, 0.1),
                  color: 'black',
                  boxShadow: '1px 2px 2px rgba(0, 0, 0, 0.1)'
                }}
                  fullWidth
                  onClick={() => handlePlaceOrder(quote)}
                >
                  <AddShoppingCartOutlined sx={{ color: 'success.main' }} />
                  {isMobile ? '' : 'Place Order'}
                </Button>
              </Grid>
            </>
          ) : (
            <>
              <Grid item>
                <Button sx={{
                  bgcolor: isMobile ? '#F2F2F2' : 'white',
                  color: 'black',
                  boxShadow: '1px 2px 2px rgba(0, 0, 0, 0.1)',
                }}
                  fullWidth
                  onClick={handleManageClick}
                  endIcon={isMenuManageOpen ? <ExpandLess /> : <ExpandMore />}
                >
                  <Settings />
                </Button>
                <Menu
                  anchorEl={anchorEl}
                  open={isMenuManageOpen}
                  onClose={handleManageClose}
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                  }}
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'left',
                  }}
                  sx={{
                    '& .MuiPaper-root': {
                      backgroundColor: '#f0f0f0',
                      border: '1px solid #ddd',
                      boxShadow: 'none',
                      zIndex: 9999,
                      // maxWidth: '100%', // Ajusta según necesites
                    },
                  }}
                >
                  <MenuItem onClick={() => onEditManage(quote)}>
                    <EditOutlined /> Edit Quote
                  </MenuItem>
                  <MenuItem onClick={() => handlePlaceOrder(quote)}>
                    <AddShoppingCartOutlined /> Place Order
                  </MenuItem>
                  <MenuItem onClick={() => handleDeleteQuote(quote)}>
                    <DeleteOutline /> Delete Quote
                  </MenuItem>
                </Menu>
              </Grid>
            </>
          )
        )}
        {isOrder && (
          <>
            <Grid item>
              <Button sx={{
                bgcolor: order.status === 'accepted' || order.status === 'completed' || order.status === 'paid' ? '#F1F1F1' : alpha(theme.palette.success.main, 0.1),
                color: 'black',
                boxShadow: '1px 2px 2px rgba(0, 0, 0, 0.1)'
              }}
                fullWidth
                onClick={() => handleStatusOrder(order, 'accepted')}
                disabled={order.status === 'accepted' || order.status === 'completed' || order.status === 'paid'}
              >
                <i className="bi bi-clipboard2-plus-fill"></i>
                {isMobile ? '' : 'Accept Order'}
              </Button>
            </Grid>
            <Grid item>
              <Button sx={{
                bgcolor: order.status === 'canceled' || order.status === 'completed' ? '#F1F1F1' : alpha(theme.palette.error.main, 0.1),
                color: 'black',
                boxShadow: '1px 2px 2px rgba(0, 0, 0, 0.1)'
              }}
                fullWidth
                onClick={() => handleStatusOrder(order, 'canceled')}
                disabled={order.status === 'canceled' || order.status === 'completed'}
              >
                <i className="bi bi-clipboard2-x"></i>
                {isMobile ? '' : 'Decline Order'}
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
            bgcolor: alpha(theme.palette.warning.main, 0.1),
            color: 'black',
            boxShadow: '1px 2px 2px rgba(0, 0, 0, 0.1)'
          }}
            onClick={onClose}
            fullWidth>
            <CloseIcon sx={{ color: 'warning.main' }} />
            {isMobile ? '' : 'Close'}
          </Button>
        </Grid>
      </Grid>
    </Box >
  );
}

export default ButtonsbarComponent;