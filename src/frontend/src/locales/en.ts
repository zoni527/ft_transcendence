export const enTranslations = {
  nav: {
    recipes: 'Recipes',
    dashboard: 'Profile',
    signup: 'Sign up',
    login: 'Log in',
  },
  recipes: {
    header: 'All recipes',
  },
  recipeDetail: {
    author: 'Author',
    prep: 'Preparation time (min)',
    cook: 'Cooking time (min)',
    servings: 'Servings',
    cuisine: 'Cuisine',
    likes: 'Likes',
    calories: 'Calories (kcal)',
    protein: 'Protein (g)',
    carbs: 'Carbohydrates (g)',
    fat: 'Fat (g)',
  },
  dashboard: {
    username: 'Username',
    email: 'E-mail',
    createdAt: 'Created at',
    updatedAt: 'Updated at',
    roles: 'Roles',
    createRecipe: 'Create recipe',
  },
  footer: {
    privacy: 'Privacy Policy',
    terms: 'Terms of Service',
  },
  privacyPolicy: {
    header: 'Privacy Policy',
  },
  termsService: {
    header: 'Terms of Service',
    terms_intro: `Welcome to RISE.
      By using our recipe-sharing platform, you agree to these Terms of Service ("Terms").
      Please read them carefully.`,

    section1_title: '1. Acceptance of these Terms',
    section1_text: `By creating an account or otherwise using RISE, you accept these Terms and our Privacy Policy.
      If you do not agree, please do not use the service.`,

    section2_title: '2. Eligibility',
    section2_text: `You must be at least 13 years old to use RISE.
      If you are under 18, your parent or guardian must read and agree to these Terms on your behalf.`,

    section3_title: '3. Your account',
    section3_text: `Provide accurate and current information when registering.
      Keep your password confidential and secure.
      You are responsible for all activity that occurs under your account.`,

    section4_title: '4. Your content',
    section4_text: `You retain ownership of the recipes, photos, comments, and other content you upload to RISE.
      By posting content, you grant us a worldwide, non-exclusive, royalty-free licence to display, reproduce, and distribute it within the platform and its features.

      You agree not to upload content that:
      - violates any law or third-party rights, including copyright
      - contains hate speech, harassment, or content harmful to others
      - misrepresents ingredients or omits allergen information
      - promotes unsafe food-handling practices.`,

    section5_title: '5. Accepted use',
    section5_text: `Users must NOT engage in following activities:
      - scrape or copy content at scale without written permission.
      - attempt to compromise the security of the service or other accounts.
      - submit false reports or abuse moderation tools.
      - impersonate any person or organisation.
      - send spam, advertise without consent, or distribute malware.
      - reverse-engineer or interfere with the operation of the service.`,

    section6_title: '6. Intellectual property',
    section6_text: `The RISE name, logo, design system, and underlying source code are owned by the RISE team.
      You may not copy, modify, or reuse them without our prior written permission.
      Community-contributed recipes remain the property of their authors.`,

    section7_title: '7. Termination',
    section7_text: `We may suspend or terminate accounts that violate these Terms.
      You may delete your account at any time from your settings; doing so will remove your personal data in accordance with our Privacy Policy.`,

    section8_title: '8. Disclaimers',
    section8_text: `Recipes are provided "as is" by community members.
      RISE does not verify the accuracy of nutritional information, allergens, or food-safety claims.
      Cook responsibly and consult a qualified professional for dietary, medical, or allergy concerns.`,

    section9_title: '9. Limitation of liability',
    section9_text: `To the fullest extent permitted by law, RISE and its contributors are not liable for indirect, incidental, special, or consequential damages arising from your use of the service.`,

    section10_title: '10. Changes to these Terms',
    section10_text: `We may update these Terms from time to time.
      Continued use of the service after changes take effect constitutes acceptance of the updated Terms.`,

    section11_title: '11. Governing law',
    section11_text: `These Terms are governed by the laws of Finland.
      Any disputes will be resolved in the competent courts of Finland.`,
  },
  login: {
    header: 'Log in',
    email: 'Email',
    emailPlace: 'Enter your email',
    password: 'Password',
    passwordPlace: 'Enter your password',
    submit: 'Continue',
    submitPending: 'Logging in',
  },
  signup: {
    header: 'Sign up',
    name: 'Full Name',
    namePlace: 'Enter your full name',
    username: 'Username / Alias',
    usernamePlace: 'Enter your username / alias',
    email: 'Email',
    emailPlace: 'Enter your email',
    password: 'Password',
    passwordPlace: 'Enter your password',
    rePassword: 'Confirm password',
    rePasswordPlace: 'Re-enter your password',
    submit: 'Continue',
    submitPending: 'Signing up',
  },
  createRecipe: {
    header: 'Create recipe',
    title: 'Recipe name',
    titlePlace: 'Enter recipe name',
    description: 'Short description',
    descriptionPlace: 'Enter short description',
    prep: 'Preparation time (min)',
    prepPlace: 'Enter preparation time in minutes',
    cook: 'Cooking time (min)',
    cookPlace: 'Enter cooking time in minutes',
    servings: 'Servings',
    servingsPlace: 'Enter number of servings',
    cuisine: 'Cuisine',
    cuisinePlace: 'Enter the type of cuisine',
    calories: 'Calories (kcal)',
    caloriesPlace: 'Enter the amount of calories in kcal',
    protein: 'Protein (g)',
    proteinPlace: 'Enter the amount of protein in grams',
    carbs: 'Carbohydrates (g)',
    carbsPlace: 'Enter the amount of carbohydrates in grams',
    fat: 'Fat (g)',
    fatPlace: 'Enter the amount of fat in grams',
    publish: 'Publish recipe?',
    yes: 'Yes',
    no: 'No',
    uploadImage: 'Upload image',
    noFile: 'No file chosen',
    submit: 'Submit',
    submitPending: 'Submitting recipe',
  },
  difficulty: {
    type: 'Difficulty',
    type_easy: 'Easy',
    type_medium: 'Medium',
    type_hard: 'Hard',
  },
  meal: {
    type: 'Meal type',
    type_breakfast: 'Breakfast',
    type_lunch: 'Lunch',
    type_dinner: 'Dinner',
    type_snack: 'Snack',
  },
  loginValidation: {
    emailRequired: 'Email is required',
    invalidEmail: 'Invalid email',
    passwordLen: 'Password must be at least 8 characters',
  },
  signupValidation: {
    nameRequired: 'Full name is required',
    usernameRequired: 'Username / Alias is required',
    emailRequired: 'Email is required',
    invalidEmail: 'Invalid email',
    passwordLen: 'Password must be at least 8 characters',
    passwordConfirm: 'Please confirm your password',
    passwordMatch: 'Passwords do not match',
  },
  recValidation: {
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
    imageRequired: 'Image required',
  },
  common: {
    bannerTitle: 'Recipes worth rising for',
    loading: 'Loading...',
    welcome: 'Welcome',
    rightsReserved: 'RISE. All Rights Reserved.',
  },
  error: {
    error: 'Error:',
    input: 'Invalid input',
    userNotFound: 'User not found',
    recipeNotFound: 'Recipe not found',
    genericError: 'An error occurred, please try again later',
    invalidResponse: 'Invalid database response',
    badRequest: 'Invalid request, please check your input',
    unauthorized: 'You are not authorized to perform this action',
    notFound: 'The requested resource could not be found',
    serverError: 'An internal server error occurred, please try again later',
    authError: 'Signup succeeded but automatic login failed, please log in',
  },
};
