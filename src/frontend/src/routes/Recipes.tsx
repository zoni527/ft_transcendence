import { useEffect, useState } from 'react';
import RecipeCard from '../components/RecipeCard';
import StatusBox from '../components/StatusBox';
import { getRecipes } from '../api';
import type { Recipe } from '../types/types';

const Recipes = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getRecipes()
      .then(setRecipes)
      .catch((err: unknown) => {
        if (err instanceof Error) setError(err.message);
        else setError('Failed to load recipes');
      })
      .finally(() => setLoading(false));
  }, []);

  if (error) {
    return <StatusBox message={`Error: ${error}`} className="text-red-500" />;
  }

  if (loading) {
    return <StatusBox message="Loading recipes..." className="text-black" />;
  }

  return (
    <div>
      <h1 className="mt-8 px-6 text-xl font-semibold text-orange-700">
        All Recipes
      </h1>

      <div className="grid grid-cols-1 gap-6 bg-white p-6 sm:grid-cols-2 md:grid-cols-4">
        {recipes.map((recipe) => (
          <RecipeCard key={recipe.id} recipe={recipe} />
        ))}
      </div>
    </div>
  );
};

export default Recipes;
