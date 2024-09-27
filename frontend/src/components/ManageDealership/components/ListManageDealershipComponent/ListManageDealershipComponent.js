import React, { useEffect, useState, useContext } from 'react';
import { SearchContext } from '../../../SearchContextComponent/SearchContextComponent';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Settings,
  DisabledByDefaultTwoTone,
  FlashOnOutlined
} from '@mui/icons-material';
import AddIcon from '@mui/icons-material/Add';
import { makeStyles } from '@mui/styles';
import { Badge } from 'react-bootstrap';
import Swal from 'sweetalert2';
import { fetchWithToken } from '../../../../utils';
import { apiUrl, apiFrontendRoot, numberRows } from '../../../../config';
import { staticUrl } from '../../../../config';
import CustomFilterComponent from '../../../Utils/components/CustomFilterComponent/CustomFilterComponent';
import CustomTablePaginationComponent from '../../../Utils/components/CustomTablePaginationComponent/CustomTablePaginationComponent';
import NavigationButtonComponent from '../../../Utils/components/NavigationButtonComponent/NavigationButtonComponent';
import ModalCreateNewUserComponent from '../ModalCreateNewUserComponent/ModalCreateNewUserComponent';
import CustomAlertComponent from '../../../Utils/components/CustomAlertComponent/CustomAlertComponent';



const useStyles = makeStyles({
  row: {
    '&:hover': {
      backgroundColor: '#f9f9f5', // Cambia esto por el color que desees
    },
  },
});

const ListManageDealershipComponent = () => {
  const classes = useStyles();
  const [dealerships, setDealerships] = useState([]);
  const [filteredDealerships, setFilteredDealerships] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(numberRows);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { searchTermGlobal } = useContext(SearchContext);
  const [openModalAdd, setOpenModalAdd] = useState(false);
  const handleOpenModalAdd = () => setOpenModalAdd(true);
  const handleCloseModalAdd = () => setOpenModalAdd(false);
  const [isDealershipSelected, setIsDealershipSelected] = useState(false);
  const [dealershipSelected, setDealershipSelected] = useState(null);
  const navigate = useNavigate();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  // const isMobile = useMediaQuery('(max-width:999px)');

  const columns = [
    { field: 'status', headerName: 'Status', width: isMobile ? 80 : 100 },
    { field: 'logo', headerName: 'Logo', width: isMobile ? 60 : 80 },
    { field: 'account_name', headerName: 'Account Name', width: 120 },
    ...(!isMobile ? [
      { field: 'id', headerName: 'ID', width: 80 },
      { field: 'phone', headerName: 'Phone', width: 120 },
      { field: 'tier', headerName: 'Tier', width: 120 },
      { field: 'dealer_admin', headerName: 'Dealer Admin', width: 100 }
    ] : []),
  ];

  useEffect(() => {
    document.title = 'Dealer Portal | Dealerships';
    const user = JSON.parse(localStorage.getItem('userLogged') || '{}');
    if (user.data?.id) {
      const payload = { user_id: user.data.id };
      fetchDealerships(payload);
    }
  }, []);

  useEffect(() => {
    const filteredList = filterDealerships(filter, searchTermGlobal);
    setFilteredDealerships(filteredList);
  }, [filter, searchTermGlobal, dealerships]);

  useEffect(() => {
    const rows = filteredDealerships.map(dealership => ({
      id: dealership.id,
      status: dealership.is_active ? 'active' : 'inactive',
      logo: dealership.logo,
      account_name: dealership.name,
      phone: dealership.company_phone,
      tier: dealership.pricing_tier,
      dealer_admin: `${dealership.dealer_admin?.first_name ? dealership.dealer_admin.first_name : ''} ${dealership.dealer_admin?.last_name ? dealership.dealer_admin.last_name : ''}`,
      address: dealership.company_address,
      email: dealership.zoho_email,
      zoho_id: dealership.zoho_id,
    }));
    setTableData(rows);
  }, [filteredDealerships]);

  const fetchDealerships = async (payload) => {
    try {
      const response = await fetchWithToken(`${apiUrl}/dealerportal/dealerships/`, 'GET', payload, {}, apiUrl);
      if (response.status === 200) {
        setDealerships(response.data.data);
        setFilteredDealerships(response.data.data);
        // console.log('response.data.data', response.data.data);
      } else {
        throw new Error(`Failed to fetch data`);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filterDealerships = (filter, searchTerm) => {
    const normalizedSearchTerm = searchTerm ? searchTerm.toLowerCase() : '';
    return dealerships.filter(dealership => {
      const matchesSearchTerm = [
        dealership.id.toString(),
        dealership.status,
        dealership.name,
        dealership.company_phone,
        dealership.pricing_tier,
        dealership?.dealer_admin?.first_name,
        dealership?.dealer_admin?.last_name,
        dealership.company_address,
        dealership.zoho_email,
        dealership.zoho_id
      ].some(field => field?.toLowerCase().includes(normalizedSearchTerm));

      return filter === 'all' ? matchesSearchTerm : matchesSearchTerm;
    });
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
    localStorage.setItem('itemListPage', newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    const rows = parseInt(event.target.value, 10);
    setRowsPerPage(rows);
    localStorage.setItem('itemListRowsPerPage', rows);
    setPage(0);
  };

  const handleFilterChange = (e) => {
    const newFilter = e.target.value;
    setFilter(newFilter);
  };

  const handleOpenDealershipDetails = (dealership) => {
    setIsDealershipSelected(true);
    setDealershipSelected(dealership);
    navigate(`${apiFrontendRoot}/dealership-details`, { state: { dealership: dealership } });
  };


  const handleDeactivateDealership = async (dealership) => {
    const customClassSwal = {
      popup: 'small-popup',
      title: 'small-title',
      icon: 'custom-icon',
      content: 'small-content',
      confirmButton: 'small-confirm-button'
    }
    try {
      console.log('dealership', dealership);
      const isActive = dealership.status === 'active';
      const action = isActive ? 'deactivate' : 'activate';
      const actionIng = isActive ? 'deactivating' : 'activating';
      const iconType = isActive ? 'warning' : 'info';
      Swal.fire({
        title: `Are you sure?`,
        text: `You are ${actionIng} dealership ${dealership.account_name}!`,
        icon: iconType,
        showCancelButton: true,
        confirmButtonText: `Yes, ${action} it!`,
        cancelButtonText: 'No, keep it',
        customClass: customClassSwal,
      }).then(async (result) => {
        if (result.isConfirmed) {
          const user = JSON.parse(localStorage.getItem('userLogged'));
          const payload = {
            user_id: user.data.id
          };
          const response = await fetchWithToken(`${apiUrl}/dealerportal/manage-dealership/status/${dealership.id}/`, 'POST', payload, {}, apiUrl);
          if (response.status === 200) {
            if (!response.data.error) {
              Swal.fire({
                title: `${response.data.info.toUpperCase()}`,
                text: `${response.data.message}`,
                icon: 'success',
                confirmButtonText: 'OK',
                customClass: customClassSwal,
                willClose: () => {
                  fetchDealerships();
                }
              });
            } else {
              Swal.fire({
                title: 'Error',
                text: `${response.data.message}`,
                icon: 'error',
                confirmButtonText: 'Cool',
                customClass: customClassSwal
              });
            }
          } else {
            Swal.fire({
              title: 'Error',
              text: `${response.data.message}`,
              icon: 'error',
              confirmButtonText: 'Cool',
              customClass: customClassSwal
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
        customClass: customClassSwal
      });
    }
  };


  const configCustomFilter = {
    filter: filter,
    handleFilterChange: handleFilterChange,
    listValues: [{ value: 'all', label: 'All Dealerships' }],
    hasSearch: false,
    marginBottomInDetails: '10px'
  };




  const childrenNavigationUpButton = [
    { label: 'New Dealership', icon: <AddIcon sx={{ marginRight: 1 }} />, onClick: handleOpenModalAdd, visibility: true, noBorder: false },
  ];

  if (loading) return <Box sx={{
    mt: isMobile ? 1 : -3,
    ml: isMobile ? 0 : 4,
    minWidth: '100%',
    bgcolor: '#f1f1f1'
  }}>
    Loading...
  </Box>;
  if (error) return <Box sx={{
    mt: isMobile ? 1 : -3,
    ml: isMobile ? 0 : 4,
    minWidth: '100%',
    bgcolor: '#f1f1f1'
  }}>
    Error: {error}
  </Box>;

  return (
    <>
      <Box sx={{ mt: isMobile ? 1 : -3, minWidth: '100%', bgcolor: '#f1f1f1' }}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Box sm={{ display: 'flex', minWidth: '100%' }}>
              <Grid container spacing={2}>
                {!isMobile ? (
                  <>
                    <Grid item xs={12} sm={11}>
                      {tableData.length > 0 ? (
                        <CustomFilterComponent configCustomFilter={configCustomFilter} sx={{ ml: 4 }} />
                      ) : (
                        <>
                          {dealerships.length > 0 && (
                            <CustomFilterComponent configCustomFilter={configCustomFilter} sx={{ ml: 4 }} />
                          )}
                          < CustomAlertComponent
                            severity='warning'
                            title='No dealerships found'
                            message={dealerships.length === 0 ? 'Proceed to create Dealerships in the next button' : ''}
                            sx={{ mb: 2, ml: 5 }}
                          />
                        </>
                      )}
                    </Grid>
                    <Grid item xs={12} sm={1}>
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2, mr: -3 }}>
                        <NavigationButtonComponent children={childrenNavigationUpButton} bgcolor='white' />
                      </Box>
                    </Grid>
                  </>
                ) : (
                  <>
                    <Grid item xs={10} sm={10}>
                      {tableData.length > 0 ? (
                        <CustomFilterComponent configCustomFilter={configCustomFilter} />
                      ) : (
                        <>
                          {dealerships.length > 0 && (
                            <CustomFilterComponent configCustomFilter={configCustomFilter} />
                          )}
                          < CustomAlertComponent
                            severity='warning'
                            title='No dealerships found'
                            message={dealerships.length === 0 ? 'Proceed to create Dealerships in the next button' : ''}
                            sx={{ mb: 2, ml: 5 }}
                          />
                        </>
                      )}
                    </Grid>
                    <Grid item xs={2} sm={2}>
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2, mr: 1 }}>
                        <NavigationButtonComponent children={childrenNavigationUpButton} bgcolor='white' />
                      </Box>
                    </Grid>
                  </>
                )}
              </Grid>
            </Box>
            {tableData.length > 0 && (
              <TableContainer sx={{
                minWidth: isMobile ? '104%' : '100%',
                bgcolor: 'white',
                borderRadius: '10px',
                mb: 0,
                // mr: isMobile ? -4 : -3,
                ml: isMobile ? -1 : 4,
                maxHeight: 'calc(100vh - 180px)',
                overflowY: 'auto'
              }}>
                <Table stickyHeader>
                  <TableHead sx={{ maxHeight: '20px', p: 0, border: '1px solid #ddd' }}>
                    <TableRow sx={{ border: '1px solid #ddd', p: 1 }}>
                      {columns.map((column) => (
                        <TableCell key={column.field} sx={{ bgcolor: '#f1f1f9', p: 1 }}><b>{column.headerName}</b></TableCell>
                      ))}
                      <TableCell sx={{ bgcolor: '#f1f1f9', p: 1 }}><b>Actions</b></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(rowsPerPage > 0
                      ? tableData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      : tableData
                    ).map((row) => {

                      const childrenNavigationRightButton = [
                        {
                          label: 'Manage',
                          icon: <Settings sx={{ marginRight: 1 }} />,
                          onClick: handleOpenDealershipDetails,
                          visibility: true,
                          noBorder: true
                        },
                        {
                          label: row['status'] === 'active' ? 'Deactivate' : 'Activate',
                          icon: row['status'] === 'active' ? <DisabledByDefaultTwoTone sx={{ marginRight: 1 }} /> : <FlashOnOutlined sx={{ marginRight: 1 }} />,
                          onClick: handleDeactivateDealership,
                          visibility: true,
                          noBorder: true
                        }
                      ];

                      return (

                        <TableRow key={row.id} className={classes.row}
                          sx={{ cursor: 'pointer', p: 1 }}
                        >
                          {columns.map((column) => (
                            <TableCell key={column.field} onClick={() => handleOpenDealershipDetails(row)} sx={{ p: 1 }}>
                              {column.field.includes('status') ? (
                                <Badge bg={row[column.field] === 'active' ? 'success' : 'danger'}
                                  style={{ marginTop: 0, marginBottom: 10, fontSize: '0.75rem' }}>
                                  {row[column.field]}
                                </Badge>
                              ) : (
                                <>
                                  {column.field.includes('logo') ? (
                                    <img src={row[column.field] ?
                                      `${staticUrl}${row[column.field].includes('dealership.png') ? '/images/' : '/'}${row[column.field]}` : ''}
                                      alt='logo' style={{ width: '50px', height: '50px', borderRadius: '50%' }} />
                                  ) : (
                                    row[column.field]
                                  )}
                                </>
                              )}
                            </TableCell>
                          ))}
                          <TableCell sx={{ p: 1 }}>
                            <NavigationButtonComponent children={childrenNavigationRightButton} bgcolor='white' row={row} />
                          </TableCell>
                        </TableRow>
                      )
                    }
                    )}
                    <CustomTablePaginationComponent
                      columnsLength={columns.length + 1}
                      data={filteredDealerships}
                      page={page}
                      rowsPerPage={rowsPerPage}
                      handleChangePage={handleChangePage}
                      handleChangeRowsPerPage={handleChangeRowsPerPage}
                    />
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Grid>
        </Grid>
      </Box>
      <ModalCreateNewUserComponent open={openModalAdd} handleClose={handleCloseModalAdd} onSyncComplete={fetchDealerships} />
    </>
  );
}

export default ListManageDealershipComponent;
