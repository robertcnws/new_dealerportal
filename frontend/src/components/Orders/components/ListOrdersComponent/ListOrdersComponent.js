import React, { useEffect, useState, useContext, useCallback } from 'react';
import {
  Box,
  Grid,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import { Badge } from 'react-bootstrap';
import { Visibility, Delete } from '@mui/icons-material';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import { fetchWithToken } from '../../../../utils';
import { apiUrl, numberRows, apiFrontendRoot } from '../../../../config';
import NavigationButtonComponent from '../../../Utils/components/NavigationButtonComponent/NavigationButtonComponent';
import CustomFilterComponent from '../../../Utils/components/CustomFilterComponent/CustomFilterComponent';
import { SearchContext } from '../../../SearchContextComponent/SearchContextComponent';
import CustomTablePaginationComponent from '../../../Utils/components/CustomTablePaginationComponent/CustomTablePaginationComponent';
import CustomAlertComponent from '../../../Utils/components/CustomAlertComponent/CustomAlertComponent';
import CustomDateComponent from '../../../Utils/components/CustomDateComponent/CustomDateComponent';

const useStyles = makeStyles({
  row: {
    '&:hover': {
      backgroundColor: '#f9f9f5',
    },
  },
});

const ListOrdersComponent = () => {
  const classes = useStyles();
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(numberRows);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { searchTermGlobal } = useContext(SearchContext);
  const [isOrderSelected, setIsOrderSelected] = useState(false);
  const [orderSelected, setOrderSelected] = useState(null);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const columns = [
    { field: 'created_at', headerName: 'Date', width: isMobile ? 100 : 20 },
    { field: 'status', headerName: 'Status', width: isMobile ? 100 : 20 },
    { field: 'quote_name', headerName: 'Quote Name', width: isMobile ? 100 : 20 },
    ...(!isMobile ? [
      { field: 'id', headerName: 'Order #', width: 20 },
      { field: 'quote_id', headerName: 'Quote #', width: 20 },
      { field: 'ordered_by', headerName: 'Ordered By', width: 20 },
      { field: 'total_sell', headerName: 'Total Sell', width: 20 },
      { field: 'total_cost', headerName: 'Total Cost', width: 20 },
      { field: 'updated_at', headerName: 'Last Modified', width: 20 },
    ] : [])
  ];

  const fetchOrders = useCallback(async (payload) => {
    try {
      const response = await fetchWithToken(`${apiUrl}/dealerportal-orders/`, 'GET', payload, {}, apiUrl);
      if (response.status === 200) {
        setOrders(response.data.data);
        setFilteredOrders(response.data.data);
      } else {
        throw new Error(`Failed to fetch data`);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const filterOrders = useCallback((filter, searchTerm) => {
    const normalizedSearchTerm = searchTerm ? searchTerm.toLowerCase() : '';
    return orders.filter(order => {
      const matchesSearchTerm = [
        order.status,
        order.created_at,
        order.quote.name,
        order.owner.first_name,
        order.owner.last_name,
        order.quote.total_sell.toString(),
        order.quote.total_cost.toString(),
        order.updated_at
      ].some(field => field?.toLowerCase().includes(normalizedSearchTerm));

      return filter === 'all' ? matchesSearchTerm : matchesSearchTerm;
    });
  }, [orders]);

  useEffect(() => {
    document.title = 'Dealer Portal | Orders';
    const user = JSON.parse(localStorage.getItem('userLogged') || '{}');
    const userId = user.data?.id;

    if (userId) {
      const payload = { user_id: userId };
      const fetchOrdersWithPayload = () => fetchOrders(payload);
      fetchOrdersWithPayload();
      const intervalId = setInterval(fetchOrdersWithPayload, 5000);
      return () => clearInterval(intervalId);
    }
  }, [fetchOrders]);

  useEffect(() => {
    const filteredList = filterOrders(filter, searchTermGlobal);
    setFilteredOrders(filteredList);
  }, [filter, searchTermGlobal, filterOrders]);

  useEffect(() => {
    const rows = filteredOrders.map(order => ({
      id: order.id,
      created_at: order.created_at ? order.created_at.split('T')[0] : '',
      status: order.status,
      quote_name: order.quote.name,
      quote_id: order.quote.id,
      ordered_by: `${order.owner.first_name} ${order.owner.last_name}`,
      total_sell: order.quote.total_sell,
      total_cost: order.quote.total_cost,
      markup_total: order.quote.markup_total,
      mark_up: order.quote.markup,
      updated_at: order.updated_at,
      products: order.quote.products,
      quote: order.quote
    }));

    setTableData(rows);
  }, [filteredOrders]);

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

  const handleOpenOrderDetails = (order) => {
    setIsOrderSelected(true);
    setOrderSelected(order);
    navigate(`${apiFrontendRoot}/order-details`, { state: { order: order } });
  };

  const handleDeleteOrder = async (order) => {
    const customClassSwal = {
      popup: 'small-popup',
      title: 'small-title',
      icon: 'custom-icon',
      content: 'small-content',
      confirmButton: 'small-confirm-button'
    }
    try {
      Swal.fire({
        title: 'Are you sure?',
        text: `You will not be able to recover order # ${order.id}!`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'No, keep it',
        customClass: customClassSwal
      }).then(async (result) => {
        if (result.isConfirmed) {
          const user = JSON.parse(localStorage.getItem('userLogged'));
          const payload = {
            user_id: user.data.id
          };
          const response = await fetchWithToken(`${apiUrl}/dealerportal/orders/delete/${order.id}/`, 'POST', payload, {}, apiUrl);
          if (response.status === 200) {
            Swal.fire({
              title: `${response.data.data.info}`,
              text: `${response.data.data.message}`,
              icon: 'success',
              confirmButtonText: 'OK',
              customClass: customClassSwal,
              willClose: () => {
                const newOrders = orders.filter(q => q.id !== order.id);
                setOrders(newOrders);
                setFilteredOrders(newOrders);
              }
            });
          } else {
            throw new Error('Failed to delete order');
          }
        }
      });
    } catch (err) {
      Swal.fire({
        title: 'Error',
        text: 'Failed to delete order',
        icon: 'error',
        confirmButtonText: 'Accept',
        customClass: customClassSwal
      });
    }
  };

  const configCustomFilter = {
    filter: filter,
    handleFilterChange: handleFilterChange,
    listValues: [{ value: 'all', label: 'All Orders' }],
    hasSearch: false,
    marginBottomInDetails: '10px'
  };

  const childrenNavigationRightButton = [
    { label: 'View', icon: <Visibility sx={{ marginRight: 1 }} />, onClick: handleOpenOrderDetails, visibility: true, noBorder: true },
    { label: 'Delete', icon: <Delete sx={{ marginRight: 1 }} />, onClick: handleDeleteOrder, visibility: true, noBorder: true }
  ];

  if (loading) return <Box sx={{ mt: isMobile ? 1 : -3, ml: isMobile ? 0 : 4, minWidth: '100%', bgcolor: '#f1f1f1' }}>Loading...</Box>;
  if (error) return <Box sx={{ mt: isMobile ? 1 : -3, ml: isMobile ? 0 : 4, minWidth: '100%', bgcolor: '#f1f1f1' }}>Error: {error}</Box>;

  return (
      <Box sx={{ mt: isMobile ? 1 : -3, ml: isMobile ? 0 : -1, minWidth: '100%', bgcolor: '#f1f1f1', p: 0 }}>
        {tableData.length > 0 ? (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Box>
                <Grid container spacing={2}>
                  <Grid item xs={8}>
                    <CustomFilterComponent configCustomFilter={configCustomFilter} sx={{ ml: isMobile ? 0 : 4 }} />
                  </Grid>
                </Grid>
              </Box>
              <TableContainer sx={{
                minWidth: isMobile ? '104%' : '100%',
                bgcolor: 'white',
                borderRadius: '10px',
                mb: 0,
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
                    ).map((row) => (
                      <TableRow key={row.id} className={classes.row}
                        sx={{ cursor: 'pointer', p: 1 }}
                      >
                        {columns.map((column) => (
                          <TableCell key={column.field} onClick={() => handleOpenOrderDetails(row)} sx={{ p: 1 }}>
                            {column.field.includes('status') ? (
                              <Badge bg={row[column.field] === 'accepted' || row[column.field] === 'completed' || row[column.field] === 'paid' ? 'success' :
                                (row[column.field] === 'pending' ? 'info' :
                                  (row[column.field] === 'canceled' ? 'danger' : 'primary'))}
                                style={{ marginTop: 0, marginBottom: 10, fontSize: '0.75rem' }}>
                                {row[column.field]}
                              </Badge>
                            ) : (
                              !['created_at', 'updated_at'].includes(column.field) ? row[column.field] :
                                <CustomDateComponent date={new Date(row[column.field])} formatType={isMobile ? 'short' : null} />
                            )}
                          </TableCell>
                        ))}
                        <TableCell sx={{ p: 1 }}>
                          <NavigationButtonComponent children={childrenNavigationRightButton} bgcolor='white' row={row} />
                        </TableCell>
                      </TableRow>
                    ))}
                    <CustomTablePaginationComponent
                      columnsLength={columns.length + 1}
                      data={filteredOrders}
                      page={page}
                      rowsPerPage={rowsPerPage}
                      handleChangePage={handleChangePage}
                      handleChangeRowsPerPage={handleChangeRowsPerPage}
                    />
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
          </Grid>
        ) : (
          <CustomAlertComponent severity='warning' title='No orders found' message='No orders found, proceed to create Quotes and place orders'
            sx={{ ml: isMobile ? 0 : 4, width: '100%' }} />
        )}
      </Box>
  );
};

export default ListOrdersComponent;
