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
} from '@mui/material';
import Swal from 'sweetalert2';
import { apiUrl, staticUrl } from '../../../../../../config';
import { fetchWithToken } from '../../../../../../utils';

const ModalManageUserComponent = ({ user, open, handleClose, onSyncComplete }) => {
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const userLogged = JSON.parse(localStorage.getItem('userLogged') || '{}');

  useEffect(() => {
    reset({
      username: user?.username || '',
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
      email: user?.email || '',
      address: user?.address || '',
    });

  }, [user, reset]);

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
    const customClassSwal = {
      popup: 'small-popup',
      title: 'small-title',
      icon: 'custom-icon',
      content: 'small-content',
      confirmButton: 'small-confirm-button',
    };
    try {
      const url = `${apiUrl}/dealerportal/manage-account/${user.id}/`;
      const response = await fetchWithToken(url, 'POST', data, {}, apiUrl);
      if (response.status === 200) {
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
                if (onSyncComplete){
                  const payload = {
                    user_id: userLogged.data.id,
                  };
                  onSyncComplete(payload);
                }
              },

            });
          } else {
            Swal.fire({
              title: 'Error',
              text: `${response.data.message}`,
              icon: 'error',
              confirmButtonText: 'Accept',
              customClass: customClassSwal,
            });
          }
        }
      }
    }
    catch (error) {
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
            Update <b>{user?.username} account</b> details
          </Typography>
        </div>
        <div className="modal-body">
          <form onSubmit={handleSubmit(onSubmit)}>

            <Box className="inputDiv" sx={{ mb: 3 }}>
              {/* <label htmlFor="name">Name:</label> */}
              <TextField
                label="Username"
                id="username"
                name="username"
                placeholder="Enter Username"
                fullWidth
                margin="none"
                InputLabelProps={{
                  shrink: true,
                }}
                {...register('username', {
                  required: 'Username is required',
                })}
                error={!!errors.username}
              />
              {errors.username && (
                <FormHelperText error>{errors.username.message}</FormHelperText>
              )}
            </Box>

            <Box className="inputDiv" sx={{ mb: 3 }}>
              {/* <label htmlFor="name">Company Address:</label> */}
              <TextField
                label="First Name"
                id="first_name"
                name="first_name"
                placeholder="Enter First Name"
                fullWidth
                margin="none"
                InputLabelProps={{
                  shrink: true,
                }}
                {...register('first_name', {
                  required: 'First Name is required',
                })}
                error={!!errors.first_name}
              />
              {errors.first_name && (
                <FormHelperText error>{errors.first_name.message}</FormHelperText>
              )}
            </Box>

            <Box className="inputDiv" sx={{ mb: 3 }}>
              {/* <label htmlFor="name">Company Phone:</label> */}
              <TextField
                label="Last Name"
                id="last_name"
                name="last_name"
                placeholder="Enter Last Name"
                fullWidth
                margin="none"
                InputLabelProps={{
                  shrink: true,
                }}
                {...register('last_name', {
                  required: 'Last Name is required',
                })}
                error={!!errors.last_name}
              />
              {errors.last_name && (
                <FormHelperText error>{errors.last_name.message}</FormHelperText>
              )}
            </Box>

            <Box className="inputDiv" sx={{ mb: 3 }}>
              {/* <label htmlFor="name">Dealership ID Email:</label> */}
              <TextField
                type="email"
                label="Email"
                id="email"
                name="email"
                placeholder="Enter Email"
                fullWidth
                margin="none"
                InputLabelProps={{
                  shrink: true,
                }}
                {...register('email', {
                  required: 'Email is required',
                })}
                error={!!errors.email}
              />
              {errors.email && (
                <FormHelperText error>{errors.email.message}</FormHelperText>
              )}
            </Box>

            <Box className="inputDiv" sx={{ mb: 3 }}>
              {/* <label htmlFor="name">Dealership ID Email:</label> */}
              <TextField
                label="Address"
                id="address"
                name="address"
                placeholder="Enter Address"
                fullWidth
                margin="none"
                InputLabelProps={{
                  shrink: true,
                }}
                {...register('address', {
                  required: 'Address is required',
                })}
                error={!!errors.address}
              />
              {errors.address && (
                <FormHelperText error>{errors.address.message}</FormHelperText>
              )}
            </Box>

            <Box className="btnGroup">
              <Button type="submit" variant="contained" color="success">
                Update Account
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

export default ModalManageUserComponent;
