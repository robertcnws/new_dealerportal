import React from 'react';
import { Box, Typography, useTheme, useMediaQuery, TableContainer, Table, TableHead, TableRow, TableCell, TableBody } from '@mui/material';

const TableAppManagersComponent = () => {

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const columns = [
    { field: 'status', headerName: 'Status', width: 100 },
    { field: 'username', headerName: 'Username', width: 150 },
    { field: 'full_name', headerName: 'Full Name', width: 150 },
    ...(!isMobile ? [
      { field: 'email', headerName: 'Email', width: 150 },
      { field: 'last_login', headerName: 'Last Login', width: 150 },
    ] : []),
  ];

  return (
    <Box sx={{ mb: 1 }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', ml: isMobile ? 0 : 2 }}>
        <Typography variant="h6" sx={{ fontSize: '20px', p: 1 }}>
          App Managers
        </Typography>
        <Box sx={{ p: 1, bgcolor: 'white', borderRadius: '8px'}}>
          <TableContainer>
            <Table aria-label="simple table">
              <TableHead sx={{ maxHeight: '20px', p: 0, border: '1px solid #ddd' }}>
                <TableRow>
                  {columns.map((column) => (
                    <TableCell key={`${column.field}-DealerAdmin`} align="center" sx={{ bgcolor: '#f1f1f9', p: 1 }}>
                      {column.headerName}
                    </TableCell>
                  ))}
                  <TableCell align="center" sx={{ bgcolor: '#f1f1f9', p: 1 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Box>
    </Box>
  );
}

export default TableAppManagersComponent;
