import React, { createContext, useContext, useState } from 'react';
import { users } from '../data/sampleData';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Default to Dustin
  const [currentUser, setCurrentUser] = useState(users[0]);

  const switchUser = (userId) => {
    const user = users.find((u) => u.id === userId);
    if (user) {
      setCurrentUser(user);
    }
  };

  const getUser = (userId) => {
    return users.find((u) => u.id === userId) || null;
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        users,
        switchUser,
        getUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
