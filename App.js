import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Button, Switch, Alert, Image, Linking, FlatList } from 'react-native';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { useTranslation } from 'react-i18next';
import { changeLanguage, initI18n } from './i18n';
import * as ImagePicker from 'expo-image-picker';
import * as SQLite from 'expo-sqlite';

const Tab = createBottomTabNavigator();
const Drawer = createDrawerNavigator();
const db = SQLite.openDatabase('violations.db');

const initDB = () => {
    db.transaction(tx => {
        tx.executeSql(
            `CREATE TABLE IF NOT EXISTS violations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        imageUri TEXT,
        createdAt TEXT
      );`,
            [],
            (_, result) => console.log("Table created or exists", result),
            (_, error) => { console.log("Error creating table", error); return true; }
        );
    });
};

const CalendarScreen = ({ themeColors, t }) => (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
        <Text style={{ color: themeColors.text }}>{t('calendarScreen')}</Text>
    </View>
);

const MapScreen = ({ themeColors, t }) => (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
        <Text style={{ color: themeColors.text }}>{t('mapScreen')}</Text>
    </View>
);

function NewScreen({ themeColors, t }) {
    const [image, setImage] = useState(null);
    const [list, setList] = useState([]);

    useEffect(() => {
        initDB();
        loadData();
    }, []);

    const loadData = () => {
        db.transaction(tx => {
            tx.executeSql(
                'SELECT * FROM violations;',
                [],
                (_, { rows }) => setList(rows._array),
                (_, error) => { console.log("Select error", error); return true; }
            );
        });
    };

    const handleTakePhoto = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') return;
        const result = await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [4,3], quality: 1 });
        if (!result.canceled) setImage(result.assets[0].uri);
    };

    const handlePickImage = async () => {
        const { status } = await ImagePicker.getMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            const { status: newStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (newStatus !== 'granted') return;
        }
        const result = await ImagePicker.launchImageLibraryAsync({ allowsEditing: true, aspect: [4,3], quality: 1, mediaTypes: ImagePicker.MediaType.Images });
        if (!result.canceled) setImage(result.assets[0].uri);
    };

    const saveToDB = () => {
        if (!image) return;
        const date = new Date().toISOString();
        db.transaction(tx => {
            tx.executeSql(
                'INSERT INTO violations (imageUri, createdAt) VALUES (?, ?);',
                [image, date],
                () => { setImage(null); loadData(); },
                (_, error) => { console.log("Insert error", error); return true; }
            );
        });
    };

    return (
        <View style={[styles.container, { backgroundColor: themeColors.background }]}>
            <Text style={{ color: themeColors.text, fontSize: 18, marginBottom: 10 }}>{t('newScreen')}</Text>
            <Button title={t('takePhoto')} onPress={handleTakePhoto} />
            <View style={{ height: 10 }} />
            <Button title={t('pickImage')} onPress={handlePickImage} />
            <View style={{ height: 10 }} />
            <Button title={t('saveToSQLite')} onPress={saveToDB} />
            {image && <Image source={{ uri: image }} style={styles.image} />}
            <FlatList
                data={list}
                keyExtractor={item => item.id.toString()}
                renderItem={({ item }) => (
                    <View style={{ marginTop: 15 }}>
                        <Text style={{ color: themeColors.text }}>{item.createdAt}</Text>
                        <Image source={{ uri: item.imageUri }} style={{ width: 150, height: 150 }} />
                    </View>
                )}
            />
            <StatusBar style="auto" />
        </View>
    );
}

const ProfileScreen = ({ themeColors, t }) => (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
        <Text style={{ color: themeColors.text }}>{t('profileScreen')}</Text>
    </View>
);

const ExitScreen = ({ navigation, themeColors, t }) => (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
        <Text style={{ color: themeColors.text }}>{t('exitScreen')}</Text>
        <Button title={t('goBack')} onPress={() => navigation.goBack()} />
    </View>
);

const BottomTabs = ({ themeColors, t }) => (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
        <Tab.Screen name={t('calendarScreen')}>{() => <CalendarScreen themeColors={themeColors} t={t} />}</Tab.Screen>
        <Tab.Screen name={t('mapScreen')}>{() => <MapScreen themeColors={themeColors} t={t} />}</Tab.Screen>
        <Tab.Screen name={t('newScreen')}>{() => <NewScreen themeColors={themeColors} t={t} />}</Tab.Screen>
    </Tab.Navigator>
);

const SettingsScreen = ({ themeColors, isDarkTheme, toggleTheme, language, switchLanguage, t }) => (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
        <Text style={{ fontSize: 20, marginBottom: 10, color: themeColors.text }}>{t('settings')}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 10 }}>
            <Text style={{ color: themeColors.text }}>{t('darkTheme')}</Text>
            <Switch value={isDarkTheme} onValueChange={toggleTheme} />
        </View>
        <View style={{ marginVertical: 10 }}>
            <Text style={{ color: themeColors.text }}>{t('language')}: {language}</Text>
            <Button title={t('switchLanguage')} onPress={switchLanguage} />
        </View>
    </View>
);

export default function App() {
    const [isReady, setIsReady] = useState(false);
    const [isDarkTheme, setIsDarkTheme] = useState(false);
    const [language, setLanguage] = useState('en');
    const { t, i18n } = useTranslation();

    useEffect(() => {
        const prepare = async () => {
            await initI18n();
            setLanguage(i18n.language);
            setIsReady(true);
        };
        prepare();
    }, []);

    if (!isReady) return null;

    const toggleTheme = () => setIsDarkTheme(prev => !prev);

    const switchLanguage = async () => {
        const newLang = language === 'en' ? 'uk' : language === 'uk' ? 'pl' : 'en';
        await changeLanguage(newLang);
        setLanguage(newLang);
    };

    const themeColors = isDarkTheme
        ? { background: '#121212', text: '#ffffff' }
        : { background: '#ffffff', text: '#000000' };

    return (
        <NavigationContainer theme={isDarkTheme ? DarkTheme : DefaultTheme}>
            <Drawer.Navigator screenOptions={{ headerShown: true }}>
                <Drawer.Screen name={t('home')}>{() => <BottomTabs themeColors={themeColors} t={t} />}</Drawer.Screen>
                <Drawer.Screen name={t('profile')}>{() => <ProfileScreen themeColors={themeColors} t={t} />}</Drawer.Screen>
                <Drawer.Screen name={t('settings')}>
                    {() => <SettingsScreen themeColors={themeColors} isDarkTheme={isDarkTheme} toggleTheme={toggleTheme} language={language} switchLanguage={switchLanguage} t={t} />}
                </Drawer.Screen>
                <Drawer.Screen name={t('exit')}>{() => <ExitScreen themeColors={themeColors} t={t} />}</Drawer.Screen>
            </Drawer.Navigator>
        </NavigationContainer>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 10 },
    image: { width: 300, height: 300, marginTop: 20 },
});
