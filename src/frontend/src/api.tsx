import type { Recipe } from './types/types';

const baseUrl = 'http://localhost:8080/api/recipes';

export const getRecipes = async (): Promise<Recipe[]> => {
  const response = await fetch(baseUrl);

  if (!response.ok) {
    throw new Error(`Failed to fetch recipes: ${response.status} ${response.statusText}`);
  }

  const data = (await response.json()) as Recipe[];
  return data;
};

export const getRecipeById = async (id: string): Promise<Recipe> => {
  const response = await fetch(`${baseUrl}/${id}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch recipe with id ${id}`);
  }

  const data = (await response.json()) as Recipe;
  return data;
};
