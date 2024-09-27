import React from 'react';

import { Box, useTheme, useMediaQuery, Modal, Button, Typography } from '@mui/material';
import CustomAlertComponent from '../../../../../Utils/components/CustomAlertComponent/CustomAlertComponent';
import CustomDateComponent from '../../../../../Utils/components/CustomDateComponent/CustomDateComponent';
import Swal from 'sweetalert2';
import { fetchWithToken } from '../../../../../../utils';
import { apiUrl } from '../../../../../../config';

const ModalProductsSyncComponent = ({ open, handleClose, zohoConfig }) => {

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const user = JSON.parse(localStorage.getItem('userLogged') || '{}');

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

  const customClassSwal = {
    popup: 'small-popup',
    title: 'small-title',
    icon: 'custom-icon',
    content: 'small-content',
    confirmButton: 'small-confirm-button',
  };

  const handleCloseModal = () => {
    handleClose();
  }

  const handleSyncProducts = async () => {
    try {
      const url = `${apiUrl}/z_api/dealerportal-zoho/sync_zoho_items/`;
      const data = {
        user_id: user.data.id,
      };
      const response = await fetchWithToken(url, 'POST', data, {}, apiUrl);
      if (response.status === 200) {
        handleCloseModal();
        if (!response.data.error) {
          Swal.fire({
            title: 'Success',
            text: `${response.data.message}`,
            icon: 'success',
            confirmButtonText: 'OK',
            customClass: customClassSwal,
          });
        } else {
          Swal.fire({
            title: 'Error',
            text: `${response.data.message}`,
            icon: 'error',
            confirmButtonText: 'Accept',
            customClass: customClassSwal,
          });
        }
      }
      
    } catch (error) {
      console.log(error);
    }
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
            <i className="fa-solid fa-sync"></i>
            Initiate Zoho Products (Items) Sync Manually
          </Typography>
        </div>
        <div className="modal-body">
          {zohoConfig?.connected ? (
            <div className="d-flex justify-content-center mb-3">
              <i className="fas fa-info-circle fa-2x text-muted align-self-start"></i>
            </div>
          ) : (
            <div className="d-flex justify-content-center mb-3">
              <i className="fas fa-exclamation-triangle fa-2x text-warning align-self-start"></i>
            </div>
          )}
          <CustomAlertComponent
            sx={{ mb: 2 }}
            severity={zohoConfig?.connected ? "warning" : "error"}
            message={zohoConfig?.connected ? "Please confirm if you want to sync items. This action cannot be undone." :
              "You are currently not connected to the Zoho API. Please check your API settings and ensure a valid connection before attempting to sync Zoho items."}
          />
          {zohoConfig?.connected && (
            <p className="mt-2 text-muted small">
              <i className="fas fa-clock me-1"></i>
              Last sync time: <b><CustomDateComponent date={zohoConfig?.last_sync_time} /></b>
            </p>
          )}
          <div className="modal-footer">
            <Box sx={{ display: 'flex', mt: 2, justifyContent: 'center' }}>
              {zohoConfig?.connected && (
                <Button variant="contained" color="success" onClick={handleSyncProducts} sx={{ mr: 2 }}>
                  Sync Zoho Items
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

export default ModalProductsSyncComponent;
