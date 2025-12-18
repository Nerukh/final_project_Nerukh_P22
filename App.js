import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Button, Switch } from 'react-native';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createDrawerNavigator } from '@react-navigation/drawer';

const Tab = createBottomTabNavigator();
const Drawer = createDrawerNavigator();

export default function App() {
    const [isDarkTheme, setIsDarkTheme] = useState(false);

    const toggleTheme = () => setIsDarkTheme(prev => !prev);

    // --- Екрани ---
    const CalendarScreen = () => (
        <View style={[styles.container, { backgroundColor: isDarkTheme ? '#121212' : '#fff' }]}>
            <Text style={[styles.text, { color: isDarkTheme ? '#fff' : '#000' }]}>Calendar Screen</Text>
        </View>
    );

    const MapScreen = () => (
        <View style={[styles.container, { backgroundColor: isDarkTheme ? '#121212' : '#fff' }]}>
            <Text style={[styles.text, { color: isDarkTheme ? '#fff' : '#000' }]}>Map Screen</Text>
        </View>
    );

    const NewScreen = () => (
        <View style={[styles.container, { backgroundColor: isDarkTheme ? '#121212' : '#fff' }]}>
            <Text style={[styles.text, { color: isDarkTheme ? '#fff' : '#000' }]}>New Screen</Text>
        </View>
    );

    const BottomTabs = () => (
        <Tab.Navigator screenOptions={{ headerShown: false }}>
            <Tab.Screen name="Calendar" component={CalendarScreen} />
            <Tab.Screen name="Map" component={MapScreen} />
            <Tab.Screen name="New" component={NewScreen} />
        </Tab.Navigator>
    );

    const ProfileScreen = () => (
        <View style={[styles.container, { backgroundColor: isDarkTheme ? '#121212' : '#fff' }]}>
            <Text style={[styles.text, { color: isDarkTheme ? '#fff' : '#000' }]}>Profile Screen</Text>
        </View>
    );

    const ExitScreen = ({ navigation }) => (
        <View style={[styles.container, { backgroundColor: isDarkTheme ? '#121212' : '#fff' }]}>
            <Text style={[styles.text, { color: isDarkTheme ? '#fff' : '#000' }]}>Exit Screen</Text>
            <Button title="Go Back" onPress={() => navigation.goBack()} />
        </View>
    );

    const SettingsScreen = () => (
        <View style={[styles.container, { backgroundColor: isDarkTheme ? '#121212' : '#fff' }]}>
            <Text style={[styles.text, { color: isDarkTheme ? '#fff' : '#000', fontSize: 20, marginBottom: 10 }]}>
                Settings
            </Text>

            <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 10 }}>
                <Text style={[styles.text, { color: isDarkTheme ? '#fff' : '#000' }]}>Dark Theme:</Text>
                <Switch value={isDarkTheme} onValueChange={toggleTheme} />
            </View>
        </View>
    );

    return (
        <NavigationContainer theme={isDarkTheme ? DarkTheme : DefaultTheme}>
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
  text: {
    fontSize: 16,
  }
});
