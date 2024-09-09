import React, { useState } from 'react';
import axios from 'axios';
import { TextField, Button, Typography } from '@mui/material';
import { useLocation } from 'react-router-dom';
import { apiUrl } from '../../../../config';

const PasswordResetConfirmComponent = () => {
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const query = new URLSearchParams(useLocation().search);
  const uid = query.get('uid');
  const token = query.get('token');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${apiUrl}/api-dealerportal/password-reset-confirm/`, { uid, token, new_password: newPassword });
      setMessage('Password has been reset successfully.');
      setError('');
    } catch (err) {
      setError('Failed to reset password.');
      setMessage('');
    }
  };

  return (
    <div>
      <Typography variant="h6">Reset Password</Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          label="New Password"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          fullWidth
          required
        />
        <Button type="submit" variant="contained" color="primary">Reset Password</Button>
      </form>
      {message && <Typography color="success">{message}</Typography>}
      {error && <Typography color="error">{error}</Typography>}
    </div>
  );
};

export default PasswordResetConfirmComponent;
