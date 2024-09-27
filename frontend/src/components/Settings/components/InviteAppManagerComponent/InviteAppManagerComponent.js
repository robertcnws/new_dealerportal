import React from 'react';
import { Box, Typography, useTheme, useMediaQuery, TextField, FormHelperText, Button } from '@mui/material';
import { useForm } from 'react-hook-form';

const InviteAppManagerComponent = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { register, handleSubmit, formState: { errors }, reset } = useForm();

  const onSubmit = async (data) => {
    console.log(data);
    // Aquí puedes agregar la lógica para enviar la invitación
    reset(); // Limpia el formulario después de enviar
  };

  return (
    <Box sx={{ mb: 4, ml: isMobile ? 0 : 2, mr: isMobile ? 0 : 2 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Invite New App Manager
      </Typography>

      <Box sx={{ p: 1, bgcolor: 'white', borderRadius: '8px' }}>
        <Typography variant="h6" sx={{ mb: 1 }}>
          <i className="bi bi-plus-circle me-2"></i>
          Email Invitation
        </Typography>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Box sx={{ mb: 1 }}>
            <TextField
              type="email"
              label="Email"
              id="email"
              name="email"
              placeholder="Enter email"
              fullWidth
              margin="normal"
              InputLabelProps={{
                shrink: true,
              }}
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^\S+@\S+$/i,
                  message: 'Enter a valid email address',
                },
              })}
              error={!!errors.email}
            />
            {errors.email && (
              <FormHelperText error>{errors.email.message}</FormHelperText>
            )}
          </Box>

          <Box sx={{ textAlign: 'right', mb: 1 }}>
            <Button type="submit" variant="contained" color="success" disabled>
              Send Invitation
            </Button>
          </Box>
        </form>
      </Box>
    </Box>
  );
};

export default InviteAppManagerComponent;
