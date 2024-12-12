import React, { useState } from 'react';
import {
  Button,
  TextField,
  Box,
  IconButton,
  Typography,
  CircularProgress,
} from '@mui/material';
import { VisibilityOff, Visibility } from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { apiUrl, apiFrontendRoot } from '../../config';
import { useAuth } from '../../components/AuthContextComponent/AuthContextComponent';
import MainLoginComponent from '../MainLoginComponent/MainLoginComponent';
import CustomAlertComponent from '../Utils/components/CustomAlertComponent/CustomAlertComponent';
import { getCookie } from '../../utils';
import logo from '../../static/styles/img/logo13.png';

const LoginComponent = () => {

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    if (!username.trim() || !password.trim()) {
      setError('Username and password are required');
      setLoading(false);
      return;
    }
  
    try {
      const body_jwt = { username, password };
      const jwtResponse = await axios.post(`${apiUrl}/api/token/`, body_jwt, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });
      if (jwtResponse.status === 200) {
        localStorage.setItem('accessToken', jwtResponse.data.access);
        localStorage.setItem('refreshToken', jwtResponse.data.refresh);
        
        const body = { username, password };
        
        const loginResponse = await axios.post(`${apiUrl}/dealerportal-login/`, body, {
          headers: {
            'Content-Type': 'application/json',
            // 'X-CSRFToken': getCookie('csrftoken'),
            'Authorization': `Bearer ${jwtResponse.data.access}`,
          },
        });
  
        if (loginResponse.status === 200) {
          setSuccess('Login successful');
          delete loginResponse.data.data.password;
          localStorage.setItem('userLogged', JSON.stringify(loginResponse.data));
          login();
          navigate(apiFrontendRoot);
        } else {
          setError(`${loginResponse.data.error} : ${loginResponse.data.description}`);
          throw new Error(`${loginResponse.data.error} : ${loginResponse.data.description}`);
        }
      } else {
        setError(`Invalid Credentials: No active account found with the given credentials`);
        throw new Error(`Invalid Credentials`);
      }
    } catch (error) {
      setError(`Invalid Credentials: No active account found with the given credentials`);
      console.error('Error during login:', error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <MainLoginComponent>
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
            <b>Welcome</b>
          </Typography>
        </div>
        <Typography variant="body2" align="center" gutterBottom sx={{ color: 'gray' }}>
          Enter your credentials to access your account.
        </Typography>
        <Box component="form" noValidate onSubmit={(e) => handleSubmit(e)}>
          <TextField
            label="Username"
            variant="outlined"
            fullWidth
            margin="normal"
            name="username"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            InputLabelProps={{
              shrink: true,
            }}
            error={!username.trim() && Boolean(error)}
            helperText={!username.trim() && error ? 'Username is required' : ''}
          />
          <Box sx={{ position: 'relative' }}>
            <TextField
              type={showPassword ? 'text' : 'password'}
              label="Password"
              variant="outlined"
              fullWidth
              margin="normal"
              name="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              error={!password.trim() && Boolean(error)}
              helperText={!password.trim() && error ? 'Password is required' : ''}
              InputLabelProps={{
                shrink: true,
              }}
              InputProps={{
                endAdornment: (
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                  >
                    {!showPassword ? <Visibility /> : <VisibilityOff />}
                  </IconButton>
                ),
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 10, paddingBottom: 10 }}>
              <Typography variant="body2" className="forgetLink" component={Link} to="/password-reset">
                ¿Forgot your password?
              </Typography>
            </div>

            {success && <CustomAlertComponent severity="success" message={success} sx={{ fontSize: '12px' }} />}
            {error && <CustomAlertComponent severity="error" message={error} sx={{ fontSize: '12px' }} />}

            <Box sx={{ position: 'relative', mt: 3, mb: 3 }}>
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
                Login
              </Button>
            </Box>
          </Box>
        </Box>
      </Box>
    </MainLoginComponent>
  );
};

export default LoginComponent;
