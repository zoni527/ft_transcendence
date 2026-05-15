import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import RecipeCard from '../components/RecipeCard';
import StatusBox from '../components/StatusBox';
import { getRecipes } from '../api';
import { useNotification } from '../utils/NotifContext.ts';
import type { Recipe } from '../types/types';

const Recipes = () => {
  const { showNotification } = useNotification();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState<'name' | 'date'>('name');

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

  const filteredRecipes = recipes
    .filter((recipe) =>
      recipe.title.toLowerCase().includes(searchQuery.toLowerCase()),
    )
    .sort((a, b) => {
      if (sortOption === 'name') {
        return a.title.localeCompare(b.title);
      } else if (sortOption === 'date') {
        return (
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      }
      return 0;
    });

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
    <div className="mt-8 flex gap-6">
      {/* Left panel */}
      <aside className="w-64 shrink-0 rounded-md bg-gray-100 p-4">
        <h2 className="mb-4 text-lg font-semibold">{t('common.filters')}</h2>

        {/* Search */}
        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium">
            {t('common.search')}
          </label>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-md border p-2"
            placeholder={t('common.searchPlaceholder')}
          />
        </div>

        {/* Sort */}
        <div>
          <label className="mb-1 block text-sm font-medium">
            {t('common.sortBy')}
          </label>
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value as 'name' | 'date')}
            className="w-full rounded-md border p-2"
          >
            <option value="name">{t('common.sortName')}</option>
            <option value="date">{t('common.sortDate')}</option>
          </select>
        </div>
      </aside>

      {/* Right panel: Recipes */}
      <div className="grid flex-1 grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {filteredRecipes.map((recipe) => (
          <RecipeCard key={recipe.id} recipe={recipe} />
        ))}
      </div>
    </div>
  );
};

export default Recipes;
