import React, { useEffect, useState, useContext } from 'react';
import {
  Box,
  Grid,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Modal,
  Typography,
  Button
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import { Badge } from 'react-bootstrap';
import { Visibility, FileCopy, Delete } from '@mui/icons-material';
import AddIcon from '@mui/icons-material/Add';
import SmartButtonIcon from '@mui/icons-material/SmartButton';
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
import QuoteDetailsComponent from '../../../QuoteDetails/components/QuoteDetailsComponent/QuoteDetailsComponent';
import ListStocksComponent from '../../../Stock/components/ListStocksComponent/ListStocksComponent';
import GroupStockRowComponent from '../../../Stock/components/GroupStockRowComponent/GroupStockRowComponent';

const columns = [
  { field: 'created_at', headerName: 'Date', width: 20 },
  { field: 'status', headerName: 'Status', width: 20 },
  { field: 'id', headerName: 'Quote #', width: 20 },
  { field: 'job_name', headerName: 'Job Name', width: 20 },
  { field: 'dealer_account', headerName: 'Dealer Account', width: 20 },
  { field: 'owner', headerName: 'Created By', width: 20 },
  { field: 'total_sell', headerName: 'Total Sell', width: 20 },
  { field: 'total_cost', headerName: 'Total Cost', width: 20 },
  { field: 'updated_at', headerName: 'Last Modified', width: 20 },
];

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

  useEffect(() => {
    document.title = 'Dealer Portal | Quotes';
    const user = JSON.parse(localStorage.getItem('userLogged') || '{}');
    if (user.data?.id) {
      const payload = { user_id: user.data.id };
      fetchQuotes(payload);
    }
  }, []);

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
    }));
    setTableData(rows);
  }, [filteredQuotes]);

  const fetchQuotes = async (payload) => {
    try {
      const response = await fetchWithToken(`${apiUrl}/api-dealerportal-quotes/`, 'GET', payload, {}, apiUrl);
      if (response.status === 200) {
        setQuotes(response.data.data);
        setFilteredQuotes(response.data.data);
      } else {
        throw new Error(`Failed to fetch data`);
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

  const handleDelete = () => {
    Swal.fire({
      title: 'Hello World!',
      text: 'This is a small alert!',
      icon: 'success',
      confirmButtonText: 'Cool',
      customClass: {
        popup: 'small-popup',
        title: 'small-title',
        icon: 'custom-icon',
        content: 'small-content',
        confirmButton: 'small-confirm-button'
      }
    });
  };

  const handleOpenQuoteDetails = (quote) => {
    console.log('quote', quote);
    setIsQuoteSelected(true);
    setQuoteSelected(quote);
    navigate(`${apiFrontendRoot}/quote_details`, { state: { quote: quote } });
  };

  const configCustomFilter = {
    filter: filter,
    handleFilterChange: handleFilterChange,
    listValues: [{ value: 'all', label: 'All Quotes' }],
    hasSearch: false,
    marginBottomInDetails: '10px'
  };
  

  const childrenNavigationRightButton = [
    { label: 'View', icon: <Visibility sx={{ marginRight: 1 }} />, visibility: true, noBorder: true },
    { label: 'Clone', icon: <FileCopy sx={{ marginRight: 1 }} />, visibility: true, noBorder: true },
    { label: 'Delete', icon: <Delete sx={{ marginRight: 1 }} />, onClick: handleDelete, visibility: true, noBorder: true }
  ];

  const childrenNavigationUpButton = [
    { label: 'New Quote', icon: <AddIcon sx={{ marginRight: 1 }} />, onClick: handleOpenModalAdd, visibility: true, noBorder: false },
    { label: 'Smart Quote', icon: <i className="bi bi-robot me-2" style={{ marginRight: 1 }}></i>, onClick: handleOpenModalAddSmart, visibility: true, noBorder: false },
  ];

  if (loading) return <Box sx={{ mt: 3, minWidth: '100%', bgcolor: '#f1f1f1' }}>Loading...</Box>;
  if (error) return <Box sx={{ mt: 3, minWidth: '100%', bgcolor: '#f1f1f1' }}>Error: {error}</Box>;

  return (
    <>
      <Box sx={{ mt: 3, minWidth: '100%', bgcolor: '#f1f1f1' }}>
        {tableData.length > 0 && (
          <Grid container spacing={2}>
              <Grid item xs={12}>
                <Box>
                  <Grid container spacing={2}>
                    <Grid item xs={8}>
                      <CustomFilterComponent configCustomFilter={configCustomFilter} />
                    </Grid>
                    <Grid item xs={4}>
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                        <NavigationButtonComponent children={childrenNavigationUpButton} bgcolor='white' />
                      </Box>
                    </Grid>
                  </Grid>
                </Box>
                <TableContainer sx={{ minWidth: '100%', bgcolor: 'white', borderRadius: '10px', mb: 2, maxHeight: 'calc(100vh - 180px)', overflowY: 'auto' }}>
                  <Table>
                    <TableHead sx={{ maxHeight: '20px', p: 0 }}>
                      <TableRow>
                        {columns.map((column) => (
                          <TableCell key={column.field}><b>{column.headerName}</b></TableCell>
                        ))}
                        <TableCell><b>Actions</b></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {tableData.map((row) => (
                        <TableRow key={row.id} className={classes.row}
                          sx={{ cursor: 'pointer' }}
                          onClick={() => handleOpenQuoteDetails(row)}>
                          {columns.map((column) => (
                            <TableCell key={column.field}>
                              {column.field.includes('status') ? (
                                <Badge bg={row[column.field] === 'active' ? 'success' : 'error'} style={{ marginTop: 0, marginBottom: 10, fontSize: '0.75rem' }}>
                                  {row[column.field]}
                                </Badge>
                              ) : (
                                row[column.field]
                              )}
                            </TableCell>
                          ))}
                          <TableCell>
                            <NavigationButtonComponent children={childrenNavigationRightButton} bgcolor='white' />
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
              </Grid>
          </Grid>
        )}
      </Box>
      <ModalAddQuoteComponent open={openModalAdd} handleClose={handleCloseModlAdd} />
      <ModalAddSmartQuoteComponent open={openModalAddSmart} handleClose={handleCloseModlAddSmart} />
    </>
  );
};

export default ListQuotesComponent;
