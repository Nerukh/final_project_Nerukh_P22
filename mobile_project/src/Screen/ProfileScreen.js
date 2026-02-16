import React, { useState, useContext, useEffect } from 'react';
import { View, StyleSheet, Alert, TouchableOpacity, ScrollView } from 'react-native';
import { TextInput, Button, Text, Checkbox, Card, Avatar } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';

export default function ProfileScreen({ themeColors }) {
  const { t } = useTranslation();
  const { user, login, register, logout } = useContext(AuthContext);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadSavedEmail = async () => {
      const savedEmail = await AsyncStorage.getItem('lastUserEmail');
      if (savedEmail) {
        setEmail(savedEmail);
        setRememberMe(true);
      }
    };
    loadSavedEmail();
  }, []);

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert(t('error'), t('fill_all_fields') || 'Заповніть усі поля');
      return;
    }

    setLoading(true);
    try {
      if (isRegistering) {
        await register(email, password);
        Alert.alert(t('success'), 'Акаунт створено!');
      } else {
        await login(email, password, rememberMe);

        if (rememberMe) {
          await AsyncStorage.setItem('lastUserEmail', email);
        } else {
          await AsyncStorage.removeItem('lastUserEmail');
        }
      }
    } catch (err) {
      console.error(err);
      Alert.alert(t('error'), err.response?.data?.message || t('auth_failed') || 'Помилка авторизації');
    } finally {
      setLoading(false);
    }
  };

  if (user) {
    return (
      <View style={[styles.container, { backgroundColor: themeColors.background }]}>
        <Card style={[styles.card, { backgroundColor: themeColors.card }]}>
          <Card.Content style={styles.center}>
            <Avatar.Icon size={80} icon="account" color="#fff" style={{ backgroundColor: themeColors.primary }} />
            <Text variant="headlineSmall" style={[styles.welcomeText, { color: themeColors.text }]}>
              {t('welcome') || 'Вітаємо'},
            </Text>
            <Text variant="bodyLarge" style={[styles.emailText, { color: themeColors.text }]}>
              {user.email}
            </Text>

            <View style={styles.infoBox}>
              <Text style={{ color: themeColors.text, opacity: 0.7 }}>
                {t('status') || 'Статус'}: {t('online') || 'В мережі'}
              </Text>
            </View>

            <Button
              mode="contained"
              onPress={logout}
              buttonColor="#ff4444"
              style={styles.logoutButton}
              icon="logout"
            >
              {t('logout')}
            </Button>
          </Card.Content>
        </Card>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: themeColors.background }]}>
      <Card style={[styles.card, { backgroundColor: themeColors.card }]}>
        <Card.Content>
          <Text variant="headlineMedium" style={[styles.title, { color: themeColors.text }]}>
            {isRegistering ? t('registration') || 'Реєстрація' : t('login') || 'Вхід'}
          </Text>

          <TextInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            mode="outlined"
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
            outlineColor={themeColors.primary}
            activeOutlineColor={themeColors.primary}
          />

          <TextInput
            label={t('password') || 'Пароль'}
            value={password}
            onChangeText={setPassword}
            mode="outlined"
            secureTextEntry
            style={styles.input}
            outlineColor={themeColors.primary}
            activeOutlineColor={themeColors.primary}
          />

          {!isRegistering && (
            <View style={styles.row}>
              <Checkbox
                status={rememberMe ? 'checked' : 'unchecked'}
                onPress={() => setRememberMe(!rememberMe)}
                color={themeColors.primary}
              />
              <TouchableOpacity onPress={() => setRememberMe(!rememberMe)}>
                <Text style={{ color: themeColors.text }}>{t('remember_me') || "Запам'ятати мене"}</Text>
              </TouchableOpacity>
            </View>
          )}

          <Button
            mode="contained"
            onPress={handleAuth}
            loading={loading}
            disabled={loading}
            style={styles.authButton}
            buttonColor={themeColors.primary}
          >
            {isRegistering ? t('create_account') || 'Створити акаунт' : t('login') || 'Увійти'}
          </Button>

          <Button
            mode="text"
            onPress={() => setIsRegistering(!isRegistering)}
            style={styles.switchButton}
            textColor={themeColors.primary}
          >
            {isRegistering
              ? t('already_have_account') || 'Вже є акаунт? Увійти'
              : t('no_account_yet') || 'Немає акаунту? Реєстрація'}
          </Button>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: 'center', padding: 20 },
  card: { padding: 15, elevation: 4, borderRadius: 15 },
  center: { alignItems: 'center', paddingVertical: 20 },
  title: { textAlign: 'center', marginBottom: 25, fontWeight: 'bold' },
  welcomeText: { marginTop: 15, fontWeight: '300' },
  emailText: { fontWeight: 'bold', marginBottom: 10 },
  input: { marginBottom: 15 },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  infoBox: { marginVertical: 20, padding: 10, borderWidth: 1, borderColor: 'rgba(0,0,0,0.1)', borderRadius: 10, width: '100%', alignItems: 'center' },
  authButton: { paddingVertical: 5, borderRadius: 10 },
  logoutButton: { width: '100%', marginTop: 10, borderRadius: 10 },
  switchButton: { marginTop: 15 }
});