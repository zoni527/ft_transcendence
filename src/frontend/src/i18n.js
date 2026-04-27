import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

i18n.use(initReactI18next).init({
  resources: {
    en: {
      translation: {
        nav_recipes: 'Recipes',
        nav_dashboard: 'My Profile',
        nav_signup: 'Sign up',
        nav_login: 'Login',
        welcome: 'Welcome',
      },
    },
    fi: {
      translation: {
        nav_recipes: 'Reseptit',
        nav_dashboard: 'Käyttäjäprofiili',
        nav_signup: 'Rekisteröidy',
        nav_login: 'Kirjaudu sisään',
        welcome: 'Tervetuloa',
      },
    },
    cz: {
      translation: {
        nav_recipes: 'Recepty',
        nav_dashboard: 'Uživatelský profil',
        nav_signup: 'Registrovat se',
        nav_login: 'Přihlásit se',
        welcome: 'Vítejte',
      },
    },
  },
  lng: 'en',
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
