import { Divider, Grid, Box, Typography, useTheme, useMediaQuery, TextField, FormHelperText, Button, IconButton } from '@mui/material';
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { fetchWithToken } from '../../../../utils';
import { apiFrontendRoot, apiUrl } from '../../../../config';
import CustomAlertComponent from '../../../Utils/components/CustomAlertComponent/CustomAlertComponent';
import { useNavigate } from 'react-router-dom';

const IntegrationComponent = () => {

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { register, handleSubmit, formState: { errors }, reset } = useForm();
  const [zohoConfig, setZohoConfig] = React.useState(null);
  const navigate = useNavigate();

  const fetchZohoConfig = async () => {
    try {
      const response = await fetchWithToken(`${apiUrl}/z_api/dealerportal-zoho/settings/`, 'GET', null, {}, apiUrl);
      if (response.status === 200) {
        console.log(response.data);
        setZohoConfig(response.data);
      } else {
        throw new Error(`Failed to fetch Zoho Config`);
      }
    } catch (err) {
      console.error(err.message);
    }
  }

  const onSubmit = async () => {
  }

  useEffect(() => {
    fetchZohoConfig();
  }, []);

  useEffect(() => {

    reset({
      client_id: zohoConfig?.app_config?.zoho_client_id,
      client_secret: zohoConfig?.app_config?.zoho_client_secret,
      redirect_uri: zohoConfig?.app_config?.zoho_redirect_uri,
      organization_id: zohoConfig?.app_config?.zoho_org_id,
    });

  }, [zohoConfig, reset]);


  const handleReturnToSettings = () => {
    navigate(`${apiFrontendRoot}/settings`);
  }


  return (
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
                  message={zohoConfig.connected ? 'Connected to Zoho Inventory ' : 'Not connected to Zoho '}
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
            <Grid item xs sx={{ mb: 2}}>
              <Typography variant="h6">
                <i className="fa-solid fa-dolly me-2"></i>
                Zoho Inventory Integration
              </Typography>
            </Grid>
          </Grid>
          <Grid container spacing={1} sx={{ bgcolor: 'white', p: 1, borderRadius: '10px' }}>
            <Grid item xs>
              <form onSubmit={handleSubmit()}>
                <Box sx={{ mb: 1, width: '100%' }}>
                  <TextField
                    type="client_id"
                    label="Client ID"
                    id="client_id"
                    name="client_id"
                    placeholder="Enter Client ID"
                    fullWidth
                    margin="normal"
                    InputLabelProps={{
                      shrink: true,
                    }}
                    {...register('client_id', {
                      required: 'Client ID is required',
                    })}
                    error={!!errors.client_id}
                  />
                  {errors.client_id && (
                    <FormHelperText error>{errors.client_id.message}</FormHelperText>
                  )}
                </Box>

                <Box sx={{ mb: 1, width: '100%' }}>
                  <TextField
                    type="client_secret"
                    label="Client Secret"
                    id="client_secret"
                    name="client_secret"
                    placeholder="Enter Client Secret"
                    fullWidth // Asegura que ocupe todo el ancho
                    margin="normal"
                    InputLabelProps={{
                      shrink: true,
                    }}
                    {...register('client_secret', {
                      required: 'Client Secret is required',
                    })}
                    error={!!errors.client_secret}
                  />
                  {errors.client_secret && (
                    <FormHelperText error>{errors.client_secret.message}</FormHelperText>
                  )}
                </Box>

                <Box sx={{ mb: 1, width: '100%' }}>
                  <TextField
                    type="redirect_uri"
                    label="Redirect URI"
                    id="redirect_uri"
                    name="redirect_uri"
                    placeholder="Enter Redirect URI"
                    fullWidth // Asegura que ocupe todo el ancho
                    margin="normal"
                    InputLabelProps={{
                      shrink: true,
                    }}
                    {...register('redirect_uri', {
                      required: 'Redirect URI is required',
                    })}
                    error={!!errors.redirect_uri}
                  />
                  {errors.redirect_uri && (
                    <FormHelperText error>{errors.redirect_uri.message}</FormHelperText>
                  )}
                </Box>

                <Box sx={{ mb: 1, width: '100%' }}>
                  <TextField
                    type="organization_id"
                    label="Organization ID"
                    id="organization_id"
                    name="organization_id"
                    placeholder="Enter Organization ID"
                    fullWidth // Asegura que ocupe todo el ancho
                    margin="normal"
                    InputLabelProps={{
                      shrink: true,
                    }}
                    {...register('organization_id', {
                      required: 'Organization ID is required',
                    })}
                    error={!!errors.organization_id}
                  />
                  {errors.organization_id && (
                    <FormHelperText error>{errors.organization_id.message}</FormHelperText>
                  )}
                </Box>

                <Box sx={{ textAlign: 'right', mb: 1, width: '100%' }}>
                  <Button type="submit" variant="contained" color="success" disabled>
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
                  <i className="fa-solid fa-dolly"></i>
                  <Typography variant="body2" sx={{ fontSize: '15px' }}>
                    Connect to Zoho Inventory
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
                  <i className="fa-solid fa-sync"></i>
                  <Typography variant="body2" sx={{ fontSize: '15px' }}>
                    Manual Sync Products
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
  );
}

export default IntegrationComponent;