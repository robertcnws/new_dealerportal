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

const ModalChangePasswordUserComponent = ({ user, open, handleClose, onSyncComplete }) => {
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const userLogged = JSON.parse(localStorage.getItem('userLogged') || '{}');

  useEffect(() => {
    reset({
      new_password: '',
      confirm_password: '',
    });

  }, [reset]);

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
      const url = `${apiUrl}/dealerportal/change-password/${user.id}/`;
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
                if (onSyncComplete) {
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
            <i className="bi bi-person-fill-lock me-2"></i>
            Change password <b>{user?.username} </b> account
          </Typography>
        </div>
        <div className="modal-body">
          <form onSubmit={handleSubmit(onSubmit)}>

            <Box className="inputDiv" sx={{ mb: 3 }}>
              {/* <label htmlFor="name">Name:</label> */}
              <TextField
                label="New Password"
                id="new_password"
                name="new_password"
                type="password"
                placeholder="Enter New Password"
                fullWidth
                margin="none"
                InputLabelProps={{
                  shrink: true,
                }}
                {...register('new_password', {
                  required: 'New Password is required',
                })}
                error={!!errors.new_password}
              />
              {errors.new_password && (
                <FormHelperText error>{errors.new_password.message}</FormHelperText>
              )}
            </Box>

            <Box className="inputDiv" sx={{ mb: 3 }}>
              {/* <label htmlFor="name">Name:</label> */}
              <TextField
                label="Confirm Password"
                id="confirm_password"
                name="confirm_password"
                type="password"
                placeholder="Confirm New Password"
                fullWidth
                margin="none"
                InputLabelProps={{
                  shrink: true,
                }}
                {...register('confirm_password', {
                  required: 'Confirm Password is required',
                  validate: (value) => value === watch('new_password') || 'The passwords do not match',
                })}
                error={!!errors.confirm_password}
              />
              {errors.confirm_password && (
                <FormHelperText error>{errors.confirm_password.message}</FormHelperText>
              )}
            </Box>

            <Box className="btnGroup">
              <Button type="submit" variant="contained" color="success">
                Update Password
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

export default ModalChangePasswordUserComponent;
