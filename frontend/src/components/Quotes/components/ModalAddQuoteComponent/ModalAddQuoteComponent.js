import React from 'react';
import { Modal, Box, Button, Typography, TextField, FormHelperText } from '@mui/material';
import { useForm } from 'react-hook-form';
import { fetchWithToken } from '../../../../utils';
import { apiUrl } from '../../../../config';

const ModalAddQuoteComponent = ({ open, handleClose, onSyncComplete }) => {
  const { register, handleSubmit, formState: { errors }, reset } = useForm();

  const onSubmit = async (data) => {
    const user = JSON.parse(localStorage.getItem('userLogged'));
    const newQuote = {
      ...data,
      markup: parseFloat(data.markup),
      user_id: user.data.id,
    };
    try {
      const response = await fetchWithToken(`${apiUrl}/api-dealerportal/quotes/create/`, 'POST', newQuote, {}, apiUrl);
      if (response.status === 200) {
        const payload = { user_id: user.data.id };
        onSyncComplete(payload);
        handleCloseModal();
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
            New Quote
          </Typography>
        </div>
        <div className="modal-body">
          <form onSubmit={handleSubmit(onSubmit)}>
            <Box className="inputDiv" sx={{ mb: 3 }}>
              <label htmlFor="name">Name:</label>
              <TextField
                id="name"
                name="name"
                placeholder="Enter Job Name"
                fullWidth
                margin="none"
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
              <label htmlFor="markup">Markup:</label>
              <TextField
                id="markup"
                name="markup"
                type="number"
                placeholder="Enter MarkUp as %"
                fullWidth
                margin="none"
                {...register('markup', {
                  required: 'MarkUp is required',
                  min: {
                    value: 1,
                    message: 'The minimum value is 1',
                  },
                })}
                error={!!errors.markup}
                inputProps={{ min: 1 }}
              />
              {errors.markup && (
                <FormHelperText error>{errors.markup.message}</FormHelperText> 
              )}
            </Box>

            <Box className="btnGroup">
              <Button type="submit" variant="contained" color="success">
                Create
              </Button>
              <Button
                variant="contained"
                color="secondary"
                onClick={handleCloseModal}
                sx={{ ml: 2 }}
              >
                Cancel
              </Button>
            </Box>
          </form>
        </div>
      </Box>
    </Modal>
  );
};

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '1px solid #ddd',
  boxShadow: 24,
  p: 4,
  borderRadius: '10px',
};

export default ModalAddQuoteComponent;
