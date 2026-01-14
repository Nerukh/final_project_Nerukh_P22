import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Button, Switch, Alert, Image, FlatList } from 'react-native';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createDrawerNavigator } from '@react-navigation/drawer';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import * as Location from 'expo-location';
import MapView from "react-native-maps";
import { createTable, insertUser, fetchUsers } from './database';
import { useTranslation, initReactI18next } from 'react-i18next';
import { changeLanguage, initI18n } from './i18n';

const Tab = createBottomTabNavigator();
const Drawer = createDrawerNavigator();

const CalendarScreen = ({ themeColors, t }) => (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
        <Text style={{ color: themeColors.text }}>{t('calendarScreen')}</Text>
    </View>
);

const MapScreen = ({ region, setRegion }) => (
    <MapView
        style={{ flex: 1 }}
        region={region}
        onRegionChangeComplete={setRegion}
    />
);

function NewScreen({ themeColors, t }) {
    const [image, setImage] = React.useState(null);
    const [location, setLocation] = React.useState(null);
    const [list, setList] = React.useState([]);

    React.useEffect(() => {
        createTable();
        loadData();
    }, []);

    const loadData = () => {
        fetchUsers(data => {
            console.log('SQLite data loaded:', data);
            data.forEach(item => {
                console.log(`ID:${item.id} URL:${item.name} Lat:${item.latitude} Lng:${item.longitude}`);
            });
            setList(data || []);
        });
    };

    const takePhoto = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') return;

        const photo = await ImagePicker.launchCameraAsync({ quality: 1 });
        if (photo.canceled) return;

        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
        setImage(photo.assets[0].uri);
        setLocation({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
    };

    const saveToDB = async () => {
        if (!image || !location) {
            Alert.alert('Error', 'Photo or location missing');
            return;
        }

        try {
            const formData = new FormData();
            formData.append('file', { uri: image, type: 'image/jpeg', name: 'photo.jpg' });
            formData.append('upload_preset', 'archive');

            const response = await fetch(
                'https://api.cloudinary.com/v1_1/dvf7vqr1s/image/upload',
                { method: 'POST', body: formData }
            );
            const data = await response.json();
            const imageUrl = data.secure_url || image;

            console.log('Uploaded to Cloudinary:', imageUrl);
            console.log('Photo coordinates:', location);

            insertUser(imageUrl, location.latitude, location.longitude, loadData);

            setImage(null);
            setLocation(null);
        } catch (error) {
            console.error('Error saving photo:', error);
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: themeColors.background }]}>
            <Text style={{ color: themeColors.text, fontSize: 18 }}>{t('newScreen')}</Text>
            <Button title={t('takePhoto')} onPress={takePhoto} />
            <View style={{ height: 10 }} />
            <Button title={t('saveToSQLite')} onPress={saveToDB} />
            {image && <Image source={{ uri: image }} style={styles.image} />}
            <FlatList
                data={list}
                keyExtractor={item => item.id.toString()}
                renderItem={({ item }) => (
                    <View style={{ marginTop: 15 }}>
                        <Image source={{ uri: item.name }} style={{ width: 200, height: 200 }} />
                        <Text style={{ color: themeColors.text }}>
                            ID: {item.id} Lat: {item.latitude} Lng: {item.longitude}
                        </Text>
                    </View>
                )}
            />
        </View>
    );
}



const ProfileScreen = ({ themeColors, t }) => (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
        <Text style={{ color: themeColors.text }}>{t('profileScreen')}</Text>
    </View>
);

const SettingsScreen = ({ themeColors, isDarkTheme, toggleTheme, language, switchLanguage, t }) => (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
        <Text style={{ color: themeColors.text }}>{t('settings')}</Text>
        <Switch value={isDarkTheme} onValueChange={toggleTheme} />
        <Button title={t('switchLanguage')} onPress={switchLanguage} />
    </View>
);

export default function App() {
    const [isReady, setIsReady] = useState(false);
    const [isDarkTheme, setIsDarkTheme] = useState(false);
    const [language, setLanguage] = useState('en');

    const { t, i18n } = useTranslation();

    const [region, setRegion] = useState({
        latitude: 50.4501,
        longitude: 30.5234,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421
    });

    useEffect(() => {
        const prepare = async () => {
            await initI18n();
            setLanguage(i18n.language);
            setIsReady(true);
        };
        prepare();
    }, []);

    if (!isReady) return null;

    const switchLanguage = async () => {
        const newLang = language === 'en' ? 'uk' : 'en';
        await changeLanguage(newLang);
        setLanguage(newLang);
    };

    const themeColors = isDarkTheme
        ? { background: '#121212', text: '#fff' }
        : { background: '#fff', text: '#000' };

    return (
        <NavigationContainer theme={isDarkTheme ? DarkTheme : DefaultTheme}>
            <Drawer.Navigator>
                <Drawer.Screen name={t('home')}>
                    {() => (
                        <Tab.Navigator screenOptions={{ headerShown: false }}>
                            <Tab.Screen name={t('calendarScreen')}>
                                {() => <CalendarScreen themeColors={themeColors} t={t} />}
                            </Tab.Screen>
                            <Tab.Screen name={t('mapScreen')}>
                                {() => <MapScreen region={region} setRegion={setRegion} />}
                            </Tab.Screen>
                            <Tab.Screen name={t('newScreen')}>
                                {() => <NewScreen themeColors={themeColors} t={t} />}
                            </Tab.Screen>
                        </Tab.Navigator>
                    )}
                </Drawer.Screen>

                <Drawer.Screen name={t('profile')}>
                    {() => <ProfileScreen themeColors={themeColors} t={t} />}
                </Drawer.Screen>

                <Drawer.Screen name={t('settings')}>
                    {() => (
                        <SettingsScreen
                            themeColors={themeColors}
                            isDarkTheme={isDarkTheme}
                            toggleTheme={() => setIsDarkTheme(p => !p)}
                            language={language}
                            switchLanguage={switchLanguage}
                            t={t}
                        />
                    )}
                </Drawer.Screen>
            </Drawer.Navigator>
        </NavigationContainer>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 10 },
    image: { width: 300, height: 300, marginTop: 20 },
    map: { width: 300, height: 300, flex: 1 },
});
