import React, { useEffect, useState } from 'react';
import { Box, Typography, Grid, IconButton, useTheme, useMediaQuery } from '@mui/material';
import { Badge } from 'react-bootstrap';
import { AddCircleOutline, EditNoteOutlined, PowerSettingsNew, Web } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { apiUrl, apiFrontendRoot } from '../../../../../../config';
import { fetchWithToken } from '../../../../../../utils';
import ModalSendNewUserComponent from '../ModalSendNewUserComponent/ModalSendNewUserComponent';
import ModalUpdateUserComponent from '../ModalUpdateUserComponent/ModalUpdateUserComponent';

const DealershipButtonsDetailsComponent = ({ dealership, setDealership }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const [openModalAdd, setOpenModalAdd] = useState(false);
  const handleOpenModalAdd = () => setOpenModalAdd(true);
  const handleCloseModalAdd = () => setOpenModalAdd(false);
  const [openModalUpdate, setOpenModalUpdate] = useState(false);
  const handleOpenModalUpdate = () => setOpenModalUpdate(true);
  const handleCloseModalUpdate = () => setOpenModalUpdate(false);
  const [localDealership, setLocalDealership] = useState(dealership);
  const user = JSON.parse(localStorage.getItem('userLogged'));

  useEffect(() => {
    setLocalDealership(dealership);
  }, [dealership]);

  const handleDeactivateDealership = async () => {
    const customClassSwal = {
      popup: 'small-popup',
      title: 'small-title',
      icon: 'custom-icon',
      content: 'small-content',
      confirmButton: 'small-confirm-button',
    };
    try {
      const isActive = localDealership.status === 'active';
      const action = isActive ? 'deactivate' : 'activate';
      const actionIng = isActive ? 'deactivating' : 'activating';
      const iconType = isActive ? 'warning' : 'info';
      Swal.fire({
        title: `Are you sure?`,
        text: `You are ${actionIng} dealership ${localDealership.account_name}!`,
        icon: iconType,
        showCancelButton: true,
        confirmButtonText: `Yes, ${action} it!`,
        cancelButtonText: 'No, keep it',
        customClass: customClassSwal,
      }).then(async (result) => {
        if (result.isConfirmed) {
          
          const payload = {
            user_id: user.data.id,
          };
          const response = await fetchWithToken(
            `${apiUrl}/dealerportal/manage-dealership/status/${localDealership.id}/`,
            'POST',
            payload,
            {},
            apiUrl
          );
          if (response.status === 200) {
            if (!response.data.error) {
              Swal.fire({
                title: `${response.data.info.toUpperCase()}`,
                text: `${response.data.message}`,
                icon: 'success',
                confirmButtonText: 'OK',
                customClass: customClassSwal,
                willClose: () => {
                  setLocalDealership((prevDealership) => ({
                    ...prevDealership,
                    status: isActive ? 'inactive' : 'active',
                  }));
                },
              });
            } else {
              Swal.fire({
                title: 'Error',
                text: `${response.data.message}`,
                icon: 'error',
                confirmButtonText: 'Cool',
                customClass: customClassSwal,
              });
            }
          } else {
            Swal.fire({
              title: 'Error',
              text: `${response.data.message}`,
              icon: 'error',
              confirmButtonText: 'Cool',
              customClass: customClassSwal,
            });
          }
        }
      });
    } catch (err) {
      Swal.fire({
        title: 'Error',
        text: err.message,
        icon: 'error',
        confirmButtonText: 'Cool',
        customClass: customClassSwal,
      });
    }
  };

  return (
    <>
      <Grid container spacing={1}>
        <Grid item xs={isMobile ? 12 : 8}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              flexGrow: 1,
              justifyContent: 'space-between',
              ml: isMobile ? 0 : 5,
              p: 1,
              bgcolor: 'white',
              borderRadius: '10px',
            }}
          >
            <Typography variant="body1">
              <b>Name</b>: {localDealership.account_name}
            </Typography>
            <Typography variant="body1">
              <b>Status</b>:{' '}
              <Badge bg={localDealership.status === 'active' ? 'success' : 'danger'}>
                {localDealership.status}
              </Badge>
            </Typography>
            <Typography variant="body1">
              <b>Dealership Admin</b>: {localDealership.dealer_admin}
            </Typography>
            <Typography variant="body1">
              <b>Phone</b>: {localDealership.phone}
            </Typography>
            <Typography variant="body1">
              <b>Address</b>: {localDealership.address}
            </Typography>
          </Box>
        </Grid>

        <Grid item xs={isMobile ? 12 : 4} sx={{ height: '100%' }}>
          <Box sx={{ height: '100%' }}>
            <Box sx={{ mb: 1, height: '100%' }}>
              <Grid container spacing={1} sx={{ height: '100%' }}>
                <Grid item xs={6} sx={{ height: '100%' }}>
                  <Box
                    onClick={handleOpenModalAdd}
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
                      height: '100%',
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
                      <AddCircleOutline />
                      <Typography variant="body2" sx={{ fontSize: '15px' }}>
                        ADD NEW USER
                      </Typography>
                    </IconButton>
                  </Box>
                </Grid>
                <Grid item xs={6} sx={{ height: '100%' }}>
                  <Box
                    onClick={handleOpenModalUpdate}
                    sx={{
                      display: 'flex',
                      flexGrow: 1,
                      flexDirection: 'column',
                      ml: isMobile ? 0 : 1,
                      p: 1,
                      bgcolor: 'white',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      height: '100%',
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
                      <EditNoteOutlined />
                      <Typography variant="body2" sx={{ fontSize: '15px' }}>
                        MANAGE DETAILS
                      </Typography>
                    </IconButton>
                  </Box>
                </Grid>
              </Grid>
            </Box>
            <Box>
              <Grid container spacing={1} sx={{ height: '100%' }}>
                <Grid item xs={6} sx={{ height: '100%' }}>
                  <Box
                    onClick={handleDeactivateDealership}
                    sx={{
                      display: 'flex',
                      flexGrow: 1,
                      flexDirection: 'column',
                      ml: isMobile ? 0 : 1,
                      p: 1,
                      bgcolor: 'white',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      height: '100%',
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
                      <PowerSettingsNew />
                      <Typography variant="body2" sx={{ fontSize: '15px' }}>
                        {localDealership.status === 'active' ? 'DEACTIVATE' : 'ACTIVATE'} DEALERSHIP
                      </Typography>
                    </IconButton>
                  </Box>
                </Grid>
                <Grid item xs={6} sx={{ height: '100%' }}>
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
                      height: '100%',
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
                      onClick={() => user.data.role === 'DealerAdmin' ? navigate(`${apiFrontendRoot}`) : navigate(`${apiFrontendRoot}/dealerships`)}
                    >
                      <Web />
                      <Typography variant="body2" sx={{ fontSize: '15px' }}>
                        GO TO DEALERS PAGE
                      </Typography>
                    </IconButton>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </Box>
        </Grid>
      </Grid>
      <ModalSendNewUserComponent dealership={localDealership} open={openModalAdd} handleClose={handleCloseModalAdd} />
      <ModalUpdateUserComponent
        dealership={localDealership}
        open={openModalUpdate}
        handleClose={handleCloseModalUpdate}
        setDealership={setDealership}
      />
    </>
  );
};

export default DealershipButtonsDetailsComponent;
