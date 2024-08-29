import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  IconButton,
  Grid,
  Alert,
  Tooltip
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { staticUrl } from '../../../../config';

const ItemStockDetailsComponent = ({ item, stock, onClose }) => {

  const [imageUrl, setImageUrl] = useState('');
  const [aspectRatio, setAspectRatio] = useState(0);
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    const fetchImageUrl = async () => {
      try {
        setImageUrl(`${staticUrl}/styles/img/products/${item.image_name}`);
        const img = new Image();
        img.src = `${staticUrl}/styles/img/products/${item.image_name}`;
        img.onload = () => {
          setAspectRatio(Math.round(img.width / img.height));
        };
        img.onerror = () => {
          console.error('Error loading image');
          setAspectRatio(0);
        };
      } catch (error) {
        console.error('Error fetching image URL:', error);
      }
    };
    fetchImageUrl();
  }, [item.id, aspectRatio]);

  const getImageStyle = () => {
    if (aspectRatio == 1) {
      return {
        width: '80%',
        height: '80%',
        objectFit: 'cover',
        borderRadius: 4,
      };
    } else if (aspectRatio > 1) {
      return {
        width: '80%',
        height: '60%',
        objectFit: 'cover',
        borderRadius: 4,
      };
    }
  };

  const handleCopySKU = () => {
    navigator.clipboard.writeText(item.sku).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    });
  };

  return (
    <Box sx={{ padding: 1, overflowY: 'auto', ml: -1, minWidth: '100%', mt: 5 }}>
      <Paper elevation={3} sx={{ padding: 2, boxShadow: 'none', borderRadius: '10px', minHeight: 'calc(100vh - 175px)' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5">{stock.group_name}</Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="h6">{item.name}</Typography>
              <Typography variant="body1">
                Selling Price: <strong>${item.price}</strong>
              </Typography>
              <Typography variant="body1">
                Available Stock: <strong>{item.stock}</strong>
              </Typography>
              <Box
                sx={{
                  backgroundColor: '#f2f2f2',
                  padding: 2,
                  mt: 2,
                  whiteSpace: 'pre-line'
                }}
              >
                <Typography variant="body2" color="textSecondary">
                  {item.description}
                </Typography>
              </Box>
              <Typography variant="body1">
                <strong>SKU :</strong> <code>{item.sku}</code>
                <Tooltip title={copySuccess ? "Copied!" : "Copy SKU"}>
                  <IconButton onClick={handleCopySKU}>
                    <ContentCopyIcon />
                  </IconButton>
                </Tooltip>
              </Typography>
            </Box>
          </Grid>
          <Grid container justifyContent="center" alignItems="center" item xs={6}>
            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              {aspectRatio > 0 ? (
                <img
                  src={imageUrl}
                  alt={item.name}
                  style={getImageStyle()}
                />
              ) : (
                <Alert severity="warning">Image not available</Alert>
              )}
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default ItemStockDetailsComponent;
