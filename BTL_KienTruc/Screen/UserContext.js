import React, { createContext, useContext, useState } from 'react';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState({
    name: 'Nguyễn Cao Anh Minh',
    email: 'anhminh123@gmail.com',
    phone: '0123456789',
    address: 'Hà Nội, Việt Nam',
  });

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);