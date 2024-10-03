import React, { useState } from 'react';
import { Box, Typography, Grid, IconButton, Button } from '@mui/material';
import { Badge } from 'react-bootstrap';
import PercentIcon from '@mui/icons-material/Percent'; 
import { ExpandLessOutlined, ExpandMoreOutlined, ListAltOutlined } from '@mui/icons-material';
import CustomDateComponent from '../../../Utils/components/CustomDateComponent/CustomDateComponent';

const StickyBoxComponent = ({ quote }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleToggleExpand = () => {
    setIsExpanded((prevState) => !prevState);
  };

  return (
    <>
      <Box
        id="sticky-box"
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          mb: 0,
          mt: 13,
          ml: -2,
          position: 'fixed',
          top: 0,
          zIndex: 1000,
          backgroundColor: '#F1F1F1',
          p: 1,
          borderBottom: '1px solid lightgray',
          width: '100%',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            width: '100%',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Typography variant="body1" sx={{ marginRight: 2 }}>
            <IconButton color="gray" sx={{ p: 0 }}>
              <ListAltOutlined />
            </IconButton>
            <b> {quote.job_name}</b>{' '}
            <Badge bg={quote.status === 'Pending' ? 'warning' : 'success'}>
              {quote.status}
            </Badge>
          </Typography>
          <Typography variant="body1">
            <IconButton color="gray" sx={{ p: 0 }}>
              <PercentIcon />
            </IconButton>
            <b> ({quote.mark_up})</b>
          </Typography>
          <Button onClick={handleToggleExpand} sx={{ ml: 2, color: 'black' }}>
            {isExpanded ? <ExpandLessOutlined /> : <ExpandMoreOutlined />}
          </Button>
        </Box>
        {isExpanded && (
          <Box sx={{ width: '100%', mt: 0 }}>
            <Grid
              container
              spacing={1}
              sx={{
                ml: 0,
                p: 1,
                justifyContent: 'space-between',
              }}
            >
              <Grid
                item
                xs={12}
                sx={{
                  border: '1px solid whitesmoke',
                  borderRadius: '10px',
                  p: 1,
                }}
              >
                <Box sx={{ mb: 1, p: 0 }}>
                  {/* <Typography variant="body1">
                    Status:{' '}
                    <Badge bg={quote.status === 'Pending' ? 'warning' : 'success'}>
                      {quote.status}
                    </Badge>
                  </Typography>
                  <Typography variant="body1">
                    <b>Job Name</b>: {quote.job_name}
                  </Typography> */}
                  <Typography variant="body1">
                    <b>Created By</b>: {quote.owner_name}
                  </Typography>
                  <Typography variant="body1">
                    <b>Created At</b>: <CustomDateComponent date={new Date(quote.created_at)}/>
                  </Typography>
                  {/* <Typography variant="body1">
                    <b>Mark Up</b>: {quote.mark_up}
                  </Typography> */}
                </Box>
              </Grid>
            </Grid>
          </Box>
        )}
      </Box>
      {/* Espacio adicional para evitar que el contenido quede oculto detrás del sticky */}
      <Box sx={{ height: isExpanded ? '150px' : '70px' }}></Box>
    </>
  );
};

export default StickyBoxComponent;
