import React, { useState, useEffect, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { apiUrl, apiFrontendRoot } from '../../../../config';
import { fetchWithToken } from '../../../../utils';
import { SearchContext } from '../../../SearchContextComponent/SearchContextComponent';
import GroupStockRowComponent from '../../../Stock/components/GroupStockRowComponent/GroupStockRowComponent';
import { Box, Grid, Table, TableBody, TableContainer, useTheme, useMediaQuery } from '@mui/material';
import CustomFilterComponent from '../../../Utils/components/CustomFilterComponent/CustomFilterComponent';
import QuoteDetailsComponent from '../QuoteDetailsComponent/QuoteDetailsComponent';
import ButtonsbarComponent from '../ButtonsbarComponent/ButtonsbarComponent';


const ListStocksQuoteDetailsComponent = ({ setIsLoadingOperation, isLoadingOperation }) => {

  const [stocks, setStocks] = useState([]);
  const [filteredStocks, setFilteredStocks] = useState([]);
  const [filter, setFilter] = useState('all');
  const [expandedItem, setExpandedItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { searchTermGlobal } = useContext(SearchContext);
  const location = useLocation();
  const navigate = useNavigate();
  const [quote, setQuote] = useState(null);
  const [quoteProducts, setQuoteProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    document.title = 'Dealer Portal | Stocks';
    fetchStocks();
    // const intervalId = setInterval(fetchStocks, 5000);
    // return () => clearInterval(intervalId);
  }, []);

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
  }, []);

  const fetchStocks = async () => {
    try {
      const response = await fetchWithToken(`${apiUrl}/api-dealerportal-check-stock/`, 'GET', null, {}, apiUrl);
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
      const response = await fetchWithToken(`${apiUrl}/api-dealerportal-quote-products/${quote.id}/`, 'GET', payload, {}, apiUrl);
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

  const handleFilterChange = (e) => {
    const newFilter = e.target.value;
    setFilter(newFilter);
    const filteredList = filterStocks(newFilter);
    setFilteredStocks(filteredList);
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
      <Box sx={{
        mt: 3,
        minWidth: '100%',
        bgcolor: '#f1f1f1',
      }}>
        {stocks && quote && (

          <Grid container spacing={2}>
            {quote.status === 'active' && (
              <Grid item xs={4}>
                <Box>
                  <CustomFilterComponent configCustomFilter={configCustomFilter} />
                </Box>
                <TableContainer sx={{
                  minWidth: '100%',
                  bgcolor: 'white',
                  borderRadius: '10px',
                  borderTop: '1px solid #ddd',
                  mb: 2,
                  maxHeight: 'calc(100vh - 180px)',
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
                <Box sx={{ mt: 2, mb: 3 }}>
                  <ButtonsbarComponent quote={quote} onClose={onCloseDetails} />
                </Box>
              </Grid>
              <Grid item container spacing={2}>
                <Box sx={{ ml: 1, width: '100%' }}>
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
    );
  }
  return (

    <Box sx={{
      mt: 4,
      minWidth: '100%',
      bgcolor: '#f1f1f1',
    }}>
      {stocks && quote && (
        <>
          {quote.status === 'active' && (
            <Grid item container xs={12} spacing={2}>
              <Box>
                <CustomFilterComponent configCustomFilter={configCustomFilter} />
              </Box>
              <TableContainer sx={{
                minWidth: '100%',
                bgcolor: 'white',
                borderRadius: '10px',
                borderTop: '1px solid #ddd',
                mb: 2,
                maxHeight: 'calc(100vh - 180px)',
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

          <Grid item container xs={12} spacing={1}>
            <Grid item container spacing={1} justifyContent="flex-end">
              <Box sx={{ mt: 1, mb: 2 }}>
                <ButtonsbarComponent quote={quote} onClose={onCloseDetails} />
              </Box>
            </Grid>
          </Grid>

          <Grid item container xs={12} spacing={2}>
            <Grid item xs={12}>
              <Grid item container spacing={2}>
                <Box sx={{
                  ml: 1, 
                  mr: isMobile ? -2 : 0,
                  width: '100%'
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

  );
}

export default ListStocksQuoteDetailsComponent;