import { getRecipes } from '../api';
import { useEffect, useState } from 'react';
import RecipeCard from '../components/RecipeCard';
import type { Recipe } from '../types/types';

const Recipes = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getRecipes()
      .then(setRecipes)
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading recipes...</p>;

  return (
    <div>
      <h1 className="mt-8 px-6 text-xl font-semibold text-amber-900">
        Top Recipes
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
