import React from 'react';
import { Card, CardContent, Typography, Box, LinearProgress, Grid } from '@mui/material';
import { ArrowUpward, ArrowDownward, BarChart, ShowChart } from '@mui/icons-material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

function UserSalesStatsComponent({ 
  userStats,
  monthName,
  quoteProgress,
  salesProgress,
  estimateProgress,
  orderProgress,
  quoteChangePercent,
  orderChangePercent, 
}) {

  return (
    <Box className="insights" display="flex" flexDirection="column" gap={3} sx={{
      mt: 3, bgcolor: '#f1f1f1',
    }}>
      <Box display="flex" justifyContent="space-between" sx={{
        bgcolor: '#f1f1f1',
      }}>
        {/* <Box className="income" display="flex" gap={2}> */}
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Card className="cardExt" flex={1}>
              <CardContent>
                <Box display="flex" alignItems="center">
                  <ShowChart fontSize="large" sx={{ color: '#00E092'}}/>
                  <Box ml={2}>
                    <Typography variant="h6">Total Estimates</Typography>
                    <Typography variant="h4">
                      ${userStats?.today_estimates.toFixed(2)}
                    </Typography>
                  </Box>
                </Box>
                <Box mt={2}>
                  <LinearProgress variant="determinate" value={estimateProgress || 0} />
                </Box>
                <Typography variant="body2" color="textSecondary">Last 24 Hours</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card className="cardExt" flex={1}>
              <CardContent>
                <Box display="flex" alignItems="center">
                  <BarChart fontSize="large" sx={{ color: '#FF4961'}}/>
                  <Box ml={2}>
                    <Typography variant="h6">Total Sales</Typography>
                    <Typography variant="h4">
                      ${userStats?.today_orders.toFixed(2)}
                    </Typography>
                  </Box>
                </Box>
                <Box mt={2}>
                  <LinearProgress variant="determinate" value={salesProgress || 0} />
                </Box>
                <Typography variant="body2" color="textSecondary">Last 24 Hours</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
      {/* </Box> */}

      <Box display="flex" justifyContent="space-between" sx={{
        bgcolor: '#f1f1f1',
      }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
          <Card className="cardExt" flex={1}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" mb={2}>
                <Box>
                  <Typography variant="h4" color="primary" id="todayQuotesCount">
                    {userStats?.today_quotes_count}
                  </Typography>
                  <Typography variant="body2">Estimates Today</Typography>
                </Box>
                <Box>
                  <Typography variant="h4" id="yesterdayQuotesCount">
                    {userStats?.yesterday_quotes_count}
                  </Typography>
                  <Typography variant="body2">Estimates Yesterday</Typography>
                </Box>
              </Box>
              <Box mb={2}>
                <LinearProgress variant="determinate" value={quoteProgress || 0} />
              </Box>
              <Box display="flex" justifyContent="space-between">
                <Box>
                  <Typography variant="body2" color="success.main" display="flex" alignItems="center">
                    <ArrowUpward />
                    <span id="percentageChangeQuotes">{quoteChangePercent || 0}</span>%
                  </Typography>
                  <Typography variant="body2">Since yesterday</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" id="percentageOfTotalQuotes">
                    {userStats?.totalQuotePercent || 0}%
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
          </Grid>

          <Grid item xs={12} md={6}>

            <Card className="cardExt" flex={1}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" mb={2}>
                  <Box>
                    <Typography variant="h4" color="error" id="todayOrdersCount">
                      {userStats?.today_orders_count}
                    </Typography>
                    <Typography variant="body2">Sales Today</Typography>
                  </Box>
                  <Box>
                    <Typography variant="h4" id="yesterdayOrdersCount">
                      {userStats?.yesterday_orders_count}
                    </Typography>
                    <Typography variant="body2">Sales Yesterday</Typography>
                  </Box>
                </Box>
                <Box mb={2}>
                  <LinearProgress variant="determinate" value={orderProgress || 0} />
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Box>
                    <Typography variant="body2" color="error.main" display="flex" alignItems="center">
                      <ArrowDownward />
                      <span id="percentageChangeOrders">{orderChangePercent || 0}</span>%
                    </Typography>
                    <Typography variant="body2">Since yesterday</Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" id="percentageOfTotalOrders">
                      {userStats?.totalOrderPercent || 0}%
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}

export default UserSalesStatsComponent;
