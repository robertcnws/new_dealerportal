import React, { useState, useEffect, useContext, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { apiUrl, apiFrontendRoot } from '../../../../config';
import { fetchWithToken } from '../../../../utils';
import { SearchContext } from '../../../SearchContextComponent/SearchContextComponent';
import GroupStockRowComponent from '../../../Stock/components/GroupStockRowComponent/GroupStockRowComponent';
import { Box, Grid, Table, TableBody, TableContainer, useTheme, useMediaQuery, Button } from '@mui/material';
import CustomFilterComponent from '../../../Utils/components/CustomFilterComponent/CustomFilterComponent';
import QuoteDetailsComponent from '../QuoteDetailsComponent/QuoteDetailsComponent';
import ButtonsbarComponent from '../ButtonsbarComponent/ButtonsbarComponent';
import ModalAddQuoteComponent from '../../../Quotes/components/ModalAddQuoteComponent/ModalAddQuoteComponent';
import { AddCircle, Visibility } from '@mui/icons-material';


const ListStocksQuoteDetailsComponent = ({ setIsLoadingOperation, isLoadingOperation }) => {

  const [stocks, setStocks] = useState([]);
  const [filteredStocks, setFilteredStocks] = useState([]);
  const [filter, setFilter] = useState('all');
  const [expandedItem, setExpandedItem] = useState(null);
  const [expandedGroups, setExpandedGroups] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { searchTermGlobal } = useContext(SearchContext);
  const location = useLocation();
  const navigate = useNavigate();
  const [quote, setQuote] = useState(null);
  const [quoteProducts, setQuoteProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [openModalEdit, setOpenModalEdit] = useState(false);
  const handleOpenModalEdit = (quote) => setOpenModalEdit(true);
  const handleCloseModalEdit = () => setOpenModalEdit(false);
  const [isItemGroupVisible, setIsItemGroupVisible] = useState(false);
  const [menuOpened, setMenuOpened] = useState(false);
  const sidebarRef = useRef(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  // const isMobile = useMediaQuery('(max-width:999px)');

  useEffect(() => {
    document.title = 'Dealer Portal | Stocks';
    fetchStocks();
    // const intervalId = setInterval(fetchStocks, 5000);
    // return () => clearInterval(intervalId);
  }, [menuOpened, fetchStocks]);

  useEffect(() => {
    const filteredList = filterStocks(filter, searchTermGlobal);
    setFilteredStocks(filteredList);
  }, [filter, searchTermGlobal]);

  useEffect(() => {
    const quote = location.state.quote;
    setQuote(quote);
    const fetchQuoteProductsInterval = () => {
      fetchQuoteProducts(quote);
    };
    fetchQuoteProductsInterval();
    const intervalId = setInterval(fetchQuoteProductsInterval, 1000);
    return () => clearInterval(intervalId);
  }, [location.state.quote, fetchQuoteProducts]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      const isClickInsideCustomFilter = event.target.closest('.custom-filter-component');
      if (sidebarRef.current && !sidebarRef.current.contains(event.target) && !isClickInsideCustomFilter) {
        setIsItemGroupVisible(false);
      }
    };
    if (isItemGroupVisible) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isItemGroupVisible, sidebarRef]);


  const fetchStocks = async () => {
    try {
      const response = await fetchWithToken(`${apiUrl}/dealerportal-check-stock/`, 'GET', null, {}, apiUrl);
      if (response.status !== 200) {
        throw new Error(`Failed to fetch data`);
      }
      setStocks(response.data.data);
      setFilteredStocks(response.data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchQuoteProducts = async (quote) => {
    try {
      const user = JSON.parse(localStorage.getItem('userLogged'));
      const payload = {
        user_id: user.data.id,
      };
      const response = await fetchWithToken(`${apiUrl}/dealerportal-quote-products/${quote.id}/`, 'GET', payload, {}, apiUrl);
      if (response.status !== 200) {
        throw new Error(`Failed to fetch quote products`);
      }
      setQuoteProducts(response.data.data.quote_products);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }



  const fetchQuoteChanges = async () => {
    const user = JSON.parse(localStorage.getItem('userLogged'));
    const payload = { user_id: user.data.id };
    const url = `${apiUrl}/dealerportal-get-quote/${quote.id}/`;
    const response = await fetchWithToken(url, 'POST', payload, {}, apiUrl);
    if (response.status === 200) {
      quote.job_name = response.data.data.quote.name;
      quote.total_sell = response.data.data.quote.total_sell;
      quote.total_cost = response.data.data.quote.total_cost;
      quote.markup_total = response.data.data.quote.markup_total;
      quote.mark_up = response.data.data.quote.markup;
      quote.id = response.data.data.quote.id;
      quote.owner = response.data.data.quote.owner;
      quote.owner_name = response.data.data.quote.owner.first_name + ' ' + response.data.data.quote.owner.last_name;
    }
    return quote;
  }

  const handleFilterChange = (e) => {
    const newFilter = e.target.value;
    setFilter(newFilter);
    const filteredList = filterStocks(newFilter);
    setFilteredStocks(filteredList);
    isMobile && setIsItemGroupVisible(true);
  }

  const filterStocks = (filter, searchTerm) => {
    const normalizedSearchTerm = searchTerm ? searchTerm.toLowerCase() : '';
    return stocks
      .map((stock) => {
        const filteredItems = stock.items.filter((item) => {
          const name = item.name ? item.name.toLowerCase() : '';
          const sku = item.sku ? item.sku.toLowerCase() : '';
          const description = item.description ? item.description.toLowerCase() : '';

          return name.includes(normalizedSearchTerm) ||
            sku.includes(normalizedSearchTerm) ||
            description.includes(normalizedSearchTerm);
        });

        if (filteredItems.length > 0) {
          let finalFilteredItems = filteredItems;

          if (filter !== 'all') {
            switch (filter) {
              case 'BG':
                finalFilteredItems = filteredItems.filter((item) =>
                  item.sku.includes('BG')
                );
                break;
              case 'WG':
                finalFilteredItems = filteredItems.filter((item) =>
                  item.sku.includes('WG')
                );
                break;
              case 'BGI':
                finalFilteredItems = filteredItems.filter((item) =>
                  item.sku.includes('BGI')
                );
                break;
              case 'WGI':
                finalFilteredItems = filteredItems.filter((item) =>
                  item.sku.includes('WGI')
                );
                break;
              default:
                break;
            }
          }
          if (finalFilteredItems.length > 0) {
            return {
              ...stock,
              items: finalFilteredItems,
            };
          }
        }
        setExpandedItem(null);
        return null;
      })
      .filter((stock) => stock !== null);
  };

  const handleSelection = (item, stock) => {
    selectedProducts.push(item);
    // console.log('selectedProducts', selectedProducts);
  };

  const getSelectedProducts = () => {
    return selectedProducts;
  };

  const onCloseDetails = () => {
    navigate(`${apiFrontendRoot}/quotes`);
  };

  const toggleSidebar = () => {
    setIsItemGroupVisible(!isItemGroupVisible);
  };

  const configCustomFilter = {
    filter: filter,
    handleFilterChange: handleFilterChange,
    listValues: [
      { value: 'all', label: 'All Items' },
      { value: 'BG', label: 'Bronce/ Gray' },
      { value: 'WG', label: 'White/ Gray' },
      { value: 'BGI', label: 'Bronce/ Gray (Privacy)' },
      { value: 'WGI', label: 'White/ Gray (Privacy)' },
    ],
    hasSearch: false,
    marginBottomInDetails: '10px'
  }

  if (!isMobile) {
    return (
      <>
        <Box sx={{
          mt: -3,
          minWidth: '100%',
          bgcolor: '#f1f1f1',
        }}>
          {stocks && quote && (

            <Grid container spacing={2}>
              {quote.status === 'active' && (
                <Grid item xs={4}>
                  <Box>
                    <CustomFilterComponent configCustomFilter={configCustomFilter} sx={{ ml: 3 }} />
                  </Box>
                  <TableContainer sx={{
                    minWidth: '100%',
                    bgcolor: 'white',
                    // borderRadius: '10px',
                    borderTop: '1px solid #ddd',
                    mb: 0,
                    ml: 3,
                    maxHeight: 'calc(100vh - 170px)',
                    overflowY: 'auto'
                  }}>
                    <Table>
                      <TableBody>
                        {filteredStocks.map((stock) => (
                          <GroupStockRowComponent
                            key={stock.id}
                            group={stock}
                            onSelection={handleSelection}
                            expandedItem={expandedItem}
                            expandedGroups={expandedGroups}
                            setExpandedGroups={setExpandedGroups}
                            isInQuoteDetails={true}
                            quote={quote}
                            quoteProducts={quoteProducts}
                            onSyncCompleted={() => fetchQuoteProducts(quote)}
                            setIsLoadingOperation={setIsLoadingOperation}
                            isLoadingOperation={isLoadingOperation}
                          // isSyncing={isSyncing}
                          // setIsSyncing={setIsSyncing}
                          />
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>
              )}
              <Grid item xs={quote.status === 'active' ? 8 : 12}>
                <Grid item container spacing={2} justifyContent="flex-end">
                  <Box sx={{ mt: 2, mb: 3, mr: -2 }}>
                    <ButtonsbarComponent quote={quote} onClose={onCloseDetails} onEdit={handleOpenModalEdit} />
                  </Box>
                </Grid>
                <Grid item container spacing={2}>
                  <Box sx={{ ml: 3, minWidth: '100.5%' }}>
                    <QuoteDetailsComponent
                      quote={quote}
                      quoteProducts={quoteProducts}
                      onSyncCompleted={() => fetchQuoteProducts(quote)}
                      setIsLoadingOperation={setIsLoadingOperation}
                      isLoadingOperation={isLoadingOperation}
                    />
                  </Box>
                </Grid>
              </Grid>
            </Grid>
          )}
        </Box >
        <ModalAddQuoteComponent open={openModalEdit} handleClose={handleCloseModalEdit} dataEdit={quote} onSyncEdit={fetchQuoteChanges} />
      </>
    );
  }
  return (
    <>
      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        mt: 0,
        minWidth: '100%',
        bgcolor: '#f1f1f1',
      }}>
        {stocks && quote && (
          <>
            <Box sx={{
              // display: 'flex-column',
              display: 'flex',
              position: 'sticky',
              top: '55px', // O cualquier valor para definir desde dónde debe pegarse
              bgcolor: 'white', // Asegúrate de que el fondo sea sólido para que el sticky se vea correctamente
              boxShadow: '0px 1px 1px rgba(0, 0, 0, 0.5)', // Opcional: agrega una sombra para mayor visibilidad
              zIndex: 1100, // Opcional: ajusta el índice z si el sticky se debe superponer a otros elementos
              width: !menuOpened ? '111%' : '120%',
              ml: -3,
              mt: -1,
              border: '1px solid lightgray',
            }}
            >
              {quote.status !== 'ordered' && (
                <Button onClick={toggleSidebar} sx={{ color: 'black', bgcolor: '#F2F2F2', mt: 1, ml: 2, mb: 1 }}>
                  <AddCircle />
                </Button>
              )}
              {quote.status === 'active' && (
                <Grid item container xs={12} spacing={2} ref={sidebarRef} sx={{
                  position: 'fixed',
                  left: isItemGroupVisible ? 0 : '-100%',
                  top: 0,
                  height: '100%',
                  width: '80%',
                  maxWidth: '400px',
                  bgcolor: '#fff',
                  boxShadow: 3,
                  transition: 'left 0.3s ease',
                  zIndex: 1300,
                  overflowY: 'auto',
                }}
                >
                  <Box className="custom-filter-component">
                    <Box sx={{ display: 'flex', mt: 12, ml: 5, mb: 2 }}>
                      <CustomFilterComponent configCustomFilter={configCustomFilter} isItemGroupToggle={true} />
                    </Box>
                    <TableContainer sx={{
                      minWidth: '100%',
                      bgcolor: 'white',
                      borderRadius: '10px',
                      borderTop: '1px solid #ddd',
                      mb: 2,
                      minHeight: 'calc(100vh - 180px)',
                      overflowY: 'auto'
                    }}>
                      <Table>
                        <TableBody>
                          {filteredStocks.map((stock) => (
                            <GroupStockRowComponent
                              key={stock.id}
                              group={stock}
                              onSelection={handleSelection}
                              expandedItem={expandedItem}
                              expandedGroups={expandedGroups}
                              setExpandedGroups={setExpandedGroups}
                              isInQuoteDetails={true}
                              quote={quote}
                              quoteProducts={quoteProducts}
                              onSyncCompleted={() => fetchQuoteProducts(quote)}
                              setIsLoadingOperation={setIsLoadingOperation}
                              isLoadingOperation={isLoadingOperation}
                            // isSyncing={isSyncing}
                            // setIsSyncing={setIsSyncing}
                            />
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Box>
                </Grid>
              )}

              <Grid container spacing={1}>
                <Grid item xs={12}>
                  <Grid container spacing={1} justifyContent="flex-end">
                    <Box sx={{ display: 'flex', mt: 2, mb: 0, ml: 5, mr: 0 }}>
                      <ButtonsbarComponent quote={quote} onClose={onCloseDetails} onEdit={handleOpenModalEdit} setMenuOpened={setMenuOpened} />
                    </Box>
                  </Grid>
                </Grid>
              </Grid>

            </Box>

            <Grid item container xs={12} spacing={2}>
              <Grid item xs={12}>
                <Grid item container spacing={2}>
                  <Box sx={{
                    ml: 0,
                    mr: -3,
                    width: '110%'
                  }}>
                    <QuoteDetailsComponent
                      quote={quote}
                      quoteProducts={quoteProducts}
                      onSyncCompleted={() => fetchQuoteProducts(quote)}
                      setIsLoadingOperation={setIsLoadingOperation}
                      isLoadingOperation={isLoadingOperation}
                    />
                  </Box>
                </Grid>
              </Grid>
            </Grid>
          </>
        )}

      </Box >
      <ModalAddQuoteComponent open={openModalEdit} handleClose={handleCloseModalEdit} dataEdit={quote} onSyncEdit={fetchQuoteChanges} />
    </>
  );
}

export default ListStocksQuoteDetailsComponent;