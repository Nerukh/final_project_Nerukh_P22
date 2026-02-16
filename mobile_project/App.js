import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native'; // ДОДАЙ ЦЕЙ ІМПОРТ
import { AuthProvider } from './src/context/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';
import { initDB } from './src/database/database';
import { initI18n } from './src/i18n';

export default function App() {
  const [ready, setReady] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [token, setToken] = useState(null);

  const toggleTheme = () => setIsDark(!isDark);
  useEffect(() => {
    const loadToken = async () => {
      const savedToken = await AsyncStorage.getItem('userToken');
      setToken(savedToken);
    };
    loadToken();
  }, []);

  useEffect(() => {
    const setup = async () => {
      try {
        await initDB();
        await initI18n();
        console.log("Database and Localization ready!");
      } catch (e) {
        console.error("Setup error:", e);
      } finally {
        setReady(true);
      }
    };
    setup();
  }, []);

  if (!ready) return null;

  const themeColors = isDark
    ? { background: '#121212', text: '#ffffff', primary: '#bb86fc', card: '#1e1e1e' }
    : { background: '#ffffff', text: '#000000', primary: '#6200ee', card: '#f8f9fa' };

  return (
    <AuthProvider>
      <NavigationContainer>
        <AppNavigator
          themeColors={themeColors}
          isDark={isDark}
          toggleTheme={toggleTheme}
          token={token}
        />
      </NavigationContainer>
    </AuthProvider>
  );
}