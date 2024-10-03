import React, { useEffect, useState } from 'react';
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
  // const isMobile = useMediaQuery('(max-width:999px)');

  const [expanded, setExpanded] = useState(true);

  const toggleExpand = () => {
    setExpanded((prev) => !prev);
  };

  useEffect(() => {
    // if (isSyncing) {
    const intervalId = setInterval(onSyncCompleted, 500000);
    return () => clearInterval(intervalId);
    // }
  }, [onSyncCompleted]);

  if (isLoadingOperation) {
    return (
      <div className="app-container">
        <div className="loading-overlay">
          <div className="spinner">Loading...</div>
        </div>
      </div>
    )
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
                      Status: <Badge bg={quote.status === 'Pending' ? 'warning' : 'success'}>{quote.status}</Badge>
                    </Typography>
                    <Typography variant="body1">
                      <b>Job Name</b>: {quote.job_name}
                    </Typography>
                    <Typography variant="body1">
                      <b>Created By</b>: {quote.owner_name}
                    </Typography>
                    <Typography variant="body1">
                      <b>Created At</b>: <CustomDateComponent date={new Date(quote.created_at)} />
                    </Typography>
                    <Typography variant="body1">
                      <b>Mark Up</b>: {quote.mark_up}
                    </Typography>
                  </Box>
                </Grid>
                {/* <Grid item xs={2}>
                <Box sx={{ mb: 2, p: 1 }}>
                  <NavigationButtonComponent children={childrenNavigationButton} />
                </Box>
              </Grid> */}
              </Grid>
              <Grid item xs={8} sx={{ borderRadius: '10px', p: 1, justifyContent: 'space-between' }}>
                <Box sx={{
                  ml: 1,
                  mr: 1,
                  p: 1,
                  width: '100%',
                  boxShadow: '0px 1px 1px rgba(0, 0, 0, 0.1)',
                  bgcolor: '#F1F1F1',
                  borderRadius: '10px',
                  textAlign: 'right'
                }}>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    QUOTE TOTALS
                  </Typography>
                  <Divider />
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="body1">
                      <b>Total Cost</b>: $ {parseFloat(quote.total_cost).toFixed(2)}
                    </Typography>
                    <Typography variant="body1">
                      <b>Mark up Total</b>: $ {parseFloat(quote.markup_total).toFixed(2)}
                    </Typography>
                    <Typography variant="body1">
                      <b>Total Sell</b>: $ {parseFloat(quote.total_sell).toFixed(2)}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Box>
          {/* <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'left', width: '100%' }}>
          <Grid container spacing={1} sx={{ display: 'flex', justifyContent: 'center' }}>
            <Grid item xs={12} sx={{ borderRadius: '10px', p: 1, justifyContent: 'center' }}>
              <Box sx={{
                ml: 1,
                mr: 1,
                p: 1,
                width: '100%',
                boxShadow: '0px 1px 1px rgba(0, 0, 0, 0.1)',
                bgcolor: '#F1F1F1',
                borderRadius: '10px',
                textAlign: 'right'
              }}>
                <Typography variant="h6" sx={{ mb: 1 }}>
                  QUOTE NOTES
                </Typography>
                <Divider />
                <form>
                  <Box sx={{ mt: 1 }}>
                    <FormControl variant="outlined" size="small" style={{ width: '100%' }}>
                      <TextareaAutosize
                        minRows={1}
                        placeholder="Enter your notes here..."
                        style={{ width: '100%', borderRadius: '5px', border: '1px solid #ddd' }}
                      />
                    </FormControl>
                    <Box sx={{ mt: 1 }}>
                      <Button variant="contained" color="primary" size="small" type="submit">
                        Save Notes
                      </Button>
                    </Box>
                  </Box>
                </form>
              </Box>
            </Grid>
          </Grid>
        </Box> */}
          <Box sx={{ textAlign: 'center', width: '100%', mt: 1 }}>
            {quoteProducts.length > 0 ? (
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
      </Box >
    );
  }
  return (
    <Box sx={{ padding: 1, overflowY: 'auto', ml: -1, minWidth: '101%' }}>
      <Paper elevation={3} sx={{ padding: 2, boxShadow: 'none', borderRadius: '10px', minHeight: 'calc(100vh - 175px)' }}>
        <StickyBoxComponent quote={quote} /> 
        <Box sx={{ textAlign: 'center', width: '102%', mt: 0, ml: 0 }}>
          {quoteProducts.length > 0 ? (
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
        <Box sx={{
          position: 'fixed',
          bottom: 33,
          right: 7,
          zIndex: 1000,
          width: expanded ? '99%' : 'auto',
          height: expanded ? 'auto' : '50px',
          boxShadow: '0px 1px 1px rgba(0, 0, 0, 0.1)',
          bgcolor: expanded ? '#F1F1F1' : 'transparent',
          borderRadius: expanded ? '0px' : '50%',
          textAlign: 'right',
          border: expanded ? '1px solid lightgray' : 'none',
          p: 1,
        }}>
          <Box sx={{ bgcolor: !expanded ? '#F1F1F1' : 'inherit' }}>
            <IconButton onClick={toggleExpand} sx={{
              position: 'absolute',
              top: expanded ? '10px' : '0',
              right: expanded ? '88%' : '0',
              bgcolor: !expanded ? '#F1F1F1' : 'inherit',
              borderRadius: '10%',
              color: !expanded ? 'black' : 'inherit',
            }}>
              {expanded ? <ExpandMore /> : <><ExpandLess /> <small style={{ fontSize: '13px' }}><b>Show Totals</b></small></>}
            </IconButton>
          </Box>
          {expanded && (
            <Box sx={{ ml: 1, mr: 1, p: 1, width: '100%' }}>
              <Grid container spacing={1}>
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    <b>QUOTE TOTALS</b>
                  </Typography>
                  {/* <Divider /> */}
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="body1">
                      <b>Total Cost</b>: $ {parseFloat(quote.total_cost).toFixed(2)}
                    </Typography>
                    <Typography variant="body1">
                      <b>Mark up Total</b>: $ {parseFloat(quote.markup_total).toFixed(2)}
                    </Typography>
                    <Typography variant="body1">
                      <b>Total Sell</b>: $ {parseFloat(quote.total_sell).toFixed(2)}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          )}
        </Box>

        {/* <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'left', width: '100%' }}>
        <Grid container spacing={1} sx={{ display: 'flex', justifyContent: 'center' }}>
          <Grid item xs={12} sx={{ borderRadius: '10px', p: 1, justifyContent: 'center' }}>
            <Box sx={{
              ml: 1,
              mr: 1,
              p: 1,
              width: '100%',
              boxShadow: '0px 1px 1px rgba(0, 0, 0, 0.1)',
              bgcolor: '#F1F1F1',
              borderRadius: '10px',
              textAlign: 'right'
            }}>
              <Typography variant="h6" sx={{ mb: 1 }}>
                QUOTE NOTES
              </Typography>
              <Divider />
              <form>
                <Box sx={{ mt: 1 }}>
                  <FormControl variant="outlined" size="small" style={{ width: '100%' }}>
                    <TextareaAutosize
                      minRows={1}
                      placeholder="Enter your notes here..."
                      style={{ width: '100%', borderRadius: '5px', border: '1px solid #ddd' }}
                    />
                  </FormControl>
                  <Box sx={{ mt: 1 }}>
                    <Button variant="contained" color="primary" size="small" type="submit">
                      Save Notes
                    </Button>
                  </Box>
                </Box>
              </form>
            </Box>
          </Grid>
        </Grid>
      </Box> */}


      </Paper>
    </Box >
  );
};

export default QuoteDetailsComponent;
