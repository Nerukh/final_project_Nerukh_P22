import React, { useState, useCallback } from 'react';
import { View, StyleSheet, Dimensions, ActivityIndicator } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { useFocusEffect } from '@react-navigation/native';
import { Button, Text, FAB } from 'react-native-paper';
import { getAllPhotos, getPhotosByDate } from '../database/database';


export default function MapScreen({ route, navigation, themeColors }) {
  const [markers, setMarkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterMode, setFilterMode] = useState('all');

  const { filterDate, filterPost } = route.params || {};

  useFocusEffect(
    useCallback(() => {
      const loadMarkers = async () => {
        setLoading(true);
        try {
          if (filterPost) {
            setFilterMode('single');
            setMarkers([filterPost]);
          } else if (filterDate) {
            setFilterMode('date');
            const datePhotos = await getPhotosByDate(filterDate);
            setMarkers(datePhotos);
          } else {
            setFilterMode('all');
            const allPhotos = await getAllPhotos();
            setMarkers(allPhotos);
          }
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      };

      loadMarkers();
    }, [filterDate, filterPost])
  );

  const resetFilter = () => {
    navigation.setParams({ filterDate: null, filterPost: null });
  };

  const initialRegion = {
    latitude: filterPost ? filterPost.latitude : 50.4501,
    longitude: filterPost ? filterPost.longitude : 30.5234,
    latitudeDelta: filterPost ? 0.005 : 0.0922,
    longitudeDelta: filterPost ? 0.005 : 0.0421,
  };

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color={themeColors.primary} /></View>;
  }

  return (
    <View style={styles.container}>
      {filterMode !== 'all' && (
        <View style={[styles.filterBadge, { backgroundColor: themeColors.card }]}>
          <Text style={{ color: themeColors.text }}>
            {filterMode === 'single' ? 'Одне порушення' : `Порушення за ${filterDate}`}
          </Text>
          <Button mode="text" onPress={resetFilter}>Показати всі</Button>
        </View>
      )}

      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={initialRegion}
        region={filterPost ? {
            latitude: filterPost.latitude,
            longitude: filterPost.longitude,
            latitudeDelta: 0.005,
            longitudeDelta: 0.005,
        } : undefined}
      >
        {markers.map((marker) => (
          <Marker
            key={marker.id}
            coordinate={{ latitude: marker.latitude, longitude: marker.longitude }}
            title={marker.category || "Порушення"}
            description={marker.description}
            onCalloutPress={() => {
              navigation.navigate('CalendarTab', {
                screen: 'PostScreen',
                params: { post: marker }
              });
            }}
          />
        ))}
      </MapView>

      <FAB
        style={[styles.fab, { backgroundColor: themeColors.primary }]}
        icon="refresh"
        color="white"
        onPress={resetFilter}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { width: Dimensions.get('window').width, height: Dimensions.get('window').height },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  filterBadge: {
    position: 'absolute',
    top: 50,
    alignSelf: 'center',
    zIndex: 10,
    padding: 10,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 3
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});