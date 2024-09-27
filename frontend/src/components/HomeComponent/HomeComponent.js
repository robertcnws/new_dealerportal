import React, { useEffect, useState } from 'react';
import { Grid, Typography, Box, useTheme, useMediaQuery } from '@mui/material';
import SpeedIcon from '@mui/icons-material/Speed';
import { Badge } from 'react-bootstrap';
import DealershipOverviewComponent from '../Dashboard/components/DealershipOverviewComponent/DealershipOverviewComponent';
import SalesPerformanceComponent from '../Dashboard/components/SalesPerformanceComponent/SalesPerformanceComponent';
import RecentQuotesTableComponent from '../Dashboard/components/RecentQuotesTableComponent/RecentQuotesTableComponent';
import FAQSectionComponent from '../Dashboard/components/FAQSectionComponent/FAQSectionComponent';
import UserSalesStatsComponent from '../Dashboard/components/UserSalesStatsComponent/UserSalesStatsComponent';
import CustomStatCardComponent from '../Utils/components/CustomStatCardComponent/CustomStatCardComponent';


import { fetchWithToken } from '../../utils';
import { apiUrl } from '../../config';


const HomeComponent = () => {

  const [contextDashboard, setContextDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quoteProgress, setQuoteProgress] = useState(0);
  const [salesProgress, setSalesProgress] = useState(0);
  const [estimateProgress, setEstimateProgress] = useState(0);
  const [orderProgress, setOrderProgress] = useState(0);
  const [quoteChangePercent, setQuoteChangePercent] = useState(0);
  const [orderChangePercent, setOrderChangePercent] = useState(0);
  const theme = useTheme();
  // const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isMobile = useMediaQuery('(max-width:999px)');

  useEffect(() => {
    document.title = 'NWS Dealer Portal';
    const user = localStorage.getItem('userLogged') ? JSON.parse(localStorage.getItem('userLogged')) : {};
    if (user.data.id) {
      const payload = {
        user_id: user.data.id,
      }
      fetchStats(payload);
      calculatePercetage();
    }
  }
    , []);

  const fetchStats = async (payload) => {
    try {
      const response = await fetchWithToken(`${apiUrl}/dealerportal-home/`, 'GET', payload);
      if (response.status !== 200) {
        throw new Error(`Failed to fetch data`);
      }
      setContextDashboard(response.data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const calculatePercetage = () => {
    if (contextDashboard) {
      const totalQuotes = contextDashboard.total_quotes;
      const totalOrders = contextDashboard.total_orders;
      const confirmedOrders = contextDashboard.confirmed_orders;
      const pendingOrders = contextDashboard.pending_orders;
      const totalQuotesLastMonth = contextDashboard.total_quotes_last_month;
      const totalOrdersLastMonth = contextDashboard.total_orders_last_month;
      const confirmedOrdersLastMonth = contextDashboard.confirmed_orders_last_month;
      const pendingOrdersLastMonth = contextDashboard.pending_orders_last_month;

      setQuoteProgress((totalQuotes / totalQuotesLastMonth) * 100 || 0);
      setSalesProgress((totalOrders / totalOrdersLastMonth) * 100 || 0);
      setEstimateProgress((confirmedOrders / confirmedOrdersLastMonth) * 100 || 0);
      setOrderProgress((pendingOrders / pendingOrdersLastMonth) * 100 || 0);
      setQuoteChangePercent(((totalQuotes - totalQuotesLastMonth) / totalQuotesLastMonth) * 100 || 0);
      setOrderChangePercent(((totalOrders - totalOrdersLastMonth) / totalOrdersLastMonth) * 100 || 0);
    }
  }

  return (
    <Box sx={{
      mt: isMobile ? 2 : -3,
      ml: isMobile ? 0 : 4,
      minWidth: '100%',
      bgcolor: '#f1f1f1',
    }}>
      {contextDashboard && (
        <>
          <Typography component="div" gutterBottom sx={{
            display: 'flex',
            alignItems: 'left',
            fontSize: '0.9rem',
            fontFamily: 'SFMono-Regular,Menlo,Monaco,Consolas,"Liberation Mono","Courier New",monospace',
            color: '#d63384',
          }}>
            <SpeedIcon sx={{ mr: 1 }} />
            Welcome to New Window System Dealer Portal, you can manage your quotes and check out stock levels.
          </Typography>
          <Badge bg="success" style={{
            marginTop: 0,
            marginBottom: 10,
            fontSize: '0.75rem',
            fontFamily: 'SFMono-Regular,Menlo,Monaco,Consolas,"Liberation Mono","Courier New",monospace'
          }}>
            Your Stats for {contextDashboard?.month_name}
          </Badge>

          {/* Stats Cards */}
          <Box sx={{ ml: -1, mb: 2, width: '100%', display: 'flex', bgcolor: '#f1f1f1' }}>
            <Grid container spacing={2} sx={{ width: '100%', m: 0, display: 'flex' }}>
              <Grid item xs={12} md={3}>
                <CustomStatCardComponent title="Total Quotes" value={contextDashboard?.total_quotes} icon="bi bi-journal-bookmark" />
              </Grid>
              <Grid item xs={12} md={3}>
                <CustomStatCardComponent title="Total Orders" value={contextDashboard?.total_orders} icon="bi bi-cart" />
              </Grid>
              <Grid item xs={12} md={3}>
                <CustomStatCardComponent title="Confirmed Orders" value={contextDashboard?.confirmed_orders} icon="bi bi-cart" />
              </Grid>
              <Grid item xs={12} md={3}>
                <CustomStatCardComponent title="Pending Orders" value={contextDashboard?.pending_orders} icon="bi bi-clock" />
              </Grid>
            </Grid>
          </Box>

          {/* Extensions/Insights */}
          <Box sx={{ ml: 1, width: '99%', display: 'flex', bgcolor: '#f1f1f1' }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={12} md={6}>
                <DealershipOverviewComponent dealership={contextDashboard?.dealership} />
                <UserSalesStatsComponent
                  userStats={contextDashboard?.user_stats}
                  monthName={contextDashboard?.month_name}
                  quoteProgress={quoteProgress}
                  salesProgress={salesProgress}
                  estimateProgress={estimateProgress}
                  orderProgress={orderProgress}
                  quoteChangePercent={quoteChangePercent}
                  orderChangePercent={orderChangePercent}
                />
              </Grid>
              <Grid item xs={12} sm={12} md={6}>
                <SalesPerformanceComponent userStats={contextDashboard?.user_stats} monthName={contextDashboard?.month_name} />
                <FAQSectionComponent />
              </Grid>
            </Grid>
            {/* <Grid container spacing={2}>
              <Grid item xs={6} sm={6} md={6}>
                <UserSalesStatsComponent userStats={contextDashboard?.user_stats} monthName={contextDashboard?.month_name} />
              </Grid>
            </Grid> */}
          </Box>

          {/* Recent Quotes Table */}
          <Box sx={{ my: 1 }} />
          <Typography variant="h6" gutterBottom>
            10 Most Recent Quotes
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <RecentQuotesTableComponent data={contextDashboard.quotes} />
            </Grid>
          </Grid>
        </>
      )}
    </Box>
  );
};

export default HomeComponent;
