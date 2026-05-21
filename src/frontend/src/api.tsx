import type { TFunction } from 'i18next';
import type {
  Recipe,
  User,
  FriendshipListItem,
  AcceptedFriend,
} from './types/types';

export interface SearchRecipesParams {
  query?: string;
  page?: number;
  mealType?: string;
  date?: 'oldest' | 'newest';
  difficulty?: string;
  cuisine?: string;
}

interface CreateRecipePayload {
  title: string;
  description: string;
  preparation_time_min: number;
  servings: number;
  difficulty: string;
  cuisine: string;
  meal_type: string;
  image_url: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
}

interface UpdateRecipePayload {
  id: string;
  title: string;
  description: string;
  preparation_time_min: number;
  servings: number;
  difficulty: string;
  cuisine: string;
  meal_type: string;
  image_url: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
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

export interface UpdateUserPayload {
  email: string | null;
  password: string | null;
  name: string | null;
  display_name: string | null;
  avatar_url: string | null;
  roles?: string[] | null;
}

interface FriendshipsResponse {
  friends: AcceptedFriend[];
  sent: FriendshipListItem[];
  incoming: FriendshipListItem[];
}

export interface GetSearchResponse {
  id: string;
  name: string;
  display_name: string;
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

const baseUrl = '/api';

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

// Validation for GetSearchResponse
function isGetSearchResponse(data: unknown): data is GetSearchResponse[] {
  if (!Array.isArray(data)) {
    return false;
  }

  return data.every((item) => {
    if (typeof item !== 'object' || item === null) {
      return false;
    }

    const obj = item as Record<string, unknown>;

    return (
      typeof obj.id === 'string' &&
      typeof obj.name === 'string' &&
      typeof obj.display_name === 'string'
    );
  });
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
    typeof obj.is_online === 'boolean' &&
    Array.isArray(obj.roles) &&
    obj.roles.every((role) => typeof role === 'string')
  );
}

// Validation for FriendshipListItem
function isFriendshipListItem(data: unknown): data is FriendshipListItem {
  if (typeof data !== 'object' || data === null) return false;

  const obj = data as Record<string, unknown>;

  return (
    typeof obj.id === 'string' &&
    typeof obj.display_name === 'string' &&
    typeof obj.name === 'string'
  );
}

// Validation for OnlineFriend
function isAcceptedFriend(data: unknown): data is AcceptedFriend {
  if (!isFriendshipListItem(data)) return false;

  const obj = data as unknown as Record<string, unknown>;
  return typeof obj.is_online === 'boolean';
}

// Validation for Friendships
function isFriendshipsResponse(data: unknown): data is FriendshipsResponse {
  if (typeof data !== 'object' || data === null) return false;
  const obj = data as Record<string, unknown>;

  return (
    Array.isArray(obj.friends) &&
    obj.friends.every(isAcceptedFriend) &&
    Array.isArray(obj.sent) &&
    obj.sent.every(isFriendshipListItem) &&
    Array.isArray(obj.incoming) &&
    obj.incoming.every(isFriendshipListItem)
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
    case 403:
      return t('error.forbidden');
    case 404:
      return t('error.notFound');
    case 409:
      return t('error.conflict');
    case 429:
      return t('error.rateLimit');
    case 500:
      return t('error.serverError');
    default:
      return t('error.genericError', { statusCode });
  }
}

// GET /api/recipes (get all recipes)
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

// GET /api/recipes/search (get recipes from search)
export const getRecipesSearch = async (
  t: TFunction,
  params: SearchRecipesParams = {},
): Promise<Recipe[]> => {
  const queryParams = new URLSearchParams();

  if (params.query) queryParams.append('q', params.query);
  if (params.page) queryParams.append('page', params.page.toString());
  if (params.mealType) queryParams.append('meal_type', params.mealType);
  if (params.date) queryParams.append('date', params.date);
  if (params.difficulty) queryParams.append('difficulty', params.difficulty);
  if (params.cuisine) queryParams.append('cuisine', params.cuisine);

  const url = `${baseUrl}/recipes/search?${queryParams.toString()}`;

  const response = await fetch(url);

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

// GET /api/auth/session (session authentication)
export const getSession = async (t: TFunction): Promise<User | null> => {
  const response = await fetch(`${baseUrl}/auth/session`, {
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

// GET /api/users/search?q= (searches for users)
export const getSearch = async (
  query: string,
  t: TFunction,
): Promise<GetSearchResponse[]> => {
  const searchParams = new URLSearchParams({ q: query });
  const response = await fetch(
    `${baseUrl}/users/search?${searchParams.toString()}`,
    {
      method: 'GET',
      credentials: 'include',
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

  if (!isGetSearchResponse(data)) {
    throw new Error(t('error.invalidResponse'));
  }

  return data;
};

// GET /api/users (get all users)
export const getUsers = async (t: TFunction): Promise<User[]> => {
  const response = await fetch(`${baseUrl}/users`);

  if (!response.ok) {
    throw new Error(getTranslatedErrorMessage(response.status, t));
  }

  const data: unknown = await response.json();

  if (!Array.isArray(data)) {
    return [];
  }

  return data as User[];
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

// DELETE /api/users/:id (delete a single user by ID)
export const deleteUser = async (id: string, t: TFunction) => {
  const response = await fetch(`${baseUrl}/users/${id}`, {
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

// POST /api/auth/login (user login)
export const postLogin = async (payload: LoginPayload, t: TFunction) => {
  const response = await fetch(`${baseUrl}/auth/login`, {
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

// POST /api/auth/logout (user logout)
export const postLogout = async (t: TFunction) => {
  const response = await fetch(`${baseUrl}/auth/logout`, {
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

// PUT /api/users/me/heartbeat
export const putHeartbeat = async (t: TFunction) => {
  const response = await fetch(`${baseUrl}/users/me/heartbeat`, {
    method: 'PUT',
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

// PUT /api/users/:id (user update)
export const putUpdateUser = async (
  payload: UpdateUserPayload,
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

// GET /api/friendships (get all friendships)
export const getFriendships = async (
  t: TFunction,
): Promise<FriendshipsResponse> => {
  const response = await fetch(`${baseUrl}/friendships`, {
    credentials: 'include',
  });

  let data: unknown = null;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    throw new Error(getTranslatedErrorMessage(response.status, t));
  }

  if (!isFriendshipsResponse(data)) {
    throw new Error(t('error.invalidResponse'));
  }

  return data;
};

// POST /api/friendships/ (send a friend request)
export const sendFriendship = async (receiver_id: string, t: TFunction) => {
  const response = await fetch(`${baseUrl}/friendships`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ receiver_id }),
  });

  if (!response.ok) {
    throw new Error(getTranslatedErrorMessage(response.status, t));
  }
};

// PATCH /api/friendships/:id (accept a friend request)
export const acceptFriend = async (id: string, t: TFunction) => {
  const response = await fetch(`${baseUrl}/friendships/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error(getTranslatedErrorMessage(response.status, t));
  }
};

// DELETE /api/friendships/:id (delete / reject / cancel friend relationship)
export const deleteFriend = async (id: string, t: TFunction) => {
  const response = await fetch(`${baseUrl}/friendships/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error(getTranslatedErrorMessage(response.status, t));
  }
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
