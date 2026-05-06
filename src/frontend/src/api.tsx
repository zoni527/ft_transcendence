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

interface UpdateRecipePayload {
  id: string;
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

interface SessionResponse {
  authenticated: boolean;
  user: User;
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

interface UpdateMePayload {
  email: string;
  password: string;
  name: string;
  display_name: string;
  avatar_url: string;
}

interface LoginSignupResponse {
  id: string;
  email: string;
  authenticated: boolean;
}

export interface CloudinaryUploadConfig {
  signature: string;
  api_key: string;
  cloud_name: string;
  timestamp: string;
  folder: string;
}

export interface CloudinaryResponse {
  secure_url: string;
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

// Validation for SessionResponse
function isSessionResponse(data: unknown): data is SessionResponse {
  if (typeof data !== 'object' || data === null) {
    return false;
  }

  const obj = data as Record<string, unknown>;

  return typeof obj.authenticated === 'boolean' && isUserResponse(obj.user);
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
    typeof obj.avatar_url === 'string' &&
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

// Validation for CloudinaryUploadConfig from backend
function isCloudinaryBackendResponse(
  data: unknown,
): data is CloudinaryUploadConfig {
  if (typeof data !== 'object' || data === null) {
    return false;
  }

  const obj = data as Record<string, unknown>;

  return (
    typeof obj.signature === 'string' &&
    typeof obj.api_key === 'string' &&
    typeof obj.cloud_name === 'string' &&
    typeof obj.timestamp === 'string' &&
    typeof obj.folder === 'string'
  );
}

// Validation for CloudinaryResponse
function isCloudinaryResponse(data: unknown): data is CloudinaryResponse {
  if (typeof data !== 'object' || data === null) {
    return false;
  }

  const obj = data as Record<string, unknown>;

  return typeof obj.secure_url === 'string';
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
    case 429:
      return t('error.rateLimit');
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
    throw new Error(getTranslatedErrorMessage(response.status, t));
  }

  const data: unknown = await response.json();

  if (!Array.isArray(data)) {
    return [];
  }

  return data as Recipe[];
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

// DELETE /api/recipes/:id (delete a single recipe by ID)
export const deleteRecipe = async (id: string, t: TFunction) => {
  const response = await fetch(`${baseUrl}/recipes/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });

  if (!response.ok) {
    const errorMessage = getTranslatedErrorMessage(response.status, t);
    throw new Error(errorMessage);
  }
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

  if (!isCreateRecipeResponse(data)) {
    throw new Error(t('error.invalidResponse'));
  }

  return data;
};

// GET /api/users/session (session authentication)
export const getSession = async (t: TFunction): Promise<User | null> => {
  const response = await fetch(`${baseUrl}/users/session`, {
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

  if (!isSessionResponse(data)) {
    throw new Error(t('error.invalidResponse'));
  }

  if (!data.authenticated) return null;

  return data.user;
};

// GET /api/users/me (user authentication)
export const getMe = async (t: TFunction): Promise<User> => {
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

// GET /api/users/:id (get a user by ID)
export const getUserbyId = async (id: string, t: TFunction): Promise<User> => {
  const response = await fetch(`${baseUrl}/users/${id}`, {
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

// POST /api/users/logout (user logout)
export const postLogout = async (t: TFunction) => {
  const response = await fetch(`${baseUrl}/users/logout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });

  if (!response.ok) {
    const errorMessage = getTranslatedErrorMessage(response.status, t);
    throw new Error(errorMessage);
  }
};

// POST /api/users (user signup)
export const postSignup = async (payload: SignupPayload, t: TFunction) => {
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
    const errorMessage = getTranslatedErrorMessage(response.status, t);
    throw new Error(errorMessage);
  }

  if (!isLoginSignupResponse(data)) {
    throw new Error(t('error.invalidResponse'));
  }

  if (!data.authenticated) {
    throw new Error(t('error.authError'));
  }
};

// PUT /api/users/me (user update)
export const putUpdateUser = async (
  payload: UpdateMePayload,
  id: string,
  t: TFunction,
) => {
  const response = await fetch(`${baseUrl}/users/${id}`, {
    method: 'PUT',
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

  if (!isUserResponse(data)) {
    throw new Error(t('error.invalidResponse'));
  }

  return data;
};

// PUT /api/recipes/:id (edit a recipe)
export const putUpdateRecipe = async (
  payload: UpdateRecipePayload,
  id: string,
  t: TFunction,
): Promise<CreateRecipeResponse> => {
  const response = await fetch(`${baseUrl}/recipes/${id}`, {
    method: 'PUT',
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

  if (!isCreateRecipeResponse(data)) {
    throw new Error(t('error.invalidResponse'));
  }

  return data;
};

// GET /api/recipes/image-signature (gets an UploadConfig for Cloudinary)
export const getCloudinarySignature = async (
  t: TFunction,
): Promise<CloudinaryUploadConfig> => {
  const response = await fetch(`${baseUrl}/recipes/image-signature`, {
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

  if (!isCloudinaryBackendResponse(data)) {
    throw new Error(t('error.invalidResponse'));
  }

  return data;
};

// GET /api/users/avatar (gets an UploadConfig for Cloudinary)
export const getCloudinarySignatureAvatar = async (
  t: TFunction,
): Promise<CloudinaryUploadConfig> => {
  const response = await fetch(`${baseUrl}/users/avatar`, {
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

  if (!isCloudinaryBackendResponse(data)) {
    throw new Error(t('error.invalidResponse'));
  }

  return data;
};

// POST Cloudinary (uploading an image to Cloudinary)
export const uploadImageToCloudinary = async (
  file: File,
  config: CloudinaryUploadConfig,
  t: TFunction,
): Promise<string> => {
  const formData = new FormData();

  formData.append('file', file);

  Object.entries(config).forEach(([key, value]) => {
    if (key !== 'cloud_name' && value !== undefined) {
      formData.append(key, String(value));
    }
  });

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${config.cloud_name}/image/upload`,
    {
      method: 'POST',
      body: formData,
    },
  );

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

  if (!isCloudinaryResponse(data)) {
    throw new Error(t('error.invalidResponse'));
  }

  return data.secure_url;
};
