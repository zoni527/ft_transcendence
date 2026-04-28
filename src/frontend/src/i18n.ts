import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const enTranslations = {
  nav: {
    recipes: 'Recipes',
    dashboard: 'My Profile',
    signup: 'Sign up',
    login: 'Login',
  },
  validation: {
    recipeNameRequired: 'Recipe name is required',
    descriptionRequired: 'Description is required',
    prepTime: 'Prep time',
    cookTime: 'Cook time',
    servings: 'Servings',
    cuisineRequired: 'Cuisine type is required',
    calories: 'Calories',
    protein: 'Protein',
    carbs: 'Carbs',
    fat: 'Fat',
    selectDifficulty: 'Please select a difficulty',
    selectMealType: 'Please select a meal type',
    selectPublishOption: 'Please select a publish option',
    fieldRequired: '{{field}} is required',
    numRequired: '{{field}} must be a number',
    numMin: '{{field}} must be at least {{value}}',
  },
  meal: {
    breakfast: 'Breakfast',
    lunch: 'Lunch',
    dinner: 'Dinner',
    snack: 'Snack',
  },
  common: {
    bannerTitle: 'Recipes worth rising for',
    welcome: 'Welcome',
  },
};

const fiTranslations = {
  nav: {
    recipes: 'Reseptit',
    dashboard: 'Käyttäjäprofiili',
    signup: 'Rekisteröidy',
    login: 'Kirjaudu sisään',
  },
  validation: {
    recipeNameRequired: 'Reseptin nimi on pakollinen',
    descriptionRequired: 'Kuvaus on pakollinen',
    prepTime: 'Valmistusaika',
    cookTime: 'Kypsennysaika',
    servings: 'Annokset',
    cuisineRequired: 'Keittiötyyppi on pakollinen',
    calories: 'Kalorit',
    protein: 'Proteiini',
    carbs: 'Hiilihydraatit',
    fat: 'Rasva',
    selectDifficulty: 'Valitse vaikeustaso',
    selectMealType: 'Valitse ateriatyyppi',
    selectPublishOption: 'Valitse julkaisuvaihtoehto',
    fieldRequired: '{{field}} on pakollinen',
    numRequired: '{{field}} täytyy olla numero',
    numMin: '{{field}} täytyy olla vähintään {{value}}',
  },
  meal: {
    breakfast: 'Aamiainen',
    lunch: 'Lounas',
    dinner: 'Päivällinen',
    snack: 'Välipala',
  },
  common: {
    bannerTitle: 'Reseptejä, joita kannattaa herätä varten',
    welcome: 'Tervetuloa',
  },
};

const csTranslations = {
  nav: {
    recipes: 'Recepty',
    dashboard: 'Uživatelský profil',
    signup: 'Registrovat se',
    login: 'Přihlásit se',
  },
  validation: {
    recipeNameRequired: 'Název receptu je povinný',
    descriptionRequired: 'Popis je povinný',
    prepTime: 'Doba přípravy',
    cookTime: 'Doba vaření',
    servings: 'Porce',
    cuisineRequired: 'Typ kuchyně je povinný',
    calories: 'Kalorie',
    protein: 'Bílkoviny',
    carbs: 'Sacharidy',
    fat: 'Tuky',
    selectDifficulty: 'Vyberte obtížnost',
    selectMealType: 'Vyberte typ jídla',
    selectPublishOption: 'Vyberte možnost publikování',
    fieldRequired: '{{field}} je povinné',
    numRequired: '{{field}} musí být číslo',
    numMin: '{{field}} musí být alespoň {{value}}',
  },
  meal: {
    breakfast: 'Snídaně',
    lunch: 'Oběd',
    dinner: 'Večeře',
    snack: 'Svačina',
  },
  common: {
    bannerTitle: 'Reseptejä, joita kannattaa herätä varten',
    welcome: 'Vítejte',
  },
};

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: enTranslations },
      fi: { translation: fiTranslations },
      cs: { translation: csTranslations },
    },
    fallbackLng: 'en',
    detection: {
      order: ['localStorage', 'cookie', 'querystring', 'navigator'],
      caches: ['localStorage', 'cookie'],
    },
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
