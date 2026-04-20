import type { Recipe } from './types/types';

interface ApiError {
  error: string;
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

  let data: unknown;

  try {
    data = await response.json();
  } catch {
    throw new Error('Invalid server response');
  }

  if (!response.ok) {
    const message =
      typeof data === 'object' && data !== null && 'error' in data
        ? (data as ApiError).error
        : 'Signup failed';

    throw new Error(message);
  }

  return data as SignupResponse;
};
