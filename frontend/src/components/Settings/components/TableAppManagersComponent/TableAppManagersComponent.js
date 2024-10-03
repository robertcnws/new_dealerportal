import React, { useState } from 'react';
import { Box, Typography, useTheme, useMediaQuery, TableContainer, Table, TableHead, TableRow, TableCell, TableBody } from '@mui/material';
import { FlashOnOutlined, PowerSettingsNewOutlined } from '@mui/icons-material';
import { Badge } from 'react-bootstrap';
import Swal from 'sweetalert2';
import DateDifferenceComponent from '../../../Utils/components/DateDifferenceComponent/DateDifferenceComponent';
import NavigationButtonComponent from '../../../Utils/components/NavigationButtonComponent/NavigationButtonComponent';
import ModalManageUserComponent from '../../../ManageDealership/components/MainDealershipAccountComponent/components/ModalManageUserComponent/ModalManageUserComponent';
import { fetchWithToken } from '../../../../utils';
import { apiUrl, numberRows } from '../../../../config';
import CustomTablePaginationComponent from '../../../Utils/components/CustomTablePaginationComponent/CustomTablePaginationComponent';

const TableAppManagersComponent = ({ managers, setManagers, onSyncComplete }) => {

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const user = JSON.parse(localStorage.getItem('userLogged') || '{}');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(numberRows);

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

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    const rows = parseInt(event.target.value, 10);
    setRowsPerPage(rows);
    setPage(0);
  };

  const handleDeactivate = async (row) => {
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
          const url = `${apiUrl}/app_settings/dealeportal/users/change_auth_status/${row.id}/`;
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
                    onSyncComplete(payload);
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

  const handlePromote = async (row) => {
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
          const url = `${apiUrl}/app_settings/dealeportal/users/change_auth_role/${row.id}/`;
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
                    onSyncComplete(payload);
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

  const columns = [
    { field: 'status', headerName: 'Status', width: 100 },
    { field: 'username', headerName: 'Username', width: 150 },
    { field: 'full_name', headerName: 'Full Name', width: 150 },
    ...(!isMobile ? [
      { field: 'email', headerName: 'Email', width: 150 },
      { field: 'last_login', headerName: 'Last Login', width: 150 },
    ] : []),
  ];

  return (
    <>
      {managers && (
        <>
          <Box sx={{ mb: 1 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', ml: isMobile ? 0 : 2 }}>
              <Typography variant="h6" sx={{ fontSize: '20px', p: 1 }}>
                App Managers
              </Typography>
              <Box sx={{ p: 1, bgcolor: 'white', borderRadius: '8px' }}>
                <TableContainer>
                  <Table aria-label="simple table">
                    <TableHead sx={{ maxHeight: '20px', p: 0, border: '1px solid #ddd' }}>
                      <TableRow>
                        {columns.map((column) => (
                          <TableCell key={`${column.field}-DealerAdmin`} align="center" sx={{ bgcolor: '#f1f1f9', p: 1 }}>
                            {column.headerName}
                          </TableCell>
                        ))}
                        <TableCell align="center" sx={{ bgcolor: '#f1f1f9', p: 1 }}>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {managers && (rowsPerPage > 0
                        ? managers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                        : managers
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
                            label: 'Promote to Admin',
                            icon: <i className="bi bi-shield-fill-x" style={{ marginRight: 10 }}></i>,
                            onClick: () => handlePromote(row),
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
                                <TableCell key={`${row?.id}-${row?.last_login}${row?.index}`} align="center" sx={{ p: 0, cursor: 'pointer' }} onClick={() => handleOpenModal(row)}>
                                  <DateDifferenceComponent dateString={row?.last_login} />
                                </TableCell>
                              </>
                            )}
                            <TableCell key={`${row?.id}-buttonsDealershipAdmin`} align="center" sx={{ p: 0 }}>
                              <NavigationButtonComponent children={childrenNavigationDealerAdmin} bgcolor='white' row={row} />
                            </TableCell>
                          </TableRow>
                        );
                      })}
                      <CustomTablePaginationComponent
                        columnsLength={columns.length + 1}
                        data={managers}
                        page={page}
                        rowsPerPage={rowsPerPage}
                        handleChangePage={handleChangePage}
                        handleChangeRowsPerPage={handleChangeRowsPerPage}
                      />
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            </Box>
          </Box>
          <ModalManageUserComponent user={selectedRow} open={openModal} handleClose={handleCloseModal} onSyncComplete={onSyncComplete} />
        </>
      )}
    </>
  );
}

export default TableAppManagersComponent;
