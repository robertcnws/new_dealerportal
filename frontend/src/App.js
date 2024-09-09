import React, { useEffect, useCallback, useRef, useState } from 'react';
import { Route, Routes, Navigate, useNavigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { lightTheme, darkTheme } from './theme';
import { useAuth } from './components/AuthContextComponent/AuthContextComponent';
import { ToastContainer } from 'react-toastify';
import ProtectedRoutesComponent from './components/ProtectedRoutesComponent/ProtectedRoutesComponent';
import LoginComponent from './components/LoginComponent/LoginComponent';
import MainContentComponent from './components/MainContentComponent/MainContentComponent';
import HomeComponent from './components/HomeComponent/HomeComponent';
import ListStocksComponent from './components/Stock/components/ListStocksComponent/ListStocksComponent';
import { SearchProvider } from './components/SearchContextComponent/SearchContextComponent';
import ListQuotesComponent from './components/Quotes/components/ListQuotesComponent/ListQuotesComponent';
import { apiFrontendRoot } from './config';
import ListStocksQuoteDetailsComponent from './components/QuoteDetails/components/ListStocksQuoteDetailsComponent/ListStocksQuoteDetailsComponent';
import ListOrdersComponent from './components/Orders/components/ListOrdersComponent/ListOrdersComponent';
import OrderDetailsComponent from './components/Orders/components/OrderDetailsComponent/OrderDetailsComponent';
import './App.css';
import PasswordResetRequestComponent from './components/ForgotPassword/components/PasswordResetRequestComponent/PasswordResetRequestComponent';

const HomeRedirect = () => {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    const redirectPath = localStorage.getItem('redirectPath') || apiFrontendRoot;
    localStorage.removeItem('redirectPath');
    return <Navigate to={redirectPath} />;
  }

  return <LoginComponent />;
};

const useIdleTimer = (navigate, timeout = 60000) => {
  const { logout } = useAuth();
  const timer = useRef(null);

  const resetTimer = useCallback(() => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      logout();
      navigate('/'); // Redirecciona al cerrar sesión
    }, timeout);
  }, [logout, navigate, timeout]);

  useEffect(() => {
    const handleActivity = () => resetTimer();

    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keydown', handleActivity);

    resetTimer();

    return () => {
      clearTimeout(timer.current);
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keydown', handleActivity);
    };
  }, [resetTimer]);

  return null;
};


const App = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  useIdleTimer(navigate, 1800000);
  const [theme, setTheme] = useState('light');
  const [isLoadingOperation, setIsLoadingOperation] = useState(false);

  const handleThemeChange = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  return (
    <>
      <SearchProvider>
        <ThemeProvider theme={theme === 'light' ? lightTheme : darkTheme}>
          <CssBaseline /> {/* Normaliza los estilos */}
          {isAuthenticated && <ToastContainer />}
          <Routes>
            <Route path="/" element={<HomeRedirect />} />
            <Route path="/password-reset" element={<PasswordResetRequestComponent />} />
            <Route path={`${apiFrontendRoot}/*`} element={<ProtectedRoutesComponent><MainContentComponent onThemeChange={handleThemeChange} /></ProtectedRoutesComponent>} >
              <Route path="" element={<HomeComponent />} />
              <Route path="check-stock" element={<ListStocksComponent />} />
              <Route path="quotes" element={<ListQuotesComponent />} />
              <Route path="quote-details" element={<ListStocksQuoteDetailsComponent setIsLoadingOperation={setIsLoadingOperation} isLoadingOperation={isLoadingOperation} />} />
              <Route path="orders" element={<ListOrdersComponent />} />
              <Route path="order-details" element={<OrderDetailsComponent />} />
            </Route>
          </Routes>
        </ThemeProvider>
      </SearchProvider>
    </>
  );
};

export default App;
