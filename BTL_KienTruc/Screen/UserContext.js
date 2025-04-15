// Screen/UserContext.js
import React, { createContext, useContext, useState } from 'react';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null); // ban đầu là null để dễ kiểm tra
  const [isEditing, setIsEditing] = useState(false);

  return (
    <UserContext.Provider value={{ user, setUser, isEditing, setIsEditing }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
