import React, { useEffect, useState, useContext, useRef } from 'react';
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
  useMediaQuery,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import { Badge } from 'react-bootstrap';
import { Visibility, FileCopy, Delete } from '@mui/icons-material';
import AddIcon from '@mui/icons-material/Add';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import { fetchWithToken } from '../../../../utils';
import { apiUrl, numberRows, apiFrontendRoot } from '../../../../config';
import NavigationButtonComponent from '../../../Utils/components/NavigationButtonComponent/NavigationButtonComponent';
import CustomFilterComponent from '../../../Utils/components/CustomFilterComponent/CustomFilterComponent';
import { SearchContext } from '../../../SearchContextComponent/SearchContextComponent';
import CustomTablePaginationComponent from '../../../Utils/components/CustomTablePaginationComponent/CustomTablePaginationComponent';
import ModalAddQuoteComponent from '../ModalAddQuoteComponent/ModalAddQuoteComponent';
import ModalAddSmartQuoteComponent from '../ModalSmartQuoteComponent/ModalSmartQuoteComponent';
import CustomAlertComponent from '../../../Utils/components/CustomAlertComponent/CustomAlertComponent';
import CustomDateComponent from '../../../Utils/components/CustomDateComponent/CustomDateComponent';



const useStyles = makeStyles({
  row: {
    '&:hover': {
      backgroundColor: '#f9f9f5', // Cambia esto por el color que desees
    },
  },
});

const ListQuotesComponent = () => {
  const classes = useStyles();
  const [quotes, setQuotes] = useState([]);
  const [filteredQuotes, setFilteredQuotes] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(numberRows);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { searchTermGlobal } = useContext(SearchContext);
  const [openModalAdd, setOpenModalAdd] = useState(false);
  const handleOpenModalAdd = () => setOpenModalAdd(true);
  const handleCloseModlAdd = () => setOpenModalAdd(false);
  const [openModalAddSmart, setOpenModalAddSmart] = useState(false);
  const handleOpenModalAddSmart = () => setOpenModalAddSmart(true);
  const handleCloseModlAddSmart = () => setOpenModalAddSmart(false);
  const [isQuoteSelected, setIsQuoteSelected] = useState(false);
  const [quoteSelected, setQuoteSelected] = useState(null);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isFetching = useRef(false);
  // const isMobile = useMediaQuery('(max-width:999px)');

  const columns = [
    { field: 'id', headerName: 'Quote #', width: 80 },
    { field: 'created_at', headerName: 'Date', width: isMobile ? 80 : 100 },
    { field: 'status', headerName: 'Status', width: isMobile ? 60 : 80 },
    { field: 'job_name', headerName: 'Job Name', width: 120 },
    ...(!isMobile ? [
      { field: 'dealer_account', headerName: 'Dealer Account', width: 120 },
      { field: 'owner', headerName: 'Created By', width: 120 },
      { field: 'total_sell', headerName: 'Total Sell', width: 100 },
      { field: 'total_cost', headerName: 'Total Cost', width: 100 },
      { field: 'updated_at', headerName: 'Last Modified', width: 120 },
    ] : []),
  ];

  useEffect(() => {
    document.title = 'Dealer Portal | Quotes';
    const user = JSON.parse(localStorage.getItem('userLogged') || '{}');

    if (user.data?.id) {
      const payload = { user_id: user.data.id };

      const fetchQuotesWithPayload = async () => {
        if (!isFetching.current) {
          isFetching.current = true;
          await fetchQuotes(payload);
          isFetching.current = false;
        }
      };
      fetchQuotesWithPayload();
      const intervalId = setInterval(() => {
        fetchQuotesWithPayload();
      }, 5000);
      return () => clearInterval(intervalId);
    }
  }, [filter]);


  useEffect(() => {
    const filteredList = filterQuotes(filter, searchTermGlobal);
    setFilteredQuotes(filteredList);
  }, [filter, searchTermGlobal, quotes]);



  useEffect(() => {
    const rows = filteredQuotes.map(quote => ({
      id: quote.id,
      created_at: quote.created_at ? quote.created_at.split('T')[0] : '',
      status: quote.status,
      job_name: quote.name,
      dealer_account: quote.owner.dealer_account?.name,
      owner: `${quote.owner.first_name} ${quote.owner.last_name}`,
      total_sell: quote.total_sell,
      total_cost: quote.total_cost,
      updated_at: quote.updated_at,
      mark_up: quote.markup,
      markup_total: quote.markup_total,
    }));
    setTableData(rows);
  }, [filteredQuotes]);

  const fetchQuotes = async (payload) => {
    try {
      const response = await fetchWithToken(`${apiUrl}/dealerportal-quotes/`, 'GET', payload, {}, apiUrl);

      if (response.status === 200) {
        const newQuotes = response.data.data;
        // Compare new data with existing quotes
        if (JSON.stringify(newQuotes) !== JSON.stringify(quotes)) {
          setQuotes(newQuotes);
          setFilteredQuotes(newQuotes);
        }
      } else {
        throw new Error('Failed to fetch data');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filterQuotes = (filter, searchTerm) => {
    const normalizedSearchTerm = searchTerm ? searchTerm.toLowerCase() : '';
    return quotes.filter(quote => {
      const matchesSearchTerm = [
        quote.status,
        quote.created_at,
        quote.name,
        quote.owner.dealer_account?.name,
        quote.owner.first_name,
        quote.owner.last_name,
        quote.total_sell.toString(),
        quote.total_cost.toString(),
        quote.updated_at
      ].some(field => field?.toLowerCase().includes(normalizedSearchTerm));

      return filter === 'all' ? matchesSearchTerm : quote.status === filter && matchesSearchTerm;
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

  const handleOpenQuoteDetails = (quote) => {
    setIsQuoteSelected(true);
    setQuoteSelected(quote);
    navigate(`${apiFrontendRoot}/quote-details`, { state: { quote: quote } });
  };

  const handleCloneQuote = async (quote) => {
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
        text: `You are about to clone quote # ${quote.id}!`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, clone it!',
        cancelButtonText: 'No, keep it',
        customClass: customClassSwal
      }).then(async (result) => {
        if (result.isConfirmed) {
          const user = JSON.parse(localStorage.getItem('userLogged'));
          const payload = {
            user_id: user.data.id
          };
          const response = await fetchWithToken(`${apiUrl}/dealerportal/quotes/clone/${quote.id}/`, 'POST', payload, {}, apiUrl);
          if (response.status === 200) {
            Swal.fire({
              title: !response.data.data.error ? `${response.data.data.info}` : `${response.data.data.error}`,
              text: `${response.data.data.message}`,
              icon: !response.data.data.error ? 'success' : 'error',
              confirmButtonText: 'OK',
              customClass: customClassSwal,
              
            });
          } else {
            throw new Error('Failed to clone quote');
          }
        }
      });
    } catch (err) {
      Swal.fire({
        title: 'Error',
        text: 'Failed to clone quote',
        icon: 'error',
        confirmButtonText: 'Cool',
        customClass: customClassSwal
      });
    }
  };


  const handleDeleteQuote = async (quote) => {
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
        text: `You will not be able to recover quote # ${quote.id}!`,
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
          const response = await fetchWithToken(`${apiUrl}/dealerportal/quotes/delete/${quote.id}/`, 'POST', payload, {}, apiUrl);
          if (response.status === 200) {
            Swal.fire({
              title: `${response.data.data.info}`,
              text: `${response.data.data.message}`,
              icon: 'success',
              confirmButtonText: 'OK',
              customClass: customClassSwal,
              willClose: () => {
                const newQuotes = quotes.filter(q => q.id !== quote.id);
                setQuotes(newQuotes);
                setFilteredQuotes(newQuotes);
              }
            });
          } else {
            throw new Error('Failed to delete quote');
          }
        }
      });
    } catch (err) {
      Swal.fire({
        title: 'Error',
        text: 'Failed to delete quote',
        icon: 'error',
        confirmButtonText: 'Cool',
        customClass: customClassSwal
      });
    }
  };


  const configCustomFilter = {
    filter: filter,
    handleFilterChange: handleFilterChange,
    listValues: [
      { value: 'all', label: 'All Quotes' },
      { value: 'active', label: 'Active Quotes' },
      { value: 'ordered', label: 'Ordered Quotes' },
      { value: 'inactive', label: 'Inactive Quotes' },
      { value: 'pending', label: 'Pending Quotes' },
    ],
    hasSearch: false,
    marginBottomInDetails: '10px'
  };


  const childrenNavigationRightButton = [
    { label: 'View', icon: <Visibility sx={{ marginRight: 1 }} />, onClick: handleOpenQuoteDetails, visibility: true, noBorder: true },
    { label: 'Clone', icon: <FileCopy sx={{ marginRight: 1 }} />, onClick: handleCloneQuote, visibility: true, noBorder: true },
    { label: 'Delete', icon: <Delete sx={{ marginRight: 1 }} />, onClick: handleDeleteQuote, visibility: true, noBorder: true }
  ];

  const childrenNavigationUpButton = [
    { label: 'New Quote', icon: <AddIcon sx={{ marginRight: 1 }} />, onClick: handleOpenModalAdd, visibility: true, noBorder: false },
    // { label: 'Smart Quote', icon: <i className="bi bi-robot me-2" style={{ marginRight: 1 }}></i>, onClick: handleOpenModalAddSmart, visibility: true, noBorder: false },
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
                          {quotes.length > 0 && (
                            <CustomFilterComponent configCustomFilter={configCustomFilter} sx={{ ml: 4 }} />
                          )}
                          < CustomAlertComponent
                            severity='warning'
                            title='No quotes found'
                            message={quotes.length === 0 ? 'Proceed to create Quotes in the next button' : ''}
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
                          {quotes.length > 0 && (
                            <CustomFilterComponent configCustomFilter={configCustomFilter} />
                          )}
                          < CustomAlertComponent
                            severity='warning'
                            title='No quotes found'
                            message={quotes.length === 0 ? 'Proceed to create Quotes in the next button' : ''}
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
                    ).map((row) => (
                      <TableRow key={row.id} className={classes.row}
                        sx={{ cursor: 'pointer', p: 1 }}
                      >
                        {columns.map((column) => (
                          <TableCell key={column.field} onClick={() => handleOpenQuoteDetails(row)} sx={{ p: 1 }}>
                            {column.field.includes('status') ? (
                              <Badge bg={row[column.field] === 'active' ? 'success' :
                                (row[column.field] === 'ordered' ? 'warning' : 'danger')}
                                style={{ marginTop: 0, marginBottom: 10, fontSize: '0.75rem' }}>
                                {row[column.field]}
                              </Badge>
                            ) : (
                              !['created_at', 'updated_at'].includes(column.field) ? row[column.field] : <CustomDateComponent date={new Date(row[column.field])} />
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
                      data={filteredQuotes}
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
      <ModalAddQuoteComponent open={openModalAdd} handleClose={handleCloseModlAdd} onSyncComplete={fetchQuotes} />
      <ModalAddSmartQuoteComponent open={openModalAddSmart} handleClose={handleCloseModlAddSmart} />
    </>
  );
};

export default ListQuotesComponent;
