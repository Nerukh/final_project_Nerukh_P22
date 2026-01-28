import React, { useEffect, useState, useContext } from 'react';
import { StyleSheet, View, Text, Image } from 'react-native';
import MapView, { Marker, Callout, PROVIDER_GOOGLE } from 'react-native-maps';
import { useIsFocused } from '@react-navigation/native';
import { AuthContext } from '../AuthContext';
import { getPhotos } from '../database';

export default function MapScreen({ themeColors }) {
  const { user } = useContext(AuthContext);
  const [markers, setMarkers] = useState([]);
  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused && user) {
      loadMarkers();
    }
  }, [isFocused, user]);

  const loadMarkers = async () => {
    try {
      console.log("Оновлення маркерів на карті...");
      const data = await getPhotos(user.id);
      const validMarkers = data.filter(m => m.latitude && m.longitude);
      setMarkers(validMarkers);
    } catch (e) {
      console.log("Помилка завантаження маркерів:", e);
    }
  };

  return (
    <View style={styles.container}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={{
          latitude: 37.7749295,
          longitude: -122.4194155,
          latitudeDelta: 0.1,
          longitudeDelta: 0.1,
        }}
      >
        {markers.map((item) => (
          <Marker
            key={item.id.toString()}
            coordinate={{
              latitude: parseFloat(item.latitude),
              longitude: parseFloat(item.longitude),
            }}
            pinColor="red"
          >
            <Callout tooltip>
              <View style={styles.callout}>
                <Text style={styles.calloutTitle}>
                  {item.description || "Правопорушення"}
                </Text>

                <Image
                  source={{ uri: item.image }}
                  style={styles.calloutImage}
                  resizeMode="cover"
                />

                <Text style={styles.calloutDate}>
                  {new Date(item.created_at).toLocaleDateString()}
                </Text>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { width: '100%', height: '100%' },
  callout: {
    width: 150,
    padding: 10,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc'
  },
  calloutTitle: {
    fontWeight: 'bold',
    fontSize: 12,
    marginBottom: 5,
    textAlign: 'center'
  },
  calloutImage: {
    width: 130,
    height: 80,
    borderRadius: 5
  },
  calloutDate: {
    fontSize: 10,
    color: '#666',
    marginTop: 5
  }
});