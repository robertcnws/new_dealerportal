import React from 'react';
import { Modal, Box, Button, Typography, TextField, FormHelperText, useTheme, useMediaQuery } from '@mui/material';
import { useForm } from 'react-hook-form';
import { fetchWithToken } from '../../../../utils';
import { apiUrl } from '../../../../config';



const ModalCreateNewUserComponent = ({ open, handleClose, onSyncComplete }) => {

  const { register, handleSubmit, formState: { errors }, reset } = useForm();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));


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

    // Agregar el archivo si existe
    if (data.logo && data.logo[0]) {
        formData.append('logo', data.logo[0]); // 'logo' es el nombre del campo en tu backend
    }

    try {
        const url = `${apiUrl}/dealerportal/dealerships/create/`;
        const response = await fetchWithToken(url, 'POST', formData, {}, apiUrl);
        if (response.status === 200) {
            const payload = { user_id: user.data.id };
            if (onSyncComplete) {
                onSyncComplete(payload);
            } 
            handleCloseModal();
        }
    } catch (error) {
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
            <Box className="inputDiv" sx={{ mb: 5 }}>
              {/* <label htmlFor="logo">Logo:</label> */}
              <TextField
                label="Logo"
                id="logo"
                name="logo"
                type="file"
                fullWidth
                margin="none"
                InputLabelProps={{
                  shrink: true,
                }}
                inputProps={{
                  accept: 'image/*',
                  style: { cursor: 'pointer' }, // Cambia el cursor al pasar sobre el botón
                }}
                {...register('logo')}
              />
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
                This Email must be the same that the one for the User on the Zoho System.
              </Typography>
            </Box>

            <Box className="btnGroup">
              <Button type="submit" variant="contained" color="success">
                Create Dealership
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



export default ModalCreateNewUserComponent;
