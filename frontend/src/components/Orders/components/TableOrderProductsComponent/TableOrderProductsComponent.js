import React, { useEffect, useState } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useTheme,
  useMediaQuery
} from '@mui/material';

const TableOrderProductsComponent = ({ order }) => {

  const [products, setProducts] = useState([]);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  // const isMobile = useMediaQuery('(max-width:999px)');

  const columns = [
    { field: 'id', headerName: 'ID', width: 0 },
    { field: 'product', headerName: 'Product' },
    { field: 'price', headerName: 'Price', width: 150 },
    { field: 'quantity', headerName: 'Quantity', width: 120 },
    { field: 'total_price', headerName: 'Total Price', width: 170 },
  ];


  useEffect(() => {
    if (order?.products?.length > 0) {
      const quoteProducts = order?.products || [];
      const updatedProducts = quoteProducts?.map((product) => {
        return {
          id: product.id,
          id_quote_product: product.id,
          product: {
            name: product.product.name,
            sku: product.product.sku,
          },
          price: `$ ${product.total_price}`,
          quantity: Number.parseInt(product.quantity),
          total_price: `$ ${((Number.parseFloat(product.total_price) * Number.parseFloat(product.quantity)).toFixed(2)).toString()}`,
        };
      });
      setProducts(updatedProducts);
    }
    else {
      setProducts([]);
    }
  }, [order]);


  if (!isMobile) {
    return (
      <Box sx={{ width: '100%', mt: 1 }}>
        <TableContainer style={{ height: '500px' }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                {columns.map((column) => (
                  column.field !== 'id' && (
                    <TableCell key={column.field} sx={{ width: column.width, bgcolor: '#f1f1f1', p: 1 }}>
                      <b>{column.headerName} </b>{column.field === 'product' && `(${order?.products?.length})`}
                    </TableCell>
                  )
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {products?.map((row) => (
                <TableRow key={`${row.id}`}>
                  {columns.map((column) => (
                    column.field !== 'id' && (
                      <TableCell key={column.field}>
                        {column.field !== 'product' ? (
                          row[column.field]
                        ) : (
                          <Box>
                            <Typography sx={{ fontSize: '12px' }}>
                              <b>{row.product.name}</b>
                            </Typography>
                            <Typography sx={{ fontStyle: 'italic', fontSize: '12px' }}>
                              {row.product.sku}
                            </Typography>
                            {/* <Typography sx={{ fontSize: '12px' }}>
                            <code style={{ fontStyle: 'italic' }}>{row.product.is_in_stock}</code>
                            <span style={{
                              fontStyle: 'italic',
                              fontSize: '10px',
                              color: 'gray',
                              cursor: 'pointer'
                            }}
                              onClick={() => alert('View product details')}
                            >  CLICK FOR MORE DETAILS</span>
                          </Typography> */}
                          </Box>
                        )}
                      </TableCell>
                    )
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    );
  }
  return (
    <Box sx={{ width: '100%', mt: 1, mb: 4 }}>
      <TableContainer style={{ height: '100%' }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell sx={{ width: 0, bgcolor: '#f1f1f1', p: 1 }}>
                <b>Product</b>
              </TableCell>
              <TableCell sx={{ width: 150, bgcolor: '#f1f1f1', p: 1 }}>
                <b>Order Info</b>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products?.map((row) => (
              <TableRow key={`${row.id}`}>
                <TableCell key="product">
                  <Box>
                    <Typography sx={{ fontSize: '12px' }}>
                      <b>{row.product.name}</b>
                    </Typography>
                    <Typography sx={{ fontStyle: 'italic', fontSize: '12px' }}>
                      {row.product.sku}
                    </Typography>
                    {/* <Typography sx={{ fontSize: '12px' }}>
                          <code style={{ fontStyle: 'italic' }}>{row.product.is_in_stock}</code>
                          <span style={{
                            fontStyle: 'italic',
                            fontSize: '10px',
                            color: 'gray',
                            cursor: 'pointer'
                          }}
                            onClick={() => alert('View product details')}
                          >  CLICK FOR MORE DETAILS</span>
                        </Typography> */}
                  </Box>
                </TableCell>
                <TableCell key="order_info">
                  <Box>
                    <Typography sx={{ fontSize: '12px' }}>
                      <b>Price</b>: {row.price}
                    </Typography>
                    <Typography sx={{ fontSize: '12px' }}>
                      <b>Quantity</b>: {row.quantity}
                    </Typography>
                    <Typography sx={{ fontSize: '12px' }}>
                      <b>Total Price</b>: {row.total_price}
                    </Typography>
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

export default TableOrderProductsComponent;
