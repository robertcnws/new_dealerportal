import React, { useState } from 'react';
import {
  IconButton,
  TableRow,
  TableCell,
  useTheme,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined';
import FolderOpenOutlinedIcon from '@mui/icons-material/FolderOpenOutlined';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { faFolderOpen } from '@fortawesome/free-solid-svg-icons';

const useStyles = makeStyles({
  row: {
    '&:hover': {
      backgroundColor: '#f9f9f5', // Cambia esto por el color que desees
    },
  },
});

const GroupStockRowComponent = ({ group, onSelection, expandedItem }) => {
  const classes = useStyles();
  const [open, setOpen] = useState(false);
  const theme = useTheme();

  const handleToggle = () => {
    setOpen(!open);
  };

  const handleItemOpen = (item, stock) => {
    onSelection(item, stock);
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
          onClick={() => handleItemOpen(item, group)}
          sx={{
            bgcolor: expandedItem && expandedItem.item.id === item.id ? '#f1f1fa' : 'white',
          }}>
          <TableCell sx={{
            paddingLeft: '70px',
            fontSize: '13px',
            color: 'info.main',
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
                width: '2px',
                backgroundColor: theme.palette.info.main,
              }}
            />

            <div
              style={{
                position: 'absolute',
                left: '40px',
                top: '50%',
                width: '20px',
                height: '2px',
                backgroundColor: theme.palette.info.main,
              }}
            />
            {item.name}
          </TableCell>
        </TableRow>
      ))}
    </>
  );
};

export default GroupStockRowComponent;
