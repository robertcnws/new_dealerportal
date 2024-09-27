import React, { useEffect, useState } from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, useTheme, useMediaQuery } from '@mui/material';
import { DisabledByDefaultTwoTone, EditAttributesOutlined, FlashOnOutlined, Logout, PowerSettingsNewOutlined } from '@mui/icons-material';
import CustomAlertComponent from '../../../../../Utils/components/CustomAlertComponent/CustomAlertComponent';
import { fetchWithToken } from '../../../../../../utils';
import { apiUrl } from '../../../../../../config';
import { Badge } from 'react-bootstrap';
import Swal from 'sweetalert2';
import DateDifferenceComponent from '../../../../../Utils/components/DateDifferenceComponent/DateDifferenceComponent';
import NavigationButtonComponent from '../../../../../Utils/components/NavigationButtonComponent/NavigationButtonComponent';
import ModalManageUserComponent from '../ModalManageUserComponent/ModalManageUserComponent';

const TablesDealershipAccountComponent = ({ dealership }) => {

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [listDealershipAdmin, setListDealershipAdmin] = useState([]);
  const [listEstimatorsAccounts, setListEstimatorsAccounts] = useState([]);
  const [listPendingInvitations, setListPendingInvitations] = useState([]);
  const user = JSON.parse(localStorage.getItem('userLogged') || '{}');
  const [openModal, setOpenModal] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);

  const handleOpenModal = (row) => {
    setSelectedRow(row);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setSelectedRow(null);
    setOpenModal(false);
  };

  const columnsDealerAdmin = [
    { field: 'status', headerName: 'Status', width: 100 },
    { field: 'username', headerName: 'Username', width: 150 },
    { field: 'name', headerName: 'Name', width: 150 },
    ...(!isMobile ? [
      { field: 'email', headerName: 'Email', width: 150 },
      { field: 'role', headerName: 'Role', width: 150 },
      { field: 'last_login', headerName: 'Last Login', width: 150 },
    ] : []),
  ];

  const columnsEstimatorsAccounts = [
    { field: 'status', headerName: 'Status', width: 100 },
    { field: 'username', headerName: 'Username', width: 150 },
    { field: 'full_name', headerName: 'Full Name', width: 150 },
    ...(!isMobile ? [
      { field: 'email', headerName: 'Email', width: 150 },
      { field: 'last_login', headerName: 'Last Login', width: 150 },
    ] : []),
  ];

  const columnsPendingInvitations = [
    { field: 'status', headerName: 'Status', width: 100 },
    { field: 'email', headerName: 'Email', width: 150 },
    { field: 'created', headerName: 'Created', width: 150 },
  ];

  const handleManageDealerAdmin = () => {
    console.log('handleManageDealerAdmin');
  };

  const handleDeactivateDealerAdmin = async (row) => {
    const customClassSwal = {
      popup: 'small-popup',
      title: 'small-title',
      icon: 'custom-icon',
      content: 'small-content',
      confirmButton: 'small-confirm-button',
    };

    Swal.fire({
      title: row.is_active ? 'DEACTIVATE DEALER ADMIN' : 'ACTIVATE DEALER ADMIN',
      text: `Are you sure you want to proceed this action for user ${row.username}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No',
      customClass: customClassSwal,
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const url = `${apiUrl}/dealerportal/manage-dealership/users/manage-status/${row.id}/`;
          const user = JSON.parse(localStorage.getItem('userLogged') || '{}');
          const data = {
            user_id: user.data.id,
          };
          const response = await fetchWithToken(url, 'POST', data, {}, apiUrl);
          if (response.status === 200) {
            if (response.status === 200) {
              handleCloseModal();
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

  const handleDemoteToEstimator = async (row) => {
    const customClassSwal = {
      popup: 'small-popup',
      title: 'small-title',
      icon: 'custom-icon',
      content: 'small-content',
      confirmButton: 'small-confirm-button',
    };

    Swal.fire({
      title: row.role === 'DealerAdmin' ? 'DEMOTE TO ESTIMATOR' : 'PROMOTE TO ADMIN',
      text: `Are you sure you want to proceed this action for user ${row.username}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No',
      customClass: customClassSwal,
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const url = `${apiUrl}/dealerportal/manage-dealership/users/manage-admin/${row.id}/`;
          const user = JSON.parse(localStorage.getItem('userLogged') || '{}');
          const data = {
            user_id: user.data.id,
          };
          const response = await fetchWithToken(url, 'POST', data, {}, apiUrl);
          if (response.status === 200) {
            if (response.status === 200) {
              handleCloseModal();
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
              handleCloseModal();
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
              handleCloseModal();
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

  const fetchInfo = async (payload) => {
    try {
      const response = await fetchWithToken(`${apiUrl}/dealerportal/dealerships/manage-dealership/${dealership.id}/`, 'GET', payload, {}, apiUrl);
      if (response.status === 200) {
        let listAdmins = [];
        if (response.data.data.dealership_admin) {
          listAdmins.push(response.data.data.dealership_admin || {});
        }
        setListDealershipAdmin(listAdmins);
        setListEstimatorsAccounts(response.data.data.estimators);
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
    const intervalId = setInterval(() => {
      fetchInfo(payload);
    }, 5000);
    return () => clearInterval(intervalId);
  }, [user.data.id]);


  return (
    <>
      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        flexGrow: 1,
        justifyContent: 'center',
        ml: isMobile ? 0 : 5,
        mt: 2,
        p: 1,
        bgcolor: 'white',
        borderRadius: '10px',
      }}>
        <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          flexGrow: 1,
          mb: 3,
        }}>
          <Typography variant="body1">
            <b>Dealer Admin</b>
          </Typography>
          <Box>
            <TableContainer>
              <Table aria-label="simple table">
                <TableHead sx={{ maxHeight: '20px', p: 0, border: '1px solid #ddd' }}>
                  <TableRow>
                    {columnsDealerAdmin.map((column) => (
                      <TableCell key={`${column.field}-DealerAdmin`} align="center" sx={{ bgcolor: '#f1f1f9', p: 1 }}>
                        {column.headerName}
                      </TableCell>
                    ))}
                    <TableCell align="center" sx={{ bgcolor: '#f1f1f9', p: 1 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {listDealershipAdmin.length > 0 ? listDealershipAdmin.map((row, index) => {

                    const childrenNavigationDealerAdmin = [
                      {
                        label: 'Manage',
                        icon: <i className="bi bi-pencil-square" style={{ marginRight: 10 }}></i>,
                        onClick: () => handleOpenModal(row),
                        visibility: true,
                        noBorder: true,
                      },
                      ...(user.data.role.includes('AppAdmin') ? [
                        {
                          label: row.is_active ? 'Deactivate' : 'Activate',
                          icon: row.is_active ? <PowerSettingsNewOutlined sx={{ marginRight: 1 }} /> : <FlashOnOutlined sx={{ marginRight: 1 }} />,
                          onClick: () => handleDeactivateDealerAdmin(row),
                          visibility: true,
                          noBorder: true,
                        },
                      ] : []),
                      {
                        label: row?.role !== 'DealerAdmin' ? 'Promote to Dealer Admin' : 'Demote to Estimator',
                        icon: row?.role !== 'DealerAdmin' ? (
                          <i className="bi bi-shield-fill-x" style={{ marginRight: 10 }}></i>
                        ) : (
                          <i className="bi bi-shield-fill-check" style={{ marginRight: 10 }}></i>
                        ),
                        onClick: () => handleDemoteToEstimator(row),
                        visibility: true,
                        noBorder: true,
                      },
                    ];

                    return (

                      <TableRow key={row?.id}>
                        <TableCell key={`${row?.id}-${row?.is_active}${row?.index}`} align="center" sx={{ p: 0 }}>
                          <Badge bg={row?.is_active ? 'success' : 'danger'}>{row?.is_active ? 'active' : 'inactive'}</Badge>
                        </TableCell>
                        <TableCell key={`${row?.id}-${row?.username}${row?.index}`} align="center" sx={{ p: 0 }}>{row?.username}</TableCell>
                        <TableCell key={`${row?.id}-${row?.first_name}${row?.index}`} align="center" sx={{ p: 0 }}>{row?.first_name} {row?.last_name}</TableCell>
                        {!isMobile && (
                          <>
                            <TableCell key={`${row?.id}-${row?.email}${row?.index}`} align="center" sx={{ p: 0 }}>{row?.email}</TableCell>
                            <TableCell key={`${row?.id}-${row?.role}${row?.index}`} align="center" sx={{ p: 0 }}>{row?.role}</TableCell>
                            <TableCell key={`${row?.id}-${row?.last_login}${row?.index}`} align="center" sx={{ p: 0 }}>
                              <DateDifferenceComponent dateString={row?.last_login} />
                            </TableCell>
                          </>
                        )}
                        <TableCell key={`${row?.id}-buttonsDealershipAdmin`} align="center" sx={{ p: 0 }}>
                          <NavigationButtonComponent children={childrenNavigationDealerAdmin} bgcolor='white' row={row} />
                        </TableCell>
                      </TableRow>
                    )
                  }) : (
                    <TableRow>
                      <TableCell align="center" colSpan={columnsDealerAdmin.length + 1} sx={{ p: 0 }}>
                        <CustomAlertComponent severity="info" message="No dealer admin" sx={{ p: 0 }} />
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </Box>

        <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          flexGrow: 1,
          mb: 3,
        }}>
          <Typography variant="body1">
            <b>Estimators Accounts</b>
          </Typography>
          <Box>
            <TableContainer>
              <Table aria-label="simple table">
                <TableHead sx={{ maxHeight: '20px', p: 0, border: '1px solid #ddd' }}>
                  <TableRow>
                    {columnsEstimatorsAccounts.map((column) => (
                      <TableCell key={`${column.field}-EstimatorsAccounts`} align="center" sx={{ bgcolor: '#f1f1f9', p: 1 }}>
                        {column.headerName}
                      </TableCell>
                    ))}
                    <TableCell align="center" sx={{ bgcolor: '#f1f1f9', p: 1 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {listEstimatorsAccounts.length > 0 ? listEstimatorsAccounts.map((row, index) => {

                    const childrenNavigationEstimator = [
                      {
                        label: 'Manage',
                        icon: <i className="bi bi-pencil-square" style={{ marginRight: 10 }}></i>,
                        onClick: () => handleOpenModal(row),
                        visibility: true,
                        noBorder: true,
                      },
                      ...(user.data.role.includes('AppAdmin') ? [
                        {
                          label: row.is_active ? 'Deactivate' : 'Activate',
                          icon: row.is_active ? <PowerSettingsNewOutlined sx={{ marginRight: 1 }} /> : <FlashOnOutlined sx={{ marginRight: 1 }} />,
                          onClick: () => handleDeactivateDealerAdmin(row),
                          visibility: true,
                          noBorder: true,
                        },
                      ] : []),
                      {
                        label: row?.role !== 'DealerAdmin' ? 'Promote to Dealer Admin' : 'Demote to Estimator',
                        icon: row?.role !== 'DealerAdmin' ? (
                          <i className="bi bi-shield-fill-x" style={{ marginRight: 10 }}></i>
                        ) : (
                          <i className="bi bi-shield-fill-check" style={{ marginRight: 10 }}></i>
                        ),
                        onClick: () => handleDemoteToEstimator(row),
                        visibility: true,
                        noBorder: true,
                      },
                    ];

                    return (
                      <TableRow key={row?.id}>
                        <TableCell key={`${row?.id}-${row?.is_active}${row?.index}`} align="center" sx={{ p: 0 }}>
                          <Badge bg={row?.is_active ? 'success' : 'danger'}>{row?.is_active ? 'active' : 'inactive'}</Badge>
                        </TableCell>
                        <TableCell key={`${row?.id}-${row?.username}${row?.index}`} align="center" sx={{ p: 0 }}>{row?.username}</TableCell>
                        <TableCell key={`${row?.id}-${row?.first_name}${row?.index}`} align="center" sx={{ p: 0 }}>{row?.first_name} {row?.last_name}</TableCell>
                        {!isMobile && (
                          <>
                            <TableCell key={`${row?.id}-${row?.email}${row?.index}`} align="center" sx={{ p: 0 }}>{row?.email}</TableCell>
                            <TableCell key={`${row?.id}-${row?.last_login}${row?.index}`} align="center" sx={{ p: 0 }}>
                              <DateDifferenceComponent dateString={row?.last_login} />
                            </TableCell>
                          </>
                        )}
                        <TableCell key={`${row?.id}-buttonsEstimatorsAccounts`} align="center" sx={{ p: 0 }}>
                          <NavigationButtonComponent children={childrenNavigationEstimator} bgcolor='white' row={row} />
                        </TableCell>
                      </TableRow>
                    )
                  }) : (
                    <TableRow>
                      <TableCell align="center" colSpan={columnsEstimatorsAccounts.length + 1} sx={{ p: 0 }}>
                        <CustomAlertComponent severity="info" message="No estimators accounts" sx={{ p: 0 }} />
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </Box>

        <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          flexGrow: 1,
        }}>
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
                  {listPendingInvitations.length > 0 ? listPendingInvitations.map((row) => (
                    <TableRow key={row?.id}>
                      <TableCell key={`${row?.id}-${row?.is_accepted}${row?.index}`} align="center" sx={{ p: 0 }}>
                        <Badge bg={row?.is_accepted ? 'success' : 'warning'}>{row?.is_accepted ? 'accepted' : 'pending'}</Badge>
                      </TableCell>
                      <TableCell key={`${row?.id}-${row?.email}${row?.index}`} align="center" sx={{ p: 0 }}>{row?.email}</TableCell>
                      <TableCell key={`${row?.id}-${row?.created_at}${row?.index}`} align="center" sx={{ p: 0 }}>
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
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </Box>

      </Box>
      <ModalManageUserComponent user={selectedRow} open={openModal} handleClose={handleCloseModal} />
    </>
  );
}

export default TablesDealershipAccountComponent;
