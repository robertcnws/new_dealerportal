import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Alert,
  Divider,
  useTheme,
  useMediaQuery,
  IconButton
} from '@mui/material';
import { Badge } from 'react-bootstrap';
import TableQuoteProductsComponent from '../TableQuoteProductsComponent/TableQuoteProductsComponent';
import './QuoteDetailsComponent.css';
import { ExpandLess, ExpandMore } from '@mui/icons-material';
import CustomDateComponent from '../../../Utils/components/CustomDateComponent/CustomDateComponent';
import StickyBoxComponent from '../StickyBoxComponent/StickyBoxComponent';

const QuoteDetailsComponent = ({ quote, quoteProducts, onSyncCompleted, setIsLoadingOperation, isLoadingOperation }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [expanded, setExpanded] = useState(true);

  const totals = useMemo(() => {
    const total_cost = Number.parseFloat(quote?.total_cost ?? 0) || 0;
    const markup_total = Number.parseFloat(quote?.markup_total ?? 0) || 0;
    const total_sell = Number.parseFloat(quote?.total_sell ?? 0) || 0;
    return { total_cost, markup_total, total_sell };
  }, [quote?.total_cost, quote?.markup_total, quote?.total_sell]);

  if (isLoadingOperation) {
    return (
      <div className="app-container">
        <div className="loading-overlay">
          <div className="spinner">Loading...</div>
        </div>
      </div>
    );
  }

  if (!isMobile) {
    return (
      <Box sx={{ padding: 1, overflowY: 'auto', ml: -1, minWidth: '100%' }}>
        <Paper elevation={3} sx={{ padding: 2, boxShadow: 'none', minHeight: 'calc(100vh - 170px)', border: '1px solid #ddd' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'right', mb: 2 }}>
            <Grid container spacing={1} sx={{ p: 1, display: 'flex', justifyContent: 'space-between' }}>
              <Grid item xs={4} sx={{ border: '1px solid whitesmoke', borderRadius: '10px', p: 1 }}>
                <Grid item xs={12}>
                  <Box sx={{ mb: 1, p: 1 }}>
                    <Typography variant="body1">
                      Status: <Badge bg={quote?.status === 'Pending' ? 'warning' : 'success'}>{quote?.status}</Badge>
                    </Typography>
                    <Typography variant="body1">
                      <b>Job Name</b>: {quote?.job_name}
                    </Typography>
                    <Typography variant="body1">
                      <b>Created By</b>: {quote?.owner_name}
                    </Typography>
                    <Typography variant="body1">
                      <b>Created At</b>: <CustomDateComponent date={new Date(quote?.created_at)} />
                    </Typography>
                    <Typography variant="body1">
                      <b>Mark Up</b>: {quote?.mark_up}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
              <Grid item xs={8} sx={{ borderRadius: '10px', p: 1, justifyContent: 'space-between' }}>
                <Box sx={{ ml: 1, mr: 1, p: 1, width: '100%', boxShadow: '0px 1px 1px rgba(0, 0, 0, 0.1)', bgcolor: '#F1F1F1', borderRadius: '10px', textAlign: 'right' }}>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    QUOTE TOTALS
                  </Typography>
                  <Divider />
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="body1">
                      <b>Total Cost</b>: $ {totals.total_cost.toFixed(2)}
                    </Typography>
                    <Typography variant="body1">
                      <b>Mark up Total</b>: $ {totals.markup_total.toFixed(2)}
                    </Typography>
                    <Typography variant="body1">
                      <b>Total Sell</b>: $ {totals.total_sell.toFixed(2)}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Box>

          <Box sx={{ textAlign: 'center', width: '100%', mt: 1 }}>
            {quoteProducts?.length > 0 ? (
              <Grid container spacing={1} sx={{ display: 'flex', justifyContent: 'center' }}>
                <TableQuoteProductsComponent
                  quote={quote}
                  onSyncCompleted={onSyncCompleted}
                  setIsLoadingOperation={setIsLoadingOperation}
                />
              </Grid>
            ) : (
              <Alert severity="warning" sx={{ mt: 2 }}>
                No products added to this quote yet.
              </Alert>
            )}
          </Box>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ padding: 1, overflowY: 'auto', ml: -1, minWidth: '101%' }}>
      <Paper elevation={3} sx={{ padding: 2, boxShadow: 'none', borderRadius: '10px', minHeight: 'calc(100vh - 175px)' }}>
        <StickyBoxComponent quote={quote} />
        <Box sx={{ textAlign: 'center', width: '102%', mt: 0, ml: 0 }}>
          {quoteProducts?.length > 0 ? (
            <Grid container spacing={1} sx={{ display: 'flex', justifyContent: 'center' }}>
              <TableQuoteProductsComponent
                quote={quote}
                onSyncCompleted={onSyncCompleted}
                setIsLoadingOperation={setIsLoadingOperation}
              />
            </Grid>
          ) : (
            <Alert severity="warning" sx={{ mt: 1 }}>
              No products added to this quote yet.
            </Alert>
          )}
        </Box>

        <Box sx={{ position: 'fixed', left: 0, right: 0, bottom: 33, zIndex: 1000, px: 1 }}>
          <Box sx={{ bgcolor: '#F1F1F1', border: '1px solid lightgray', borderRadius: 2, p: 1, boxShadow: '0px 1px 1px rgba(0, 0, 0, 0.1)' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="subtitle1">
                <b>QUOTE TOTALS</b>
              </Typography>
              <IconButton onClick={() => setExpanded((prev) => !prev)} size="small">
                {expanded ? <ExpandMore /> : <ExpandLess />}
              </IconButton>
            </Box>

            {expanded && (
              <Box sx={{ mt: 1, textAlign: 'right' }}>
                <Typography variant="body2">
                  <b>Total Cost</b>: $ {totals.total_cost.toFixed(2)}
                </Typography>
                <Typography variant="body2">
                  <b>Mark up Total</b>: $ {totals.markup_total.toFixed(2)}
                </Typography>
                <Typography variant="body2">
                  <b>Total Sell</b>: $ {totals.total_sell.toFixed(2)}
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default QuoteDetailsComponent;
