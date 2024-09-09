import React, { useState } from 'react';
import {
  Box,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  useTheme,
  useMediaQuery
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import FileCopy from '@mui/icons-material/FileCopy';
import Delete from '@mui/icons-material/Delete';
import { Badge } from 'react-bootstrap';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import NavigationButtonComponent from '../../../Utils/components/NavigationButtonComponent/NavigationButtonComponent';
import { apiFrontendRoot, apiUrl } from '../../../../config';
import { fetchWithToken } from '../../../../utils';

const RecentQuotesTableComponent = ({ data }) => {

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [isQuoteSelected, setIsQuoteSelected] = useState(false);
  const [quoteSelected, setQuoteSelected] = useState(null);
  const navigate = useNavigate();

  const columns = [
    { field: 'created_at', headerName: 'Date', width: isMobile ? 80 : 100 },
    { field: 'status', headerName: 'Status', width: isMobile ? 60 : 80 },
    { field: 'job_name', headerName: 'Job Name', width: 120 },
    ...(!isMobile ? [
      { field: 'id', headerName: 'Quote #', width: 80 },
      { field: 'dealer_account', headerName: 'Dealer Account', width: 120 },
      { field: 'owner', headerName: 'Created By', width: 120 },
      { field: 'total_sell', headerName: 'Total Sell', width: 100 },
      { field: 'total_cost', headerName: 'Total Cost', width: 100 },
      { field: 'updated_at', headerName: 'Last Modified', width: 120 },
    ] : []),
  ];

  const rows = [];
  if (data) {
    data.forEach((quote) => {
      rows.push({
        id: quote.id,
        created_at: quote.created_at ? quote.created_at.split('T')[0] : '',
        status: quote.status,
        job_name: quote.name,
        dealer_account: quote.owner.dealer_account?.name,
        owner: `${quote.owner.first_name} ${quote.owner.last_name}`,
        total_sell: quote.total_sell,
        total_cost: quote.total_cost,
        updated_at: quote.updated_at,
        mark_up: quote.markup,
        markup_total: quote.markup_total,
      });
    });

    const handleDeleteQuote = async (quote) => {
      const customClassSwal = {
        popup: 'small-popup',
        title: 'small-title',
        icon: 'custom-icon',
        content: 'small-content',
        confirmButton: 'small-confirm-button'
      }
      try {
        Swal.fire({
          title: 'Are you sure?',
          text: `You will not be able to recover quote # ${quote.id}!`,
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Yes, delete it!',
          cancelButtonText: 'No, keep it',
          customClass: customClassSwal
        }).then(async (result) => {
          if (result.isConfirmed) {
            const user = JSON.parse(localStorage.getItem('userLogged'));
            const payload = {
              user_id: user.data.id
            };
            const response = await fetchWithToken(`${apiUrl}/api-dealerportal/quotes/delete/${quote.id}/`, 'POST', payload, {}, apiUrl);
            if (response.status === 200) {
              Swal.fire({
                title: `${response.data.data.info}`,
                text: `${response.data.data.message}`,
                icon: 'success',
                confirmButtonText: 'OK',
                customClass: customClassSwal,
                willClose: () => {
                  rows.filter(q => q.id !== quote.id);
                }
              });
            } else {
              throw new Error('Failed to delete quote');
            }
          }
        });
      } catch (err) {
        Swal.fire({
          title: 'Error',
          text: 'Failed to delete quote',
          icon: 'error',
          confirmButtonText: 'Cool',
          customClass: customClassSwal
        });
      }
    };

    const handleCloneQuote = async (quote) => {
      const customClassSwal = {
        popup: 'small-popup',
        title: 'small-title',
        icon: 'custom-icon',
        content: 'small-content',
        confirmButton: 'small-confirm-button'
      }
      try {
        Swal.fire({
          title: 'Are you sure?',
          text: `You are about to clone quote # ${quote.id}!`,
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Yes, clone it!',
          cancelButtonText: 'No, keep it',
          customClass: customClassSwal
        }).then(async (result) => {
          if (result.isConfirmed) {
            const user = JSON.parse(localStorage.getItem('userLogged'));
            const payload = {
              user_id: user.data.id
            };
            const response = await fetchWithToken(`${apiUrl}/api-dealerportal/quotes/clone/${quote.id}/`, 'POST', payload, {}, apiUrl);
            if (response.status === 200) {
              Swal.fire({
                title: !response.data.data.error ? `${response.data.data.info}` : `${response.data.data.error}`,
                text: `${response.data.data.message}`,
                icon: !response.data.data.error ? 'success' : 'error',
                confirmButtonText: 'OK',
                customClass: customClassSwal,
                // willClose: () => {
                //   if (!response.data.data.error) {
                //     const newQuotes = [...quotes, response.data.data.quote];
                //     setQuotes(newQuotes);
                //     setFilteredQuotes(newQuotes);
                //   }
                // }
              });
            } else {
              throw new Error('Failed to clone quote');
            }
          }
        });
      } catch (err) {
        Swal.fire({
          title: 'Error',
          text: 'Failed to clone quote',
          icon: 'error',
          confirmButtonText: 'OK',
          customClass: customClassSwal
        });
      }
    };

    const handleOpenQuoteDetails = (quote) => {
      setIsQuoteSelected(true);
      setQuoteSelected(quote);
      navigate(`${apiFrontendRoot}/quote-details`, { state: { quote: quote } });
    };

    const childrenNavigationRightButton = [
      { label: 'View', icon: <Visibility sx={{ marginRight: 1 }} />, onClick: handleOpenQuoteDetails, visibility: true, noBorder: true },
      { label: 'Clone', icon: <FileCopy sx={{ marginRight: 1 }} />, onClick: handleCloneQuote, visibility: true, noBorder: true },
      { label: 'Delete', icon: <Delete sx={{ marginRight: 1 }} />, onClick: handleDeleteQuote, visibility: true, noBorder: true }
    ];

    return (
      <Box sx={{ width: '100%', mb: 5 }}>
        {/* <DataGrid rows={rows} columns={columns} pageSize={10} autoHeight/> */}
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: '100%' }} aria-label="simple table">
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
