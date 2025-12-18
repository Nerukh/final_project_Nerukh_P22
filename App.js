import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Button, Switch } from 'react-native';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { changeLanguage, loadLanguage } from './i18n';
import { useTranslation } from 'react-i18next';

const Tab = createBottomTabNavigator();
const Drawer = createDrawerNavigator();

// --- Екрани ---
const CalendarScreen = ({ themeColors }) => (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
        <Text style={{ color: themeColors.text }}>Calendar Screen</Text>
    </View>
);

const MapScreen = ({ themeColors }) => (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
        <Text style={{ color: themeColors.text }}>Map Screen</Text>
    </View>
);

const NewScreen = ({ themeColors }) => (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
        <Text style={{ color: themeColors.text }}>New Screen</Text>
    </View>
);

const ProfileScreen = ({ themeColors }) => (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
        <Text style={{ color: themeColors.text }}>Profile Screen</Text>
    </View>
);

const ExitScreen = ({ navigation, themeColors }) => (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
        <Text style={{ color: themeColors.text }}>Exit Screen</Text>
        <Button title="Go Back" onPress={() => navigation.goBack()} />
    </View>
);

const BottomTabs = ({ themeColors }) => (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
        <Tab.Screen name="Calendar">
            {() => <CalendarScreen themeColors={themeColors} />}
        </Tab.Screen>
        <Tab.Screen name="Map">
            {() => <MapScreen themeColors={themeColors} />}
        </Tab.Screen>
        <Tab.Screen name="New">
            {() => <NewScreen themeColors={themeColors} />}
        </Tab.Screen>
    </Tab.Navigator>
);

const SettingsScreen = ({ themeColors, isDarkTheme, toggleTheme, language, switchLanguage }) => {
    const { t } = useTranslation();
    return (
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
};

export default function App() {
    const { i18n } = useTranslation();
    const [language, setLanguage] = useState(i18n.language);
    const [isDarkTheme, setIsDarkTheme] = useState(false);

    useEffect(() => {
        loadLanguage().then(() => setLanguage(i18n.language));
    }, []);

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
                <Drawer.Screen name="Home">
                    {() => <BottomTabs themeColors={themeColors} />}
                </Drawer.Screen>
                <Drawer.Screen name="Profile">
                    {() => <ProfileScreen themeColors={themeColors} />}
                </Drawer.Screen>
                <Drawer.Screen name="Settings">
                    {() => (
                        <SettingsScreen
                            themeColors={themeColors}
                            isDarkTheme={isDarkTheme}
                            toggleTheme={toggleTheme}
                            language={language}
                            switchLanguage={switchLanguage}
                        />
                    )}
                </Drawer.Screen>
                <Drawer.Screen name="Exit">
                    {() => <ExitScreen themeColors={themeColors} />}
                </Drawer.Screen>
            </Drawer.Navigator>
        </NavigationContainer>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
