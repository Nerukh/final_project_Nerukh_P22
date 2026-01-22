import React, { createContext, useState } from 'react';
import { loginUser, registerUser } from './database';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const login = async (email, password) => {
    const u = await loginUser(email, password);
    if (u) {
      setUser(u);
      return u;
    }
    throw new Error('Невірний логін');
  };

  const register = async (email, password) => {
    return await registerUser(email, password);
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}