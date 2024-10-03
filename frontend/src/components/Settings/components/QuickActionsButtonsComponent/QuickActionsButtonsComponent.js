import React from 'react';
import { Box, Grid, Typography, IconButton, useTheme, useMediaQuery } from '@mui/material';
import { Link } from 'react-router-dom';
import { apiFrontendRoot } from '../../../../config';

const QuickActionsButtonsComponent = () => {

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));


  return (
    <Grid item xs={12}>
      <Box sx={{ mb: 2, display: 'flex', flexGrow: 1, flexDirection: 'column' }}>
        <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', ml: isMobile ? 0 : 2, mb: 1 }}>
          <Typography variant="h6" sx={{ fontSize: '20px' }}>
            Quick Actions
          </Typography>
        </Box>
        <Grid container spacing={1}>
          <Grid item xs>
            <Box
              sx={{
                display: 'flex',
                flexGrow: 1,
                flexDirection: 'column',
                justifyContent: 'center',
                ml: isMobile ? 0 : 1,
                p: 1,
                bgcolor: 'white',
                borderRadius: '10px',
                cursor: 'pointer',
              }}
            >
              <IconButton
                color="gray"
                sx={{
                  p: 0,
                  borderRadius: '5px',
                  minWidth: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <i className="bi-solid bi-lock"></i>
                <Typography variant="body2" sx={{ fontSize: '15px' }}>
                  Security
                </Typography>
              </IconButton>
            </Box>
          </Grid>
          <Grid item xs>
            <Box
              sx={{
                display: 'flex',
                flexGrow: 1,
                flexDirection: 'column',
                ml: isMobile ? 0 : 1,
                p: 1,
                bgcolor: 'white',
                borderRadius: '10px',
                cursor: 'pointer',
              }}
            >
              <IconButton
                color="gray"
                sx={{
                  p: 0,
                  borderRadius: '5px',
                  minWidth: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                component={Link}
                to={`${apiFrontendRoot}/z-integration`}
              >
                <i className="bi bi-tools"></i>
                <Typography variant="body2" sx={{ fontSize: '15px' }}>
                  Integration
                </Typography>
              </IconButton>
            </Box>
          </Grid>
          <Grid item xs>
            <Box
              sx={{
                display: 'flex',
                flexGrow: 1,
                flexDirection: 'column',
                ml: isMobile ? 0 : 1,
                p: 1,
                bgcolor: 'white',
                borderRadius: '10px',
                cursor: 'pointer',
              }}
            >
              <IconButton
                color="gray"
                sx={{
                  p: 0,
                  borderRadius: '5px',
                  minWidth: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <i className="bi-solid bi-envelope"></i>
                <Typography variant="body2" sx={{ fontSize: '15px' }}>
                  Setup E-mail
                </Typography>
              </IconButton>
            </Box>
          </Grid>
          <Grid item xs>
            <Box
              sx={{
                display: 'flex',
                flexGrow: 1,
                flexDirection: 'column',
                ml: isMobile ? 0 : 1,
                p: 1,
                bgcolor: 'white',
                borderRadius: '10px',
                cursor: 'pointer',
              }}
            >
              <IconButton
                color="gray"
                sx={{
                  p: 0,
                  borderRadius: '5px',
                  minWidth: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                component={Link}
                to={`${apiFrontendRoot}/users`}

              >
                <i className="bi bi-person"></i>
                <Typography variant="body2" sx={{ fontSize: '15px' }}>
                  Authorized Users
                </Typography>
              </IconButton>
            </Box>
          </Grid>
          <Grid item xs>
            <Box
              sx={{
                display: 'flex',
                flexGrow: 1,
                flexDirection: 'column',
                ml: isMobile ? 0 : 1,
                p: 1,
                bgcolor: 'white',
                borderRadius: '10px',
                cursor: 'pointer',
              }}
            >
              <IconButton
                color="gray"
                sx={{
                  p: 0,
                  borderRadius: '5px',
                  minWidth: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}

              >
                <i className="bi bi-universal-access"></i>
                <Typography variant="body2" sx={{ fontSize: '15px' }}>
                  Accessibility
                </Typography>
              </IconButton>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Grid>
  );
}

export default QuickActionsButtonsComponent;