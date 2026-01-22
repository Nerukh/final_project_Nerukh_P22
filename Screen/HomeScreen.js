import React from 'react';
import { View, Text } from 'react-native';

export default function HomeScreen({ user }) {
  if (!user) return <Text>Please login to use the app</Text>;
  return (
    <View>
      <Text>Home Screen</Text>
    </View>
  );
}