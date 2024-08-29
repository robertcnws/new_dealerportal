import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from '@mui/material';
import React from 'react';

const columns = [
  { field: 'id', headerName: 'ID', width: 0 },
  { field: 'product', headerName: 'Product' },
  { field: 'price', headerName: 'Price', width: 150 },
  { field: 'quantity', headerName: 'Quantity', width: 100 },
  { field: 'total_price', headerName: 'Total Price', width: 170 },
];

const TableQuoteProductsComponent = ({ quote, getSelectedProducts }) => {

  const products = getSelectedProducts().map((product) => {
    return {
      id: product.id,
      product: {
        name: product.name,
        sku: product.sku,
      },
      price: product.price,
      quantity: 1,
      total_price: product.price * product.quantity,
    };
  })

  return (
    <Box sx={{ width: '100%', mt: 1 }}>
      <TableContainer style={{ height: '300px' }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell key={column.field} sx={{ width: column.width, bgcolor: '#F1F1F1' }}>{column.headerName}</TableCell>
              ))}
              <TableCell key="actions" sx={{ width: 100, bgcolor: '#F1F1F1' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products.map((row) => (
              <TableRow key={row.id}>
                {columns.map((column) => (
                  <TableCell key={column.field}>
                    {column.field === 'quantity' ? (
                      <TextField
                        type="number"
                        value={row[column.field]}
                        onChange={(e) => {
                          // Aquí puedes manejar el cambio del valor del TextField
                          console.log('New value for quantity:', e.target.value);
                        }}
                        InputProps={{ sx: { width: '100%' } }} // Opcional: ajusta el ancho del TextField
                        variant="outlined" // Opcional: estilo del TextField
                      />
                    ) : column.field === 'product' ? (
                      <Box>
                        <Typography variant="body1">
                          <b>{row.product.name}</b>
                        </Typography>
                        <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                          {row.product.sku}
                        </Typography>
                      </Box>
                    ) : (
                      row[column.field]
                    )}
                  </TableCell>
                ))}
                <TableCell key="actions">
                  <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                    <button>Delete</button>
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
