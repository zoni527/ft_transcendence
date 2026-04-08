import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { getRecipeById } from '../api';
import type { Recipe } from '../types/types';
import { cardBase } from '../styles/styles';

const RecipeDetail = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const state = location.state as { recipe?: Recipe } | null;

  const [recipe, setRecipe] = useState<Recipe | null>(state?.recipe ?? null);
  const [loading, setLoading] = useState(!recipe);

  useEffect(() => {
    if (!recipe && id) {
      getRecipeById(id)
        .then((fetched) => setRecipe(fetched))
        .catch((err) => console.error('Recipe not found', err))
        .finally(() => setLoading(false));
    }
  }, [id, recipe]);

  if (loading) return <div>Loading recipe...</div>;
  if (!recipe) return <div>Recipe not found</div>;

  return (
    <div className={`${cardBase} mt-8 p-8 wrap-anywhere`}>
      {/* Recipe Image */}
      <img
        src={`/assets/${recipe.id}.jpg`}
        alt={recipe.title}
        className="mb-8 h-64 w-full rounded object-cover shadow-md md:h-80"
      />

      {/* Header */}
      <h1 className="mb-6 text-2xl font-semibold text-amber-900">
        {recipe.title}
      </h1>

      {/* Recipe Info */}
      <div className="mb-6">
        <p className="text-lg">
          <strong>Description:</strong> {recipe.description}
        </p>
      </div>

      <div className="space-y-1">
        <p className="text-lg">
          <strong>Calories:</strong> {recipe.calories}
        </p>

        <p className="text-lg">
          <strong>Protein g:</strong> {recipe.protein_g}
        </p>

        <p className="text-lg">
          <strong>Carbs (g):</strong> {recipe.carbs_g}
        </p>
      </div>

      {/* Likes */}
      <div className="mt-6">
        <p className="text-md max-w-[80%]">
          Likes: {recipe.has_been_favorite_times}
        </p>
        <button
          className="text-amber-500 transition-colors hover:cursor-pointer hover:text-amber-600 hover:shadow-xl"
          aria-label="Like"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            viewBox="0 0 24 24"
            className="h-6 w-6"
          >
            <path
              d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 
                 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 
                 4.5 2.09C13.09 3.81 14.76 3 16.5 3 
                 19.58 3 22 5.42 22 8.5c0 3.78-3.4 
                 6.86-8.55 11.54L12 21.35z"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default RecipeDetail;
