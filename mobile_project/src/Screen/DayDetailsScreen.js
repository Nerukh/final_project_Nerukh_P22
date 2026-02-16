import React, { useState, useEffect } from 'react';
import { View, FlatList, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Card, Button, Badge } from 'react-native-paper';
import { getPhotosByDate } from '../database/database';

export default function DayDetailsScreen({ route, navigation, themeColors }) {
  const { selectedDate } = route.params || {};
  const [violations, setViolations] = useState([]);

  const loadData = async () => {
    if (!selectedDate) return;
    try {
      const data = await getPhotosByDate(selectedDate);
      setViolations(data);
    } catch (error) {
      console.error("Помилка завантаження:", error);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedDate]);

  const parseImages = (imgField) => {
    try {
      const parsed = JSON.parse(imgField);
      if (Array.isArray(parsed)) {
        return { uri: parsed[0], count: parsed.length };
      }
      return { uri: imgField, count: 1 };
    } catch (e) {
      return { uri: imgField, count: 1 };
    }
  };

  const renderViolationItem = ({ item }) => {
    const { uri, count } = parseImages(item.image);

    return (
      <TouchableOpacity
        onPress={() => navigation.navigate('Post', { post: item })}
        activeOpacity={0.9}
      >
        <Card style={styles.card}>
          <View>
            <Card.Cover source={{ uri: uri }} />
            {count > 1 && (
              <Badge style={styles.badge} size={24}>+{count - 1}</Badge>
            )}
          </View>
          <Card.Content>
            <Text style={[styles.category, { color: themeColors.text }]}>
              {item.category || item.title}
            </Text>
            <Text numberOfLines={2} style={[styles.description, { color: themeColors.text }]}>
              {item.description || item.text}
            </Text>
          </Card.Content>
        </Card>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <Text style={[styles.title, { color: themeColors.text }]}>
        Порушення за {selectedDate}
      </Text>

      {violations.length > 0 && (
        <Button
          icon="map"
          mode="outlined"
          style={{ marginBottom: 10, borderColor: themeColors.primary }}
          textColor={themeColors.primary}
          onPress={() => navigation.navigate('Map', { filterDate: selectedDate })}
        >
          Показати на карті
        </Button>
      )}

      <FlatList
        data={violations}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderViolationItem}
        contentContainerStyle={{ paddingBottom: 20 }}
        ListEmptyComponent={
          <Text style={styles.emptyText}>У цей день порушень не зафіксовано</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10 },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
  card: { marginBottom: 15, borderRadius: 10, elevation: 4, overflow: 'hidden' },
  category: { fontWeight: 'bold', marginTop: 10, fontSize: 16 },
  description: { marginTop: 5, fontSize: 14, opacity: 0.7 },
  emptyText: { textAlign: 'center', marginTop: 50, color: 'gray', fontSize: 16 },
  badge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.7)',
    color: 'white',
    fontWeight: 'bold'
  }
});