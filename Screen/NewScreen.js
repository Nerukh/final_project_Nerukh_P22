import React, { useContext, useEffect, useState } from 'react';
import { View, Text, Button, Image, FlatList, StyleSheet, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { AuthContext } from '../AuthContext';
import { insertPhoto, getPhotos } from '../database';

export default function NewScreen() {
  const { user } = useContext(AuthContext);
  const [photos, setPhotos] = useState([]);
  const [tempImage, setTempImage] = useState(null);

  useEffect(() => {
    if (user) load();
  }, [user]);

  const load = async () => {
    const data = await getPhotos(user.id);
    setPhotos(data);
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      alert('Потрібен доступ до камери!');
      return;
    }

    const img = await ImagePicker.launchCameraAsync({
      quality: 0.5,
    });

    if (!img.canceled) {
      setTempImage(img.assets[0].uri);
    }
  };

const savePhoto = async () => {
    if (!tempImage) return;

    try {
      console.log('Початок збереження...');

      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        alert('Помилка: Дозвольте доступ до локації!');
        return;
      }

      console.log('Отримання координат...');
      let loc = null;

      try {
        loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
          timeout: 5000,
        });
      } catch (e) {
        console.log('GPS недоступний, використовуємо дефолтні координати (SF)');
        loc = {
          coords: {
            latitude: 37.7749,
            longitude: -122.4194,
          }
        };
      }

      console.log('Координати для запису:', loc.coords.latitude, loc.coords.longitude);

      await insertPhoto({
        image: tempImage,
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        created_at: new Date().toISOString(),
        user_id: user.id
      });

      console.log('Записано в SQLite успішно!');
      setTempImage(null);
      load();

    } catch (error) {
      console.error('Помилка при збереженні:', error);
      alert('Помилка: ' + error.message);
    }
};

  if (!user) {
    return <View style={styles.center}><Text>Увійдіть, щоб додавати фото</Text></View>;
  }

  return (
    <View style={styles.container}>
      <Button title="Зробити фото" onPress={takePhoto} />

      {tempImage && (
        <View style={styles.previewContainer}>
          <Text>Попередній перегляд:</Text>
          <Image source={{ uri: tempImage }} style={styles.previewImage} />
          <Button title="ЗБЕРЕГТИ ФОТО У БАЗУ" color="green" onPress={savePhoto} />
          <Button title="Скасувати" color="red" onPress={() => setTempImage(null)} />
        </View>
      )}

      <Text style={styles.title}>Ваші правопорушення:</Text>
      <FlatList
        data={photos}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.photoItem}>
            <Image source={{ uri: item.image }} style={styles.image} />
            <Text>Lat: {item.latitude.toFixed(4)}, Lng: {item.longitude.toFixed(4)}</Text>
            <Text style={styles.date}>{new Date(item.created_at).toLocaleString()}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  previewContainer: { marginVertical: 20, alignItems: 'center', borderBottomWidth: 1, paddingBottom: 10 },
  previewImage: { width: 150, height: 150, borderRadius: 10, marginVertical: 10 },
  title: { fontSize: 18, fontWeight: 'bold', marginTop: 20, marginBottom: 10 },
  photoItem: { marginBottom: 15, alignItems: 'center' },
  image: { width: 200, height: 200, borderRadius: 10 },
  date: { fontSize: 12, color: 'gray' }
});