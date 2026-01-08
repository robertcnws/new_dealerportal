import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  IconButton,
  Grid,
  Alert,
  Tooltip,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { staticUrl } from '../../../../config';

const ItemStockDetailsComponent = ({ item, stock, onClose }) => {
  const [imageUrl, setImageUrl] = useState('');
  const [aspectRatio, setAspectRatio] = useState(0);
  const [copySuccess, setCopySuccess] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    if (!item?.image_name) {
      setImageUrl('');
      setAspectRatio(0);
      return;
    }

    const url = `${staticUrl}/styles/img/products/${item.image_name}`;
    setImageUrl(url);

    let cancelled = false;
    const img = new Image();
    img.onload = () => {
      if (cancelled) return;
      const w = img.naturalWidth || img.width || 0;
      const h = img.naturalHeight || img.height || 0;
      setAspectRatio(w > 0 && h > 0 ? w / h : 0);
    };
    img.onerror = () => {
      if (cancelled) return;
      setAspectRatio(0);
    };
    img.src = url;

    return () => {
      cancelled = true;
    };
  }, [item?.image_name]);

  const imgStyle = useMemo(() => {
    if (aspectRatio <= 0) return undefined;
    const isSquare = Math.abs(aspectRatio - 1) < 0.08;
    const isLandscape = aspectRatio > 1;

    if (isSquare) {
      return { width: '80%', height: '80%', objectFit: 'cover', borderRadius: 4 };
    }
    if (isLandscape) {
      return { width: '80%', height: '60%', objectFit: 'cover', borderRadius: 4 };
    }
    return { width: '60%', height: '80%', objectFit: 'cover', borderRadius: 4 };
  }, [aspectRatio]);

  useEffect(() => {
    if (!copySuccess) return;
    const t = setTimeout(() => setCopySuccess(false), 2000);
    return () => clearTimeout(t);
  }, [copySuccess]);

  const handleCopySKU = useCallback(() => {
    const sku = item?.sku || '';
    if (!sku) return;

    navigator.clipboard
      ?.writeText(sku)
      .then(() => setCopySuccess(true))
      .catch(() => setCopySuccess(false));
  }, [item?.sku]);

  const handleClose = useCallback(() => {
    onClose?.();
  }, [onClose]);

  const Details = (
    <>
      <Box sx={{ mb: 2 }}>
        <Typography variant="h6">{item?.name}</Typography>
        <Typography variant="body1">
          Selling Price: <strong>${item?.price}</strong>
        </Typography>
        <Typography variant="body1">
          Available Stock: <strong>{item?.stock}</strong>
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
            {item?.description}
          </Typography>
        </Box>

        <Typography variant="body1">
          <strong>SKU :</strong> <code>{item?.sku}</code>
          <Tooltip title={copySuccess ? 'Copied!' : 'Copy SKU'}>
            <IconButton onClick={handleCopySKU} disabled={!item?.sku}>
              <ContentCopyIcon />
            </IconButton>
          </Tooltip>
        </Typography>
      </Box>
    </>
  );

  const ImageBox = (
    <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      {aspectRatio > 0 && imageUrl ? (
        <img src={imageUrl} alt={item?.name || 'product'} style={imgStyle} />
      ) : (
        <Alert severity="warning">Image not available</Alert>
      )}
    </Box>
  );

  if (!isMobile) {
    return (
      <Box sx={{ padding: 1, overflowY: 'auto', ml: -1, minWidth: '100%', mt: 5.5 }}>
        <Paper
          elevation={3}
          sx={{
            padding: 2,
            boxShadow: 'none',
            minHeight: 'calc(100vh - 170px)',
            border: '1px solid #ddd'
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h5">{stock?.group_name}</Typography>
            <IconButton onClick={handleClose}>
              <CloseIcon />
            </IconButton>
          </Box>

          <Grid container spacing={2}>
            <Grid item xs={6}>
              {Details}
            </Grid>
            <Grid container justifyContent="center" alignItems="center" item xs={6}>
              {ImageBox}
            </Grid>
          </Grid>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ padding: 1, overflowY: 'auto', ml: -1, minWidth: '100%', mt: 2 }}>
      <Paper elevation={3} sx={{ padding: 2, boxShadow: 'none', borderRadius: '10px', minHeight: 'calc(100vh - 175px)' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5">{stock?.group_name}</Typography>
          <IconButton onClick={handleClose}>
            <CloseIcon />
          </IconButton>
        </Box>

        <Grid container spacing={2}>
          <Grid item xs={12}>
            {Details}
          </Grid>
          <Grid container justifyContent="center" alignItems="center" item xs={12}>
            {ImageBox}
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default ItemStockDetailsComponent;
