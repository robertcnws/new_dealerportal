import React, { useState } from 'react';
import axios from 'axios';
import { TextField, Button, Typography, Box, Container, useTheme, useMediaQuery, CircularProgress } from '@mui/material';
import { apiUrl } from '../../../../config';
import './PasswordResetRequestComponent.css';
import logo from '../../../../static/styles/img/logo13.png';
import CustomAlertComponent from '../../../Utils/components/CustomAlertComponent/CustomAlertComponent';
import { Link } from 'react-router-dom';

const PasswordResetRequestComponent = () => {

  document.title = 'Password Reset | Dealer Portal';

  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const theme = useTheme();
  // const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isMobile = useMediaQuery('(max-width:999px)');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Email is required');
      setLoading(false);
      return;
    }
    try {
      await axios.post(`${apiUrl}/dealerportal/password-reset/`, { email });
      setMessage('If an account with that email exists, a password reset link has been sent.');
      setError('');
    } catch (err) {
      setError('Failed to send password reset link.');
      setMessage('');
    }
  };

  return (
    <Box className="containerMain">
      <Container className="container" maxWidth={isMobile ? '' : 'xs'} sx={{ maxWidth: isMobile ? '80%' : '100%' }}>
        <Box>

          <Box>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
            }}>
              <img src={logo} alt="Logo" style={{ width: '200px', height: 'auto' }} />
              <Typography variant="h6" gutterBottom>
                <b>Password Reset</b>
              </Typography>
            </div>
            <Box component="form" noValidate onSubmit={(e) => handleSubmit(e)}>
              <TextField
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                fullWidth
                variant="outlined"
                margin="normal"
                name="email"
                id="email"
                required
                error={!email.trim() && Boolean(error)}
                helperText={!email.trim() && error ? 'Email is required' : ''}
              />
              <Box sx={{ position: 'relative' }}>


                {message && <CustomAlertComponent severity="success" message={message} sx={{ fontSize: '12px' }} />}
                {error && <CustomAlertComponent severity="error" message={error} sx={{ fontSize: '12px' }} />}

                <Box sx={{ position: 'relative', mt: 3, mb: 3, display: 'flex', gap: 2 }}>
                  <Button
                    variant="contained"
                    type="submit"
                    fullWidth
                    className="submitBtn"
                    sx={{
                      bgcolor: '#669A41',
                      color: 'white',
                      position: 'relative',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                    disabled={loading}
                  >
                    {loading && (
                      <CircularProgress
                        size={24}
                        sx={{
                          color: 'primary.main',
                          marginRight: '8px',
                        }}
                      />
                    )}
                    Send Reset Link
                  </Button>

                  <Button
                    variant="contained"
                    type="button"
                    component={Link} 
                    to="/"
                    fullWidth
                    sx={{
                      bgcolor: 'primary.main',
                      color: 'white',
                      position: 'relative',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                    disabled={loading}
                  >
                    Back to Login
                  </Button>
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default PasswordResetRequestComponent;
