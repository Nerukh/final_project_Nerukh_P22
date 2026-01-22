import React, { useState, useContext } from 'react'; // Додав useContext сюди
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { AuthContext } from '../AuthContext';

export default function ProfileScreen({ themeColors, t }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');


  const { user, login, register, logout } = useContext(AuthContext);

  const handleRegister = async () => {
    try {
      await register(email, password);
      Alert.alert('Успіх', 'Акаунт створено!');
    } catch (err) {
      Alert.alert('Помилка', 'Вже зареєстровано');
    }
  };

  const handleLogin = async () => {
    try {
      await login(email, password);
    } catch (err) {
      Alert.alert('Помилка', 'Невірні дані');
    }
  };

  if (user) {
    return (
      <View style={[styles.container, { backgroundColor: themeColors.background }]}>
        <Text style={{ color: themeColors.text }}>Вітаємо, {user.email}</Text>
        <Button title="Вийти" onPress={logout} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />
      <Button title="Увійти" onPress={handleLogin} />
      <Button title="Реєстрація" onPress={handleRegister} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, marginBottom: 10 }
});