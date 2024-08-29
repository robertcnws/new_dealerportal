import React, { createContext, useState } from 'react';

// Crea el contexto
export const SearchContext = createContext();

// Proveedor del contexto
export const SearchProvider = ({ children }) => {
  const [searchTermGlobal, setSearchTermGlobal] = useState('');

  return (
    <SearchContext.Provider value={{ searchTermGlobal, setSearchTermGlobal }}>
      {children}
    </SearchContext.Provider>
  );
};
