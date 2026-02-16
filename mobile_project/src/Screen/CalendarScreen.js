import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useFocusEffect } from '@react-navigation/native';
import { getViolationCounts } from '../database/database';

export default function CalendarScreen({ navigation, themeColors }) {
  const { t } = useTranslation();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [counts, setCounts] = useState({});

  useFocusEffect(
    useCallback(() => {
      const loadCounts = async () => {
        try {
          const data = await getViolationCounts();
          console.log("Дані з бази (Counts):", data);
          setCounts(data);
        } catch (e) {
          console.error("Помилка завантаження календаря:", e);
        }
      };
      loadCounts();
    }, [])
  );

  const changeMonth = (increment) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + increment);
    setCurrentDate(newDate);
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();

  const shift = firstDayIndex === 0 ? 6 : firstDayIndex - 1;

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const startBlanks = Array.from({ length: shift }, (_, i) => i);

  const totalSlots = 42;
  const endBlanks = Array.from({ length: totalSlots - (days.length + startBlanks.length) }, (_, i) => i);

  const getDayColor = (dateString) => {
    const count = counts[dateString] || 0;
    if (count > 0) {
      if (count <= 6) return '#FFD700';
      if (count <= 10) return '#FFA500';
      return '#FF4500';
    }
    return null;
  };

  const isToday = (day) => {
    const today = new Date();
    return day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>

        <View style={styles.header}>
          <TouchableOpacity onPress={() => changeMonth(-1)}>
            <Ionicons name="chevron-back" size={30} color={themeColors.text} />
          </TouchableOpacity>
          <Text style={[styles.monthText, { color: themeColors.text }]}>
            {currentDate.toLocaleString('default', { month: 'long' })} {year}
          </Text>
          <TouchableOpacity onPress={() => changeMonth(1)}>
            <Ionicons name="chevron-forward" size={30} color={themeColors.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.grid}>
          {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд'].map((d, index) => (
            <View key={index} style={styles.dayHeader}>
              <Text style={{ color: themeColors.text, fontWeight: 'bold' }}>{d}</Text>
            </View>
          ))}

          {startBlanks.map((_, index) => (
            <View key={`start-${index}`} style={styles.cell} />
          ))}

          {days.map(day => {
            const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

            const bgColor = getDayColor(dateString);
            const isCurrentDay = isToday(day);

            return (
              <TouchableOpacity
                key={day}
                onPress={() => navigation.navigate('DayDetails', { selectedDate: dateString })}
                style={[
                  styles.cell,
                  isCurrentDay && { borderColor: themeColors.primary, borderWidth: 2 },
                  bgColor && { backgroundColor: bgColor, borderColor: bgColor, borderWidth: 0 }
                ]}
              >
                <Text style={{
                  color: bgColor ? '#fff' : themeColors.text,
                  fontWeight: bgColor ? 'bold' : 'normal',
                  fontSize: 16
                }}>
                  {day}
                </Text>
              </TouchableOpacity>
            );
          })}

          {endBlanks.map((_, index) => (
            <View key={`end-${index}`} style={styles.cell} />
          ))}
        </View>

        <View style={styles.legendContainer}>
          <Text style={[styles.legendTitle, { color: themeColors.text }]}>
            {t('violation_activity') || 'Активність порушень:'}
          </Text>
          <View style={styles.legendRow}>
            <View style={styles.legendItem}>
              <View style={[styles.colorBox, { backgroundColor: '#FFD700' }]} />
              <Text style={{ color: themeColors.text, fontSize: 12 }}>1-5</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.colorBox, { backgroundColor: '#FFA500' }]} />
              <Text style={{ color: themeColors.text, fontSize: 12 }}>6-10</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.colorBox, { backgroundColor: '#FF4500' }]} />
              <Text style={{ color: themeColors.text, fontSize: 12 }}>&gt; 11</Text>
            </View>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20
  },
  monthText: {
    fontSize: 22,
    fontWeight: 'bold',
    textTransform: 'capitalize'
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 10
  },
  dayHeader: {
    width: '14.28%',
    height: 40,
    justifyContent: 'center',
    alignItems: 'center'
  },
  cell: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: 'rgba(204, 204, 204, 0.3)',
    borderRadius: 8,
    marginVertical: 2
  },
  legendContainer: {
    marginTop: 20,
    padding: 15,
    alignItems: 'center'
  },
  legendTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%'
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  colorBox: {
    width: 15,
    height: 15,
    borderRadius: 3,
    marginRight: 5
  }
});