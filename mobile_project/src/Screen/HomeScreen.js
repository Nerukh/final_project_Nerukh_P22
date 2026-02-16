import React, { useState, useContext, useCallback } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';


import MapScreen from './MapScreen';
import NewScreen from './NewScreen';
import CalendarScreen from './CalendarScreen';
import DayDetailsScreen from './DayDetailsScreen';
import PostScreen from './PostScreen';

import { getAllPosts, createPost } from '../api/api';
import { clearAllPhotos, insertPhoto, getUnsyncedPhotos, markPhotoAsSynced } from '../database/database';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function CalendarStack({ themeColors }) {
  const { t } = useTranslation();
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: themeColors.card },
        headerTintColor: themeColors.text,
      }}
    >
      <Stack.Screen name="CalendarMain" options={{ title: t('calendar') || 'Календар' }}>
        {(props) => <CalendarScreen {...props} themeColors={themeColors} />}
      </Stack.Screen>
      <Stack.Screen name="DayDetails" options={{ title: t('day_details') || 'Деталі дня' }}>
        {(props) => <DayDetailsScreen {...props} themeColors={themeColors} />}
      </Stack.Screen>
      <Stack.Screen name="Post" options={{ title: t('post_details') || 'Деталі порушення' }}>
        {(props) => <PostScreen {...props} themeColors={themeColors} />}
      </Stack.Screen>
    </Stack.Navigator>
  );
}

export default function HomeScreen({ themeColors }) {
  const { token } = useContext(AuthContext);
  const { t } = useTranslation();
  const [isSyncing, setIsSyncing] = useState(false);

  const syncData = async () => {
    if (isSyncing) return;
    setIsSyncing(true);


    try {
      const unsynced = await getUnsyncedPhotos();
      if (unsynced.length > 0 && token) {
        for (const photo of unsynced) {
          try {
            await createPost({
              title: photo.category,
              text: photo.description,
              image: photo.image,
              latitude: photo.latitude,
              longitude: photo.longitude,
              date: photo.created_at
            }, token);
            await markPhotoAsSynced(photo.id);
          } catch (e) {
          }
        }
      }

      const remotePosts = await getAllPosts();
      if (remotePosts && remotePosts.length > 0) {
        await clearAllPhotos();
        for (const post of remotePosts) {
          await insertPhoto({
            image: post.image,
            latitude: post.latitude,
            longitude: post.longitude,
            description: post.text,
            category: post.title,
            created_at: post.date,
            user_email: post.user_email,
            user_id: 1,
            synced: 1
          });
        }
      }
    } catch (error) {
    } finally {
      setIsSyncing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      syncData();
    }, [token])
  );

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName =
            route.name === 'Map' ? 'map' :
            route.name === 'New' ? 'add-circle' : 'calendar';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: themeColors.primary,
        headerShown: false,
      })}
    >
      <Tab.Screen name="Map" options={{ title: t('map') || 'Карта' }}>
        {(props) => <MapScreen {...props} themeColors={themeColors} />}
      </Tab.Screen>

      {token && (
        <Tab.Screen name="New" options={{ title: t('new') || 'Нове' }}>
          {(props) => <NewScreen {...props} themeColors={themeColors} />}
        </Tab.Screen>
      )}

      <Tab.Screen name="CalendarTab" options={{ title: t('calendar') || 'Календар' }}>
        {(props) => <CalendarStack themeColors={themeColors} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}