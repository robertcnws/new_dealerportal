import React, { useEffect, useState } from 'react';
import { Modal, Box, Button, Typography, TextField, FormHelperText } from '@mui/material';
import { useForm } from 'react-hook-form';
import { fetchWithToken } from '../../../../utils';
import { apiUrl } from '../../../../config';

const ModalAddQuoteComponent = ({ open, handleClose, onSyncComplete, dataEdit, onSyncEdit }) => {
  const { register, handleSubmit, formState: { errors }, reset } = useForm();
  const [loading, setLoading] = useState(false);
  const [quoteEdited, setQuoteEdited] = useState(null);

  useEffect(() => {
    if (dataEdit) {
      fetchQuoteChanges();
    }
  }, [dataEdit]);

  const fetchQuoteChanges = async () => {
    setLoading(true);
    const user = JSON.parse(localStorage.getItem('userLogged'));
    const payload = { user_id: user.data.id };
    const url = `${apiUrl}/dealerportal-get-quote/${dataEdit.id}/`;
    const response = await fetchWithToken(url, 'POST', payload, {}, apiUrl);
    if (response.status === 200) {
      const quote = response.data.data.quote;
      dataEdit.job_name = quote.name;
      dataEdit.total_sell = quote.total_sell;
      dataEdit.total_cost = quote.total_cost;
      dataEdit.markup_total = quote.markup_total;
      dataEdit.mark_up = quote.markup;
      dataEdit.id = quote.id;
      dataEdit.owner = quote.owner;

      // Actualiza el formulario solo cuando los datos estén listos
      reset({
        name: dataEdit.job_name || '',
        markup: dataEdit.mark_up || '',
      });


    }
    setLoading(false);  // Finaliza la carga
    setQuoteEdited(dataEdit);
  };


  const onSubmit = async (data) => {
    const user = JSON.parse(localStorage.getItem('userLogged'));
    const newQuote = {
      ...data,
      markup: parseFloat(data.markup),
      user_id: user.data.id,
    };
    try {
      const url = dataEdit ? `${apiUrl}/dealerportal/quotes/update/${dataEdit.id}/` : `${apiUrl}/dealerportal/quotes/create/`;
      const response = await fetchWithToken(url, 'POST', newQuote, {}, apiUrl);
      if (response.status === 200) {
        const payload = { user_id: user.data.id };
        if (onSyncComplete) {
          onSyncComplete(payload);
        }
        else {
          onSyncEdit();
        }
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
            {dataEdit ? (
              <i className="bi bi-pencil-square me-2"></i>
            ) : (
              <i className="bi bi-plus-circle me-2"></i>
            )}
            {dataEdit ? 'Edit Quote' : 'Add New Quote'}
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
              {/* <label htmlFor="markup">Markup:</label> */}
              <TextField
                label="Markup"
                id="markup"
                name="markup"
                type="number"
                placeholder="Enter MarkUp as %"
                fullWidth
                margin="none"
                InputLabelProps={{
                  shrink: true,
                }}
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
                {dataEdit ? 'Update' : 'Create'}
              </Button>
              <Button
                onClick={handleCloseModal}
                sx={{ ml: 2, bgcolor: '#F6D3A1', color: 'gray' }}
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
