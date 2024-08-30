import DeleteIcon from '@mui/icons-material/Delete';
import { Box, IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Tooltip, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';

const columns = [
  { field: 'id', headerName: 'ID', width: 0 },
  { field: 'product', headerName: 'Product' },
  { field: 'price', headerName: 'Price', width: 150 },
  { field: 'quantity', headerName: 'Quantity', width: 120 },
  { field: 'total_price', headerName: 'Total Price', width: 170 },
];

const TableQuoteProductsComponent = ({ quote, onSyncCompleted, isSyncing, setIsSyncing, quoteProducts }) => {

  const [products, setProducts] = useState([]);

  useEffect(() => {
    // if (isSyncing) {
    const intervalId = setInterval(onSyncCompleted, 5000);
    return () => clearInterval(intervalId);
    // }
  }, [onSyncCompleted]);

  useEffect(() => {
    if (quoteProducts.length > 0) {
      const updatedProducts = quoteProducts.map((product) => {
        return {
          id: product.id,
          id_quote_product: product.id_quote_product,
          product: {
            name: product.name,
            sku: product.sku,
            is_in_stock: product.is_in_stock,
          },
          price: `$ ${product.price}`,
          quantity: parseInt(product.quantity),
          total_price: `$ ${((parseFloat(product.price) * parseFloat(product.quantity)).toFixed(2)).toString()}`,
        };
      });
      setProducts(updatedProducts);
    }
    else {
      setProducts([]);
    }
  }, [quoteProducts]);

  const onChangeQuantity = (e, row) => {
    const updatedProducts = products.map((product) => {
      if (product.id === row.id) {
        return { ...product, quantity: e.target.value };
      }
      return product;
    });
    setProducts(updatedProducts);
  };

  return (
    <Box sx={{ width: '100%', mt: 1 }}>
      <TableContainer style={{ height: '350px' }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                column.field !== 'id' && (
                  <TableCell key={column.field} sx={{ width: column.width, bgcolor: '#f1f1f1', p: 1 }}>
                    <b>{column.headerName} </b>{column.field === 'product' && `(${quoteProducts.length})`}
                  </TableCell>
                )
              ))}
              <TableCell key="actions" sx={{ width: 100, bgcolor: '#f1f1f1', p: 1 }}><b>Actions</b></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products.map((row) => (
              <TableRow key={`${row.id}-${row.id_quote_product}`}>
                {columns.map((column) => (
                  column.field !== 'id' && (
                    <TableCell key={column.field}>
                      {column.field === 'quantity' ? (
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
                          value={row[column.field]}
                          onChange={(e) => onChangeQuantity(e, row)}
                          variant="outlined"
                          inputProps={{ min: 1 }}
                        />
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
                            <span style={{
                              fontStyle: 'italic',
                              fontSize: '10px',
                              color: 'gray',
                              cursor: 'pointer'
                            }}
                              onClick={() => alert('View product details')}
                            >  CLICK FOR MORE DETAILS</span>
                          </Typography>
                        </Box>
                      ) : (
                        row[column.field]
                      )}
                    </TableCell>
                  )
                ))}
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
                      <IconButton>
                        <DeleteIcon sx={{ color: 'error.main' }} />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );


}

export default TableQuoteProductsComponent;
