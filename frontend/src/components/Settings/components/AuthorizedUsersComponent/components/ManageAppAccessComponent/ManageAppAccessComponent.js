import React, { useEffect, useState } from 'react';
import { Box, Typography, useTheme, useMediaQuery, TextField, FormHelperText, Button, Grid, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, IconButton } from '@mui/material';
import { useForm } from 'react-hook-form';
import Swal from 'sweetalert2';
import { apiUrl, customClassSwal } from '../../../../../../config';
import { fetchWithToken } from '../../../../../../utils';
import CustomAlertComponent from '../../../../../Utils/components/CustomAlertComponent/CustomAlertComponent';
import NavigationButtonComponent from '../../../../../Utils/components/NavigationButtonComponent/NavigationButtonComponent';
import DateDifferenceComponent from '../../../../../Utils/components/DateDifferenceComponent/DateDifferenceComponent';
import { Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { apiFrontendRoot, numberRows } from '../../../../../../config';
import CustomTablePaginationComponent from '../../../../../Utils/components/CustomTablePaginationComponent/CustomTablePaginationComponent';

const ManageAppAccessComponent = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { register, handleSubmit, formState: { errors }, reset } = useForm();
  const user = JSON.parse(localStorage.getItem('userLogged'));
  const [listPendingInvitations, setListPendingInvitations] = React.useState([]);
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(numberRows);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    const rows = parseInt(event.target.value, 10);
    setRowsPerPage(rows);
    setPage(0);
  };

  const customClassSwal = {
    popup: 'small-popup',
    title: 'small-title',
    icon: 'custom-icon',
    content: 'small-content',
    confirmButton: 'small-confirm-button',
  };

  const onSubmit = async (data) => {
    const user = JSON.parse(localStorage.getItem('userLogged'));
    const payload = {
      ...data,
      user_id: user.data.id,
      role: 'K54Rl',
    };
    try {
      const url = `${apiUrl}/utils/dealerportal-send-invitation/`;
      const response = await fetchWithToken(url, 'POST', payload, {}, apiUrl);
      if (response.status === 200) {
        if (response.data.error) {
          Swal.fire({
            title: 'Error',
            text: response.data.error,
            icon: 'error',
            confirmButtonText: 'OK',
            customClass: customClassSwal,
          });
        }
        else {
          Swal.fire({
            title: 'Success!',
            text: `${response.data.message}`,
            icon: 'success',
            confirmButtonText: 'OK',
            customClass: customClassSwal,
            willClose: () => {
              reset();
              const payload = {
                user_id: user.data.id,
              };
              fetchInfo(payload);
            },
          });
        }
      }
    }
    catch (error) {
      console.log(error);
    }
  };

  const handleResendInvitation = async (row) => {
    const customClassSwal = {
      popup: 'small-popup',
      title: 'small-title',
      icon: 'custom-icon',
      content: 'small-content',
      confirmButton: 'small-confirm-button',
    };

    Swal.fire({
      title: 'RESEND INVITATION',
      text: `Are you sure you want to resend invitation for email ${row.email}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No',
      customClass: customClassSwal,
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const url = `${apiUrl}/utils/dealerportal-resend-invitation/${row.id}/`;
          const user = JSON.parse(localStorage.getItem('userLogged') || '{}');
          const data = {
            user_id: user.data.id,
          };
          const response = await fetchWithToken(url, 'POST', data, {}, apiUrl);
          if (response.status === 200) {
            if (response.status === 200) {
              // handleCloseModal();
              if (!response.data.error) {
                Swal.fire({
                  title: 'Success',
                  text: `${response.data.message}`,
                  icon: 'success',
                  confirmButtonText: 'OK',
                  customClass: customClassSwal,
                  willClose: () => {
                    const payload = {
                      user_id: user.data.id,
                    };
                    fetchInfo(payload);
                  }
                });
              } else {
                Swal.fire({
                  title: 'Error',
                  text: `${response.data.message}`,
                  icon: 'error',
                  confirmButtonText: 'Accept',
                  customClass: customClassSwal,
                });
              }
            }
          }
        }
        catch (error) {
          console.log(error);
        }
      }
    });
  };

  const handleDeleteInvitation = async (row) => {
    const customClassSwal = {
      popup: 'small-popup',
      title: 'small-title',
      icon: 'custom-icon',
      content: 'small-content',
      confirmButton: 'small-confirm-button',
    };

    Swal.fire({
      title: 'DELETE INVITATION',
      text: `Are you sure you want to delete the invitation for ${row.email}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No',
      customClass: customClassSwal,
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const url = `${apiUrl}/utils/dealerportal-delete-invitation/`;
          const user = JSON.parse(localStorage.getItem('userLogged') || '{}');
          const data = {
            user_id: user.data.id,
            invitation_id: row.id,
          };
          const response = await fetchWithToken(url, 'POST', data, {}, apiUrl);
          if (response.status === 200) {
            if (response.status === 200) {
              // handleCloseModal();
              if (!response.data.error) {
                Swal.fire({
                  title: 'Success',
                  text: `${response.data.message}`,
                  icon: 'success',
                  confirmButtonText: 'OK',
                  customClass: customClassSwal,
                  willClose: () => {
                    const payload = {
                      user_id: user.data.id,
                    };
                    fetchInfo(payload);
                  }
                });
              } else {
                Swal.fire({
                  title: 'Error',
                  text: `${response.data.message}`,
                  icon: 'error',
                  confirmButtonText: 'Accept',
                  customClass: customClassSwal,
                });
              }
            }
          }
        }
        catch (error) {
          console.log(error);
        }
      }
    });
  };

  const columnsPendingInvitations = [
    { field: 'status', headerName: 'Status', width: 100 },
    { field: 'email', headerName: 'Email', width: 150 },
    { field: 'created', headerName: 'Created', width: 150 },
  ];

  const childrenNavigationPendingInvitations = [
    {
      label: 'Resend Invitation',
      icon: <i className="bi bi-send" style={{ marginRight: 10 }}></i>,
      onClick: handleResendInvitation,
      visibility: true,
      noBorder: true,
    },
    {
      label: 'Delete Invite',
      icon: <i className="bi bi-trash" style={{ marginRight: 10 }} />,
      onClick: handleDeleteInvitation,
      visibility: true,
      noBorder: true,
    },
  ];

  const handleReturnToSettings = () => {
    navigate(`${apiFrontendRoot}/settings`);
  }

  const fetchInfo = async (payload) => {
    try {
      const response = await fetchWithToken(`${apiUrl}/dealerportal/pending_invitations/`, 'GET', payload, {}, apiUrl);
      if (response.status === 200) {
        setListPendingInvitations(response.data.data.pending_invitations);
      } else {
        throw new Error(`Failed to fetch data`);
      }
    } catch (err) {
      console.error(err.message);
    }
  };

  useEffect(() => {
    const payload = {
      user_id: user.data.id,
    };
    fetchInfo(payload);
  }, []);

  return (
    <>
      <Box sx={{ mt: isMobile ? 1 : -3, minWidth: '100%', bgcolor: '#f1f1f1' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ ml: isMobile ? 0 : 5, mt: isMobile ? -1 : 3, mb: 2 }}>
            Manage Aplication Access
          </Typography>
          <Box onClick={handleReturnToSettings}
            sx={{
              mt: isMobile ? -2 : 2,
              mb: 1,
              p: 1,
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
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <i className="fa-solid fa-close"></i>
              <Typography sx={{ fontSize: '13px', ml: 1 }}> Return to settings</Typography>
            </IconButton>
          </Box>
        </Box>
        <Grid container spacing={1} sx={{ ml: isMobile ? 0 : 2 }}>
          <Grid item xs={isMobile ? 12 : 4}>
            <Box sx={{ mb: 4, ml: isMobile ? 0 : 2, mr: isMobile ? 0 : 2 }}>
              <Box sx={{ p: 1, bgcolor: 'white', borderRadius: '8px' }}>
                <Typography variant="h6" sx={{ mb: 1 }}>
                  <i className="bi bi-plus-circle me-2"></i>
                  Add a new User as an App Manager
                </Typography>

                <form onSubmit={handleSubmit(onSubmit)}>
                  <Box sx={{ mb: 1 }}>
                    <TextField
                      type="email"
                      label="Email"
                      id="email"
                      name="email"
                      placeholder="Enter email"
                      fullWidth
                      margin="normal"
                      InputLabelProps={{
                        shrink: true,
                      }}
                      {...register('email', {
                        required: 'Email is required',
                        pattern: {
                          value: /^\S+@\S+$/i,
                          message: 'Enter a valid email address',
                        },
                      })}
                      error={!!errors.email}
                    />
                    {errors.email && (
                      <FormHelperText error>{errors.email.message}</FormHelperText>
                    )}
                  </Box>

                  <Box sx={{ textAlign: 'right', mb: 1 }}>
                    <Button type="submit" variant="contained" color="success">
                      Send Invitation
                    </Button>
                  </Box>
                </form>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={isMobile ? 12 : 8} sx={{ bgcolor: 'white', p: 1, borderRadius: '5px' }}>
            <Typography variant="body1">
              <b>Pending Invitations</b>
            </Typography>
            <Box>
              <TableContainer>
                <Table aria-label="simple table">
                  <TableHead sx={{ maxHeight: '20px', p: 0, border: '1px solid #ddd' }}>
                    <TableRow>
                      {columnsPendingInvitations.map((column) => (
                        <TableCell key={`${column.field}-PendingInvitations`} align="center" sx={{ bgcolor: '#f1f1f9', p: 1 }}>
                          {column.headerName}
                        </TableCell>
                      ))}
                      <TableCell align="center" sx={{ bgcolor: '#f1f1f9', p: 1 }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {listPendingInvitations.length > 0 ? (rowsPerPage > 0
                      ? listPendingInvitations.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      : listPendingInvitations
                    ).map((row) => (
                      <TableRow key={row?.id}>
                        <TableCell key={`${row?.id}-${row?.is_accepted}${row?.index}`} align="center" sx={{ p: 0, cursor: 'pointer' }} onClick={() => handleResendInvitation(row)}>
                          <Badge bg={row?.is_accepted ? 'success' : 'warning'}>{row?.is_accepted ? 'accepted' : 'pending'}</Badge>
                        </TableCell>
                        <TableCell key={`${row?.id}-${row?.email}${row?.index}`} align="center" sx={{ p: 0, cursor: 'pointer' }} onClick={() => handleResendInvitation(row)}>
                          {row?.email}
                        </TableCell>
                        <TableCell key={`${row?.id}-${row?.created_at}${row?.index}`} align="center" sx={{ p: 0, cursor: 'pointer' }} onClick={() => handleResendInvitation(row)}>
                          <DateDifferenceComponent dateString={row?.created_at} />
                        </TableCell>
                        <TableCell key={`${row?.id}-buttonsPendingInvitations`} align="center" sx={{ p: 0 }}>
                          <NavigationButtonComponent children={childrenNavigationPendingInvitations} bgcolor='white' row={row} />
                        </TableCell>
                      </TableRow>
                    )) : (
                      <TableRow>
                        <TableCell align="center" colSpan={columnsPendingInvitations.length + 1} sx={{ p: 0 }}>
                          <CustomAlertComponent severity="info" message="No pending invitations" sx={{ p: 0 }} />
                        </TableCell>
                      </TableRow>
                    )}
                    <CustomTablePaginationComponent
                      columnsLength={columnsPendingInvitations.length + 1}
                      data={listPendingInvitations}
                      page={page}
                      rowsPerPage={rowsPerPage}
                      handleChangePage={handleChangePage}
                      handleChangeRowsPerPage={handleChangeRowsPerPage}
                    />
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </>
  );
}

export default ManageAppAccessComponent;
