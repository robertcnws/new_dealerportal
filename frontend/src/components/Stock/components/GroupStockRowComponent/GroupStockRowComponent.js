import React, { useEffect, useState } from 'react';
import {
  IconButton,
  TableRow,
  TableCell,
  useTheme,
  useMediaQuery,
  Tooltip,
  Grid,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined';
import FolderOpenOutlinedIcon from '@mui/icons-material/FolderOpenOutlined';
import { apiUrl } from '../../../../config';
import { fetchWithToken } from '../../../../utils';
import { AddBoxRounded } from '@mui/icons-material';
import { set } from 'react-hook-form';

const useStyles = makeStyles({
  row: {
    '&:hover': {
      backgroundColor: '#f9f9f5', // Cambia esto por el color que desees
    },
  },
});

const GroupStockRowComponent = ({ 
  group, onSelection, expandedItem, isInQuoteDetails, quote, quoteProducts, setIsLoadingOperation
}) => {
  const classes = useStyles();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [buttonsDisabled, setButtonsDisabled] = useState([]);
  const [error, setError] = useState('');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    const updateButtons = () => {
      if (group.items.length > 0 && isInQuoteDetails) {
        const buttonsDisabled = group.items.map((item) => {
          return {
            id: item.id,
            disabled: setDisabledAddToQuote(item),
          };
        });
        setButtonsDisabled(buttonsDisabled);
      }
    };
    updateButtons();
    
  }, [group, quoteProducts]);

  const handleToggle = () => {
    setOpen(!open);
  };

  const handleItemOpen = (item, stock) => {
    onSelection(item, stock);
  }

  const handleAddToQuote = async (event, quote, item) => {
    event.stopPropagation();
    setLoading(true);
    setIsLoadingOperation(true);
    buttonsDisabled.forEach((button) => {
      if (button.id === item.id) {
        button.disabled = true;
      }
    });
    try {
      const user = JSON.parse(localStorage.getItem('userLogged'));
      const payload = {
        quote_id: quote.id,
        product_id: item.id,
        user_id: user.data.id,
        quantity: 1,
      };
      const response = await fetchWithToken(`${apiUrl}/api-dealerportal-manage-product-to-quote/`, 'POST', payload, {}, apiUrl);
      if (response.status !== 200) {
        throw new Error(`Failed to fetch data`);
      }
      quote.total_sell = response.data.data.quote.total_sell;
      quote.total_cost = response.data.data.quote.total_cost;
      quote.markup_total = response.data.data.quote.markup_total;
      setIsLoadingOperation(false);

      // if (onSyncComplete) {
      //   onSyncComplete();
      // }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const setDisabledAddToQuote = (item) => {
    return quoteProducts.some((quoteProduct) => {
      // console.log(quoteProduct.id, item.id);
      return quoteProduct.id === item.id
    });
  }

  return (
    <>
      <TableRow sx={{
        cursor: 'pointer',
      }}
        onClick={handleToggle}>
        <TableCell className={classes.row}
          sx={{
            color: !open ? '#677488' : '#669A41',
            fontWeight: !open ? 'normal' : 'bold',
            bgcolor: !open ? 'white' : '#f1f1fa',
            position: 'sticky',
            top: 0,
            zIndex: 1,
          }}>
          <IconButton>
            {open ?
              <FolderOpenOutlinedIcon sx={{ color: '#669A41', fontWeight: 'bold' }} /> :
              // <FontAwesomeIcon icon={faFolderOpen} sx={{ color: '#669A41', fontWeight: 'bold' }} /> :
              <FolderOutlinedIcon sx={{ color: '#677488', fontWeight: 'normal' }} />}
          </IconButton>
          {group.group_name}
        </TableCell>
      </TableRow>
      {open && group.items.map((item, index) => (
        <TableRow key={item.id} className={classes.row}
          onClick={() => !isInQuoteDetails ? handleItemOpen(item, group) : null}
          sx={{
            bgcolor: expandedItem && expandedItem.item.id === item.id ? '#f1f1fa' : 'white',
          }}>
          <TableCell sx={{
            paddingLeft: '70px',
            fontSize: '14px',
            color: 'gray',
            position: 'relative',
            cursor: 'pointer',
          }}
          >
            <div
              style={{
                position: 'absolute',
                left: '40px',
                top: 0,
                bottom: index === group.items.length - 1 ? '50%' : '0',
                width: '1px',
                backgroundColor: '#D6DADA',
              }}
            />

            <div
              style={{
                position: 'absolute',
                left: '40px',
                top: '50%',
                width: '20px',
                height: '1px',
                backgroundColor: '#D6DADA',
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
                      title={isInQuoteDetails ? `Click to Add to Quote Product: ${item.name}` : `Click to See details: ${item.name}`}
                      key={item.id}
                      arrow
                      sx={{
                        '& .MuiTooltip-tooltip': {
                          backgroundColor: '#000000',
                          color: 'white',
                          fontSize: '0.875rem'
                        }
                      }}
                    >
                      <span>
                        {buttonsDisabled.length > 0 && (
                          <IconButton
                            onClick={(e) => handleAddToQuote(e, quote, item)}
                            sx={{ color: 'info.main' }}
                            disabled={buttonsDisabled.find((button) => button.id === item.id).disabled}
                          >
                            <AddBoxRounded />
                          </IconButton>
                        )}
                      </span>
                    </Tooltip>
                  </Grid>
                </Grid>
                {/* <span style={{ fontSize: '10px' }}>SKU: <b>{item.sku}</b></span><br /> */}

              </>
            )}
          </TableCell>
        </TableRow>
      ))}
    </>
  );
};

export default GroupStockRowComponent;
