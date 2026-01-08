import React, { useEffect, useMemo, useState } from 'react';
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

const money = (value) => {
  const n = Number.parseFloat(value);
  if (Number.isNaN(n)) return '$ 0.00';
  return `$ ${n.toFixed(2)}`;
};

const TableOrderProductsComponent = ({ order }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const products = useMemo(() => {
    const quoteProducts = order?.products || [];
    return quoteProducts.map((p) => {
      const qty = Number.parseInt(p?.quantity ?? 0, 10) || 0;

      // IMPORTANT:
      // Your API field name `total_price` appears to be the *unit price* (based on your old code:
      // unit = total_price, total = unit * quantity)
      const unit = Number.parseFloat(p?.total_price ?? 0) || 0;
      const total = unit * qty;

      return {
        id: p?.id,
        productName: p?.product?.name || '',
        sku: p?.product?.sku || '',
        unitPriceLabel: money(unit),
        qty,
        totalLabel: money(total),
      };
    });
  }, [order?.products]);

  const desktopColumns = useMemo(
    () => [
      { field: 'product', headerName: 'Product' },
      { field: 'unitPriceLabel', headerName: 'Price', width: 150 },
      { field: 'qty', headerName: 'Quantity', width: 120 },
      { field: 'totalLabel', headerName: 'Total Price', width: 170 },
    ],
    []
  );

  if (!isMobile) {
    return (
      <Box sx={{ width: '100%', mt: 1 }}>
        <TableContainer sx={{ height: 500 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                {desktopColumns.map((col) => (
                  <TableCell
                    key={col.field}
                    sx={{ width: col.width, bgcolor: '#f1f1f1', p: 1 }}
                  >
                    <b>
                      {col.headerName}
                      {col.field === 'product' ? ` (${products.length})` : ''}
                    </b>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>

            <TableBody>
              {products.map((row) => (
                <TableRow key={row.id ?? `${row.productName}-${row.sku}`}>
                  {desktopColumns.map((col) => (
                    <TableCell key={col.field} sx={{ p: 1 }}>
                      {col.field !== 'product' ? (
                        row[col.field]
                      ) : (
                        <Box>
                          <Typography sx={{ fontSize: 12 }}>
                            <b>{row.productName}</b>
                          </Typography>
                          <Typography sx={{ fontStyle: 'italic', fontSize: 12 }}>
                            {row.sku}
                          </Typography>
                        </Box>
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
              {products.length === 0 && (
                <TableRow>
                  <TableCell colSpan={desktopColumns.length} sx={{ p: 2 }}>
                    <Typography sx={{ color: 'gray' }}>No products</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', mt: 1, mb: 4 }}>
      <TableContainer>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell sx={{ bgcolor: '#f1f1f1', p: 1 }}>
                <b>Product ({products.length})</b>
              </TableCell>
              <TableCell sx={{ width: 170, bgcolor: '#f1f1f1', p: 1 }}>
                <b>Order Info</b>
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {products.map((row) => (
              <TableRow key={row.id ?? `${row.productName}-${row.sku}`}>
                <TableCell sx={{ p: 1 }}>
                  <Box>
                    <Typography sx={{ fontSize: 12 }}>
                      <b>{row.productName}</b>
                    </Typography>
                    <Typography sx={{ fontStyle: 'italic', fontSize: 12 }}>
                      {row.sku}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell sx={{ p: 1 }}>
                  <Box>
                    <Typography sx={{ fontSize: 12 }}>
                      <b>Price</b>: {row.unitPriceLabel}
                    </Typography>
                    <Typography sx={{ fontSize: 12 }}>
                      <b>Quantity</b>: {row.qty}
                    </Typography>
                    <Typography sx={{ fontSize: 12 }}>
                      <b>Total Price</b>: {row.totalLabel}
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ))}

            {products.length === 0 && (
              <TableRow>
                <TableCell colSpan={2} sx={{ p: 2 }}>
                  <Typography sx={{ color: 'gray' }}>No products</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default TableOrderProductsComponent;
