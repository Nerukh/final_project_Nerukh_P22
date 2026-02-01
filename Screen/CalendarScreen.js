import React, { useState, useEffect, useContext } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  Button,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image
} from 'react-native';
import { AuthContext } from '../AuthContext';
import { getPhotos } from '../database';

// Компонент дня з додатковою іконкою правопорушення
const Day = ({ day, isCurrentMonth, isToday, isSelected, hasTasks, hasViolation, dayWidth, dayHeight, onPress }) => {
  // Violation (правопорушення) має пріоритет у кольорі або позначці
  const backgroundColor = isSelected ? '#FFD700' : isToday ? '#000' : '#fff';
  const textColor = !isCurrentMonth ? '#aaa' : isToday ? '#fff' : '#000';

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.dayBox, { width: dayWidth, height: dayHeight, backgroundColor }]}
    >
      <Text style={[styles.dayText, { color: textColor }]}>{day}</Text>
      <View style={styles.dotContainer}>
        {hasTasks && <View style={styles.taskDot} />}
        {hasViolation && <View style={styles.violationDot} />}
      </View>
    </TouchableOpacity>
  );
};

const Header = ({ month, year, months, prevMonth, nextMonth, goToday }) => (
  <View style={styles.headerContainer}>
    <Text style={styles.headerText}>{months[month]} {year} р.</Text>
    <View style={{ flexDirection: 'row', gap: 6, marginTop: 5 }}>
      <Button title="<" onPress={prevMonth} />
      <Button title="Сьогодні" onPress={goToday} />
      <Button title=">" onPress={nextMonth} />
    </View>
  </View>
);

export default function CalendarScreen() {
  const { user } = useContext(AuthContext);
  const rows = 6;
  const cols = 7;
  const months = ["Січень","Лютий","Березень","Квітень","Травень","Червень","Липень","Серпень","Вересень","Жовтень","Листопад","Грудень"];
  const weekDays = ["Пн","Вт","Ср","Чт","Пт","Сб","Нд"];

  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [gridRows, setGridRows] = useState([]);
  const [tasks, setTasks] = useState({}); // Локальні задачі
  const [violations, setViolations] = useState([]); // Дані з БД
  const [selectedDate, setSelectedDate] = useState(null);

  const { width, height } = useWindowDimensions();
  const isPortrait = height > width;
  const dayWidth = width / 8;
  const dayHeight = isPortrait ? dayWidth : height / 10;

  const formatDate = (y, m, d) => `${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;

  // Завантаження правопорушень з бази
  useEffect(() => {
    if (user) {
      const loadViolations = async () => {
        const data = await getPhotos(user.id);
        setViolations(data);
      };
      loadViolations();
    }
  }, [user]);

  useEffect(() => {
    const firstDay = new Date(year, month, 1).getDay();
    const start = firstDay === 0 ? 6 : firstDay-1;
    const daysInMonth = new Date(year, month+1, 0).getDate();
    const daysPrevMonth = new Date(year, month, 0).getDate();

    let dayCounter=1;
    let nextDay=1;
    const rowsArr=[];
    for(let i=0;i<rows;i++){
      const row=[];
      for(let j=0;j<cols;j++){
        const index = i*cols+j;
        if(index<start) row.push({ day: daysPrevMonth - start + 1 + index, current: false });
        else if(dayCounter<=daysInMonth) row.push({ day: dayCounter++, current:true });
        else row.push({ day: nextDay++, current:false });
      }
      rowsArr.push(row);
    }
    setGridRows(rowsArr);
  }, [month, year]);

  const goToday = () => { setYear(today.getFullYear()); setMonth(today.getMonth()); };
  const nextMonth = () => month === 11 ? (setMonth(0), setYear(year+1)) : setMonth(month+1);
  const prevMonth = () => month === 0 ? (setMonth(11), setYear(year-1)) : setMonth(month-1);

  // Фільтруємо фото для обраної дати
  const violationsForSelectedDay = violations.filter(v => v.created_at.startsWith(selectedDate));

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header month={month} year={year} months={months} prevMonth={prevMonth} nextMonth={nextMonth} goToday={goToday} />

      <ScrollView>
        <View style={styles.calendarContainer}>
          <View style={styles.weekRow}>
            {weekDays.map((d,i) => (
              <View key={i} style={[styles.dayBox, { width: dayWidth, height: 30, borderBottomWidth: 0 }]}>
                <Text style={{fontSize: 10, color: '#666'}}>{d}</Text>
              </View>
            ))}
          </View>

          {gridRows.map((row, r) => (
            <View key={r} style={styles.weekRow}>
              {row.map(({ day, current }, c) => {
                const dateKey = formatDate(year, month, day);
                const hasViolation = violations.some(v => v.created_at.startsWith(dateKey));

                return (
                  <Day
                    key={c}
                    day={day}
                    isCurrentMonth={current}
                    isToday={current && day===today.getDate() && month===today.getMonth() && year===today.getFullYear()}
                    isSelected={selectedDate===dateKey}
                    hasTasks={!!tasks[dateKey]}
                    hasViolation={current && hasViolation}
                    onPress={() => current && setSelectedDate(dateKey)}
                    dayWidth={dayWidth}
                    dayHeight={dayHeight}
                  />
                );
              })}
            </View>
          ))}
        </View>

        {/* Секція перегляду правопорушень під календарем */}
        <View style={styles.detailsContainer}>
          {selectedDate ? (
            <>
              <Text style={styles.dateTitle}>Дата: {selectedDate}</Text>
              {violationsForSelectedDay.length > 0 ? (
                violationsForSelectedDay.map((v, index) => (
                  <View key={index} style={styles.violationItem}>
                    <Text style={styles.violationText}>🚨 Правопорушення виявлено</Text>
                    <Image source={{ uri: v.image }} style={styles.miniImage} />
                  </View>
                ))
              ) : (
                <Text style={styles.noViolationText}>Правопорушень за цей день не зафіксовано</Text>
              )}
            </>
          ) : (
            <Text style={styles.selectDayText}>Оберіть день, щоб переглянути деталі</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor:'#fff' },
  calendarContainer: { padding: 10, alignItems: 'center' },
  weekRow: { flexDirection:'row' },
  dayBox: { borderWidth:0.5, borderColor:'#eee', alignItems:'center', justifyContent:'center' },
  dayText: { fontWeight:'600', fontSize:14 },
  dotContainer: { flexDirection: 'row', gap: 2, marginTop: 2 },
  taskDot: { width:4, height:4, borderRadius:2, backgroundColor:'blue' },
  violationDot: { width:6, height:6, borderRadius:3, backgroundColor:'red' },
  headerContainer: { alignItems:'center', padding:10, backgroundColor: '#f8f9fa' },
  headerText: { fontSize:18, fontWeight:'bold', color:'#333' },
  detailsContainer: { padding: 20, borderTopWidth: 1, borderTopColor: '#eee' },
  dateTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  violationItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff5f5', padding: 10, borderRadius: 8, marginBottom: 10, borderWidth: 1, borderColor: '#feb2b2' },
  violationText: { flex: 1, color: '#c53030', fontWeight: 'bold' },
  miniImage: { width: 50, height: 50, borderRadius: 5 },
  noViolationText: { color: '#666', fontStyle: 'italic' },
  selectDayText: { textAlign: 'center', marginTop: 20, color: '#999' }
});