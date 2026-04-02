import type { Recipe } from './types/types';

const baseUrl = 'http://localhost:8080/api/recipes';

const getRecipes = async () => {
  const response = await fetch(baseUrl);

  if (!response.ok) {
    throw new Error('Failed to fetch notes');
  }

  const data = (await response.json()) as Recipe[];

  return data;
};

export default getRecipes;
