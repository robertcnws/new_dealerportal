import { Alert, AlertTitle, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const CustomAlertComponent = ({ severity, title, message, sx, onClose }) => {
  return (
    <Alert
      severity={severity}
      sx={sx ? sx : ''}
      action={
        onClose && (
          <IconButton
            aria-label="close"
            color="inherit"
            size="small"
            onClick={onClose}
          >
            <CloseIcon fontSize="inherit" />
          </IconButton>
        )
      }
    >
      <AlertTitle>{title ? title : ''}</AlertTitle>
      {message ? message : ''}
    </Alert>
  );
};


export default CustomAlertComponent;