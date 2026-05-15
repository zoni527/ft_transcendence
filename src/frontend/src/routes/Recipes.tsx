import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import FilterGroup from '../components/FilterGroup.tsx';
import RecipeCard from '../components/RecipeCard';
import SortOrderFilter from '../components/SortOrderFilter.tsx';
import StatusBox from '../components/StatusBox';
import { getRecipesSearch } from '../api';
import type { SearchRecipesParams } from '../api';
import { useNotification } from '../utils/NotifContext.ts';
import type { Recipe } from '../types/types';
import { buttonBase } from '../styles/styles.tsx';

const Recipes = () => {
  const { showNotification } = useNotification();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();

  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);

  // State
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [inputValue, setInputValue] = useState(searchQuery);

  const [sortOrder, setSortOrder] = useState<'oldest' | 'newest'>(
    (searchParams.get('date') as 'oldest' | 'newest') || 'newest',
  );

  const [page, setPage] = useState(Number(searchParams.get('page')) || 1);

  const [mealType, setMealType] = useState<string>(
    searchParams.get('mealType') || '',
  );

  const [difficulty, setDifficulty] = useState<string>(
    searchParams.get('difficulty') || '',
  );

  // Debounced search
  useEffect(() => {
    const timeout = setTimeout(() => {
      setPage(1);
      setSearchQuery(inputValue);
    }, 300);

    return () => clearTimeout(timeout);
  }, [inputValue]);

  // Fetch recipes
  useEffect(() => {
    let cancelled = false;

    const fetchRecipes = async () => {
      setLoading(true);

      try {
        const params: SearchRecipesParams = {
          page,
          query: searchQuery,
          date: sortOrder,
          mealType,
          difficulty,
        };

        const data = await getRecipesSearch(t, params);

        if (!cancelled) {
          setRecipes((prevRecipes) =>
            page === 1 ? data : [...prevRecipes, ...data],
          );
          setHasMore(data.length === 10);
        }
      } catch (err: unknown) {
        if (!cancelled) {
          const message =
            err instanceof Error ? err.message : t('error.genericError');
          showNotification(message, 'error');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void fetchRecipes().catch((err: unknown) => {
      const message =
        err instanceof Error ? err.message : t('error.genericError');

      showNotification(message, 'error');
      void navigate('/');
    });

    return () => {
      cancelled = true;
    };
  }, [
    page,
    searchQuery,
    sortOrder,
    difficulty,
    mealType,
    t,
    showNotification,
    navigate,
  ]);

  // Sync URL
  useEffect(() => {
    const params = new URLSearchParams();

    if (searchQuery) params.set('q', searchQuery);
    if (page !== 1) params.set('page', page.toString());
    if (sortOrder !== 'newest') params.set('date', sortOrder);

    if (mealType) params.set('mealType', mealType);
    if (difficulty) params.set('difficulty', difficulty);

    const newSearch = params.toString();

    if (newSearch !== searchParams.toString()) {
      setSearchParams(params, { replace: true });
    }
  }, [
    searchQuery,
    sortOrder,
    page,
    mealType,
    difficulty,
    searchParams,
    setSearchParams,
  ]);

  return (
    <div className="mt-8 flex gap-6">
      <aside className="w-50 shrink-0 rounded-md bg-gray-100/50 p-4">
        <h2 className="mb-4 text-xl font-semibold">{t('common.filters')}</h2>

        {/* Search */}
        <div className="mt-6 mb-4">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className={`text-md block w-full rounded-full border border-gray-700 bg-white px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-orange-800 focus:outline-none`}
            placeholder={t('common.searchRecipe')}
          />
        </div>

        {/* Sort Order */}
        <SortOrderFilter
          value={sortOrder}
          onChange={setSortOrder}
          onResetPage={() => setPage(1)}
        />

        {/* Meal Type */}
        <FilterGroup
          label={t('meal.type')}
          value={mealType}
          onChange={setMealType}
          onResetPage={() => setPage(1)}
          options={[
            { label: 'All', value: '' },
            { label: 'Breakfast', value: 'breakfast' },
            { label: 'Lunch', value: 'lunch' },
            { label: 'Dinner', value: 'dinner' },
            { label: 'Snack', value: 'snack' },
          ]}
        />

        {/* Difficulty */}
        <FilterGroup
          label={t('difficulty.type')}
          value={difficulty}
          onChange={setDifficulty}
          onResetPage={() => setPage(1)}
          options={[
            { label: 'All', value: '' },
            { label: 'Easy', value: 'easy' },
            { label: 'Medium', value: 'medium' },
            { label: 'Hard', value: 'hard' },
          ]}
        />
      </aside>

      {/* Recipe Grid */}
      <div className="flex-1">
        {loading && page === 1 && (
          <StatusBox message={t('common.loading')} className="text-black" />
        )}
        {!loading && recipes.length === 0 && (
          <StatusBox
            message={t('error.recipesNotFound')}
            className="text-red-600"
          />
        )}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
          {recipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>

        {/* Load more... button */}
        {hasMore && !loading && (
          <div className="mt-12 text-center">
            <button
              onClick={() => setPage((prev) => prev + 1)}
              className={`${buttonBase} rounded-full border-3 border-orange-700 hover:cursor-pointer hover:border-orange-800`}
            >
              {t('common.loadMore')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Recipes;
