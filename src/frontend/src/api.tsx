import type { Recipe } from './types/types';

interface SignupPayload {
  username: string;
  email: string;
  password: string;
}

interface SignupResponse {
  message: string;
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
  const response = await fetch(`${baseUrl}recipes/${id}`);

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

  if (!response.ok) {
    const errorData = (await response.json()) as
      | { message?: string }
      | undefined;
    throw new Error(errorData?.message ?? 'Signup failed');
  }

  const data = (await response.json()) as SignupResponse;
  return data;
};
