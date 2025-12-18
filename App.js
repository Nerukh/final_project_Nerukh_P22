import React, { useState } from 'react';
import { StyleSheet, Text, View, Button, Switch,  } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

const Tab = createBottomTabNavigator();
const Drawer = createDrawerNavigator();

const CalendarScreen = () => (
    <View style={styles.container}>
        <Text>Calendar Screen</Text>
    </View>
);

const MapScreen = () => (
    <View style={styles.container}>
        <Text>Map Screen</Text>
    </View>
);

const NewScreen = () => (
    <View style={styles.container}>
        <Text>New Screen</Text>
    </View>
);

function BottomTabs() {
    return (
        <Tab.Navigator screenOptions={{ headerShown: false }}>
            <Tab.Screen name="Calendar" component={CalendarScreen} />
            <Tab.Screen name="Map" component={MapScreen} />
            <Tab.Screen name="New" component={NewScreen} />
        </Tab.Navigator>
    );
}

const ProfileScreen = () => (
    <View style={styles.container}>
        <Text>Profile Screen</Text>
    </View>
);

const ExitScreen = ({ navigation }) => (
    <View style={styles.container}>
        <Text>Exit Screen</Text>
        <Button title="Go Back" onPress={() => navigation.goBack()} />
    </View>
);

const SettingsScreen = () => {
    const [isDarkTheme, setIsDarkTheme] = useState(false);
    const [language, setLanguage] = useState('EN');

    const toggleTheme = () => setIsDarkTheme(prev => !prev);
    const switchLanguage = () => setLanguage(prev => (prev === 'EN' ? 'UA' : 'EN'));

    return (
        <View style={styles.container}>
            <Text style={{ fontSize: 20, marginBottom: 10 }}>Settings</Text>

            <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 10 }}>
                <Text>Dark Theme:</Text>
                <Switch value={isDarkTheme} onValueChange={toggleTheme} />
            </View>

            <View style={{ marginVertical: 10 }}>
                <Text>Language: {language}</Text>
                <Button title="Switch Language" onPress={switchLanguage} />
            </View>
        </View>
    );
};

export default function App() {
    return (
        <NavigationContainer>
            <Drawer.Navigator screenOptions={{ headerShown: true }}>
                <Drawer.Screen name="Home" component={BottomTabs} />
                <Drawer.Screen name="Profile" component={ProfileScreen} />
                <Drawer.Screen name="Settings" component={SettingsScreen} />
                <Drawer.Screen name="Exit" component={ExitScreen} />
            </Drawer.Navigator>
        </NavigationContainer>
    );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});