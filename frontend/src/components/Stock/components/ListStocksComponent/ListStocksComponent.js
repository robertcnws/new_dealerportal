import React, { useEffect, useState, useContext } from 'react';
import { Box } from '@mui/material';
import { fetchWithToken } from '../../../../utils';
import { apiUrl } from '../../../../config';
import {
  Grid,
  TableContainer,
  Table,
  TableBody,
  useTheme,
  useMediaQuery
} from '@mui/material';
import CustomFilterComponent from '../../../Utils/components/CustomFilterComponent/CustomFilterComponent';
import GroupStockRowComponent from '../GroupStockRowComponent/GroupStockRowComponent';
import ItemStockDetailsComponent from '../ItemStockDetailsComponent/ItemStockDetailsComponent';
import { SearchContext } from '../../../SearchContextComponent/SearchContextComponent';

const ListStocksComponent = ({ setIsLoadingOperation }) => {
  const [stocks, setStocks] = useState([]);
  const [filteredStocks, setFilteredStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const { searchTermGlobal } = useContext(SearchContext);
  const [expandedItem, setExpandedItem] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [isListVisible, setIsListVisible] = useState(true);

  useEffect(() => {
    document.title = 'Dealer Portal | Stocks';
    fetchStocks();
  }, []);

  useEffect(() => {
    const filteredList = filterStocks(filter, searchTermGlobal);
    setFilteredStocks(filteredList);
  }, [filter, searchTermGlobal]);

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
    if (expandedItem && expandedItem.id === item.id) {
      setExpandedItem(null);
    } else {
      setExpandedItem({ item, stock });
    }
    if (isMobile) {
      setIsListVisible(false);
    }
  };

  const handleCloseSelection = () => {
    setExpandedItem(null);
    if (isMobile) {
      setIsListVisible(true);
    }
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
        {stocks && (
          <Grid container spacing={2}>
            <Grid item xs={expandedItem ? 4 : 12}>
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
                        setIsLoadingOperation={setIsLoadingOperation}
                      />
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
            <Grid item xs={8}>
              {expandedItem && (
                <ItemStockDetailsComponent
                  item={expandedItem.item}
                  stock={expandedItem.stock}
                  onClose={handleCloseSelection}
                />
              )}
            </Grid>
          </Grid>
        )
        }
      </Box >

    );
  }
  return (
    <Box sx={{
      mt: 3,
      minWidth: '100%',
      bgcolor: '#f1f1f1',
    }}>
      {stocks && (
        <>
          {isListVisible && (
            <Box>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Box>
                    <CustomFilterComponent configCustomFilter={configCustomFilter} />
                  </Box>
                  <TableContainer sx={{
                    minWidth: '100%',
                    bgcolor: 'white',
                    borderRadius: '10px',
                    borderTop: '1px solid #ddd',
                    mb: 0,
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
          <Box>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                {expandedItem && (
                  <ItemStockDetailsComponent
                    item={expandedItem.item}
                    stock={expandedItem.stock}
                    onClose={handleCloseSelection}
                  />
                )}
              </Grid>
            </Grid>
          </Box>
        </>
      )
      }
    </Box >

  );
}

export default ListStocksComponent;
