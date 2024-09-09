import React from 'react';
import { Card, CardContent, Typography, Chip, Divider, Box } from '@mui/material';
import { CheckCircle, Cancel } from '@mui/icons-material';

const DealershipOverviewComponent = ({ dealership }) => {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Dealership Overview
        </Typography>
        <Box display="flex" alignItems="center" mb={1}>
          <Typography variant="body2" component="span">
            Status:
          </Typography>
          <Chip
            sx={{
              fontSize: '0.8rem',
              maxHeight: '20px',
              ml: 1,
            }}
            label={dealership && dealership.is_active ? 'Active' : 'Inactive'}
            color={dealership && dealership.is_active ? 'success' : 'error'}
            icon={dealership && dealership.is_active ? <CheckCircle sx={{ fontSize: '0.8rem' }} /> : <Cancel sx={{ fontSize: '0.8rem' }} />}
          />
        </Box>
        <Typography variant="body2">Name: {dealership?.name}</Typography>
        <Typography variant="body2">Dealership Admin: {dealership?.dealer_admin}</Typography>
        <Typography variant="body2">Created At: {new Date(dealership?.created_at).toLocaleDateString()}</Typography>
        <Typography variant="body2">Last Modified: {new Date(dealership?.updated_at).toLocaleDateString()}</Typography>
      </CardContent>
    </Card>
  );
};

export default DealershipOverviewComponent;
