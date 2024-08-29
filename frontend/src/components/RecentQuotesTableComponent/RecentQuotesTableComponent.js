import React from 'react';
import { DataGrid } from '@mui/x-data-grid';
import {
  Button,
  Box,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TablePagination,
  Paper,
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import FileCopy from '@mui/icons-material/FileCopy';
import Delete from '@mui/icons-material/Delete';
import { Badge } from 'react-bootstrap';
import Swal from 'sweetalert2';
import NavigationButtonComponent from '../Utils/components/NavigationButtonComponent/NavigationButtonComponent';


const columns = [
  { field: 'created_at', headerName: 'Date', width: 20 },
  { field: 'status', headerName: 'Status', width: 20 },
  { field: 'id', headerName: 'Quote #', width: 20 },
  { field: 'job_name', headerName: 'Job Name', width: 20 },
  { field: 'dealer_account', headerName: 'Dealer Account', width: 20 },
  { field: 'owner', headerName: 'Created By', width: 20 },
  { field: 'total_sell', headerName: 'Total Sell', width: 20 },
  { field: 'total_cost', headerName: 'Total Cost', width: 20 },
  { field: 'updated_at', headerName: 'Last Modified', width: 20 },
];

const RecentQuotesTableComponent = ({ data }) => {
  const rows = [];
  if (data) {
    data.forEach((quote) => {
      rows.push({
        id: quote.id,
        created_at: quote.created_at ? quote.created_at.split('T')[0] : '',
        status: quote.status,
        job_name: quote.name,
        dealer_account: quote.owner.dealer_account?.name,
        owner: quote.owner.first_name + ' ' + quote.owner.last_name,
        total_sell: quote.total_sell,
        total_cost: quote.total_cost,
        updated_at: quote.updated_at,
      });
    });

    const handleDelete = () => {
      Swal.fire({
        title: 'Hello World!',
        text: 'This is a small alert!',
        icon: 'success',
        confirmButtonText: 'Cool',
        customClass: {
          popup: 'small-popup',
          title: 'small-title',
          icon: 'custom-icon',
          content: 'small-content',
          confirmButton: 'small-confirm-button'
        }
      });
    };

    const childrenNavigationRightButton = [
      {
        label: 'View',
        icon: <Visibility sx={{ marginRight: 1 }} />,
        visibility: true,
        noBorder: true,
      },
      {
        label: 'Clone',
        icon: <FileCopy sx={{ marginRight: 1 }} />,
        visibility: true,
        noBorder: true,
      },
      {
        label: 'Delete',
        icon: <Delete sx={{ marginRight: 1 }} />,
        onClick: handleDelete,
        visibility: true,
        noBorder: true,
      }
    ];

    return (
      <Box sx={{ width: '100%', mb: 5 }}>
        {/* <DataGrid rows={rows} columns={columns} pageSize={10} autoHeight/> */}
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} aria-label="simple table">
            <TableHead sx={{
              maxHeight: '20px',
              p: 0
            }}>
              <TableRow>
                {columns.map((column) => (
                  <TableCell key={column.field}><b>{column.headerName}</b></TableCell>
                ))}
                <TableCell><b>Actions</b></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.id}>
                  {columns.map((column) => (
                    <TableCell key={column.field}>
                      {column.field.includes('status') ? (
                        <Badge bg={row[column.field] === 'active' ? 'success' : 'error'} style={{
                          marginTop: 0,
                          marginBottom: 10,
                          fontSize: '0.75rem',
                        }}>
                          {row[column.field]}
                        </Badge>
                      ) : (
                        row[column.field]
                      )}
                    </TableCell>
                  ))}
                  <TableCell>
                    <NavigationButtonComponent children={childrenNavigationRightButton} bgcolor='white' />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    );
  } else {
    return <div>Loading...</div>;
  };
}

export default RecentQuotesTableComponent;
