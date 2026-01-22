import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function CalendarScreen({ themeColors, t }) {
  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <Text style={{ color: themeColors.text }}>
        {t('calendarScreen')}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});