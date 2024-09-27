import React, { useState, useEffect } from 'react';
import { CircularProgress, FormControl, IconButton, InputAdornment, TextField, Tooltip, MenuItem, Box } from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';
import { List, AutoSizer } from 'react-virtualized';
import { styled } from '@mui/material/styles';
import { fetchWithToken } from '../../../../utils';
import { apiUrl } from '../../../../config';


const StyledMenuItem = styled(MenuItem)({
  backgroundColor: '#f0f0f0',
  '&:hover': {
    backgroundColor: '#d0d0d0',
  },
  padding: '10px 20px',
  borderBottom: '1px solid #e0e0e0',
});

const SelectListProductsComponent = ({ quote, handleSelectProduct }) => {

  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const payload = {
        status: quote.status,
      };
      const url = `${apiUrl}/dealerportal-get-products/`;
      const response = await fetchWithToken(url, 'GET', payload, {}, apiUrl);
      setProducts(response.data.data);
      setFilteredProducts(response.data.data);
    } catch (error) {
      console.error('Error fetching qb customers:', error);
      setError(`Failed to fetch qn customers: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchTerm = (e) => {
    setSearchTerm(e.target.value);
  }

  const handleClearSearch = () => {
    setSearchTerm('');
  }

  const rowRenderer = ({ key, index, style }) => {
    const elem = filteredProducts[index];
    return (
      <StyledMenuItem key={key} style={style} value={elem.id} onClick={() => handleSelectProduct(elem)}>
        {elem.name}
      </StyledMenuItem>
    );
  };

  if (loading) return <Box sx={{ mt: 3, minWidth: '100%', bgcolor: '#f1f1f1' }}>Loading...</Box>;
  if (error) return <Box sx={{ mt: 3, minWidth: '100%', bgcolor: '#f1f1f1' }}>Error: {error}</Box>;

  return (
    <FormControl variant="outlined" size="small" style={{ width: '100%' }}>
      <TextField
        label={"Search Products (" + filteredProducts.length + ")"}
        variant="outlined"
        fullWidth
        value={searchTerm}
        onChange={handleSearchTerm}
        InputProps={{
          endAdornment: (
            <>
              {loading && <CircularProgress size={20} />}
              <InputAdornment position="end">
                <Tooltip
                  title="Clear Search"
                  arrow
                  sx={{
                    '& .MuiTooltip-tooltip': {
                      backgroundColor: '#000000',
                      color: 'white',
                      fontSize: '0.875rem'
                    }
                  }}
                >
                  <IconButton
                    onClick={handleClearSearch}
                    edge="end"
                  >
                    <ClearIcon />
                  </IconButton>
                </Tooltip>
              </InputAdornment>
            </>
          ),
          placeholder: undefined
        }}
        placeholder=''
      />
      <div style={{ height: 200, width: '100%' }}>
        <AutoSizer>
          {({ height, width }) => (
            <List
              width={width}
              height={height}
              rowCount={filteredProducts.length}
              rowHeight={50}
              rowRenderer={rowRenderer}
            />
          )}
        </AutoSizer>
      </div>
    </FormControl>
  )
}

export default SelectListProductsComponent;
