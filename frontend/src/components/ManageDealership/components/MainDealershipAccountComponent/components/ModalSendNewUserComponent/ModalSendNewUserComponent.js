import React from 'react';
import { useTheme, useMediaQuery, Box, Typography, Modal, TextField, Button, FormHelperText } from '@mui/material';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { apiFrontendRoot, apiUrl } from '../../../../../../config';
import { fetchWithToken } from '../../../../../../utils';
import Swal from 'sweetalert2';

const ModalSendNewUserComponent = ({ dealership, open, handleClose, onSyncComplete }) => {

  const { register, handleSubmit, formState: { errors }, reset } = useForm();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();

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

  const customClassSwal = {
    popup: 'small-popup',
    title: 'small-title',
    icon: 'custom-icon',
    content: 'small-content',
    confirmButton: 'small-confirm-button',
  };

  const onSubmit = async (data) => {
    const user = JSON.parse(localStorage.getItem('userLogged'));
    const payload = {
      ...data,
      user_id: user.data.id,
      role: user.data.role,
      dealership_id: dealership.id,
    };
    try {
      const url = `${apiUrl}/utils/dealerportal-send-invitation/`;
      const response = await fetchWithToken(url, 'POST', payload, {}, apiUrl);
      if (response.status === 200) {
        handleCloseModal();
        if (response.data.error) {
          Swal.fire({
            title: 'Error',
            text: response.data.error,
            icon: 'error',
            confirmButtonText: 'OK',
            customClass: customClassSwal,
          });
        }
        else {
          Swal.fire({
            title: 'Success!',
            text: `${response.data.message}`,
            icon: 'success',
            confirmButtonText: 'OK',
            customClass: customClassSwal,
            willClose: () => {
              navigate(`${apiFrontendRoot}/dealership-details`, { state: { dealership: dealership } });
            },
          });
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
  }

  return (
    <Modal
      open={open}
      onClose={handleCloseModal}
      aria-labelledby="add-new-quote-modal"
      // aria-hidden="true"
      // inert="true"
      // tabIndex="-1"
      sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      <Box sx={style}>
        <div className="modal-header" style={{ borderBottom: '1px solid #ddd', marginBottom: 10 }}>
          <Typography id="add-new-quote-modal" variant="h6" component="h5" style={{ marginBottom: 10 }}>
            <i className="bi bi-plus-circle me-2"></i>
            New User
          </Typography>
        </div>
        <div className="modal-body">
          <form onSubmit={handleSubmit(onSubmit)}>
            <Box className="inputDiv" sx={{ mb: 3 }}>
              {/* <label htmlFor="name">Name:</label> */}
              <TextField
                type="email"
                label="Email"
                id="email"
                name="email"
                placeholder="Enter email"
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


            <Box className="btnGroup">
              <Button type="submit" variant="contained" color="success">
                Send Invitation
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


export default ModalSendNewUserComponent;