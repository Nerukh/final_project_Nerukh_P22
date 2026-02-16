import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { useTranslation } from 'react-i18next';

import HomeScreen from '../Screen/HomeScreen';
import SettingsScreen from '../Screen/SettingScreen';
import ProfileScreen from '../Screen/ProfileScreen';

const Drawer = createDrawerNavigator();

export default function AppNavigator({ themeColors, isDark, toggleTheme }) {
  const { t } = useTranslation();

  return (
    <Drawer.Navigator
      initialRouteName="Profile"
      screenOptions={{
        headerStyle: { backgroundColor: themeColors.card },
        headerTintColor: themeColors.text,
        drawerStyle: {
          backgroundColor: themeColors.background,
          width: 240,
        },
        drawerActiveTintColor: themeColors.primary,
        drawerInactiveTintColor: themeColors.text,
      }}
    >

      <Drawer.Screen name="Profile" options={{ title: t('profile') || 'Профіль' }}>
        {(props) => <ProfileScreen {...props} themeColors={themeColors} />}
      </Drawer.Screen>

      <Drawer.Screen name="Home" options={{ title: t('home') || 'Головна' }}>
        {(props) => <HomeScreen {...props} themeColors={themeColors} />}
      </Drawer.Screen>

      <Drawer.Screen name="Settings" options={{ title: t('settings') || 'Налаштування' }}>
        {(props) => (
          <SettingsScreen
            {...props}
            themeColors={themeColors}
            isDark={isDark}
            toggleTheme={toggleTheme}
          />
        )}
      </Drawer.Screen>
    </Drawer.Navigator>
  );
}