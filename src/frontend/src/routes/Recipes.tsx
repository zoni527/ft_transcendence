import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import RecipeCard from '../components/RecipeCard';
import StatusBox from '../components/StatusBox';
import { getRecipes } from '../api';
import { useNotification } from '../utils/NotifContext';
import type { Recipe } from '../types/types';

const Recipes = () => {
  const { showNotification } = useNotification();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  useEffect(() => {
    getRecipes(t)
      .then(setRecipes)
      .catch((err: unknown) => {
        const message =
          err instanceof Error ? err.message : t('error.genericError');

        showNotification(message, 'error');
      })
      .finally(() => setLoading(false));
  }, [t, showNotification]);

  if (loading) {
    return <StatusBox message={t('common.loading')} className="text-black" />;
  }

  if (recipes.length === 0) {
    return (
      <StatusBox
        message={t('error.recipesNotFound')}
        className="text-red-600"
      />
    );
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
