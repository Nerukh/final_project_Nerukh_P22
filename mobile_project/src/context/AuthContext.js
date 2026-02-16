import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loginUser, registerUser } from '../api/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

 useEffect(() => {
   const loadData = async () => {
     const savedToken = await AsyncStorage.getItem('userToken');
     const savedEmail = await AsyncStorage.getItem('userEmail');

     if (savedToken && savedEmail) {
       setToken(savedToken);
       setUser({ email: savedEmail });
     }
     setLoading(false);
   };
   loadData();
 }, []);

const login = async (email, password, shouldSave) => {
  try {
    const response = await loginUser(email, password);
    const newToken = response.data.token;

    if (newToken) {
      if (shouldSave) {
        await AsyncStorage.setItem('userToken', newToken);
      }
      await AsyncStorage.setItem('userEmail', email);
      setToken(newToken);
      setUser({ email });
    }
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
};

const register = async (email, password) => {
  try {
    const response = await registerUser(email, password);
    const newToken = response.data.token;

    if (newToken) {
      await AsyncStorage.setItem('userToken', newToken);
      await AsyncStorage.setItem('userEmail', email);
      setToken(newToken);
      setUser({ email });
    }
  } catch (error) {
    console.error("Register error:", error);
    throw error;
  }
};

  const logout = async () => {
    await AsyncStorage.removeItem('userToken');
    await AsyncStorage.removeItem('userEmail');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ token, user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};