import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
  Typography,
  Box,
  Button,
  FormHelperText,
  Modal,
  TextField,
  useMediaQuery,
  useTheme,
  Grid,
} from '@mui/material';
import Swal from 'sweetalert2';
import { apiUrl, staticUrl } from '../../../../../../config';
import { fetchWithToken } from '../../../../../../utils';

const ModalUpdateUserComponent = ({ dealership, open, handleClose, setDealership }) => {
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [previewLogo, setPreviewLogo] = useState('');

  useEffect(() => {
    console.log(dealership);
    reset({
      name: dealership.account_name,
      company_address: dealership.address,
      company_phone: dealership.phone,
      zoho_email: dealership.email,
    });

    setPreviewLogo(
      dealership.logo
        ? `${staticUrl}${dealership.logo.includes('dealership.png') ? '/images/' : '/'}${dealership.logo}`
        : ''
    );
  }, [dealership, reset]);

  const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: isMobile ? '100%' : '700px',
    bgcolor: 'background.paper',
    border: '1px solid #ddd',
    boxShadow: 24,
    p: 4,
    borderRadius: '10px',
  };

  const onSubmit = async (data) => {
    const user = JSON.parse(localStorage.getItem('userLogged'));
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('company_address', data.company_address);
    formData.append('company_phone', data.company_phone);
    formData.append('zoho_email', data.zoho_email);
    formData.append('user_id', user.data.id);

    if (data.logo) {
      formData.append('logo', data.logo);
    }

    try {
      const customClassSwal = {
        popup: 'small-popup',
        title: 'small-title',
        icon: 'custom-icon',
        content: 'small-content',
        confirmButton: 'small-confirm-button',
      };
      const url = `${apiUrl}/dealerportal/dealerships/update/${dealership.id}/`;
      const response = await fetchWithToken(url, 'POST', formData, {}, apiUrl);
      if (response.status === 200) {
        handleCloseModal();
        if (!response.data.error) {
          Swal.fire({
            title: 'Success',
            text: `${response.data.message}`,
            icon: 'success',
            confirmButtonText: 'OK',
            customClass: customClassSwal,
            willClose: () => {
              dealership.account_name = data.name;
              dealership.address = data.company_address;
              dealership.phone = data.company_phone;
              dealership.email = data.zoho_email;
              setDealership({ ...dealership });
            },
          });
        } else {
          Swal.fire({
            title: 'Error',
            text: `${response.data.message}`,
            icon: 'error',
            confirmButtonText: 'Cool',
            customClass: customClassSwal,
          });
        }

      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleCloseModal = () => {
    reset();
    handleClose();
  };

  return (
    <Modal
      open={open}
      onClose={handleCloseModal}
      aria-labelledby="add-new-quote-modal"
      sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      <Box sx={style}>
        <div
          className="modal-header"
          style={{ borderBottom: '1px solid #ddd', marginBottom: 10 }}
        >
          <Typography
            id="add-new-quote-modal"
            variant="h6"
            component="h5"
            style={{ marginBottom: 10 }}
          >
            <i className="bi bi-pencil-square me-2"></i>
            Manage <b>{dealership.account_name}</b> Details
          </Typography>
        </div>
        <div className="modal-body">
          <form onSubmit={handleSubmit(onSubmit)}>

            <Box className="inputDiv" sx={{ mb: 2 }}>
              {/* <label htmlFor="name">Name:</label> */}
              <TextField
                label="Name"
                id="name"
                name="name"
                placeholder="Enter Job Name"
                fullWidth
                margin="none"
                InputLabelProps={{
                  shrink: true,
                }}
                {...register('name', {
                  required: 'Job Name is required',
                })}
                error={!!errors.name}
              />
              {errors.name && (
                <FormHelperText error>{errors.name.message}</FormHelperText>
              )}
            </Box>

            <Box className="inputDiv" sx={{ mb: 0, p: 0 }}>
              <Grid container spacing={1}>
                <Grid item xs={2}>
                  <Box className="inputDiv" sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Preview Logo
                    </Typography>
                    <Box className="logoPreview">
                      <img
                        src={previewLogo}
                        alt="logo"
                        style={{ width: '70px', height: '70px', borderRadius: '20px' }}
                      />
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={10}>
                  <Box className="inputDiv" sx={{ mb: 3, mt: isMobile ? 6 : 4 }}>
                    <Controller
                      name="logo"
                      control={control}
                      defaultValue=""
                      render={({ field: { onChange, onBlur, name, ref } }) => (
                        <TextField
                          label="Logo"
                          id="logo"
                          type="file"
                          fullWidth
                          margin="none"
                          InputLabelProps={{
                            shrink: true,
                          }}
                          inputProps={{
                            accept: 'image/*',
                            style: { cursor: 'pointer' },
                          }}
                          name={name}
                          onBlur={onBlur}
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) {
                              setPreviewLogo(URL.createObjectURL(file));
                            } else {
                              setPreviewLogo(
                                dealership.logo
                                  ? `${staticUrl}${dealership.logo.includes('dealership.png') ? '/images/' : '/'
                                  }${dealership.logo}`
                                  : ''
                              );
                            }
                            onChange(file);
                          }}
                          inputRef={ref}
                        />
                      )}
                    />
                  </Box>
                </Grid>
              </Grid>
            </Box>


            <Box className="inputDiv" sx={{ mb: 3 }}>
              {/* <label htmlFor="name">Company Address:</label> */}
              <TextField
                label="Company Address"
                id="company_address"
                name="company_address"
                placeholder="Enter Company Address"
                fullWidth
                margin="none"
                InputLabelProps={{
                  shrink: true,
                }}
                {...register('company_address', {
                  required: 'Company Address is required',
                })}
                error={!!errors.company_address}
              />
              {errors.company_address && (
                <FormHelperText error>{errors.company_address.message}</FormHelperText>
              )}
            </Box>

            <Box className="inputDiv" sx={{ mb: 3 }}>
              {/* <label htmlFor="name">Company Phone:</label> */}
              <TextField
                label="Company Phone"
                id="company_phone"
                name="company_phone"
                placeholder="Enter Company Phone"
                fullWidth
                margin="none"
                InputLabelProps={{
                  shrink: true,
                }}
                {...register('company_phone', {
                  required: 'Company Phone is required',
                })}
                error={!!errors.company_phone}
              />
              {errors.company_phone && (
                <FormHelperText error>{errors.company_phone.message}</FormHelperText>
              )}
            </Box>

            <Box className="inputDiv" sx={{ mb: 3 }}>
              {/* <label htmlFor="name">Dealership ID Email:</label> */}
              <TextField
                label="Dealership ID Email"
                id="zoho_email"
                name="zoho_email"
                placeholder="Enter Dealership ID Email"
                fullWidth
                margin="none"
                InputLabelProps={{
                  shrink: true,
                }}
                {...register('zoho_email', {
                  required: 'Dealership ID Email is required',
                })}
                error={!!errors.zoho_email}
              />
              {errors.zoho_email && (
                <FormHelperText error>{errors.zoho_email.message}</FormHelperText>
              )}
            </Box>

            <Box className="inputDiv" sx={{ mb: 3, bgcolor: 'black', color: 'white', p: 1, borderRadius: '10px' }}>
              <Typography variant="subtitle2" gutterBottom>
                <i className="bi bi-info-circle me-2"></i>
                Alert! This affects how this Dealership Orders are mapped into ZOHO.
              </Typography>
            </Box>

            <Box className="btnGroup">
              <Button type="submit" variant="contained" color="success">
                Update Dealership
              </Button>
              <Button
                onClick={handleCloseModal}
                sx={{ ml: 2, bgcolor: '#F6D3A1', color: 'gray' }}
              >
                Close
              </Button>
            </Box>
          </form>
        </div>
      </Box>
    </Modal>
  );
};

export default ModalUpdateUserComponent;
