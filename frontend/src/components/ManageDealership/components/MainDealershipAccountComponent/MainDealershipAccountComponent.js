import React, { useEffect, useState } from 'react';
import { Box, Grid, useTheme, useMediaQuery } from '@mui/material';
import { useLocation } from 'react-router-dom';
import TablesDealershipAccountComponent from './components/TablesDealershipAccountComponent/TablesDealershipAccountComponent';
import DealershipAccountInfoComponent from './components/DealershipAccountInfoComponent/DealershipAccountInfoComponent';
import DealershipButtonsDetailsComponent from './components/DealershipButtonsDetailsComponent/DealershipButtonsDetailsComponent';

const MainDealershipAccountComponent = () => {

  const [dealership, setDealership] = useState(null);

  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    const dealership = location.state.dealership;
    setDealership(dealership);
  }, []);

  if (!isMobile) {

    return (
      <>
        {dealership && (
          <Box sx={{ mt: isMobile ? 1 : -3, minWidth: '100%', bgcolor: '#f1f1f1' }}>
            <Grid container spacing={1}>
              <Grid item xs={12}>
                <Box sm={{ display: 'flex', minWidth: '100%', p: 0 }}>

                  <Grid container spacing={1}>
                    <Grid item xs={10}>
                      <Box sx={{
                        display: 'flex',
                        justifyContent: 'flex-start',
                        bgcolor: '#f1f1f1',
                        ml: isMobile ? 0 : 5,
                      }}>
                        <h5>Dealership Account: <b>{dealership.account_name}</b></h5>
                      </Box>
                    </Grid>
                    <Grid item xs={2}>
                      <Box sx={{
                        display: 'flex',
                        justifyContent: 'flex-start',
                        bgcolor: '#f1f1f1',
                        ml: isMobile ? 0 : 3,
                      }}>
                        <h5>Information</h5>
                      </Box>
                    </Grid>
                  </Grid>

                  <Grid container spacing={1}>
                    <Grid item xs={10}>
                      <DealershipButtonsDetailsComponent dealership={dealership} setDealership={setDealership}/>
                      <Grid container spacing={1}>
                        <Grid item xs={12}>
                          <TablesDealershipAccountComponent dealership={dealership} setDealership={setDealership}/>
                        </Grid>
                      </Grid>
                    </Grid>

                    <Grid item xs={2}>
                      <DealershipAccountInfoComponent dealership={dealership} setDealership={setDealership}/>
                    </Grid>
                  </Grid>

                </Box>
              </Grid>
            </Grid>
          </Box>
        )}
      </>
    );
  }
  return (
    <>
      {dealership && (
        <Box sx={{ mt: isMobile ? 1 : -3, minWidth: '100%', bgcolor: '#f1f1f1' }}>
          <Grid container spacing={1}>
            <Grid item xs={12}>
              <Box sm={{ display: 'flex', minWidth: '100%', p: 0 }}>

                <Grid container spacing={1}>
                  <Grid item xs={12}>
                    <Box sx={{
                      display: 'flex',
                      justifyContent: 'flex-start',
                      bgcolor: '#f1f1f1',
                      ml: isMobile ? 0 : 5,
                    }}>
                      <h5>Dealership Account: <b>{dealership.account_name}</b></h5>
                    </Box>
                  </Grid>

                  <Grid item xs={12}>
                    <DealershipButtonsDetailsComponent dealership={dealership} setDealership={setDealership}/>
                  </Grid>

                  <Grid item xs={12}>
                    <TablesDealershipAccountComponent dealership={dealership} setDealership={setDealership}/>
                  </Grid>

                  <Grid item xs={12}>
                    <DealershipAccountInfoComponent dealership={dealership} setDealership={setDealership}/>
                  </Grid>

                </Grid>
              </Box>
            </Grid>
          </Grid>
        </Box>
      )}
    </>
  );
}

export default MainDealershipAccountComponent;
