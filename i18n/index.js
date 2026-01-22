import {languages} from "../locales";
import {getLocales} from 'expo-localization';
import i18next from "i18next";
import {initReactI18next} from "react-i18next";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {retrySymbolicateLogNow} from "react-native/Libraries/LogBox/Data/LogBoxData";
import * as Localization from 'expo-localization';

const config = {
    SUPPORTED_LANGUAGES: Object.keys(languages),
    DEFAULT_LANGUAGE: 'en',
    APP_LANGUAGE: 'APP_LANGUAGE',
}

const getDeviceLanguage = async () => {
    try {
        const locales = await Localization.getLocalesAsync?.() || [];
        return locales[0]?.languageCode || 'en';
    } catch (e) {
        return 'en';
    }
};

export const initI18n = async () => {
    const deviceLang = await getDeviceLanguage();
    const initialLang = config.SUPPORTED_LANGUAGES.includes(deviceLang)
        ? deviceLang
        : config.DEFAULT_LANGUAGE;

    await i18next
        .use(initReactI18next)
        .init({
            resources: languages,
            lng: initialLang,
            fallbackLng: config.DEFAULT_LANGUAGE,
            interpolation: { escapeValue: false },
        });
};

export const changeLanguage = async (lang) => {
    try {
        if (!config.SUPPORTED_LANGUAGES.includes(lang)) return;
        await AsyncStorage.setItem(config.APP_LANGUAGE, lang);
        await i18next.changeLanguage(lang);
        if (__DEV__) console.log(`Language saved and changed to: ${lang}`);
    } catch (error) {
        console.error('Failed to change language', error);
    }
}

export const loadLanguage = async () => {
    try {
        const savedLanguage = await AsyncStorage.getItem(config.APP_LANGUAGE);

        if (savedLanguage) {
            await i18next.changeLanguage(savedLanguage);
            if (__DEV__) {
                console.log(`Loaded saved language: ${savedLanguage}`)
            }
        }
    } catch (error) {
        console.error('Failed to load language', error)
    }
}

export default i18next;