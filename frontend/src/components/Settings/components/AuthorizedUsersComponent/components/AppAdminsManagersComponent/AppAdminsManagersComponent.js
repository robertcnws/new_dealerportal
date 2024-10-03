import React, { useEffect, useState } from 'react';
import { Box, Typography, useTheme, useMediaQuery, Grid, TableContainer, Table, TableHead, TableRow, TableCell, TableBody } from '@mui/material';
import DateDifferenceComponent from '../../../../../Utils/components/DateDifferenceComponent/DateDifferenceComponent';
import NavigationButtonComponent from '../../../../../Utils/components/NavigationButtonComponent/NavigationButtonComponent';
import CustomAlertComponent from '../../../../../Utils/components/CustomAlertComponent/CustomAlertComponent';
import { FlashOnOutlined, PowerSettingsNewOutlined } from '@mui/icons-material';
import { Badge } from 'react-bootstrap';
import Swal from 'sweetalert2';
import { apiUrl, numberRows } from '../../../../../../config';
import { fetchWithToken } from '../../../../../../utils';
import ModalManageUserComponent from '../../../../../ManageDealership/components/MainDealershipAccountComponent/components/ModalManageUserComponent/ModalManageUserComponent';
import CustomTablePaginationComponent from '../../../../../Utils/components/CustomTablePaginationComponent/CustomTablePaginationComponent';

const AppAdminsManagersComponent = ({ authorizedUsers }) => {

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [listAdmins, setListAdmins] = React.useState([]);
  const [listAppManagers, setListAppManagers] = React.useState([]);
  const user = JSON.parse(localStorage.getItem('userLogged') || {});
  const [openModal, setOpenModal] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [pageAdmin, setPageAdmin] = useState(0);
  const [rowsPerPageAdmin, setRowsPerPageAdmin] = useState(numberRows);
  const [pageManager, setPageManager] = useState(0);
  const [rowsPerPageManager, setRowsPerPageManager] = useState(numberRows);

  const handleOpenModal = (row) => {
    setSelectedRow(row);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setSelectedRow(null);
    setOpenModal(false);
  };

  const handleChangePageAdmin = (event, newPage) => {
    setPageAdmin(newPage);
  };

  const handleChangeRowsPerPageAdmin = (event) => {
    const rows = parseInt(event.target.value, 10);
    setRowsPerPageAdmin(rows);
    setPageAdmin(0);
  };

  const handleChangePageManager = (event, newPage) => {
    setPageManager(newPage);
  };

  const handleChangeRowsPerPageManager = (event) => {
    const rows = parseInt(event.target.value, 10);
    setRowsPerPageManager(rows);
    setPageManager(0);
  };

  const columnsAdmin = [
    { field: 'status', headerName: 'Status', width: 100 },
    { field: 'username', headerName: 'Username', width: 150 },
    { field: 'name', headerName: 'Name', width: 150 },
    ...(!isMobile ? [
      { field: 'email', headerName: 'Email', width: 150 },
      { field: 'role', headerName: 'Role', width: 150 },
      { field: 'last_login', headerName: 'Last Login', width: 150 },
    ] : []),
  ];

  const handleDeactivate = async (row) => {
    const customClassSwal = {
      popup: 'small-popup',
      title: 'small-title',
      icon: 'custom-icon',
      content: 'small-content',
      confirmButton: 'small-confirm-button',
    };

    Swal.fire({
      title: row.is_active ? 'DEACTIVATE' : 'ACTIVATE',
      text: `Are you sure you want to proceed this action for user ${row.username}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No',
      customClass: customClassSwal,
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const url = `${apiUrl}/app_settings/dealeportal/users/change_auth_status/${row.id}/`;
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

  const handleDemoteToAppManager = async (row) => {
    const customClassSwal = {
      popup: 'small-popup',
      title: 'small-title',
      icon: 'custom-icon',
      content: 'small-content',
      confirmButton: 'small-confirm-button',
    };

    Swal.fire({
      title: row.role === 'AppAdmin' ? 'DEMOTE TO APP MANAGER' : 'PROMOTE TO ADMIN',
      text: `Are you sure you want to proceed this action for user ${row.username}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No',
      customClass: customClassSwal,
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const url = `${apiUrl}/app_settings/dealeportal/users/change_auth_role/${row.id}/`;
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

  const fetchInfo = async (payload) => {
    try {
      const response = await fetchWithToken(`${apiUrl}/app_settings/dealeportal/users/`, 'GET', payload, {}, apiUrl);
      if (response.status === 200) {
        setListAdmins(response.data.app_admins);
        setListAppManagers(response.data.app_managers);
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
      <Box sx={{ mt: isMobile ? 1 : 2, minWidth: '100%', bgcolor: '#f1f1f1' }}>
        <Grid container spacing={0}>
          <Grid item xs={isMobile ? 12 : 6}>
            <Box sx={{ display: 'flex', alignItems: 'center', mt: isMobile ? 2 : 0 }}>
              <Typography variant="h6" sx={{ ml: isMobile ? 0 : 5, mt: isMobile ? -1 : 3, mb: 2 }}>
                App Administrators
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
              <TableContainer sx={{ ml: isMobile ? 0 : 5, bgcolor: 'white' }}>
                <Table aria-label="simple table">
                  <TableHead sx={{ maxHeight: '20px', p: 0, border: '1px solid #ddd' }}>
                    <TableRow>
                      {columnsAdmin.map((column) => (
                        <TableCell key={`${column.field}-DealerAdmin`} align="center" sx={{ bgcolor: '#f1f1f9', p: 1 }}>
                          {column.headerName}
                        </TableCell>
                      ))}
                      <TableCell align="center" sx={{ bgcolor: '#f1f1f9', p: 1 }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {listAdmins.length > 0 ? (rowsPerPageAdmin > 0
                      ? listAdmins.slice(pageAdmin * rowsPerPageAdmin, pageAdmin * rowsPerPageAdmin + rowsPerPageAdmin)
                      : listAdmins
                    ).map((row, index) => {

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
                            onClick: () => handleDeactivate(row),
                            visibility: true,
                            noBorder: true,
                          },
                        ] : []),
                        {
                          label: 'Demote to AppManager',
                          icon: <i className="bi bi-shield-fill-x" style={{ marginRight: 10 }}></i>,
                          onClick: () => handleDemoteToAppManager(row),
                          visibility: true,
                          noBorder: true,
                        },
                      ];

                      return (

                        <TableRow key={row?.id}>
                          <TableCell key={`${row?.id}-${row?.is_active}${row?.index}`} align="center" sx={{ p: 0, cursor: 'pointer' }} onClick={() => handleOpenModal(row)}>
                            <Badge bg={row?.is_active ? 'success' : 'danger'}>{row?.is_active ? 'active' : 'inactive'}</Badge>
                          </TableCell>
                          <TableCell key={`${row?.id}-${row?.username}${row?.index}`} align="center" sx={{ p: 0, cursor: 'pointer' }} onClick={() => handleOpenModal(row)}>
                            {row?.username}
                          </TableCell>
                          <TableCell key={`${row?.id}-${row?.first_name}${row?.index}`} align="center" sx={{ p: 0, cursor: 'pointer' }} onClick={() => handleOpenModal(row)}>
                            {row?.first_name} {row?.last_name}
                          </TableCell>
                          {!isMobile && (
                            <>
                              <TableCell key={`${row?.id}-${row?.email}${row?.index}`} align="center" sx={{ p: 0, cursor: 'pointer' }} onClick={() => handleOpenModal(row)}>
                                {row?.email}
                              </TableCell>
                              <TableCell key={`${row?.id}-${row?.role}${row?.index}`} align="center" sx={{ p: 0, cursor: 'pointer' }} onClick={() => handleOpenModal(row)}>
                                {row?.role}
                              </TableCell>
                              <TableCell key={`${row?.id}-${row?.last_login}${row?.index}`} align="center" sx={{ p: 0, cursor: 'pointer' }} onClick={() => handleOpenModal(row)}>
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
                        <TableCell align="center" colSpan={columnsAdmin.length + 1} sx={{ p: 0 }}>
                          <CustomAlertComponent severity="info" message="No App administrators" sx={{ p: 0 }} />
                        </TableCell>
                      </TableRow>
                    )}
                    <CustomTablePaginationComponent
                      columnsLength={columnsAdmin.length + 1}
                      data={listAdmins}
                      page={pageAdmin}
                      rowsPerPage={rowsPerPageAdmin}
                      handleChangePage={handleChangePageAdmin}
                      handleChangeRowsPerPage={handleChangeRowsPerPageAdmin}
                    />
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </Grid>
          <Grid item xs={isMobile ? 12 : 6}>
            <Box sx={{ display: 'flex', alignItems: 'center', mt: isMobile ? 2 : 0 }}>
              <Typography variant="h6" sx={{ ml: isMobile ? 0 : 5, mt: isMobile ? -1 : 3, mb: 2 }}>
                App Managers
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
              <TableContainer sx={{ ml: isMobile ? 0 : 5, bgcolor: 'white' }}>
                <Table aria-label="simple table">
                  <TableHead sx={{ maxHeight: '20px', p: 0, border: '1px solid #ddd' }}>
                    <TableRow>
                      {columnsAdmin.map((column) => (
                        <TableCell key={`${column.field}-DealerAdmin`} align="center" sx={{ bgcolor: '#f1f1f9', p: 1 }}>
                          {column.headerName}
                        </TableCell>
                      ))}
                      <TableCell align="center" sx={{ bgcolor: '#f1f1f9', p: 1 }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {listAppManagers.length > 0 ? (rowsPerPageManager > 0
                      ? listAppManagers.slice(pageManager * rowsPerPageManager, pageManager * rowsPerPageManager + rowsPerPageManager)
                      : listAppManagers
                    ).map((row, index) => {

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
                            onClick: () => handleDeactivate(row),
                            visibility: true,
                            noBorder: true,
                          },
                        ] : []),
                        {
                          label: 'Promote to AppAdmin',
                          icon: <i className="bi bi-shield-fill-check" style={{ marginRight: 10 }}></i>,
                          onClick: () => handleDemoteToAppManager(row),
                          visibility: true,
                          noBorder: true,
                        },
                      ];

                      return (

                        <TableRow key={row?.id}>
                          <TableCell key={`${row?.id}-${row?.is_active}${row?.index}`} align="center" sx={{ p: 0, cursor: 'pointer' }} onClick={() => handleOpenModal(row)}>
                            <Badge bg={row?.is_active ? 'success' : 'danger'}>{row?.is_active ? 'active' : 'inactive'}</Badge>
                          </TableCell>
                          <TableCell key={`${row?.id}-${row?.username}${row?.index}`} align="center" sx={{ p: 0, cursor: 'pointer' }} onClick={() => handleOpenModal(row)}>
                            {row?.username}
                            </TableCell>
                          <TableCell key={`${row?.id}-${row?.first_name}${row?.index}`} align="center" sx={{ p: 0, cursor: 'pointer' }} onClick={() => handleOpenModal(row)}>
                            {row?.first_name} {row?.last_name}
                            </TableCell>
                          {!isMobile && (
                            <>
                              <TableCell key={`${row?.id}-${row?.email}${row?.index}`} align="center" sx={{ p: 0, cursor: 'pointer' }} onClick={() => handleOpenModal(row)}>
                                {row?.email}
                                </TableCell>
                              <TableCell key={`${row?.id}-${row?.role}${row?.index}`} align="center" sx={{ p: 0, cursor: 'pointer' }} onClick={() => handleOpenModal(row)}>
                                {row?.role}
                                </TableCell>
                              <TableCell key={`${row?.id}-${row?.last_login}${row?.index}`} align="center" sx={{ p: 0, cursor: 'pointer' }} onClick={() => handleOpenModal(row)}>
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
                        <TableCell align="center" colSpan={columnsAdmin.length + 1} sx={{ p: 0 }}>
                          <CustomAlertComponent severity="info" message="No App administrators" sx={{ p: 0 }} />
                        </TableCell>
                      </TableRow>
                    )}
                    <CustomTablePaginationComponent
                      columnsLength={columnsAdmin.length + 1}
                      data={listAppManagers}
                      page={pageManager}
                      rowsPerPage={rowsPerPageManager}
                      handleChangePage={handleChangePageManager}
                      handleChangeRowsPerPage={handleChangeRowsPerPageManager}
                    />
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </Grid>
        </Grid>
      </Box >
      <ModalManageUserComponent user={selectedRow} open={openModal} handleClose={handleCloseModal} onSyncComplete={fetchInfo} />
    </>
  );
}

export default AppAdminsManagersComponent;
