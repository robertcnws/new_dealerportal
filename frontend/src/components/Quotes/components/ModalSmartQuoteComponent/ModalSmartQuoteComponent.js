import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { 
  Dialog, 
  DialogContent, 
  DialogTitle, 
  TextField, 
  Button, 
  RadioGroup, 
  FormControlLabel, 
  Radio, 
  TextareaAutosize, 
  Box, 
  Grid, 
  FormControl, 
  FormHelperText 
} from '@mui/material';
import { styled } from '@mui/system';

const StyledDialog = styled(Dialog)({
  '.MuiDialog-paper': {
    backgroundColor: '#333',
    color: '#ccc',
  },
});

const StyledTextField = styled(TextField)({
  '& .MuiInputBase-input': {
    color: '#fff',
  },
  '& .MuiOutlinedInput-root': {
    '& fieldset': {
      borderColor: '#444',
    },
    '&:hover fieldset': {
      borderColor: '#666',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#888',
    },
  },
  '& .MuiFormLabel-root': {
    color: '#ccc',
  },
});

const StyledButtonGroup = styled(Box)({
  display: 'flex',
  justifyContent: 'space-between',
  marginTop: '20px',
  marginLeft: '15%',
  marginRight: '15%',
});

const ModalAddSmartQuoteComponent = ({ open, handleClose }) => {
  const { register, handleSubmit, formState: { errors }, control, setValue, watch, reset } = useForm({
    defaultValues: {
      frame_color: '',
      frame_manufacturer: '',
      frame_budget: '',
    },
  });

  const frameColor = watch('frame_color');
  const frameManufacturer = watch('frame_manufacturer');
  const frameBudget = watch('frame_budget');

  const handleBoxClick = (frame, value) => {
    setValue(frame, value);
  };

  const onSubmit = (data) => {
    console.log(data);
  };

  const handleCloseModal = () => {
    reset();
    handleClose();
  }

  const handleAddQuote = () => {
    console.log('Add Quote');
  }

  return (
    <StyledDialog open={open} onClose={handleCloseModal} aria-labelledby="titleModal">
      <DialogTitle id="titleModal">
        <i className="bi bi-robot me-2"></i> Smart Quote
      </DialogTitle>
      <DialogContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <StyledTextField
            label="Name"
            placeholder="Enter Job Name"
            fullWidth
            margin="normal"
            {...register('name', { required: 'Name is required' })}
            error={!!errors.name}
            helperText={errors.name?.message}
          />

          <StyledTextField
            label="Markup"
            type="number"
            placeholder="Enter MarkUp as %"
            fullWidth
            margin="normal"
            {...register('markup', { required: 'Markup is required', min: 1 })}
            inputProps={{ min: 1 }}
            error={!!errors.markup}
            helperText={errors.markup?.message}
          />

          <FormControl
            error={!!errors.frame_color}
            sx={{
              width: '100%',
            }}
          >

            <Box className="inputDiv">
              <code className="form-label text-white">Frame Color:</code>
              <RadioGroup row {...register('frame_color', { required: 'Frame color is required' })} sx={{
                display: 'flex-inline',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
              }}
                error={!!errors.frame_color}
                helperText={errors.frame_color?.message}
              >
                <Grid container spacing={2}>
                  <Grid item xs={6} >
                    <Box sx={{ border: '1px solid #444' }} onClick={() => handleBoxClick('frame_color', 'W')}>
                      <FormControlLabel value="W" label="White" control={
                        <Controller
                          name="frame_color"
                          control={control}
                          render={({ field }) => (
                            <Radio
                              checked={field.value === 'W'}
                              onChange={() => field.onChange('W')}
                              sx={{ color: '#fff' }}
                            />
                          )}
                        />
                      } />
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box sx={{ border: '1px solid #444' }} onClick={() => handleBoxClick('frame_color', 'B')}>
                      <FormControlLabel value="B" label="Bronze" control={
                        <Controller
                          name="frame_color"
                          control={control}
                          render={({ field }) => (
                            <Radio
                              checked={field.value === 'B'}
                              onChange={() => field.onChange('B')}
                              sx={{ color: '#fff' }}
                            />
                          )}
                        />
                      } />
                    </Box>
                  </Grid>
                </Grid>
              </RadioGroup>
              <FormHelperText>{errors.frame_color?.message}</FormHelperText>
            </Box>
          </FormControl>

          <FormControl
            error={!!errors.frame_color}
            sx={{
              width: '100%',
            }}
          >

            <Box className="inputDiv">
              <code className="text-white">Manufacturer:</code>
              <RadioGroup row {...register('frame_manufacturer', { required: 'Manufacturer is required' })} sx={{
                display: 'flex-inline',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
              }}>
                <Grid container spacing={2}>
                  <Grid item xs={6} >
                    <Box sx={{ border: '1px solid #444' }} onClick={() => handleBoxClick('frame_manufacturer', 'MG')}>
                      <FormControlLabel value="MG" label="MG" control={
                        <Controller
                          name="frame_manufacturer"
                          control={control}
                          render={({ field }) => (
                            <Radio
                              checked={field.value === 'MG'}
                              onChange={() => field.onChange('MG')}
                              sx={{ color: '#fff' }}
                            />
                          )}
                        />
                      } />
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box sx={{ border: '1px solid #444' }} onClick={() => handleBoxClick('frame_manufacturer', 'ECO')}>
                      <FormControlLabel value="ECO" label="ECO" control={
                        <Controller
                          name="frame_manufacturer"
                          control={control}
                          render={({ field }) => (
                            <Radio
                              checked={field.value === 'ECO'}
                              onChange={() => field.onChange('ECO')}
                              sx={{ color: '#fff' }}
                            />
                          )}
                        />
                      } />
                    </Box>
                  </Grid>
                </Grid>
              </RadioGroup>
              <FormHelperText>{errors.frame_manufacturer?.message}</FormHelperText>
            </Box>

          </FormControl>

          <FormControl
            error={!!errors.frame_color}
            sx={{
              width: '100%',
            }}
          >
            <Box className="inputDiv">
              <code className="text-white">Budget:</code>
              <RadioGroup row {...register('frame_budget', { required: 'Budget is required' })} sx={{
                display: 'flex-inline',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
              }}>
                <Grid container spacing={2}>
                  <Grid item xs={6} >
                    <Box sx={{ border: '1px solid #444' }} onClick={() => handleBoxClick('frame_budget', 'economy')}>
                      <FormControlLabel value="economy" label="Economy" control={
                        <Controller
                          name="frame_budget"
                          control={control}
                          render={({ field }) => (
                            <Radio
                              checked={field.value === 'economy'}
                              onChange={() => field.onChange('economy')}
                              sx={{ color: '#fff' }}
                            />
                          )}
                        />
                      } />
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box sx={{ border: '1px solid #444' }} onClick={() => handleBoxClick('frame_budget', 'deluxe')}>
                      <FormControlLabel value="deluxe" label="Deluxe" control={
                        <Controller
                          name="frame_budget"
                          control={control}
                          render={({ field }) => (
                            <Radio
                              checked={field.value === 'deluxe'}
                              onChange={() => field.onChange('deluxe')}
                              sx={{ color: '#fff' }}
                            />
                          )}
                        />
                      } />
                    </Box>
                  </Grid>
                </Grid>
              </RadioGroup>
              <FormHelperText>{errors.frame_budget?.message}</FormHelperText>
            </Box>
          </FormControl>

          <Box className="inputDiv">
            <code className="text-white">Enter your items:</code>
            <TextareaAutosize
              minRows={4}
              placeholder="Enter your items"
              style={{ width: '100%', backgroundColor: '#333', color: '#fff', borderColor: '#444', borderRadius: '4px', padding: '8px' }}
              {...register('items', { required: 'Items are required' })}
            />
            <Box className="p-3 mt-2 code-bg bg-light">
              <code className="text-dark">Add sizes of your windows separated by comma like this:</code>
              <code>37 X 38 (2)</code><span style={{ color: '#D63384' }}><b>, </b></span>
              <code>38 X 80 (Privacy) (1)</code><span style={{ color: '#D63384' }}><b>, </b></span>
              <code>27 X 25 Bath (1)</code><span style={{ color: '#D63384' }}><b>, </b></span>
              <code>72 X 80 FD</code><span style={{ color: '#D63384' }}><b>, </b></span>
            </Box>
          </Box>

          <StyledButtonGroup>
            <Button type="submit" variant="contained" color="success">
              Create Smart Quote
            </Button>
            <Button type="button" variant="contained" color="secondary" onClick={handleCloseModal}>
              Cancel
            </Button>
          </StyledButtonGroup>
        </form>
      </DialogContent>
    </StyledDialog>
  );
};

export default ModalAddSmartQuoteComponent;
