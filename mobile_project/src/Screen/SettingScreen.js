import React, { useContext } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { List, Switch, Button, Text, Divider } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { changeLanguage } from '../i18n';
import { AuthContext } from '../context/AuthContext';

export default function SettingsScreen({ isDarkTheme, toggleTheme, themeColors }) {
  const { t } = useTranslation();
  const { logout } = useContext(AuthContext);

  const textStyle = { color: themeColors.text };
  const iconColor = themeColors.text;

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <List.Section>
        <List.Subheader style={{ color: themeColors.primary, fontWeight: 'bold' }}>
          {t('settings')}
        </List.Subheader>


        <List.Item
          title={t('dark_mode')}
          titleStyle={textStyle}
          left={() => <List.Icon icon="theme-light-dark" color={iconColor} />}
          right={() => <Switch value={isDarkTheme} onValueChange={toggleTheme} color={themeColors.primary} />}
        />

        <Divider style={{ backgroundColor: 'gray', opacity: 0.3 }} />


        <List.Accordion
          title={t('language')}
          titleStyle={textStyle}
          left={props => <List.Icon {...props} icon="translate" color={iconColor} />}
          style={{ backgroundColor: themeColors.background }}
        >
          <List.Item
            title="Українська"
            titleStyle={textStyle}
            onPress={() => changeLanguage('uk')}
          />
          <List.Item
            title="Polski"
            titleStyle={textStyle}
            onPress={() => changeLanguage('pl')}
          />
          <List.Item
            title="English"
            titleStyle={textStyle}
            onPress={() => changeLanguage('en')}
          />
        </List.Accordion>
      </List.Section>

      <View style={styles.buttonContainer}>
        <Button
          mode="contained"
          buttonColor="#ff4444"
          icon="logout"
          onPress={logout}
          style={styles.logout}
        >
          {t('logout')}
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  buttonContainer: { padding: 20, marginTop: 'auto' },
  logout: { paddingVertical: 5 }
});