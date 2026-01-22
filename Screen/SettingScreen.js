import React from 'react';
import { View, Text, Switch, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { changeLanguage } from '../i18n';

const SettingsScreen = ({ themeColors, isDarkTheme, toggleTheme, language, setLanguage, t }) => {

  const onLanguageChange = async (lang) => {
    await changeLanguage(lang);
    setLanguage(lang);
  };

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <Text style={{ fontSize: 20, marginBottom: 20, color: themeColors.text }}>
        {t('settings')}
      </Text>

      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
        <Text style={{ color: themeColors.text, marginRight: 10 }}>
          {t('darkTheme')}
        </Text>
        <Switch value={isDarkTheme} onValueChange={toggleTheme} />
      </View>

      <Text style={{ color: themeColors.text, marginBottom: 10 }}>
        {t('language')}
      </Text>

      <View style={{
        borderWidth: 1,
        borderColor: themeColors.text,
        borderRadius: 5,
        width: '100%',
        marginTop: 10
      }}>
        <Picker
          selectedValue={language}
          onValueChange={(itemValue) => onLanguageChange(itemValue)}
          style={{ color: themeColors.text, width: '100%' }}
          dropdownIconColor={themeColors.text}
        >
          <Picker.Item label={t('English')} value="en" color={isDarkTheme ? "#FFFFFF" : "#000000"} />
          <Picker.Item label={t('Ukrainian')} value="uk" color={isDarkTheme ? "#FFFFFF" : "#000000"} />
          <Picker.Item label={t('Polish')} value="pl" color={isDarkTheme ? "#FFFFFF" : "#000000"} />
        </Picker>
      </View>
    </View>
  );
};

export default SettingsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
  },
});
