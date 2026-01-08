import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  IconButton,
  TableRow,
  TableCell,
  useTheme,
  useMediaQuery,
  Tooltip,
  Grid,
  Box,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined';
import FolderOpenOutlinedIcon from '@mui/icons-material/FolderOpenOutlined';
import { apiUrl } from '../../../../config';
import { fetchWithToken } from '../../../../utils';
import { AddBoxRounded } from '@mui/icons-material';

const useStyles = makeStyles({
  row: {
    '&:hover': {
      backgroundColor: '#f9f9f5',
    },
  },
});

const GroupStockRowComponent = ({
  group,
  onSelection,
  expandedItem,
  expandedGroups,
  setExpandedGroups,
  isInQuoteDetails,
  quote,
  quoteProducts,
  setIsLoadingOperation,
}) => {
  const classes = useStyles();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const isExpanded = useMemo(() => expandedGroups.has(group.id), [expandedGroups, group.id]);

  const quoteProductIds = useMemo(() => {
    const ids = new Set();
    (quoteProducts || []).forEach((p) => ids.add(p.id));
    return ids;
  }, [quoteProducts]);

  const handleToggle = useCallback(() => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(group.id)) next.delete(group.id);
      else next.add(group.id);
      return next;
    });
  }, [group.id, setExpandedGroups]);

  const handleItemOpen = useCallback(
    (item) => {
      onSelection?.(item, group);
    },
    [group, onSelection]
  );

  const handleAddToQuote = useCallback(
    async (event, item) => {
      event.stopPropagation();
      if (!quote?.id || !item?.id) return;

      setIsLoadingOperation?.(true);
      setLoading(true);

      try {
        const user = JSON.parse(localStorage.getItem('userLogged') || '{}');
        const userId = user?.data?.id;
        if (!userId) throw new Error('User not found');

        const payload = {
          quote_id: quote.id,
          product_id: item.id,
          user_id: userId,
          quantity: 1,
        };

        const response = await fetchWithToken(
          `${apiUrl}/dealerportal-manage-product-to-quote/`,
          'POST',
          payload,
          {},
          apiUrl
        );

        if (response.status !== 200) throw new Error('Failed to fetch data');

        quote.total_sell = response.data.data.quote.total_sell;
        quote.total_cost = response.data.data.quote.total_cost;
        quote.markup_total = response.data.data.quote.markup_total;
      } catch (err) {
        setError(err?.message || 'Error');
      } finally {
        setLoading(false);
        setIsLoadingOperation?.(false);
      }
    },
    [quote, setIsLoadingOperation]
  );

  const isDisabledAdd = useCallback((itemId) => quoteProductIds.has(itemId), [quoteProductIds]);

  const items = useMemo(() => group?.items || [], [group]);

  return (
    <>
      <TableRow sx={{ cursor: 'pointer' }} onClick={handleToggle}>
        <TableCell
          className={classes.row}
          sx={{
            color: !isExpanded ? '#677488' : '#669A41',
            fontWeight: !isExpanded ? 'normal' : 'bold',
            bgcolor: !isExpanded ? 'white' : '#f1f1fa',
            position: 'sticky',
            top: 0,
            zIndex: 1,
          }}
        >
          <IconButton>
            {isExpanded ? (
              <FolderOpenOutlinedIcon sx={{ color: '#669A41', fontWeight: 'bold' }} />
            ) : (
              <FolderOutlinedIcon sx={{ color: '#677488', fontWeight: 'normal' }} />
            )}
          </IconButton>
          {group.group_name}
        </TableCell>
      </TableRow>

      {isExpanded &&
        items.map((item, index) => {
          const selected = expandedItem?.item?.id === item.id;
          const disabled = isInQuoteDetails ? isDisabledAdd(item.id) : false;

          return (
            <TableRow
              key={item.id}
              className={classes.row}
              onClick={() => (!isInQuoteDetails ? handleItemOpen(item) : undefined)}
              sx={{ bgcolor: selected ? '#f1f1fa' : 'white' }}
            >
              <TableCell
                sx={{
                  paddingLeft: '70px',
                  fontSize: '14px',
                  color: 'gray',
                  position: 'relative',
                  cursor: 'pointer',
                }}
              >
                <Box
                  sx={{
                    position: 'absolute',
                    left: '40px',
                    top: 0,
                    bottom: index === items.length - 1 ? '50%' : 0,
                    width: '1px',
                    bgcolor: '#D6DADA',
                  }}
                />
                <Box
                  sx={{
                    position: 'absolute',
                    left: '40px',
                    top: '50%',
                    width: '20px',
                    height: '1px',
                    bgcolor: '#D6DADA',
                  }}
                />

                <span style={{ fontSize: '13px', color: 'info.main', width: '80%' }}>{item.name}</span>

                {isInQuoteDetails && (
                  <>
                    <br />
                    <Grid container spacing={1} sx={{ width: '100%' }}>
                      <Grid item xs={7}>
                        <span style={{ fontSize: '10px', color: 'info.main' }}>
                          Price: $ <b>{item.price}</b>
                        </span>
                        <br />
                        <span style={{ fontSize: '10px' }}>Stock: {item.stock}</span>
                      </Grid>

                      <Grid item xs={5} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <Tooltip
                          title={
                            isInQuoteDetails
                              ? `Click to Add to Quote Product: ${item.name}`
                              : `Click to See details: ${item.name}`
                          }
                          arrow
                          sx={{
                            '& .MuiTooltip-tooltip': {
                              backgroundColor: '#000000',
                              color: 'white',
                              fontSize: '0.875rem',
                            },
                          }}
                        >
                          <span>
                            <IconButton
                              onClick={(e) => handleAddToQuote(e, item)}
                              sx={{ color: 'info.main' }}
                              disabled={disabled || loading}
                            >
                              <AddBoxRounded />
                            </IconButton>
                          </span>
                        </Tooltip>
                      </Grid>
                    </Grid>
                  </>
                )}
              </TableCell>
            </TableRow>
          );
        })}
    </>
  );
};

export default GroupStockRowComponent;
