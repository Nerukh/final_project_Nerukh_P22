// i18n/index.js
import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import { languages } from '../locales'; // тут твій файл з перекладами

// Отримуємо мову пристрою без помилки split
const deviceLocale = typeof Localization.locale === 'string' ? Localization.locale : 'en';
const deviceLanguage = deviceLocale.split('-')[0]; // напр. 'en', 'uk', 'pl'

// Ініціалізація i18next
i18next.use(initReactI18next).init({
    resources: languages,
    lng: deviceLanguage,
    fallbackLng: 'en',
    interpolation: {
        escapeValue: false, // react вже робить екранування
    },
});

// Функція зміни мови
export const changeLanguage = async (lang) => {
    await i18next.changeLanguage(lang);
};

// Функція завантаження мови (для useEffect у App.js)
export const loadLanguage = async () => {
    const currentLang = i18next.language || deviceLanguage;
    await i18next.changeLanguage(currentLang);
};

export default i18next;
