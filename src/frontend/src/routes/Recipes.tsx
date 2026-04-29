import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import RecipeCard from '../components/RecipeCard';
import StatusBox from '../components/StatusBox';
import { getRecipes } from '../api';
import type { Recipe } from '../types/types';

const Recipes = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation();

  useEffect(() => {
    getRecipes(t)
      .then(setRecipes)
      .catch((err: unknown) => {
        if (err instanceof Error) setError(err.message);
        else setError(t('error.genericError'));
      })
      .finally(() => setLoading(false));
  }, [t]);

  if (error) {
    return (
      <StatusBox
        message={`${t('error.error')} ${error}`}
        className="text-red-500"
      />
    );
  }

  if (loading) {
    return <StatusBox message={t('common.loading')} className="text-black" />;
  }

  return (
    <div>
      <h1 className="mt-8 px-6 text-xl font-semibold text-orange-700">
        {t('recipes.header')}
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
