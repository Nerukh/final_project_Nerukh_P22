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

      // 1. Перевірка дозволів
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Помилка', 'Дозвольте доступ до локації в налаштуваннях!');
        return;
      }

      console.log('Отримання координат...');
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      console.log('Координати отримано:', loc.coords.latitude, loc.coords.longitude);


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
      Alert.alert('Помилка', 'Не вдалося зберегти фото: ' + error.message);
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
          <Text style={styles.coordsText}>Lat: {item.latitude?.toFixed(4)}</Text>
          <Text style={styles.coordsText}>Lng: {item.longitude?.toFixed(4)}</Text>
        </View>
      )}
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