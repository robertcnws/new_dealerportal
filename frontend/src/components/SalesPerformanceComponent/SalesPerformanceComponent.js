import React from 'react';
import { Card, CardContent, Typography, Grid } from '@mui/material';
import { green, red, blue } from '@mui/material/colors';

const SalesPerformanceComponent = ({ userStats, monthName }) => {
  return (
    <Card sx={{ bgcolor: '#f1f1f1', border: 'none', boxShadow: 'none' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Sales Performance <small style={{ color: green[500] }}>({monthName})</small>
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <Card sx={{ backgroundColor: 'white', padding: 2 }}>
              <Typography variant="body2">Total in Estimates</Typography>
              <Typography variant="h5" sx={{ color: blue[400]}}>$ {userStats.total_estimates.toLocaleString()}</Typography>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card sx={{ backgroundColor: 'white', padding: 2 }}>
              <Typography variant="body2">Total Orders</Typography>
              <Typography variant="h5" sx={{ color: green[400]}}>${userStats.total_orders.toFixed(2).toLocaleString()}</Typography>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card sx={{ backgroundColor: 'white', padding: 2 }}>
              <Typography variant="body2">Lost Sales</Typography>
              <Typography variant="h5" sx={{ color: red[400]}}>${userStats.lost_sales.toLocaleString()}</Typography>
            </Card>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default SalesPerformanceComponent;
