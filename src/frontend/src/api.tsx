import type { Recipe } from './types/types';

interface CreateRecipePayload {
  author_id: string;
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

interface SignupResponse {
  id: string;
  email: string;
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

// Validation for SignupResponse
function isSignupResponse(data: unknown): data is SignupResponse {
  if (typeof data !== 'object' || data === null) {
    return false;
  }

  const obj = data as Record<string, unknown>;

  return typeof obj.id === 'string' && typeof obj.email === 'string';
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

// GET /api/recipes (get all published recipes)
export const getRecipes = async (): Promise<Recipe[]> => {
  const response = await fetch(`${baseUrl}/recipes`);

  if (!response.ok) {
    throw new Error(
      `Failed to fetch recipes: ${response.status} ${response.statusText}`,
    );
  }

  const data = (await response.json()) as Recipe[];
  return data;
};

// GET /api/recipes/:id (get a single recipe by ID)
export const getRecipeById = async (id: string): Promise<Recipe> => {
  const response = await fetch(`${baseUrl}/recipes/${id}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch recipe with id ${id}`);
  }

  const data = (await response.json()) as Recipe;
  return data;
};

// POST /api/recipes (create a new recipe)
export const postCreateRecipe = async (
  payload: CreateRecipePayload,
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
    throw new Error(getErrorMessage(data, 'Create recipe failed'));
  }

  if (!isCreateRecipeResponse(data)) {
    throw new Error('Invalid create recipe response');
  }

  return data;
};

// POST /api/users/login (user login)
export const postLogin = async (payload: LoginPayload): Promise<void> => {
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
    throw new Error(getErrorMessage(data, 'Login failed'));
  }
};

// POST /api/users (create a new user)
export const postSignup = async (
  payload: SignupPayload,
): Promise<SignupResponse> => {
  const response = await fetch(`${baseUrl}/users`, {
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
    throw new Error(getErrorMessage(data, 'Signup failed'));
  }

  if (!isSignupResponse(data)) {
    throw new Error('Invalid signup response');
  }

  return data;
};
