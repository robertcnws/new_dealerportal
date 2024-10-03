import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Alert,
  Divider,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { Badge } from 'react-bootstrap';
import ButtonsbarComponent from '../../../QuoteDetails/components/ButtonsbarComponent/ButtonsbarComponent';
import { apiFrontendRoot } from '../../../../config';
import TableOrderProductsComponent from '../TableOrderProductsComponent/TableOrderProductsComponent';
import CustomDateComponent from '../../../Utils/components/CustomDateComponent/CustomDateComponent';

const OrderDetailsComponent = () => {

  const navigate = useNavigate();
  const location = useLocation();
  const [order, setOrder] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  // const isMobile = useMediaQuery('(max-width:999px)');

  useEffect(() => {
    if (location.state?.order) {
      // console.log(location.state.order);
      setOrder(location.state.order);
    }
  }, [location.state.order]);

  const handleClose = () => {
    navigate(`${apiFrontendRoot}/orders`);
  }

  if (!isMobile) {
    return (
      <>
        {order && (
          <Box sx={{ padding: 1, overflowY: 'auto', ml: 2, mt: -7, minWidth: '100.7%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mt: 2, mb: 1 }}>

              <ButtonsbarComponent quote={order?.quote} onClose={handleClose} isOrder={true} order={order} />
            </Box>
            <Paper elevation={3} sx={{ padding: 2, boxShadow: 'none', minHeight: 'calc(100vh - 170px)' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'right', mb: 2 }}>
                <Grid container spacing={1} sx={{ p: 1, display: 'flex', justifyContent: 'space-between' }}>
                  <Grid item xs={4} sx={{ border: '1px solid whitesmoke', borderRadius: '10px', p: 1 }}>
                    <Grid item xs={12}>
                      {order && (
                        <Box sx={{ mb: 1, p: 1 }}>
                          <Typography variant="body1">
                            Status: <Badge bg={order?.status === 'accepted' || order?.status === 'completed' || order?.status === 'paid' ? 'success' :
                              (order?.status === 'pending' ? 'info' :
                                (order?.status === 'canceled' ? 'danger' : 'primary'))} >{order?.status}</Badge>
                          </Typography>
                          <Typography variant="body1">
                            <b>Job Name</b>: {order?.quote_name}
                          </Typography>
                          <Typography variant="body1">
                            <b>Created By</b>: {order?.ordered_by}
                          </Typography>
                          <Typography variant="body1">
                            <b>Created At</b>: <CustomDateComponent date={new Date(order?.created_at)}  /> 
                          </Typography>
                          <Typography variant="body1">
                            <b>Last Modified</b>: <CustomDateComponent date={new Date(order?.updated_at)}  /> 
                          </Typography>
                          <Typography variant="body1">
                            <b>Mark Up</b>: % {order?.mark_up}
                          </Typography>
                        </Box>
                      )}
                    </Grid>
                    {/* <Grid item xs={2}>
                <Box sx={{ mb: 2, p: 1 }}>
                  <NavigationButtonComponent children={childrenNavigationButton} />
                </Box>
              </Grid> */}
                  </Grid>
                  <Grid item xs={8} sx={{ borderRadius: '10px', p: 1, justifyContent: 'space-between' }}>
                    <Box sx={{
                      ml: 1,
                      mr: 1,
                      p: 1,
                      width: '100%',
                      boxShadow: '0px 1px 1px rgba(0, 0, 0, 0.1)',
                      bgcolor: '#F1F1F1',
                      borderRadius: '10px',
                      textAlign: 'right'
                    }}>
                      <Typography variant="h6" sx={{ mb: 2 }}>
                        ORDER TOTALS
                      </Typography>
                      <Divider />
                      {order && (
                        <Box sx={{ mt: 1 }}>
                          <Typography variant="body1">
                            <b>Total Cost</b>: $ {parseFloat(order?.total_cost).toFixed(2)}
                          </Typography>
                          <Typography variant="body1">
                            <b>Mark up Total</b>: $ {parseFloat(order?.markup_total).toFixed(2)}
                          </Typography>
                          <Typography variant="body1">
                            <b>Total Sell</b>: $ {parseFloat(order?.total_sell).toFixed(2)}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Grid>
                </Grid>
              </Box>

              <Box sx={{ textAlign: 'center', width: '100%', mt: 1 }}>
                {order?.products?.length > 0 ? (
                  <Grid container spacing={1} sx={{ display: 'flex', justifyContent: 'center' }}>
                    <TableOrderProductsComponent
                      order={order}
                    />
                  </Grid>
                ) : (
                  <Alert severity="warning" sx={{ mt: 2 }}>
                    No products added to this quote yet.
                  </Alert>
                )}
              </Box>

            </Paper>
          </Box >
        )}
      </>
    );
  }
  return (
    <>
      {order && (
        <Box sx={{ padding: 1, overflowY: 'auto', ml: -2, mt: -3, minWidth: '108%' }}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mt: 2, mb: 1 }}>
            <ButtonsbarComponent quote={order?.quote} onClose={handleClose} isOrder={true} order={order} />
          </Box>
          <Paper elevation={3} sx={{ padding: 2, boxShadow: 'none', borderRadius: '10px', minHeight: 'calc(100vh - 175px)' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'right', mb: 2 }}>
              <Grid container spacing={1} sx={{ p: 1, display: 'flex', justifyContent: 'space-between' }}>
                <Grid item xs={12} sx={{ border: '1px solid whitesmoke', borderRadius: '10px', p: 1 }}>
                  <Grid item xs={12}>
                    {order && (
                      <Box sx={{ mb: 1, p: 1 }}>
                        <Typography variant="body1">
                          Status: <Badge bg={order?.status === 'accepted' || order?.status === 'completed' || order?.status === 'paid' ? 'success' :
                            (order?.status === 'pending' ? 'info' :
                              (order?.status === 'canceled' ? 'danger' : 'primary'))} >{order?.status}</Badge>
                        </Typography>
                        <Typography variant="body1">
                          <b>Job Name</b>: {order?.quote_name}
                        </Typography>
                        <Typography variant="body1">
                          <b>Created By</b>: {order?.ordered_by}
                        </Typography>
                        <Typography variant="body1">
                          <b>Created At</b>: <CustomDateComponent date={new Date(order?.created_at)}  /> 
                        </Typography>
                        <Typography variant="body1">
                          <b>Last Modified</b>: <CustomDateComponent date={new Date(order?.updated_at)}  />
                        </Typography>
                        <Typography variant="body1">
                          <b>Mark Up</b>: % {order?.mark_up}
                        </Typography>
                      </Box>
                    )}
                  </Grid>
                  {/* <Grid item xs={2}>
              <Box sx={{ mb: 2, p: 1 }}>
                <NavigationButtonComponent children={childrenNavigationButton} />
              </Box>
            </Grid> */}
                </Grid>
              </Grid>
            </Box>

            <Box sx={{ textAlign: 'center', width: '100%', mt: 1 }}>
              {order?.products?.length > 0 ? (
                <Grid container spacing={1} sx={{ display: 'flex', justifyContent: 'center' }}>
                  <TableOrderProductsComponent
                    order={order}
                  />
                </Grid>
              ) : (
                <Alert severity="warning" sx={{ mt: 2 }}>
                  No products added to this quote yet.
                </Alert>
              )}
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'right', mb: 2 }}>
              <Grid container spacing={1} sx={{ p: 1, display: 'flex', justifyContent: 'space-between' }}>
                <Grid item xs={12} sx={{ borderRadius: '10px', p: 1, justifyContent: 'space-between' }}>
                  <Box sx={{
                    ml: 1,
                    mr: 1,
                    p: 1,
                    width: '100%',
                    boxShadow: '0px 1px 1px rgba(0, 0, 0, 0.1)',
                    bgcolor: '#F1F1F1',
                    borderRadius: '10px',
                    textAlign: 'right'
                  }}>
                    <Typography variant="h6" sx={{ mb: 0 }}>
                      ORDER TOTALS
                    </Typography>
                    <Divider />
                    {order && (
                      <Box sx={{ mt: 1 }}>
                        <Typography variant="body1">
                          <b>Total Cost</b>: $ {parseFloat(order?.total_cost).toFixed(2)}
                        </Typography>
                        <Typography variant="body1">
                          <b>Mark up Total</b>: $ {parseFloat(order?.markup_total).toFixed(2)}
                        </Typography>
                        <Typography variant="body1">
                          <b>Total Sell</b>: $ {parseFloat(order?.total_sell).toFixed(2)}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Grid>
              </Grid>
            </Box>

          </Paper>
        </Box >
      )}
    </>
  );
};

export default OrderDetailsComponent;
