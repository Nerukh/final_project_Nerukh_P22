import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, Switch, TouchableOpacity, TextInput } from 'react-native';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { Picker } from '@react-native-picker/picker';
import { useTranslation } from 'react-i18next';
import { changeLanguage, initI18n } from './i18n';
import CalendarScreen from './Screen/CalendarScreen';
import MapScreen from './Screen/MapScreen';
import NewScreen from './Screen/NewScreen';
import ProfileScreen from './Screen/ProfileScreen';
import SettingsScreen from './Screen/SettingScreen';
import { AuthProvider } from './AuthContext';
import { initDB } from './database';

const Tab = createBottomTabNavigator();
const Drawer = createDrawerNavigator();

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const [isDarkTheme, setIsDarkTheme] = useState(false);
  const [language, setLanguage] = useState('uk');

  const { t, i18n } = useTranslation();

  const [region, setRegion] = useState({
    latitude: 50.4501,
    longitude: 30.5234,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  useEffect(() => {
    const prepare = async () => {
      console.log("Starting DB initialization...");
      initDB();
      await initI18n();
      await loadLanguage();
      if (i18n && i18n.language) {
                setLanguage(i18n.language);
              }
      setIsReady(true);
    };
    prepare();
  }, []);

  if (!isReady) return null;

  const switchLanguage = async () => {
    const newLang = language === 'en' ? 'uk' : 'pl';
    await changeLanguage(newLang);
    setLanguage(newLang);
  };

  const themeColors = isDarkTheme
    ? { background: '#121212', text: '#fff' }
    : { background: '#fff', text: '#000' };

  return (
  <AuthProvider>
    <NavigationContainer theme={isDarkTheme ? DarkTheme : DefaultTheme}>
      <Drawer.Navigator>
        <Drawer.Screen name={t('profile')}>
            {(props) => <ProfileScreen {...props} themeColors={themeColors} t={t} />}
        </Drawer.Screen>

        <Drawer.Screen name={t('home')}>
          {() => (
            <Tab.Navigator screenOptions={{ headerShown: false }}>
              <Tab.Screen name={t('calendarScreen')}>
                {() => <CalendarScreen themeColors={themeColors} t={t} />}
              </Tab.Screen>

              <Tab.Screen name={t('mapScreen')}>
                {() => <MapScreen region={region} setRegion={setRegion} />}
              </Tab.Screen>

              <Tab.Screen name={t('newScreen')}>
                {() => <NewScreen themeColors={themeColors} t={t} />}
              </Tab.Screen>
            </Tab.Navigator>
          )}
        </Drawer.Screen>

        <Drawer.Screen name={t('settings')}>
          {() => (
            <SettingsScreen
              themeColors={themeColors}
              isDarkTheme={isDarkTheme}
              toggleTheme={() => setIsDarkTheme(p => !p)}
              language={language}
              switchLanguage={switchLanguage}
              t={t}
            />
          )}
        </Drawer.Screen>
      </Drawer.Navigator>
    </NavigationContainer>
  </AuthProvider>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
    title: {
      fontSize: 24,
      textAlign: 'center',
      marginBottom: 20,
      fontWeight: 'bold',
    },
    tabs: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginBottom: 20,
    },
    tab: {
      marginHorizontal: 15,
      fontSize: 16,
      color: '#888',
    },
    activeTab: {
      color: '#007AFF',
      fontWeight: 'bold',
      textDecorationLine: 'underline',
    },
    input: {
      borderWidth: 1,
      borderRadius: 6,
      padding: 10,
      marginBottom: 12,
    },
});
