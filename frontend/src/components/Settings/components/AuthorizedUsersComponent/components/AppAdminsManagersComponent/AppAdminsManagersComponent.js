import React, { useEffect, useMemo, useState, useCallback } from 'react';
import {
  Box,
  Typography,
  useTheme,
  useMediaQuery,
  Grid,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody
} from '@mui/material';
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

  const [listAdmins, setListAdmins] = useState([]);
  const [listAppManagers, setListAppManagers] = useState([]);

  const userLogged = useMemo(() => JSON.parse(localStorage.getItem('userLogged') || '{}'), []);
  const userId = userLogged?.data?.id;
  const isAppAdmin = !!userLogged?.data?.role?.includes('AppAdmin');

  const [openModal, setOpenModal] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);

  const [pageAdmin, setPageAdmin] = useState(0);
  const [rowsPerPageAdmin, setRowsPerPageAdmin] = useState(numberRows);
  const [pageManager, setPageManager] = useState(0);
  const [rowsPerPageManager, setRowsPerPageManager] = useState(numberRows);

  const columnsAdmin = useMemo(
    () => [
      { field: 'status', headerName: 'Status', width: 100 },
      { field: 'username', headerName: 'Username', width: 150 },
      { field: 'name', headerName: 'Name', width: 150 },
      ...(!isMobile
        ? [
            { field: 'email', headerName: 'Email', width: 150 },
            { field: 'role', headerName: 'Role', width: 150 },
            { field: 'last_login', headerName: 'Last Login', width: 150 }
          ]
        : []),
    ],
    [isMobile]
  );

  const customClassSwal = useMemo(
    () => ({
      popup: 'small-popup',
      title: 'small-title',
      icon: 'custom-icon',
      content: 'small-content',
      confirmButton: 'small-confirm-button',
    }),
    []
  );

  const handleOpenModal = useCallback((row) => {
    setSelectedRow(row);
    setOpenModal(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedRow(null);
    setOpenModal(false);
  }, []);

  const handleChangePageAdmin = useCallback((event, newPage) => setPageAdmin(newPage), []);
  const handleChangeRowsPerPageAdmin = useCallback((event) => {
    const rows = parseInt(event.target.value, 10);
    setRowsPerPageAdmin(rows);
    setPageAdmin(0);
  }, []);

  const handleChangePageManager = useCallback((event, newPage) => setPageManager(newPage), []);
  const handleChangeRowsPerPageManager = useCallback((event) => {
    const rows = parseInt(event.target.value, 10);
    setRowsPerPageManager(rows);
    setPageManager(0);
  }, []);

  const fetchInfo = useCallback(
    async (payload) => {
      try {
        const response = await fetchWithToken(`${apiUrl}/app_settings/dealeportal/users/`, 'GET', payload, {}, apiUrl);
        if (response.status === 200) {
          setListAdmins(response.data.app_admins || []);
          setListAppManagers(response.data.app_managers || []);
        }
      } catch (err) {
        console.error(err?.message || err);
      }
    },
    []
  );

  useEffect(() => {
    if (!userId) return;
    fetchInfo({ user_id: userId });
  }, [userId, fetchInfo]);

  const handleDeactivate = useCallback(
    async (row) => {
      Swal.fire({
        title: row?.is_active ? 'DEACTIVATE' : 'ACTIVATE',
        text: `Are you sure you want to proceed this action for user ${row?.username}?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes',
        cancelButtonText: 'No',
        customClass: customClassSwal,
      }).then(async (result) => {
        if (!result.isConfirmed || !userId) return;

        try {
          const url = `${apiUrl}/app_settings/dealeportal/users/change_auth_status/${row.id}/`;
          const data = { user_id: userId };
          const response = await fetchWithToken(url, 'POST', data, {}, apiUrl);

          if (response.status === 200) {
            const isError = !!response.data?.error;

            Swal.fire({
              title: isError ? 'Error' : 'Success',
              text: `${response.data?.message || ''}`,
              icon: isError ? 'error' : 'success',
              confirmButtonText: isError ? 'Accept' : 'OK',
              customClass: customClassSwal,
              willClose: () => {
                fetchInfo({ user_id: userId });
              },
            });
          }
        } catch (error) {
          console.log(error);
        }
      });
    },
    [customClassSwal, fetchInfo, userId]
  );

  const handleChangeRole = useCallback(
    async (row) => {
      Swal.fire({
        title: row?.role === 'AppAdmin' ? 'DEMOTE TO APP MANAGER' : 'PROMOTE TO ADMIN',
        text: `Are you sure you want to proceed this action for user ${row?.username}?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes',
        cancelButtonText: 'No',
        customClass: customClassSwal,
      }).then(async (result) => {
        if (!result.isConfirmed || !userId) return;

        try {
          const url = `${apiUrl}/app_settings/dealeportal/users/change_auth_role/${row.id}/`;
          const data = { user_id: userId };
          const response = await fetchWithToken(url, 'POST', data, {}, apiUrl);

          if (response.status === 200) {
            const isError = !!response.data?.error;

            Swal.fire({
              title: isError ? 'Error' : 'Success',
              text: `${response.data?.message || ''}`,
              icon: isError ? 'error' : 'success',
              confirmButtonText: isError ? 'Accept' : 'OK',
              customClass: customClassSwal,
              willClose: () => {
                fetchInfo({ user_id: userId });
              },
            });
          }
        } catch (error) {
          console.log(error);
        }
      });
    },
    [customClassSwal, fetchInfo, userId]
  );

  const renderTable = useCallback(
    ({ title, data, page, rowsPerPage, handleChangePage, handleChangeRowsPerPage, isAdminsTable }) => (
      <Grid item xs={isMobile ? 12 : 6}>
        <Box sx={{ display: 'flex', alignItems: 'center', mt: isMobile ? 2 : 0 }}>
          <Typography variant="h6" sx={{ ml: isMobile ? 0 : 5, mt: isMobile ? -1 : 3, mb: 2 }}>
            {title}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
          <TableContainer sx={{ ml: isMobile ? 0 : 5, bgcolor: 'white' }}>
            <Table aria-label="simple table">
              <TableHead sx={{ maxHeight: '20px', p: 0, border: '1px solid #ddd' }}>
                <TableRow>
                  {columnsAdmin.map((column) => (
                    <TableCell key={`${column.field}-${title}`} align="center" sx={{ bgcolor: '#f1f1f9', p: 1 }}>
                      {column.headerName}
                    </TableCell>
                  ))}
                  <TableCell align="center" sx={{ bgcolor: '#f1f1f9', p: 1 }}>
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {data.length > 0 ? (
                  (rowsPerPage > 0 ? data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage) : data).map((row) => {
                    const childrenNavigation = [
                      {
                        label: 'Manage',
                        icon: <i className="bi bi-pencil-square" style={{ marginRight: 10 }}></i>,
                        onClick: () => handleOpenModal(row),
                        visibility: true,
                        noBorder: true,
                      },
                      ...(isAppAdmin
                        ? [
                            {
                              label: row.is_active ? 'Deactivate' : 'Activate',
                              icon: row.is_active ? (
                                <PowerSettingsNewOutlined sx={{ marginRight: 1 }} />
                              ) : (
                                <FlashOnOutlined sx={{ marginRight: 1 }} />
                              ),
                              onClick: () => handleDeactivate(row),
                              visibility: true,
                              noBorder: true,
                            },
                          ]
                        : []),
                      {
                        label: isAdminsTable ? 'Demote to AppManager' : 'Promote to AppAdmin',
                        icon: isAdminsTable ? (
                          <i className="bi bi-shield-fill-x" style={{ marginRight: 10 }}></i>
                        ) : (
                          <i className="bi bi-shield-fill-check" style={{ marginRight: 10 }}></i>
                        ),
                        onClick: () => handleChangeRole(row),
                        visibility: true,
                        noBorder: true,
                      },
                    ];

                    return (
                      <TableRow key={row?.id}>
                        <TableCell align="center" sx={{ p: 0, cursor: 'pointer' }} onClick={() => handleOpenModal(row)}>
                          <Badge bg={row?.is_active ? 'success' : 'danger'}>{row?.is_active ? 'active' : 'inactive'}</Badge>
                        </TableCell>
                        <TableCell align="center" sx={{ p: 0, cursor: 'pointer' }} onClick={() => handleOpenModal(row)}>
                          {row?.username}
                        </TableCell>
                        <TableCell align="center" sx={{ p: 0, cursor: 'pointer' }} onClick={() => handleOpenModal(row)}>
                          {row?.first_name} {row?.last_name}
                        </TableCell>

                        {!isMobile && (
                          <>
                            <TableCell align="center" sx={{ p: 0, cursor: 'pointer' }} onClick={() => handleOpenModal(row)}>
                              {row?.email}
                            </TableCell>
                            <TableCell align="center" sx={{ p: 0, cursor: 'pointer' }} onClick={() => handleOpenModal(row)}>
                              {row?.role}
                            </TableCell>
                            <TableCell align="center" sx={{ p: 0, cursor: 'pointer' }} onClick={() => handleOpenModal(row)}>
                              <DateDifferenceComponent dateString={row?.last_login} />
                            </TableCell>
                          </>
                        )}

                        <TableCell align="center" sx={{ p: 0 }}>
                          <NavigationButtonComponent children={childrenNavigation} bgcolor="white" row={row} />
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell align="center" colSpan={columnsAdmin.length + 1} sx={{ p: 0 }}>
                      <CustomAlertComponent severity="info" message={`No ${isAdminsTable ? 'App administrators' : 'App managers'}`} sx={{ p: 0 }} />
                    </TableCell>
                  </TableRow>
                )}

                <CustomTablePaginationComponent
                  columnsLength={columnsAdmin.length + 1}
                  data={data}
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
    ),
    [
      columnsAdmin,
      handleChangeRole,
      handleDeactivate,
      handleOpenModal,
      isAppAdmin,
      isMobile,
    ]
  );

  return (
    <>
      <Box sx={{ mt: isMobile ? 1 : 2, minWidth: '100%', bgcolor: '#f1f1f1' }}>
        <Grid container spacing={0}>
          {renderTable({
            title: 'App Administrators',
            data: listAdmins,
            page: pageAdmin,
            rowsPerPage: rowsPerPageAdmin,
            handleChangePage: handleChangePageAdmin,
            handleChangeRowsPerPage: handleChangeRowsPerPageAdmin,
            isAdminsTable: true,
          })}
          {renderTable({
            title: 'App Managers',
            data: listAppManagers,
            page: pageManager,
            rowsPerPage: rowsPerPageManager,
            handleChangePage: handleChangePageManager,
            handleChangeRowsPerPage: handleChangeRowsPerPageManager,
            isAdminsTable: false,
          })}
        </Grid>
      </Box>

      <ModalManageUserComponent user={selectedRow} open={openModal} handleClose={handleCloseModal} onSyncComplete={fetchInfo} />
    </>
  );
};

export default AppAdminsManagersComponent;
