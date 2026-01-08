import React, { useState, useEffect, useContext, useRef, useCallback, useMemo } from 'react';
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
import { AddCircle } from '@mui/icons-material';

const ListStocksQuoteDetailsComponent = ({ setIsLoadingOperation, isLoadingOperation }) => {
  const [stocks, setStocks] = useState([]);
  const [filteredStocks, setFilteredStocks] = useState([]);
  const [filter, setFilter] = useState('all');

  const [expandedItem, setExpandedItem] = useState(null);
  const [expandedGroups, setExpandedGroups] = useState(new Set());

  const [loadingStocks, setLoadingStocks] = useState(true);
  const [loadingQuoteProducts, setLoadingQuoteProducts] = useState(true);
  const [error, setError] = useState('');

  const { searchTermGlobal } = useContext(SearchContext);

  const location = useLocation();
  const navigate = useNavigate();

  const [quote, setQuote] = useState(null);
  const [quoteProducts, setQuoteProducts] = useState([]);

  const [selectedProducts, setSelectedProducts] = useState([]);
  const [openModalEdit, setOpenModalEdit] = useState(false);

  const [isItemGroupVisible, setIsItemGroupVisible] = useState(false);
  const [menuOpened, setMenuOpened] = useState(false);

  const sidebarRef = useRef(null);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // -----------------------------
  // ✅ Fetch Stocks (stable)
  // -----------------------------
  const fetchStocks = useCallback(async () => {
    try {
      setLoadingStocks(true);
      const response = await fetchWithToken(`${apiUrl}/dealerportal-check-stock/`, 'GET', null, {}, apiUrl);
      if (response.status !== 200) throw new Error('Failed to fetch stock');

      const data = response?.data?.data || [];
      setStocks(data);
      // setFilteredStocks(data); // NO aquí: lo filtra el useEffect de filter/search
    } catch (err) {
      setError(err?.message || 'Failed to fetch stock');
    } finally {
      setLoadingStocks(false);
    }
  }, []);

  // -----------------------------
  // ✅ Fetch Quote Products (stable)
  // -----------------------------
  const fetchQuoteProducts = useCallback(async (quoteArg) => {
    if (!quoteArg?.id) return;
    try {
      setLoadingQuoteProducts(true);
      const user = JSON.parse(localStorage.getItem('userLogged') || '{}');
      const payload = { user_id: user?.data?.id };

      const response = await fetchWithToken(
        `${apiUrl}/dealerportal-quote-products/${quoteArg.id}/`,
        'GET',
        payload,
        {},
        apiUrl
      );

      if (response.status !== 200) throw new Error('Failed to fetch quote products');
      setQuoteProducts(response?.data?.data?.quote_products || []);
    } catch (err) {
      setError(err?.message || 'Failed to fetch quote products');
    } finally {
      setLoadingQuoteProducts(false);
    }
  }, []);

  // -----------------------------
  // ✅ Filter function (stable)
  // -----------------------------
  const filterStocks = useCallback(
    (filterValue, searchTerm) => {
      const normalizedSearchTerm = (searchTerm || '').toLowerCase();

      return (stocks || [])
        .map((stock) => {
          const items = stock?.items || [];

          const filteredItems = items.filter((item) => {
            const name = (item?.name || '').toLowerCase();
            const sku = (item?.sku || '').toLowerCase();
            const description = (item?.description || '').toLowerCase();

            const matchesSearch =
              name.includes(normalizedSearchTerm) ||
              sku.includes(normalizedSearchTerm) ||
              description.includes(normalizedSearchTerm);

            return matchesSearch;
          });

          if (filteredItems.length === 0) return null;

          let finalItems = filteredItems;

          if (filterValue && filterValue !== 'all') {
            // OJO: tu lógica usa sku.includes('BG') etc
            // Si quieres exact-match por prefijo, cámbialo aquí.
            finalItems = filteredItems.filter((item) =>
              (item?.sku || '').includes(filterValue)
            );
          }

          if (finalItems.length === 0) return null;

          return { ...stock, items: finalItems };
        })
        .filter(Boolean);
    },
    [stocks]
  );

  // -----------------------------
  // ✅ Load quote from location
  // -----------------------------
  useEffect(() => {
    const q = location?.state?.quote || null;
    setQuote(q);
  }, [location?.state?.quote]);

  // -----------------------------
  // ✅ Initial load / refresh stocks
  // (si menuOpened cambia, recarga stock)
  // -----------------------------
  useEffect(() => {
    document.title = 'Dealer Portal | Stocks';
    fetchStocks();
  }, [fetchStocks, menuOpened]);

  // -----------------------------
  // ✅ Filter whenever filter/search/stocks change
  // -----------------------------
  useEffect(() => {
    const list = filterStocks(filter, searchTermGlobal);
    setFilteredStocks(list);
    // reset expanded cuando cambia el listado
    setExpandedItem(null);
    setExpandedGroups(new Set());
  }, [filter, searchTermGlobal, filterStocks]);

  // -----------------------------
  // ✅ Poll quote products (solo si hay quote)
  // -----------------------------
  useEffect(() => {
    if (!quote?.id) return;

    // primera carga inmediata
    fetchQuoteProducts(quote);

    // polling (ajusta el intervalo si quieres)
    const intervalId = setInterval(() => {
      fetchQuoteProducts(quote);
    }, 1500);

    return () => clearInterval(intervalId);
  }, [quote?.id, fetchQuoteProducts]); // 👈 crucial: depende del id

  // -----------------------------
  // ✅ Close sidebar when click outside (mobile)
  // -----------------------------
  useEffect(() => {
    const handleClickOutside = (event) => {
      const isClickInsideCustomFilter = event.target.closest('.custom-filter-component');
      if (sidebarRef.current && !sidebarRef.current.contains(event.target) && !isClickInsideCustomFilter) {
        setIsItemGroupVisible(false);
      }
    };

    if (isItemGroupVisible) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isItemGroupVisible]);

  // -----------------------------
  // ✅ Actions
  // -----------------------------
  const handleOpenModalEdit = () => setOpenModalEdit(true);
  const handleCloseModalEdit = () => setOpenModalEdit(false);

  const onCloseDetails = () => navigate(`${apiFrontendRoot}/quotes`);

  const toggleSidebar = () => setIsItemGroupVisible((v) => !v);

  const handleFilterChange = (e) => {
    const newFilter = e.target.value;
    setFilter(newFilter);
    if (isMobile) setIsItemGroupVisible(true);
  };

  // ✅ NO MUTAR estado
  const handleSelection = useCallback((item) => {
    setSelectedProducts((prev) => {
      // si quieres evitar duplicados:
      if (prev.some((p) => p?.id === item?.id)) return prev;
      return [...prev, item];
    });
  }, []);

  const fetchQuoteChanges = useCallback(async () => {
    if (!quote?.id) return quote;

    const user = JSON.parse(localStorage.getItem('userLogged') || '{}');
    const payload = { user_id: user?.data?.id };

    const url = `${apiUrl}/dealerportal-get-quote/${quote.id}/`;
    const response = await fetchWithToken(url, 'POST', payload, {}, apiUrl);

    if (response.status === 200) {
      const q = response?.data?.data?.quote;
      if (q) {
        // actualiza tu quote local con data del server
        setQuote((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            job_name: q.name,
            total_sell: q.total_sell,
            total_cost: q.total_cost,
            markup_total: q.markup_total,
            mark_up: q.markup,
            id: q.id,
            owner: q.owner,
            owner_name: `${q.owner?.first_name || ''} ${q.owner?.last_name || ''}`.trim(),
          };
        });
      }
    }

    return quote;
  }, [quote?.id]);

  const configCustomFilter = useMemo(
    () => ({
      filter,
      handleFilterChange,
      listValues: [
        { value: 'all', label: 'All Items' },
        { value: 'BG', label: 'Bronce/ Gray' },
        { value: 'WG', label: 'White/ Gray' },
        { value: 'BGI', label: 'Bronce/ Gray (Privacy)' },
        { value: 'WGI', label: 'White/ Gray (Privacy)' },
      ],
      hasSearch: false,
      marginBottomInDetails: '10px',
    }),
    [filter]
  );

  const isLoading = loadingStocks || loadingQuoteProducts;

  // -----------------------------
  // UI
  // -----------------------------
  if (error) {
    // (si quieres, hazlo más lindo)
    // return <Box sx={{ p: 2 }}>Error: {error}</Box>;
  }

  if (!isMobile) {
    return (
      <>
        <Box sx={{ mt: -3, minWidth: '100%', bgcolor: '#f1f1f1' }}>
          {quote && (
            <Grid container spacing={2}>
              {quote.status === 'active' && (
                <Grid item xs={4}>
                  <Box>
                    <CustomFilterComponent configCustomFilter={configCustomFilter} sx={{ ml: 3 }} />
                  </Box>

                  <TableContainer
                    sx={{
                      minWidth: '100%',
                      bgcolor: 'white',
                      borderTop: '1px solid #ddd',
                      mb: 0,
                      ml: 3,
                      maxHeight: 'calc(100vh - 170px)',
                      overflowY: 'auto',
                    }}
                  >
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
                            isInQuoteDetails
                            quote={quote}
                            quoteProducts={quoteProducts}
                            onSyncCompleted={() => fetchQuoteProducts(quote)}
                            setIsLoadingOperation={setIsLoadingOperation}
                            isLoadingOperation={isLoadingOperation}
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
                      isLoading={isLoading}
                    />
                  </Box>
                </Grid>
              </Grid>
            </Grid>
          )}
        </Box>

        <ModalAddQuoteComponent
          open={openModalEdit}
          handleClose={handleCloseModalEdit}
          dataEdit={quote}
          onSyncEdit={fetchQuoteChanges}
        />
      </>
    );
  }

  // MOBILE
  return (
    <>
      <Box sx={{ display: 'flex', flexDirection: 'column', mt: 0, minWidth: '100%', bgcolor: '#f1f1f1' }}>
        {quote && (
          <>
            <Box
              sx={{
                display: 'flex',
                position: 'sticky',
                top: '55px',
                bgcolor: 'white',
                boxShadow: '0px 1px 1px rgba(0, 0, 0, 0.5)',
                zIndex: 1100,
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
                <Grid
                  item
                  container
                  xs={12}
                  spacing={2}
                  ref={sidebarRef}
                  sx={{
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
                      <CustomFilterComponent configCustomFilter={configCustomFilter} isItemGroupToggle />
                    </Box>

                    <TableContainer
                      sx={{
                        minWidth: '100%',
                        bgcolor: 'white',
                        borderRadius: '10px',
                        borderTop: '1px solid #ddd',
                        mb: 2,
                        minHeight: 'calc(100vh - 180px)',
                        overflowY: 'auto',
                      }}
                    >
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
                              isInQuoteDetails
                              quote={quote}
                              quoteProducts={quoteProducts}
                              onSyncCompleted={() => fetchQuoteProducts(quote)}
                              setIsLoadingOperation={setIsLoadingOperation}
                              isLoadingOperation={isLoadingOperation}
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
                      <ButtonsbarComponent
                        quote={quote}
                        onClose={onCloseDetails}
                        onEdit={handleOpenModalEdit}
                        setMenuOpened={setMenuOpened}
                      />
                    </Box>
                  </Grid>
                </Grid>
              </Grid>
            </Box>

            <Grid item container xs={12} spacing={2}>
              <Grid item xs={12}>
                <Box sx={{ ml: 0, mr: -3, width: '110%' }}>
                  <QuoteDetailsComponent
                    quote={quote}
                    quoteProducts={quoteProducts}
                    onSyncCompleted={() => fetchQuoteProducts(quote)}
                    setIsLoadingOperation={setIsLoadingOperation}
                    isLoadingOperation={isLoadingOperation}
                    isLoading={isLoading}
                  />
                </Box>
              </Grid>
            </Grid>
          </>
        )}
      </Box>

      <ModalAddQuoteComponent
        open={openModalEdit}
        handleClose={handleCloseModalEdit}
        dataEdit={quote}
        onSyncEdit={fetchQuoteChanges}
      />
    </>
  );
};

export default ListStocksQuoteDetailsComponent;
