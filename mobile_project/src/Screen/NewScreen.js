import React, { useState, useContext, useEffect } from 'react';
import { View, ScrollView, Image, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { TextInput, Button, Card, Text, IconButton } from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { useTranslation } from 'react-i18next';

import { AuthContext } from '../context/AuthContext';
import { insertPhoto, markPhotoAsSynced } from '../database/database';
import { uploadImage } from '../api/cloudinary';
import { createPost } from '../api/api';

export default function NewScreen({ themeColors }) {
  const { t } = useTranslation();
  const { token, user } = useContext(AuthContext);

  const [images, setImages] = useState([]);
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Parking');
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState(null);

  const categories = [
    { label: t('cat_parking') || 'Паркування', value: 'Parking' },
    { label: t('cat_garbage') || 'Сміття', value: 'Garbage' },
    { label: t('cat_road') || 'Дороги', value: 'Road' },
    { label: t('cat_vandalism') || 'Вандалізм', value: 'Vandalism' },
    { label: t('cat_other') || 'Інше', value: 'General' },
  ];

  const getLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Permission to access location was denied');
        return null;
      }

      let lastKnown = await Location.getLastKnownPositionAsync({});
      if (lastKnown) {
        setLocation(lastKnown);
      }

      let current = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        timeout: 5000
      });

      if (current) {
         setLocation(current);
         return current;
      }
      return lastKnown;

    } catch (error) {
      console.log("Location warning (using defaults or waiting for GPS):", error.message);
      return null;
    }
  };

  useEffect(() => {
    getLocation();
  }, []);

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(t('error'), 'Немає доступу до камери');
      return;
    }

    if (images.length >= 5) {
      Alert.alert(t('info'), "Максимум 5 фото для одного звіту");
      return;
    }

    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: false,
      aspect: [4, 3],
      quality: 0.5,
      exif: true,
    });

    if (!result.canceled) {
      const newPhoto = result.assets[0];
      setImages(prevImages => [...prevImages, newPhoto.uri]);

      if (!location && newPhoto.exif) {
         const { Latitude, Longitude, GPSLatitude, GPSLongitude } = newPhoto.exif;
         const lat = Latitude || GPSLatitude;
         const lon = Longitude || GPSLongitude;

         if (lat && lon) {
           console.log("Отримано координати з EXIF фото:", lat, lon);
           setLocation({
             coords: {
               latitude: lat,
               longitude: lon
             }
           });
         }
      }
    }
  };

  const removeImage = (indexToRemove) => {
    setImages(prevImages => prevImages.filter((_, index) => index !== indexToRemove));
  };

  const handleSave = async () => {
      if (images.length === 0) {
        Alert.alert(t('error'), t('take_photo_first') || "Зробіть хоча б одне фото");
        return;
      }
      if (!description.trim()) {
        Alert.alert(t('error'), t('fill_all_fields') || "Додайте опис");
        return;
      }

      setLoading(true);
      try {
        let currentLoc = location;
        if (!currentLoc) {
            currentLoc = await getLocation();
        }

        const lat = currentLoc?.coords?.latitude || 50.4501;
        const lon = currentLoc?.coords?.longitude || 30.5234;

        if (!currentLoc) {
            console.log("Увага: Використано дефолтні координати (Київ), бо GPS недоступний.");
        }

        const currentUserEmail = user?.email || user?.username || "Guest";
        const currentUserId = user?.id || 0;

        const localImagesJson = JSON.stringify(images);

        const localData = {
          image: localImagesJson,
          latitude: lat,
          longitude: lon,
          description: description,
          category: category,
          created_at: new Date().toISOString(),
          user_email: currentUserEmail,
          user_id: currentUserId,
          synced: 0
        };

        const localResult = await insertPhoto(localData);
        console.log("Local Saved ID:", localResult.lastInsertRowId);

        if (token) {
           const uploadedUrls = [];

           for (const localUri of images) {
             const url = await uploadImage(localUri);
             if (url) {
               uploadedUrls.push(url);
             } else {
               console.log("Failed to upload one image");
             }
           }

           if (uploadedUrls.length > 0) {
              const dataForServer = {
                title: category,
                text: description,
                image: JSON.stringify(uploadedUrls),
                latitude: lat,
                longitude: lon,
                user_email: currentUserEmail,
                date: new Date().toISOString(),
              };

              const response = await createPost(dataForServer, token);

              if (response) {
                await markPhotoAsSynced(localResult.lastInsertRowId);
                Alert.alert(t('success'), "Опубліковано успішно!");
              }
           } else {
             Alert.alert(t('info'), "Фото збережені на телефоні. Помилка завантаження в хмару.");
           }
        } else {
           Alert.alert(t('info'), "Збережено локально (ви не авторизовані).");
        }

        setImages([]);
        setDescription('');
        setCategory('Parking');

      } catch (err) {
        console.error("Save error:", err);
        Alert.alert(t('success'), "Збережено офлайн (помилка з'єднання).");
      } finally {
        setLoading(false);
      }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleLarge" style={[styles.title, { color: themeColors.text }]}>
             {t('new_report') || 'Нове порушення'}
          </Text>

          <Button
            mode="contained"
            icon="camera"
            onPress={takePhoto}
            style={styles.cameraButton}
            buttonColor={themeColors.primary}
            disabled={loading}
          >
            {images.length === 0 ? (t('take_photo') || 'Зробити фото') : `${t('add_photo') || 'Додати ще'} (${images.length})`}
          </Button>

          {images.length > 0 && (
            <View style={styles.imagesContainer}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {images.map((uri, index) => (
                  <View key={index} style={styles.imageWrapper}>
                    <Image source={{ uri: uri }} style={styles.thumbnail} />

                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => removeImage(index)}
                      disabled={loading}
                    >
                      <IconButton icon="close" size={14} iconColor="white" style={{ margin: 0 }} />
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            </View>
          )}

          <Text style={[styles.label, { color: themeColors.text }]}>{t('category') || 'Категорія'}:</Text>
          <View style={[styles.pickerContainer, { borderColor: themeColors.border }]}>
            <Picker
              selectedValue={category}
              onValueChange={(itemValue) => setCategory(itemValue)}
              style={{ color: themeColors.text, backgroundColor: themeColors.card }}
              dropdownIconColor={themeColors.text}
              enabled={!loading}
            >
              {categories.map((cat) => (
                <Picker.Item key={cat.value} label={cat.label} value={cat.value} />
              ))}
            </Picker>
          </View>

          <TextInput
            label={t('description') || 'Опис'}
            mode="outlined"
            value={description}
            onChangeText={setDescription}
            style={[styles.input, { backgroundColor: themeColors.card }]}
            textColor={themeColors.text}
            multiline
            numberOfLines={3}
            disabled={loading}
          />

          <Button
            mode="contained"
            onPress={handleSave}
            loading={loading}
            disabled={loading}
            style={styles.saveButton}
            buttonColor={themeColors.primary}
          >
            {loading ? (t('saving') || 'Збереження...') : (t('save') || 'Зберегти')}
          </Button>
        </Card.Content>
      </Card>

      <View style={{ height: 50 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15 },
  card: { borderRadius: 15, elevation: 4, marginBottom: 20 },
  title: { textAlign: 'center', marginBottom: 15, fontWeight: 'bold' },
  cameraButton: { marginBottom: 15 },

  imagesContainer: { flexDirection: 'row', marginBottom: 15, height: 110 },
  imageWrapper: { position: 'relative', marginRight: 10 },
  thumbnail: { width: 100, height: 100, borderRadius: 10, resizeMode: 'cover' },
  deleteButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#ff4444',
    borderRadius: 15,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    zIndex: 1
  },

  label: { marginTop: 5, marginBottom: 5, fontWeight: '600', fontSize: 16 },
  pickerContainer: { borderWidth: 1, borderRadius: 8, overflow: 'hidden' },
  input: { marginVertical: 15 },
  saveButton: { marginTop: 10, paddingVertical: 5 }
});