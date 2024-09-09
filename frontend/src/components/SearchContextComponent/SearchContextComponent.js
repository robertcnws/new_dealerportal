import React, { createContext, useState } from 'react';

export const SearchContext = createContext();

export const SearchProvider = ({ children }) => {
  const [searchTermGlobal, setSearchTermGlobal] = useState('');

  return (
    <SearchContext.Provider value={{ searchTermGlobal, setSearchTermGlobal }}>
      {children}
    </SearchContext.Provider>
  );
};
