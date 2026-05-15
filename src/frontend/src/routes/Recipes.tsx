import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import RecipeCard from '../components/RecipeCard';
import StatusBox from '../components/StatusBox';
import { getRecipesSearch } from '../api';
import type { SearchRecipesParams } from '../api';
import { useNotification } from '../utils/NotifContext.ts';
import type { Recipe } from '../types/types';

const Recipes = () => {
  const { showNotification } = useNotification();
  const { t } = useTranslation();

  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState<'name' | 'date'>('name');
  const [hasMore, setHasMore] = useState(true);

  const fetchRecipes = async () => {
    setLoading(true);
    try {
      const params: SearchRecipesParams = { page, query: searchQuery };
      if (sortOption === 'date') params.date = 'desc'; // adjust as per your backend logic

      const data = await getRecipesSearch(t, params);

      setRecipes(page === 1 ? data : [...recipes, ...data]);
      setHasMore(data.length === 10); // based on backend limit
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : t('error.genericError');
      showNotification(message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1); // reset to first page on query/sort change
  }, [searchQuery, sortOption]);

  useEffect(() => {
    fetchRecipes();
  }, [page, searchQuery, sortOption]);

  if (loading && page === 1) {
    return <StatusBox message={t('common.loading')} className="text-black" />;
  }

  if (!loading && recipes.length === 0) {
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
      <div className="flex-1">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {recipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>

        {/* Pagination */}
        {hasMore && (
          <div className="mt-6 text-center">
            <button
              onClick={() => setPage((prev) => prev + 1)}
              className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              {loading ? t('common.loading') : t('common.loadMore')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Recipes;
