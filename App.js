import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

const Tab = createBottomTabNavigator();


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


export default function App() {
    return (
        <NavigationContainer>
            <Tab.Navigator screenOptions={{ headerShown: false }}>
                <Tab.Screen name="Calendar" component={CalendarScreen} />
                <Tab.Screen name="Map" component={MapScreen} />
                <Tab.Screen name="New" component={NewScreen} />
            </Tab.Navigator>
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