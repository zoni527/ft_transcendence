import type { Recipe } from './types/types';

interface SignupPayload {
  email: string;
  password: string;
  name: string;
  display_name: string;
}

interface SignupResponse {
  error?: string;
  userId?: string;
}

const baseUrl = 'http://localhost:8080/api';

// GET Recipes
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

// GET Recipe by ID
export const getRecipeById = async (id: string): Promise<Recipe> => {
  const response = await fetch(`${baseUrl}/recipes/${id}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch recipe with id ${id}`);
  }

  const data = (await response.json()) as Recipe;
  return data;
};

// POST Signup
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

  const data = (await response
    .json()
    .catch(() => null)) as SignupResponse | null;

  if (!response.ok) {
    const errorMessage = data?.error ?? 'Signup failed';
    throw new Error(errorMessage);
  }

  return data ?? {};
};
