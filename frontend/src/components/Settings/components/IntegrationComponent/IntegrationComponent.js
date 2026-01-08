import { Divider, Grid, Box, Typography, useTheme, useMediaQuery, TextField, FormHelperText, Button, IconButton } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { fetchWithToken } from '../../../../utils';
import { apiFrontendRoot, apiUrl } from '../../../../config';
import CustomAlertComponent from '../../../Utils/components/CustomAlertComponent/CustomAlertComponent';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import ModalConnectZohoComponent from './components/ModalConnectZohoComponent/ModalConnectZohoComponent';
import ModalProductsSyncComponent from './components/ModalProductsSyncComponent/ModalProductsSyncComponent';
import ModalCustomersSyncComponent from './components/ModalCustomersSyncComponent/ModalCustomersSyncComponent';

const IntegrationComponent = () => {

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { register, handleSubmit, formState: { errors, isDirty }, reset } = useForm({
    defaultValues: {
      zoho_client_id: '',
      zoho_client_secret: '',
      zoho_redirect_uri: '',
      zoho_org_id: '',
    },
  });
  const [zohoConfig, setZohoConfig] = useState(null);
  const [openModalConnectZoho, setOpenModalConnectZoho] = useState(false);
  const handleOpenModalConnectZoho = () => setOpenModalConnectZoho(true);
  const handleCloseModalConnectZoho = () => setOpenModalConnectZoho(false);
  const [openModalProductsSync, setOpenModalProductsSync] = useState(false);
  const handleOpenModalProductsSync = () => setOpenModalProductsSync(true);
  const handleCloseModalProductsSync = () => setOpenModalProductsSync(false);
  const [openModalCustomersSync, setOpenModalCustomersSync] = useState(false);
  const handleOpenModalCustomersSync = () => setOpenModalCustomersSync(true);
  const handleCloseModalCustomersSync = () => setOpenModalCustomersSync(false);
  const navigate = useNavigate();

  const fetchZohoConfig = async () => {
    try {
      const response = await fetchWithToken(`${apiUrl}/z_api/dealerportal-zoho/settings/`, 'GET', null, {}, apiUrl);
      if (response.status === 200) {
        setZohoConfig(response.data);
      } else {
        throw new Error(`Failed to fetch Zoho Config`);
      }
    } catch (err) {
      console.error(err.message);
    }
  }

  const onSubmit = async (data) => {
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
        text: `You want to save this ZOHO Configuration!`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, save it!',
        cancelButtonText: 'No, keep it',
        customClass: customClassSwal
      }).then(async (result) => {
        if (result.isConfirmed) {
          const user = JSON.parse(localStorage.getItem('userLogged'));
          const payload = {
            ...data,
            user_id: user.data.id,
          };
          const response = await fetchWithToken(`${apiUrl}/z_api/dealerportal-zoho/settings/`, 'POST', payload, {}, apiUrl);
          if (response.status === 200) {
            if (response.data.error) {
              Swal.fire({
                title: 'Error',
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
                navigate('/dealerportal/settings');
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
        confirmButtonText: 'Accept',
        customClass: customClassSwal
      });
    }
  }

  useEffect(() => {
    fetchZohoConfig();
  }, [apiUrl, setZohoConfig, fetchWithToken]);

  useEffect(() => {
    if (zohoConfig) {
      reset(
        {
          zoho_client_id: zohoConfig.app_config.zoho_client_id,
          zoho_client_secret: zohoConfig.app_config.zoho_client_secret,
          zoho_redirect_uri: zohoConfig.app_config.zoho_redirect_uri,
          zoho_org_id: zohoConfig.app_config.zoho_org_id,
        },
        {
          keepDirty: false,
        }
      );
    }
  }, [zohoConfig, reset]);


  const handleReturnToSettings = () => {
    navigate(`${apiFrontendRoot}/settings`);
  }


  return (
    <>
      <Box sx={{
        mb: 2,
        ml: isMobile ? 0 : 2,
        mt: isMobile ? 1 : -3,
        display: 'flex',
        flexGrow: 1,
        flexDirection: 'column',
      }}>
        <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', ml: isMobile ? 0 : 2, mb: 1 }}>
          <Grid container spacing={1}>
            <Grid item xs>
              <Typography variant="h6" sx={{ fontSize: '20px' }}>
                Integration Settings
              </Typography>
            </Grid>
            {zohoConfig && (
              <Grid item xs>
                <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end' }}>
                  <CustomAlertComponent
                    severity={zohoConfig.connected ? 'success' : 'warning'}
                    message={zohoConfig.connected ? 'Connected to Zoho Inventory' : 'Not connected to Zoho Inventory'}
                    sx={{ border: 1, borderColor: 'divider', p: 0.1 }}
                  />
                </Box>
              </Grid>
            )}
          </Grid>
        </Box>
        <Divider />
        <Box
          sx={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            justifyContent: 'space-between',
            ml: isMobile ? 0 : 3,
            mb: 1,
            mt: 1,
            width: '100%',
          }}
        >

          <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            width: isMobile ? '100%' : '50%',
            mb: 2
          }}>
            <Grid container spacing={1}>
              <Grid item xs sx={{ mb: 2 }}>
                <Typography variant="h6">
                  <i className="fa-solid fa-dolly me-2"></i>
                  Zoho Inventory Integration
                </Typography>
              </Grid>
            </Grid>
            <Grid container spacing={1} sx={{ bgcolor: 'white', p: 1, borderRadius: '10px' }}>
              <Grid item xs>
                <form onSubmit={handleSubmit(onSubmit)}>
                  <Box sx={{ mb: 1, width: '100%' }}>
                    <TextField
                      type="zoho_client_id"
                      label="Client ID"
                      id="zoho_client_id"
                      name="zoho_client_id"
                      placeholder="Enter Client ID"
                      fullWidth
                      margin="normal"
                      InputLabelProps={{
                        shrink: true,
                      }}
                      {...register('zoho_client_id', {
                        required: 'Client ID is required',
                      })}
                      error={!!errors.zoho_client_id}
                    />
                    {errors.zoho_client_id && (
                      <FormHelperText error>{errors.zoho_client_id.message}</FormHelperText>
                    )}
                  </Box>

                  <Box sx={{ mb: 1, width: '100%' }}>
                    <TextField
                      type="zoho_client_secret"
                      label="Client Secret"
                      id="zoho_client_secret"
                      name="zoho_client_secret"
                      placeholder="Enter Client Secret"
                      fullWidth
                      margin="normal"
                      InputLabelProps={{
                        shrink: true,
                      }}
                      {...register('zoho_client_secret', {
                        required: 'Client Secret is required',
                      })}
                      error={!!errors.zoho_client_secret}
                    />
                    {errors.zoho_client_secret && (
                      <FormHelperText error>{errors.zoho_client_secret.message}</FormHelperText>
                    )}
                  </Box>

                  <Box sx={{ mb: 1, width: '100%' }}>
                    <TextField
                      type="zoho_redirect_uri"
                      label="Redirect URI"
                      id="zoho_redirect_uri"
                      name="zoho_redirect_uri"
                      placeholder="Enter Redirect URI"
                      fullWidth // Asegura que ocupe todo el ancho
                      margin="normal"
                      InputLabelProps={{
                        shrink: true,
                      }}
                      {...register('zoho_redirect_uri', {
                        required: 'Redirect URI is required',
                      })}
                      error={!!errors.zoho_redirect_uri}
                    />
                    {errors.zoho_redirect_uri && (
                      <FormHelperText error>{errors.zoho_redirect_uri.message}</FormHelperText>
                    )}
                  </Box>

                  <Box sx={{ mb: 1, width: '100%' }}>
                    <TextField
                      type="zoho_org_id"
                      label="Organization ID"
                      id="zoho_org_id"
                      name="zoho_org_id"
                      placeholder="Enter Organization ID"
                      fullWidth // Asegura que ocupe todo el ancho
                      margin="normal"
                      InputLabelProps={{
                        shrink: true,
                      }}
                      {...register('zoho_org_id', {
                        required: 'Organization ID is required',
                      })}
                      error={!!errors.zoho_org_id}
                    />
                    {errors.zoho_org_id && (
                      <FormHelperText error>{errors.zoho_org_id.message}</FormHelperText>
                    )}
                  </Box>

                  <Box sx={{ textAlign: 'right', mb: 1, width: '100%' }}>
                    <Button type="submit" variant="contained" color="success" disabled={!isDirty}>
                      Save
                    </Button>
                  </Box>
                </form>
              </Grid>
            </Grid>
          </Box>
          <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            width: isMobile ? '100%' : '50%',
            ml: 1
          }}>
            <Grid container spacing={1}>
              <Grid item xs>
                <Typography variant="h6" sx={{ mb: 1 }}>
                  Quick Actions
                </Typography>
              </Grid>
            </Grid>
            <Grid container spacing={1}>
              <Grid item xs>
                <Box onClick={handleOpenModalConnectZoho}
                  sx={{
                    display: 'flex',
                    flexGrow: 1,
                    flexDirection: 'column',
                    justifyContent: 'center',
                    ml: isMobile ? 0 : 1,
                    p: 1,
                    bgcolor: 'white',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    height: '100%',
                  }}
                >
                  <IconButton
                    color="gray"
                    sx={{
                      p: 0,
                      borderRadius: '5px',
                      minWidth: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <i className="fa-solid fa-dolly"></i>
                    <Typography variant="body2" sx={{ fontSize: '15px' }}>
                      Connect to Zoho Inventory
                    </Typography>
                  </IconButton>
                </Box>
              </Grid>
              <Grid item xs>
                <Box onClick={handleOpenModalProductsSync}
                  sx={{
                    display: 'flex',
                    flexGrow: 1,
                    flexDirection: 'column',
                    justifyContent: 'center',
                    ml: isMobile ? 0 : 1,
                    p: 1,
                    bgcolor: 'white',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    height: '100%',
                  }}
                >
                  <IconButton
                    color="gray"
                    sx={{
                      p: 0,
                      borderRadius: '5px',
                      minWidth: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <i className="fa-solid fa-sync"></i>
                    <Typography variant="body2" sx={{ fontSize: '15px' }}>
                      Manual Sync Products
                    </Typography>
                  </IconButton>
                </Box>
              </Grid>
              <Grid item xs>
                <Box onClick={handleOpenModalCustomersSync}
                  sx={{
                    display: 'flex',
                    flexGrow: 1,
                    flexDirection: 'column',
                    justifyContent: 'center',
                    ml: isMobile ? 0 : 1,
                    p: 1,
                    bgcolor: 'white',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    height: '100%',
                  }}
                >
                  <IconButton
                    color="gray"
                    sx={{
                      p: 0,
                      borderRadius: '5px',
                      minWidth: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <i className="fa-solid fa-user"></i>
                    <Typography variant="body2" sx={{ fontSize: '15px' }}>
                      Manual Sync Customers
                    </Typography>
                  </IconButton>
                </Box>
              </Grid>
              <Grid item xs>
                <Box
                  sx={{
                    display: 'flex',
                    flexGrow: 1,
                    flexDirection: 'column',
                    justifyContent: 'center',
                    ml: isMobile ? 0 : 1,
                    p: 1,
                    bgcolor: 'white',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    height: '100%',
                  }}
                >
                  <IconButton
                    color="gray"
                    sx={{
                      p: 0,
                      borderRadius: '5px',
                      minWidth: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <i className="fa-solid fa-dollar-sign"></i>
                    <Typography variant="body2" sx={{ fontSize: '15px' }}>
                      Manual Sync Prices
                    </Typography>
                  </IconButton>
                </Box>
              </Grid>
              <Grid item xs>
                <Box onClick={handleReturnToSettings}
                  sx={{
                    display: 'flex',
                    flexGrow: 1,
                    flexDirection: 'column',
                    justifyContent: 'center',
                    ml: isMobile ? 0 : 1,
                    p: 1,
                    bgcolor: 'white',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    height: '100%',
                  }}
                >
                  <IconButton
                    color="gray"
                    sx={{
                      p: 0,
                      borderRadius: '5px',
                      minWidth: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <i className="fa-solid fa-close"></i>
                    <Typography variant="body2" sx={{ fontSize: '15px' }}>
                      Return to Settings
                    </Typography>
                  </IconButton>
                </Box>
              </Grid>
            </Grid>
          </Box>

        </Box>
      </Box>
      {zohoConfig && (
        <>
          <ModalConnectZohoComponent open={openModalConnectZoho} handleClose={handleCloseModalConnectZoho} zohoConfig={zohoConfig} />
          <ModalProductsSyncComponent open={openModalProductsSync} handleClose={handleCloseModalProductsSync} zohoConfig={zohoConfig} />
          <ModalCustomersSyncComponent open={openModalCustomersSync} handleClose={handleCloseModalCustomersSync} zohoConfig={zohoConfig} />
        </>
      )}
    </>
  );
}

export default IntegrationComponent;