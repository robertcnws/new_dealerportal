import React, { useEffect, useState } from 'react';
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

  const [products, setProducts] = useState([]);
  const [quoteProducts, setQuoteProducts] = useState([]);
  const [modifiedQuantities, setModifiedQuantities] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openTooltipId, setOpenTooltipId] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  // const isMobile = useMediaQuery('(max-width:999px)');
  const warningColor = theme.palette.warning.main;
  const transparentWarningColor = alpha(warningColor, 0.2);

  const columns = [
    { field: 'id', headerName: 'ID', width: 0 },
    { field: 'product', headerName: 'Product' },
    { field: 'price', headerName: 'Price', width: 150 },
    { field: 'quantity', headerName: 'Quantity', width: 120 },
    { field: 'total_price', headerName: 'Total Price', width: 170 },
  ];

  useEffect(() => {
    const fetchQuoteProductsInterval = () => {
      fetchQuoteProducts(quote);
    };
    fetchQuoteProductsInterval();
    const intervalId = setInterval(fetchQuoteProductsInterval, 5000);
    return () => clearInterval(intervalId);
  }, [quote, apiUrl, setQuoteProducts, setLoading, setError, fetchWithToken]);

  useEffect(() => {
    if (quoteProducts.length > 0) {
      const updatedProducts = quoteProducts.map((product) => {
        const modifiedQuantity = modifiedQuantities[product.id];
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
          quantity: modifiedQuantity === undefined ? Number.parseInt(product.quantity) : modifiedQuantity,
          total_price: `$ ${((Number.parseFloat(product.price) * Number.parseFloat(modifiedQuantity !== undefined && !Number.isNaN(modifiedQuantity) ?
            modifiedQuantity : product.quantity)).toFixed(2)).toString()}`,
        };
      });
      setProducts(updatedProducts);
    }
    else {
      setProducts([]);
    }
  }, [quoteProducts, modifiedQuantities, quote, setProducts]);


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

  const onChangeQuantity = async (e, row) => {
    const value = e.target.value.toString();
    const newQuantity = parseInt(value);

    const quantityToStore = isNaN(newQuantity) ? 0 : newQuantity;

    setModifiedQuantities({
      ...modifiedQuantities,
      [row.id]: quantityToStore,
    });
    if (!isNaN(quantityToStore) && quantityToStore > 0) {
      // setIsLoadingOperation(true);
      try {
        const user = JSON.parse(localStorage.getItem('userLogged'));
        const payload = {
          quote_id: quote.id,
          quote_product_id: row.id_quote_product,
          product_id: row.id,
          user_id: user.data.id,
          quantity: quantityToStore,
        };
        const response = await fetchWithToken(`${apiUrl}/dealerportal-manage-product-to-quote/`, 'POST', payload, {}, apiUrl);
        if (response.status !== 200) {
          throw new Error(`Failed to fetch data`);
        }
        quote.total_sell = response.data.data.quote.total_sell;
        quote.total_cost = response.data.data.quote.total_cost;
        quote.markup_total = response.data.data.quote.markup_total;
        setIsLoadingOperation(false);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDeleteProduct = async (row) => {
    const customClassSwal = {
      popup: 'small-popup',
      title: 'small-title',
      icon: 'custom-icon',
      content: 'small-content',
      confirmButton: 'small-confirm-button'
    }
    Swal.fire({
      title: 'Are you sure?',
      text: `You will not be able to recover product SKU ${row.product.sku} for this quote # ${quote.id}!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, keep it',
      customClass: customClassSwal
    }).then(async (result) => {
      if (result.isConfirmed) {
        setIsLoadingOperation(true);
        try {
          const user = JSON.parse(localStorage.getItem('userLogged'));
          const payload = {
            quote_id: quote.id,
            quote_product_id: row.id_quote_product,
            is_deletion: true,
            user_id: user.data.id,
          };
          const response = await fetchWithToken(`${apiUrl}/dealerportal-manage-product-to-quote/`, 'POST', payload, {}, apiUrl);
          if (response.status !== 200) {
            throw new Error(`Failed to fetch data`);
          }
          quote.total_sell = response.data.data.quote.total_sell;
          quote.total_cost = response.data.data.quote.total_cost;
          quote.markup_total = response.data.data.quote.markup_total;
          setIsLoadingOperation(false);
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      }
    });

  };

  const formattedDescription = (description) => description.split('\n').map((line, index) => (
    <span key={index}>
      {line}
      <br />
    </span>
  ));

  const handleTooltipClick = (rowId) => {
    setOpenTooltipId((prevId) => (prevId === rowId ? null : rowId));
  };


  if (!isMobile) {
    return (
      <Box sx={{ width: '100%', mt: 1 }}>
        <TableContainer style={{ height: isMobile ? '100%' : '500px' }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                {columns.map((column) => (
                  column.field !== 'id' && (
                    <TableCell key={column.field} sx={{ width: column.width, bgcolor: '#f1f1f1', p: 1 }}>
                      <b>{column.headerName} </b>{column.field === 'product' && `(${products.length})`}
                    </TableCell>
                  )
                ))}
                {quote.status === 'active' && (
                  <TableCell key="actions" sx={{ width: 100, bgcolor: '#f1f1f1', p: 1 }}><b>Actions</b></TableCell>
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {products.map((row) => (
                <TableRow key={`${row.id_quote_product}`} sx={{
                  bgcolor: row.product.is_in_stock === 'Out of stock' ? '#ffcccc' :
                    (row.product.is_in_stock === 'Insufficient stock for quote' ? transparentWarningColor : 'white'),
                }}>
                  {columns.map((column) => (
                    column.field !== 'id' && (
                      <TableCell key={column.field}>
                        {column.field === 'quantity' ? (
                          quote.status !== 'ordered' ? (
                            <TextField
                              sx={{
                                width: '100%',
                                '& .MuiInputBase-root': {
                                  height: '35px',
                                },
                                '& .MuiOutlinedInput-root': {
                                  '& fieldset': {
                                    borderRadius: '4px',
                                  },
                                },
                              }}
                              type="number"
                              value={row[column.field] || ''}
                              onChange={(e) => onChangeQuantity(e, row)}
                              variant="outlined"
                              inputProps={{ min: 1 }}
                            />
                          ) : (
                            row[column.field]
                          )
                        ) : column.field === 'product' ? (
                          <Box>
                            <Typography sx={{ fontSize: '12px' }}>
                              <b>{row.product.name}</b>
                            </Typography>
                            <Typography sx={{ fontStyle: 'italic', fontSize: '12px' }}>
                              {row.product.sku}
                            </Typography>
                            <Typography sx={{ fontSize: '12px' }}>
                              <code style={{ fontStyle: 'italic' }}>{row.product.is_in_stock}</code>
                              <Tooltip
                                title={formattedDescription(row.product.description)}
                                placement="right"
                                arrow
                                open={openTooltipId === row.id}
                                onClose={() => setOpenTooltipId(null)}
                                PopperProps={{
                                  modifiers: [
                                    {
                                      name: 'arrow',
                                      enabled: true,
                                    },
                                  ],
                                }}
                                componentsProps={{
                                  tooltip: {
                                    sx: {
                                      bgcolor: 'whitesmoke',
                                      color: 'black',
                                      boxShadow: 3,
                                      fontSize: '12px',
                                    },
                                  },
                                  arrow: {
                                    sx: {
                                      color: 'black',
                                    },
                                  },
                                }}
                              >
                                <span
                                  style={{
                                    fontStyle: 'italic',
                                    fontSize: '10px',
                                    color: 'gray',
                                    cursor: 'pointer'
                                  }}
                                  onClick={row.product.description ? () => handleTooltipClick(row.id) : null}
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
                  ))}
                  {quote.status === 'active' && (
                    <TableCell key="actions">
                      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                        <Tooltip
                          title="Delete Product"
                          arrow
                          sx={{
                            '& .MuiTooltip-tooltip': {
                              backgroundColor: '#000000',
                              color: 'white',
                              fontSize: '0.875rem'
                            }
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
      <TableContainer style={{ height: isMobile ? '100%' : '500px' }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell key="product" sx={{ width: 200, bgcolor: '#f1f1f1', p: 1 }}><b>Product</b></TableCell>
              <TableCell key="quantity" sx={{ width: 120, bgcolor: '#f1f1f1', p: 1 }}><b>Quantity</b></TableCell>
              {quote.status === 'active' && (
                <TableCell key="actions" sx={{ width: 100, bgcolor: '#f1f1f1', p: 1 }}><b>Actions</b></TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {products.map((row) => (
              <TableRow key={`${row.id_quote_product}`} sx={{
                bgcolor: row.product.is_in_stock === 'Out of stock' ? '#ffcccc' :
                  (row.product.is_in_stock === 'Insufficient stock for quote' ? transparentWarningColor : 'white'),
              }}>
                <TableCell key="product">
                  <Box>
                    <Typography sx={{ fontSize: '12px' }}>
                      <b>{row.product.name}</b>
                    </Typography>
                    <Typography sx={{ fontStyle: 'italic', fontSize: '12px' }}>
                      {row.product.sku}
                    </Typography>
                    <Typography sx={{ fontSize: '12px' }}>
                      <code style={{ fontStyle: 'italic' }}>{row.product.is_in_stock}</code>
                      <Tooltip
                        title={formattedDescription(row.product.description)}
                        placement="top"
                        arrow
                        open={openTooltipId === row.id}
                        onClose={() => setOpenTooltipId(null)}
                        PopperProps={{
                          modifiers: [
                            {
                              name: 'arrow',
                              enabled: true,
                            },
                          ],
                        }}
                        componentsProps={{
                          tooltip: {
                            sx: {
                              bgcolor: 'whitesmoke',
                              color: 'black',
                              boxShadow: 3,
                              fontSize: '12px',
                            },
                          },
                          arrow: {
                            sx: {
                              color: 'black',
                            },
                          },
                        }}
                      >
                        <span
                          style={{
                            fontStyle: 'italic',
                            fontSize: '10px',
                            color: 'gray',
                            cursor: 'pointer'
                          }}
                          onClick={row.product.description ? () => handleTooltipClick(row.id) : null}
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
                        '& .MuiInputBase-root': {
                          height: '35px',
                        },
                        '& .MuiOutlinedInput-root': {
                          '& fieldset': {
                            borderRadius: '4px',
                          },
                        },
                      }}
                      type="number"
                      value={row.quantity || ''}
                      onChange={(e) => onChangeQuantity(e, row)}
                      variant="outlined"
                      inputProps={{ min: 1 }}
                    />
                  ) : (
                    <Typography sx={{ fontSize: '12px' }}>
                      {row.quantity || ''}
                    </Typography>
                  )}
                </TableCell>
                {quote.status === 'active' && (
                  <TableCell key="actions">
                    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                      <Tooltip
                        title="Delete Product"
                        arrow
                        sx={{
                          '& .MuiTooltip-tooltip': {
                            backgroundColor: '#000000',
                            color: 'white',
                            fontSize: '0.875rem'
                          }
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

export default TableQuoteProductsComponent;
