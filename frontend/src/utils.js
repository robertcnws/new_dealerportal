import axios from 'axios';
import { apiUrl } from './config';


export const clearLocalStorage = () => {
  localStorage.removeItem('invoicesListPage');
  localStorage.removeItem('invoicesListRowsPerPage');
  localStorage.removeItem('invoicesListFilterDate');
};

// export const getCsrfToken = async () => {
//   try {
//       const response = await axios.get(`${apiUrl}/get_csrf_token/`, { withCredentials: true });
//       return response.data.csrftoken;
//   } catch (error) {
//       console.error('Error fetching CSRF token:', error);
//       throw new Error('Failed to get CSRF token');
//   }
// };

export const getCookie = (name) => {
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      let cookie = cookies[i].trim();
      if (cookie.indexOf(name + '=') === 0) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

export const stableSort = (array, comparator) => {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}

export const getComparator = (order, orderBy) => {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

export function getComparatorUndefined(order, orderBy) {
  return order === 'desc'
    ? (a, b) => descendingComparatorUndefined(a, b, orderBy)
    : (a, b) => -descendingComparatorUndefined(a, b, orderBy);
}

export const descendingComparator = (a, b, orderBy) => {
  if (b.fields[orderBy] < a.fields[orderBy]) {
    return -1;
  }
  if (b.fields[orderBy] > a.fields[orderBy]) {
    return 1;
  }
  return 0;
}

function descendingComparatorUndefined(a, b, orderBy) {
  if (!a || !b || !a[orderBy] || !b[orderBy]) {
    return 0;
  }

  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

// Funciones de manejo de tokens

export const getAccessToken = () => {
  return localStorage.getItem('accessToken');
};

export const getRefreshToken = () => {
  return localStorage.getItem('refreshToken');
};

const setTokens = (accessToken, refreshToken) => {
  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('refreshToken', refreshToken);
};

const axiosInstance = axios.create({
  baseURL: apiUrl,
  // withCredentials: true,
});

const refreshAxios = axios.create({
  baseURL: apiUrl,
  // withCredentials: true,
});

const refreshToken = async () => {
  const currentRefreshToken = getRefreshToken();
  if (!currentRefreshToken) {
    console.error('No refresh token available.');
    return null;
  }

  try {
    const response = await refreshAxios.post('/api/token/refresh/', {
      refresh: currentRefreshToken,
    });
    const { access } = response.data;
    setTokens(access, currentRefreshToken);
    return access;
  } catch (error) {
    console.error('Error refreshing token:', error.response?.data || error.message);
    return null;
  }
};

export const fetchWithToken = async (url, method = 'GET', data = null, headers = {}, apiUrl) => {
  // let accessToken = getAccessToken();

  const makeRequest = async (token) => {
    try {
      const isFormData = data instanceof FormData;
      const config = {
        method: method,
        url: url, 
        withCredentials: true,
        headers: {
          ...headers,
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
        },
        ...(method === 'GET' ? { params: data } : { data: data }),
      };
      return axiosInstance(config);
    } catch (error) {
      console.error('Request error:', error);
      throw error;
    }
  };

  try {
    const newAccessToken = await refreshToken();
    const response = await makeRequest(newAccessToken);
    return response;
  } catch (error) {
    // if (error.response && error.response.status === 401) {
    //   const newAccessToken = await refreshToken();
    //   if (newAccessToken) {
    //     try {
    //       const retryResponse = await makeRequest(newAccessToken);
    //       return retryResponse;
    //     } catch (retryError) {
    //       if (retryError.response && retryError.response.status === 401) {
    //         console.error('Unauthorized: Token refresh succeeded but request failed.');
    //       } else {
    //         console.error('Request error after token refresh');
    //       }
    //       throw retryError;
    //     }
    //   } else {
    //     console.error('Unauthorized: Token refresh failed.');
    //   }
    // } else {
    //   console.error('Request error');
    // }
    throw error;
  }
};


export const formatDate = (isoString) => {
  const date = new Date(isoString);

  const pad = (num) => String(num).padStart(2, '0');

  const day = pad(date.getDate());
  const month = pad(date.getMonth() + 1);
  const year = date.getFullYear();
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const seconds = pad(date.getSeconds());

  // Obtén el desplazamiento de la zona horaria en minutos y conviértelo a horas
  const timezoneOffset = -date.getTimezoneOffset() / 60;
  const timezoneString = `UTC${timezoneOffset >= 0 ? '+' : ''}${timezoneOffset}`;

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds} ${timezoneString}`;
};

export const calculateDateDifference = (date) => {
  const notificationDate = new Date(date);
  const now = new Date();
  const diffInSeconds = Math.floor((now - notificationDate) / 1000);

  const intervals = [
    { label: 'YEAR', seconds: 31536000 },
    { label: 'MONTH', seconds: 2592000 },
    { label: 'DAY', seconds: 86400 },
    { label: 'HOUR', seconds: 3600 },
    { label: 'MINUTE', seconds: 60 },
    { label: 'SECOND', seconds: 1 },
  ];

  for (const interval of intervals) {
    const count = Math.floor(diffInSeconds / interval.seconds);
    if (count >= 1) {
      return `${count} ${interval.label}${count > 1 ? 'S' : ''} AGO`;
    }
  }

  return 'JUST NOW';
};
