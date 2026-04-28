import type { TFunction } from 'i18next';
import type { Recipe, User } from './types/types';

interface CreateRecipePayload {
  title: string;
  description: string;
  prep_time_min: number;
  cook_time_min: number;
  servings: number;
  difficulty: string;
  cuisine: string;
  meal_type: string;
  image_url: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  is_published: boolean;
}

interface CreateRecipeResponse {
  id: string;
}

interface LoginPayload {
  email: string;
  password: string;
}

interface SignupPayload {
  email: string;
  password: string;
  name: string;
  display_name: string;
}

interface LoginSignupResponse {
  id: string;
  email: string;
  authenticated: boolean;
}

const baseUrl = 'http://localhost:8080/api';

// Validation for CreateRecipeResponse
function isCreateRecipeResponse(data: unknown): data is CreateRecipeResponse {
  if (typeof data !== 'object' || data === null) {
    return false;
  }

  const obj = data as Record<string, unknown>;

  return typeof obj.id === 'string';
}

// Validation for UserResponse
function isUserResponse(data: unknown): data is User {
  if (typeof data !== 'object' || data === null) {
    return false;
  }

  const obj = data as Record<string, unknown>;

  return (
    typeof obj.id === 'string' &&
    typeof obj.email === 'string' &&
    typeof obj.name === 'string' &&
    typeof obj.display_name === 'string' &&
    typeof obj.created_at === 'string' &&
    typeof obj.updated_at === 'string' &&
    Array.isArray(obj.roles) &&
    obj.roles.every((role) => typeof role === 'string')
  );
}

// Validation for LoginSignupResponse
function isLoginSignupResponse(data: unknown): data is LoginSignupResponse {
  if (typeof data !== 'object' || data === null) {
    return false;
  }

  const obj = data as Record<string, unknown>;

  return (
    typeof obj.id === 'string' &&
    typeof obj.email === 'string' &&
    typeof obj.authenticated === 'boolean'
  );
}

// Get an error message safely
function getErrorMessage(data: unknown, fallback: string): string {
  if (typeof data === 'object' && data !== null) {
    const obj = data as Record<string, unknown>;
    if (typeof obj.error === 'string') {
      return obj.error;
    }
  }
  return fallback;
}

// Function to get translated error messages based on status code
function getTranslatedErrorMessage(statusCode: number, t: TFunction): string {
  switch (statusCode) {
    case 400:
      return t('error.badRequest');
    case 401:
      return t('error.unauthorized');
    case 404:
      return t('error.notFound');
    case 500:
      return t('error.serverError');
    default:
      return t('error.genericError', { statusCode });
  }
}

// GET /api/recipes (get all published recipes)
export const getRecipes = async (t: TFunction): Promise<Recipe[]> => {
  const response = await fetch(`${baseUrl}/recipes`);

  if (!response.ok) {
    const errorMessage = getTranslatedErrorMessage(response.status, t);
    throw new Error(errorMessage);
  }

  const data = (await response.json()) as Recipe[];
  return data;
};

// GET /api/recipes/:id (get a single recipe by ID)
export const getRecipeById = async (
  id: string,
  t: TFunction,
): Promise<Recipe> => {
  const response = await fetch(`${baseUrl}/recipes/${id}`);

  if (!response.ok) {
    const errorMessage = getTranslatedErrorMessage(response.status, t);
    throw new Error(errorMessage);
  }

  const data = (await response.json()) as Recipe;
  return data;
};

// POST /api/recipes (create a new recipe)
export const postCreateRecipe = async (
  payload: CreateRecipePayload,
  t: TFunction,
): Promise<CreateRecipeResponse> => {
  const response = await fetch(`${baseUrl}/recipes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  let data: unknown = null;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const errorMessage = getTranslatedErrorMessage(response.status, t);
    throw new Error(errorMessage);
  }

  if (!isCreateRecipeResponse(data)) {
    throw new Error(t('error.invalidResponse'));
  }

  return data;
};

// GET /api/users/me (user authentication)
export const getUser = async (t: TFunction): Promise<User> => {
  const response = await fetch(`${baseUrl}/users/me`, {
    method: 'GET',
    credentials: 'include',
  });

  let data: unknown = null;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const errorMessage = getTranslatedErrorMessage(response.status, t);
    throw new Error(errorMessage);
  }

  if (!isUserResponse(data)) {
    throw new Error(t('error.invalidResponse'));
  }

  return data;
};

// POST /api/users/login (user login)
export const postLogin = async (payload: LoginPayload, t: TFunction) => {
  const response = await fetch(`${baseUrl}/users/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(payload),
  });

  let data: unknown = null;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const errorMessage = getTranslatedErrorMessage(response.status, t);
    throw new Error(errorMessage);
  }

  if (!isLoginSignupResponse(data)) {
    throw new Error(t('error.invalidResponse'));
  }
};

// POST /api/users (user signup)
export const postSignup = async (payload: SignupPayload) => {
  const response = await fetch(`${baseUrl}/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(payload),
  });

  let data: unknown = null;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    throw new Error(getErrorMessage(data, 'Signup failed'));
  }

  if (!isLoginSignupResponse(data)) {
    throw new Error('Invalid signup response');
  }

  if (!data.authenticated) {
    throw new Error(
      'Signup succeeded but automatic login failed. Please log in.',
    );
  }
};
