import React, { useState, useEffect } from 'react';
import { View, ScrollView, Image, StyleSheet, Dimensions } from 'react-native';
import { Text, Divider, Button } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { getCityName } from '../utils/location';

const { width } = Dimensions.get('window');

export default function PostScreen({ route, navigation, themeColors }) {
  const { t } = useTranslation();
  const { post } = route.params || {};
  const [city, setCity] = useState(t('loading') || 'Завантаження...');

  const [images, setImages] = useState([]);

  useEffect(() => {
    if (post?.image) {
      try {
        const parsed = JSON.parse(post.image);
        if (Array.isArray(parsed)) {
          setImages(parsed);
        } else {
          setImages([post.image]);
        }
      } catch (e) {
        setImages([post.image]);
      }
    }
  }, [post]);

  useEffect(() => {
    const fetchCity = async () => {
      if (post && post.latitude && post.longitude) {
        try {
           const name = await getCityName(post.latitude, post.longitude);
           setCity(name || t('unknown_location') || 'Невідома локація');
        } catch (e) {
           setCity(t('unknown_location'));
        }
      }
    };
    fetchCity();
  }, [post]);

  if (!post) return <View style={styles.center}><Text>Дані відсутні</Text></View>;

  return (
    <ScrollView style={[styles.container, { backgroundColor: themeColors.background }]}>

      <View style={styles.imageContainer}>
        {images.length > 0 ? (
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={true}
          >
            {images.map((imgUri, index) => (
              <Image
                key={index}
                source={{ uri: imgUri }}
                style={[styles.fullImage, { width: width }]}
              />
            ))}
          </ScrollView>
        ) : (
          <View style={[styles.fullImage, { backgroundColor: '#ccc', justifyContent: 'center', alignItems: 'center' }]}>
            <Text>No Image</Text>
          </View>
        )}

        {images.length > 1 && (
          <View style={styles.imageCounter}>
            <Text style={{ color: 'white', fontSize: 12, fontWeight: 'bold' }}>
              Галерея: {images.length} фото
            </Text>
          </View>
        )}
      </View>

      <View style={styles.content}>
        <Text variant="headlineSmall" style={[styles.title, { color: themeColors.text }]}>
          {post.title || post.category}
        </Text>
        <Text style={styles.date}>{new Date(post.created_at || post.date).toLocaleString()}</Text>

        <Divider style={styles.divider} />

        <Text style={[styles.label, { color: themeColors.text }]}>{t('description') || 'Опис'}:</Text>
        <Text style={[styles.text, { color: themeColors.text }]}>{post.text || post.description}</Text>

        <Divider style={styles.divider} />

        <Text style={[styles.label, { color: themeColors.text }]}>{t('location') || 'Місце події'}:</Text>
        <Text style={[styles.text, { color: themeColors.text, marginBottom: 5 }]}>
           {city}
        </Text>

        <Text style={[styles.coords, { color: themeColors.text }]}>
          {post.latitude?.toFixed(6)}, {post.longitude?.toFixed(6)}
        </Text>

        <Divider style={styles.divider} />

        <Text style={[styles.label, { color: themeColors.text }]}>{t('author') || 'Автор'}:</Text>
        <Text style={[styles.text, { color: themeColors.text, marginBottom: 20 }]}>
          {post.user_email || 'Невідомий'}
        </Text>

        <Button
          icon="map-marker-radius"
          mode="contained"
          style={{ marginVertical: 10, backgroundColor: themeColors.primary }}
          onPress={() => navigation.navigate('Map', { filterPost: post })}
        >
          {t('open_map') || 'Відкрити на карті'}
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  imageContainer: { position: 'relative' },
  fullImage: { height: 300, resizeMode: 'cover' },
  imageCounter: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15
  },
  content: { padding: 20 },
  title: { fontWeight: 'bold', marginBottom: 5 },
  date: { color: 'gray', marginBottom: 15 },
  divider: { marginVertical: 15, backgroundColor: 'gray', opacity: 0.3 },
  label: { fontWeight: 'bold', fontSize: 16, marginBottom: 8 },
  text: { fontSize: 16, lineHeight: 24, opacity: 0.9 },
  coords: { fontSize: 12, textAlign: 'left', opacity: 0.6, marginTop: 5 }
});