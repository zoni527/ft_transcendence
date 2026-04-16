import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import DataField from '../components/DataField';
import { getRecipeById } from '../api';
import type { Recipe } from '../types/types';
import { cardBase } from '../styles/styles';

const RecipeDetail = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const state = location.state as { recipe?: Recipe } | null;

  const [recipe, setRecipe] = useState<Recipe | null>(state?.recipe ?? null);
  const [loading, setLoading] = useState(!recipe);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!recipe && id) {
      getRecipeById(id)
        .then(setRecipe)
        .catch((err) => {
          console.error(err);
          setError('Failed to load recipe');
        })
        .finally(() => setLoading(false));
    }
  }, [id, recipe]);

  return (
    <div className={`${cardBase} mt-8 p-8 wrap-anywhere`}>
      {loading ? (
        <p className="justify-self-start">Loading recipe...</p>
      ) : error ? (
        <p className="justify-self-start text-red-500">{error}</p>
      ) : !recipe ? (
        <p>Failed to load recipe</p>
      ) : (
        <>
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

          {/* Description */}
          <h2 className="mb-6 text-lg font-semibold">{recipe.description}</h2>

          {/* Recipe Info Fields */}
          <div className="mt-6 flex gap-8">
            {/* Left */}
            <div className="flex-1 space-y-2">
              <DataField label="Author" value={recipe.author_id} />
              <DataField
                label={'Preparation (minutes)'}
                value={recipe.prep_time_min}
              />
              <DataField
                label={'Cooking (minutes)'}
                value={recipe.cook_time_min}
              />
              <DataField label={'Servings'} value={recipe.servings} />
              <DataField label={'Difficulty'} value={recipe.difficulty} />
              <DataField label={'Likes'} value={'PLACEHOLDER VALUE'} />
            </div>

            {/* Right */}
            <div className="flex-1 space-y-2">
              <DataField label="Calories (kcal)" value={recipe.calories} />
              <DataField label={'Protein (grams)'} value={recipe.protein_g} />
              <DataField
                label={'Carbohydrates (grams)'}
                value={recipe.carbs_g}
              />
              <DataField label={'Fat (grams)'} value={recipe.fat_g} />
            </div>
          </div>

          {/* Like Button */}
          <div className="mt-2">
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
        </>
      )}
    </div>
  );
};

export default RecipeDetail;
