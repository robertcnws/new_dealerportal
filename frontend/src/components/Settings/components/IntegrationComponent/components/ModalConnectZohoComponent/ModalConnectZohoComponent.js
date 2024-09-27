import React from 'react';

import { Box, useTheme, useMediaQuery, Modal, Button, Typography } from '@mui/material';
import CustomAlertComponent from '../../../../../Utils/components/CustomAlertComponent/CustomAlertComponent';

const ModalConnectZohoComponent = ({ open, handleClose, zohoConfig }) => {

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: isMobile ? '100%' : '700px',
    bgcolor: 'background.paper',
    border: '1px solid #ddd',
    boxShadow: 24,
    p: 4,
    borderRadius: '10px',
  };

  const handleCloseModal = () => {
    handleClose();
  }

  if (!zohoConfig) {
    return null;
  }

  return (
    <Modal
      open={open}
      onClose={handleCloseModal}
      aria-labelledby="zoho-connected-modal"
      sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Box sx={style}>
        <div className="modal-header" style={{ borderBottom: '1px solid #ddd', marginBottom: 10 }}>
          <Typography id="add-new-quote-modal" variant="h6" component="h5" style={{ marginBottom: 10 }}>
            <i className="fa-solid fa-dolly"></i>
            Connecting to Zoho Inventory
          </Typography>
        </div>
        <div className="modal-body">
          <CustomAlertComponent
            sx={{ mb: 2 }}
            severity={zohoConfig?.connected ? "success" : "warning"}
            message={zohoConfig?.connected ? "You are currently connected to Zoho" : "You are currently not connected to Zoho Inventory. Click the button below to establish a connection"}
          />
          <div className="modal-footer">
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              {!zohoConfig?.connected && (
                <Button variant="contained" color="primary" onClick={handleCloseModal}>
                  Connect to Zoho Inventory
                </Button>
              )}
              <Button onClick={handleCloseModal} sx={{ bgcolor: '#F6D3A1', color: 'gray' }}>
                Close
              </Button>
            </Box>
          </div>
        </div>
      </Box>
    </Modal >
  );
}

export default ModalConnectZohoComponent;
