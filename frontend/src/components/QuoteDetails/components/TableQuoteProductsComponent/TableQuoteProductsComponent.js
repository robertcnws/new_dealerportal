import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import DeleteIcon from '@mui/icons-material/Delete';
import {
  Box,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import Swal from 'sweetalert2';
import { apiUrl } from '../../../../config';
import { fetchWithToken } from '../../../../utils';

const TableQuoteProductsComponent = ({ quote, setIsLoadingOperation }) => {
  const [quoteProducts, setQuoteProducts] = useState([]);
  const [modifiedQuantities, setModifiedQuantities] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openTooltipId, setOpenTooltipId] = useState(null);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const warningColor = theme.palette.warning.main;
  const transparentWarningColor = alpha(warningColor, 0.2);

  const debounceRef = useRef({});
  const inFlightRef = useRef({});
  const abortRef = useRef(false);

  const columns = useMemo(
    () => [
      { field: 'id', headerName: 'ID', width: 0 },
      { field: 'product', headerName: 'Product' },
      { field: 'price', headerName: 'Price', width: 150 },
      { field: 'quantity', headerName: 'Quantity', width: 120 },
      { field: 'total_price', headerName: 'Total Price', width: 170 },
    ],
    []
  );

  const fetchQuoteProducts = useCallback(async () => {
    if (!quote?.id) return;
    try {
      setError('');
      const user = JSON.parse(localStorage.getItem('userLogged') || '{}');
      const payload = { user_id: user?.data?.id };
      const response = await fetchWithToken(
        `${apiUrl}/dealerportal-quote-products/${quote.id}/`,
        'GET',
        payload,
        {},
        apiUrl
      );
      if (response.status !== 200) throw new Error('Failed to fetch quote products');
      if (!abortRef.current) setQuoteProducts(response?.data?.data?.quote_products || []);
    } catch (err) {
      if (!abortRef.current) setError(err?.message || String(err));
    } finally {
      if (!abortRef.current) setLoading(false);
    }
  }, [quote?.id]);

  useEffect(() => {
    abortRef.current = false;
    setLoading(true);
    fetchQuoteProducts();
    const intervalId = setInterval(fetchQuoteProducts, 5000);
    return () => {
      abortRef.current = true;
      clearInterval(intervalId);
      Object.values(debounceRef.current).forEach((t) => clearTimeout(t));
      debounceRef.current = {};
      inFlightRef.current = {};
    };
  }, [fetchQuoteProducts]);

  const products = useMemo(() => {
    if (!quoteProducts?.length) return [];
    return quoteProducts.map((product) => {
      const modifiedQuantity = modifiedQuantities[product.id];
      const baseQty = Number.parseInt(product.quantity, 10);
      const qty =
        modifiedQuantity === undefined || Number.isNaN(modifiedQuantity) ? baseQty : modifiedQuantity;
      const priceNum = Number.parseFloat(product.price);
      const total = Number.isFinite(priceNum) && Number.isFinite(qty) ? (priceNum * qty).toFixed(2) : '0.00';

      return {
        id: product.id,
        id_quote_product: product.id_quote_product,
        product: {
          name: product.name,
          sku: product.sku,
          is_in_stock: product.is_in_stock,
          description: product.description,
        },
        price: `$ ${product.price}`,
        quantity: qty,
        total_price: `$ ${total}`,
      };
    });
  }, [quoteProducts, modifiedQuantities]);

  const formattedDescription = useCallback((description) => {
    const txt = description || '';
    return txt.split('\n').map((line, index) => (
      <span key={index}>
        {line}
        <br />
      </span>
    ));
  }, []);

  const handleTooltipClick = (rowId) => {
    setOpenTooltipId((prevId) => (prevId === rowId ? null : rowId));
  };

  const syncQuantity = useCallback(
    async (row, quantityToStore) => {
      if (!quote?.id || !row?.id_quote_product || !row?.id) return;
      if (inFlightRef.current[row.id]) return;
      inFlightRef.current[row.id] = true;

      try {
        const user = JSON.parse(localStorage.getItem('userLogged') || '{}');
        const payload = {
          quote_id: quote.id,
          quote_product_id: row.id_quote_product,
          product_id: row.id,
          user_id: user?.data?.id,
          quantity: quantityToStore,
        };
        const response = await fetchWithToken(
          `${apiUrl}/dealerportal-manage-product-to-quote/`,
          'POST',
          payload,
          {},
          apiUrl
        );
        if (response.status !== 200) throw new Error('Failed to update quantity');

        const q = response?.data?.data?.quote;
        if (q) {
          quote.total_sell = q.total_sell;
          quote.total_cost = q.total_cost;
          quote.markup_total = q.markup_total;
        } else if (response?.data?.data?.quote) {
          const qq = response.data.data.quote;
          quote.total_sell = qq.total_sell;
          quote.total_cost = qq.total_cost;
          quote.markup_total = qq.markup_total;
        } else if (response?.data?.data) {
          quote.total_sell = response.data.data.quote?.total_sell ?? response.data.data.quote_total_sell ?? quote.total_sell;
          quote.total_cost = response.data.data.quote?.total_cost ?? response.data.data.quote_total_cost ?? quote.total_cost;
          quote.markup_total = response.data.data.quote?.markup_total ?? response.data.data.quote_markup_total ?? quote.markup_total;
        }

        setIsLoadingOperation(false);
      } catch (err) {
        setError(err?.message || String(err));
        setIsLoadingOperation(false);
      } finally {
        inFlightRef.current[row.id] = false;
      }
    },
    [quote, setIsLoadingOperation]
  );

  const onChangeQuantity = (e, row) => {
    const value = e.target.value;
    const parsed = Number.parseInt(value, 10);
    const quantityToStore = Number.isNaN(parsed) ? 0 : parsed;

    setModifiedQuantities((prev) => ({ ...prev, [row.id]: quantityToStore }));

    if (debounceRef.current[row.id]) clearTimeout(debounceRef.current[row.id]);

    if (quantityToStore > 0) {
      debounceRef.current[row.id] = setTimeout(() => {
        syncQuantity(row, quantityToStore);
      }, 350);
    }
  };

  const handleDeleteProduct = async (row) => {
    const customClassSwal = {
      popup: 'small-popup',
      title: 'small-title',
      icon: 'custom-icon',
      content: 'small-content',
      confirmButton: 'small-confirm-button',
    };

    Swal.fire({
      title: 'Are you sure?',
      text: `You will not be able to recover product SKU ${row.product.sku} for this quote # ${quote.id}!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, keep it',
      customClass: customClassSwal,
    }).then(async (result) => {
      if (!result.isConfirmed) return;
      setIsLoadingOperation(true);
      try {
        const user = JSON.parse(localStorage.getItem('userLogged') || '{}');
        const payload = {
          quote_id: quote.id,
          quote_product_id: row.id_quote_product,
          is_deletion: true,
          user_id: user?.data?.id,
        };
        const response = await fetchWithToken(
          `${apiUrl}/dealerportal-manage-product-to-quote/`,
          'POST',
          payload,
          {},
          apiUrl
        );
        if (response.status !== 200) throw new Error('Failed to delete product');

        const q = response?.data?.data?.quote;
        if (q) {
          quote.total_sell = q.total_sell;
          quote.total_cost = q.total_cost;
          quote.markup_total = q.markup_total;
        } else if (response?.data?.data?.quote) {
          const qq = response.data.data.quote;
          quote.total_sell = qq.total_sell;
          quote.total_cost = qq.total_cost;
          quote.markup_total = qq.markup_total;
        }

        setModifiedQuantities((prev) => {
          const next = { ...prev };
          delete next[row.id];
          return next;
        });

        fetchQuoteProducts();
        setIsLoadingOperation(false);
      } catch (err) {
        setError(err?.message || String(err));
        setIsLoadingOperation(false);
      } finally {
        setLoading(false);
      }
    });
  };

  if (loading) return <Box sx={{ mt: 1, minWidth: '100%', bgcolor: '#f1f1f1' }}>Loading...</Box>;
  if (error) return <Box sx={{ mt: 1, minWidth: '100%', bgcolor: '#f1f1f1' }}>Error: {error}</Box>;

  if (!isMobile) {
    return (
      <Box sx={{ width: '100%', mt: 1 }}>
        <TableContainer style={{ height: '500px' }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                {columns.map(
                  (column) =>
                    column.field !== 'id' && (
                      <TableCell key={column.field} sx={{ width: column.width, bgcolor: '#f1f1f1', p: 1 }}>
                        <b>{column.headerName}</b> {column.field === 'product' && `(${products.length})`}
                      </TableCell>
                    )
                )}
                {quote.status === 'active' && (
                  <TableCell key="actions" sx={{ width: 100, bgcolor: '#f1f1f1', p: 1 }}>
                    <b>Actions</b>
                  </TableCell>
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {products.map((row) => (
                <TableRow
                  key={`${row.id_quote_product}`}
                  sx={{
                    bgcolor:
                      row.product.is_in_stock === 'Out of stock'
                        ? '#ffcccc'
                        : row.product.is_in_stock === 'Insufficient stock for quote'
                        ? transparentWarningColor
                        : 'white',
                  }}
                >
                  {columns.map(
                    (column) =>
                      column.field !== 'id' && (
                        <TableCell key={column.field}>
                          {column.field === 'quantity' ? (
                            quote.status !== 'ordered' ? (
                              <TextField
                                sx={{
                                  width: '100%',
                                  '& .MuiInputBase-root': { height: '35px' },
                                  '& .MuiOutlinedInput-root': { '& fieldset': { borderRadius: '4px' } },
                                }}
                                type="number"
                                value={row.quantity || ''}
                                onChange={(e) => onChangeQuantity(e, row)}
                                variant="outlined"
                                inputProps={{ min: 1 }}
                              />
                            ) : (
                              row.quantity
                            )
                          ) : column.field === 'product' ? (
                            <Box>
                              <Typography sx={{ fontSize: '12px' }}>
                                <b>{row.product.name}</b>
                              </Typography>
                              <Typography sx={{ fontStyle: 'italic', fontSize: '12px' }}>{row.product.sku}</Typography>
                              <Typography sx={{ fontSize: '12px' }}>
                                <code style={{ fontStyle: 'italic' }}>{row.product.is_in_stock}</code>
                                <Tooltip
                                  title={formattedDescription(row.product.description)}
                                  placement="right"
                                  arrow
                                  open={openTooltipId === row.id}
                                  onClose={() => setOpenTooltipId(null)}
                                  componentsProps={{
                                    tooltip: {
                                      sx: {
                                        bgcolor: 'whitesmoke',
                                        color: 'black',
                                        boxShadow: 3,
                                        fontSize: '12px',
                                      },
                                    },
                                    arrow: { sx: { color: 'black' } },
                                  }}
                                >
                                  <span
                                    style={{
                                      fontStyle: 'italic',
                                      fontSize: '10px',
                                      color: 'gray',
                                      cursor: row.product.description ? 'pointer' : 'default',
                                      marginLeft: 6,
                                    }}
                                    onClick={row.product.description ? () => handleTooltipClick(row.id) : undefined}
                                  >
                                    CLICK FOR MORE DETAILS
                                  </span>
                                </Tooltip>
                              </Typography>
                            </Box>
                          ) : (
                            row[column.field]
                          )}
                        </TableCell>
                      )
                  )}
                  {quote.status === 'active' && (
                    <TableCell key="actions">
                      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                        <Tooltip
                          title="Delete Product"
                          arrow
                          sx={{
                            '& .MuiTooltip-tooltip': { backgroundColor: '#000000', color: 'white', fontSize: '0.875rem' },
                          }}
                        >
                          <IconButton onClick={() => handleDeleteProduct(row)}>
                            <DeleteIcon sx={{ color: 'error.main' }} />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', mt: 0 }}>
      <TableContainer style={{ height: '100%' }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell key="product" sx={{ width: 200, bgcolor: '#f1f1f1', p: 1 }}>
                <b>Product</b>
              </TableCell>
              <TableCell key="quantity" sx={{ width: 120, bgcolor: '#f1f1f1', p: 1 }}>
                <b>Quantity</b>
              </TableCell>
              {quote.status === 'active' && (
                <TableCell key="actions" sx={{ width: 100, bgcolor: '#f1f1f1', p: 1 }}>
                  <b>Actions</b>
                </TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {products.map((row) => (
              <TableRow
                key={`${row.id_quote_product}`}
                sx={{
                  bgcolor:
                    row.product.is_in_stock === 'Out of stock'
                      ? '#ffcccc'
                      : row.product.is_in_stock === 'Insufficient stock for quote'
                      ? transparentWarningColor
                      : 'white',
                }}
              >
                <TableCell key="product">
                  <Box>
                    <Typography sx={{ fontSize: '12px' }}>
                      <b>{row.product.name}</b>
                    </Typography>
                    <Typography sx={{ fontStyle: 'italic', fontSize: '12px' }}>{row.product.sku}</Typography>
                    <Typography sx={{ fontSize: '12px' }}>
                      <code style={{ fontStyle: 'italic' }}>{row.product.is_in_stock}</code>
                      <Tooltip
                        title={formattedDescription(row.product.description)}
                        placement="top"
                        arrow
                        open={openTooltipId === row.id}
                        onClose={() => setOpenTooltipId(null)}
                        componentsProps={{
                          tooltip: {
                            sx: {
                              bgcolor: 'whitesmoke',
                              color: 'black',
                              boxShadow: 3,
                              fontSize: '12px',
                            },
                          },
                          arrow: { sx: { color: 'black' } },
                        }}
                      >
                        <span
                          style={{
                            fontStyle: 'italic',
                            fontSize: '10px',
                            color: 'gray',
                            cursor: row.product.description ? 'pointer' : 'default',
                            marginLeft: 6,
                          }}
                          onClick={row.product.description ? () => handleTooltipClick(row.id) : undefined}
                        >
                          CLICK FOR MORE DETAILS
                        </span>
                      </Tooltip>
                    </Typography>
                    <Typography sx={{ fontSize: '12px' }}>
                      <b>Price:</b> {row.price}
                    </Typography>
                    <Typography sx={{ fontSize: '12px' }}>
                      <b>Total:</b> {row.total_price}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell key="quantity">
                  {quote.status === 'active' ? (
                    <TextField
                      sx={{
                        width: '100%',
                        '& .MuiInputBase-root': { height: '35px' },
                        '& .MuiOutlinedInput-root': { '& fieldset': { borderRadius: '4px' } },
                      }}
                      type="number"
                      value={row.quantity || ''}
                      onChange={(e) => onChangeQuantity(e, row)}
                      variant="outlined"
                      inputProps={{ min: 1 }}
                    />
                  ) : (
                    <Typography sx={{ fontSize: '12px' }}>{row.quantity || ''}</Typography>
                  )}
                </TableCell>
                {quote.status === 'active' && (
                  <TableCell key="actions">
                    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                      <Tooltip
                        title="Delete Product"
                        arrow
                        sx={{
                          '& .MuiTooltip-tooltip': { backgroundColor: '#000000', color: 'white', fontSize: '0.875rem' },
                        }}
                      >
                        <IconButton onClick={() => handleDeleteProduct(row)}>
                          <DeleteIcon sx={{ color: 'error.main' }} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default TableQuoteProductsComponent;
