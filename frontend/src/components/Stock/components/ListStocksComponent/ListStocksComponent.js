import React, { useCallback, useEffect, useMemo, useState, useContext } from 'react';
import { Box, Grid, TableContainer, Table, TableBody, useTheme, useMediaQuery } from '@mui/material';
import { fetchWithToken } from '../../../../utils';
import { apiUrl } from '../../../../config';
import CustomFilterComponent from '../../../Utils/components/CustomFilterComponent/CustomFilterComponent';
import GroupStockRowComponent from '../GroupStockRowComponent/GroupStockRowComponent';
import ItemStockDetailsComponent from '../ItemStockDetailsComponent/ItemStockDetailsComponent';
import { SearchContext } from '../../../SearchContextComponent/SearchContextComponent';

const ListStocksComponent = ({ setIsLoadingOperation }) => {
  const [stocks, setStocks] = useState([]);
  const [filter, setFilter] = useState('all');
  const [expandedItem, setExpandedItem] = useState(null);
  const [expandedGroups, setExpandedGroups] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { searchTermGlobal } = useContext(SearchContext);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [isListVisible, setIsListVisible] = useState(true);

  const fetchStocks = useCallback(async () => {
    try {
      const response = await fetchWithToken(`${apiUrl}/dealerportal-check-stock/`, 'GET', null, {}, apiUrl);
      if (response.status !== 200) throw new Error('Failed to fetch data');
      setStocks(response.data.data || []);
      setError(null);
    } catch (err) {
      setError(err?.message || 'Error fetching stock');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    document.title = 'Dealer Portal | Stocks';
    fetchStocks();
  }, [fetchStocks]);

  const filteredStocks = useMemo(() => {
    const normalizedSearchTerm = (searchTermGlobal || '').toLowerCase();

    const matchesSkuFilter = (sku = '') => {
      if (filter === 'all') return true;
      if (filter === 'BG') return sku.includes('BG');
      if (filter === 'WG') return sku.includes('WG');
      if (filter === 'BGI') return sku.includes('BGI');
      if (filter === 'WGI') return sku.includes('WGI');
      return true;
    };

    return (stocks || [])
      .map((stock) => {
        const items = (stock?.items || []).filter((item) => {
          const name = (item?.name || '').toLowerCase();
          const sku = (item?.sku || '').toLowerCase();
          const description = (item?.description || '').toLowerCase();

          const matchesSearch =
            name.includes(normalizedSearchTerm) ||
            sku.includes(normalizedSearchTerm) ||
            description.includes(normalizedSearchTerm);

          const matchesFilter = matchesSkuFilter(item?.sku || '');

          return matchesSearch && matchesFilter;
        });

        if (items.length === 0) return null;
        return { ...stock, items };
      })
      .filter(Boolean);
  }, [stocks, filter, searchTermGlobal]);

  useEffect(() => {
    if (!filteredStocks.length) setExpandedItem(null);
  }, [filteredStocks]);

  const handleFilterChange = useCallback((e) => {
    setFilter(e.target.value);
  }, []);

  const handleSelection = useCallback(
    (item, stock) => {
      setExpandedItem((prev) => (prev?.item?.id === item?.id ? null : { item, stock }));
      if (isMobile) setIsListVisible(false);
    },
    [isMobile]
  );

  const handleCloseSelection = useCallback(() => {
    setExpandedItem(null);
    if (isMobile) setIsListVisible(true);
  }, [isMobile]);

  const configCustomFilter = useMemo(
    () => ({
      filter,
      handleFilterChange,
      listValues: [
        { value: 'all', label: 'All Items' },
        { value: 'BG', label: 'Bronce/ Gray' },
        { value: 'WG', label: 'White/ Gray' },
        { value: 'BGI', label: 'Bronce/ Gray (Privacy)' },
        { value: 'WGI', label: 'White/ Gray (Privacy)' }
      ],
      hasSearch: false,
      marginBottomInDetails: '10px'
    }),
    [filter, handleFilterChange]
  );

  if (loading) {
    return (
      <Box sx={{ mt: isMobile ? 1 : -3, minWidth: '100%', bgcolor: '#f1f1f1' }}>
        Loading...
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ mt: isMobile ? 1 : -3, minWidth: '100%', bgcolor: '#f1f1f1' }}>
        Error: {error}
      </Box>
    );
  }

  if (!isMobile) {
    return (
      <Box sx={{ mt: -3, minWidth: '100.5%', bgcolor: '#f1f1f1' }}>
        <Grid container spacing={1}>
          <Grid item xs={expandedItem ? 4 : 12}>
            <Box>
              <CustomFilterComponent configCustomFilter={configCustomFilter} sx={{ ml: 4 }} />
            </Box>
            <TableContainer
              sx={{
                minWidth: '100%',
                bgcolor: 'white',
                borderTop: '1px solid #ddd',
                mb: 0,
                mr: 0,
                ml: 3,
                maxHeight: 'calc(100vh - 170px)',
                overflowY: 'auto'
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
                      setIsLoadingOperation={setIsLoadingOperation}
                    />
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>

          {expandedItem && (
            <Grid item xs={8}>
              <Box sx={{ ml: 2, width: '100%' }}>
                <ItemStockDetailsComponent
                  item={expandedItem.item}
                  stock={expandedItem.stock}
                  onSelection={handleSelection}
                  onClose={handleCloseSelection}
                />
              </Box>
            </Grid>
          )}
        </Grid>
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 1, minWidth: '100%', bgcolor: '#f1f1f1' }}>
      {isListVisible && (
        <Box>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Box>
                <CustomFilterComponent configCustomFilter={configCustomFilter} />
              </Box>
              <TableContainer
                sx={{
                  minWidth: '100%',
                  bgcolor: 'white',
                  borderRadius: '10px',
                  borderTop: '1px solid #ddd',
                  mb: 0,
                  maxHeight: 'calc(100vh - 180px)',
                  overflowY: 'auto'
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
                        setIsLoadingOperation={setIsLoadingOperation}
                      />
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
          </Grid>
        </Box>
      )}

      {expandedItem && (
        <Box>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <ItemStockDetailsComponent
                item={expandedItem.item}
                stock={expandedItem.stock}
                onSelection={handleSelection}
                onClose={handleCloseSelection}
              />
            </Grid>
          </Grid>
        </Box>
      )}
    </Box>
  );
};

export default ListStocksComponent;
