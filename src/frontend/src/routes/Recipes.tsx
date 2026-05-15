import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import RecipeCard from '../components/RecipeCard';
import StatusBox from '../components/StatusBox';
import { getRecipesSearch } from '../api';
import type { SearchRecipesParams } from '../api';
import { useNotification } from '../utils/NotifContext.ts';
import type { Recipe } from '../types/types';
import { buttonBase } from '../styles/styles.tsx';

const Recipes = () => {
  const { showNotification } = useNotification();
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

  const [cuisine, setCuisine] = useState<string>(
    searchParams.get('cuisine') || '',
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
          cuisine,
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

    void fetchRecipes().catch((err) =>
      console.error('Error fetching recipes:', err),
    );

    return () => {
      cancelled = true;
    };
  }, [
    page,
    searchQuery,
    sortOrder,
    cuisine,
    difficulty,
    mealType,
    t,
    showNotification,
  ]);

  // Sync URL
  useEffect(() => {
    const params = new URLSearchParams();

    if (searchQuery) params.set('q', searchQuery);
    if (page !== 1) params.set('page', page.toString());
    if (sortOrder !== 'newest') params.set('date', sortOrder);

    if (mealType) params.set('mealType', mealType);
    if (difficulty) params.set('difficulty', difficulty);
    if (cuisine) params.set('cuisine', cuisine);

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
    cuisine,
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
        <div>
          <label className="text-md mt-12 mb-2 block font-semibold">
            {t('common.sortBy')}
          </label>

          <div className="flex flex-col gap-1">
            <button
              type="button"
              onClick={() => {
                setSortOrder('newest');
                setPage(1);
              }}
              className={`text-md w-full rounded-lg px-4 py-2 text-left transition hover:cursor-pointer ${
                sortOrder === 'newest'
                  ? 'bg-orange-800/10 font-bold text-[#C04D31]'
                  : 'text-gray-700'
              }`}
            >
              {t('common.newest')}
            </button>

            <button
              type="button"
              onClick={() => {
                setSortOrder('oldest');
                setPage(1);
              }}
              className={`text-md w-full rounded-lg px-4 py-2 text-left transition hover:cursor-pointer ${
                sortOrder === 'newest'
                  ? 'text-gray-700'
                  : 'bg-orange-800/10 font-bold text-[#C04D31]'
              }`}
            >
              {t('common.oldest')}
            </button>
          </div>
        </div>

        {/* Meal Type */}
        <div className="mt-12">
          <label className="mb-2 block font-semibold">{t('meal.type')}</label>

          <div className="flex flex-col gap-1">
            {['', 'breakfast', 'lunch', 'dinner', 'snack'].map((type) => (
              <button
                key={type}
                onClick={() => {
                  setMealType(type);
                  setPage(1);
                }}
                className={`text-md w-full rounded-lg px-4 py-2 text-left transition hover:cursor-pointer ${
                  mealType === type
                    ? 'bg-orange-800/10 font-bold text-[#C04D31]'
                    : 'text-gray-700'
                }`}
              >
                {type === '' ? 'All' : type}
              </button>
            ))}
          </div>
        </div>

        {/* Difficulty */}
        <div className="mt-12">
          <label className="mb-2 block font-semibold">
            {t('difficulty.type')}
          </label>

          <div className="flex flex-col gap-1">
            {['', 'easy', 'medium', 'hard'].map((level) => (
              <button
                key={level}
                onClick={() => {
                  setDifficulty(level);
                  setPage(1);
                }}
                className={`text-md w-full rounded-lg px-4 py-2 text-left transition hover:cursor-pointer ${
                  difficulty === level
                    ? 'bg-orange-800/10 font-bold text-[#C04D31]'
                    : 'text-gray-700'
                }`}
              >
                {level === '' ? 'All' : level}
              </button>
            ))}
          </div>
        </div>

        {/* Cuisine */}
        <div className="mt-12">
          <label className="mb-2 block font-semibold">
            {t('recipeDetail.cuisine')}
          </label>

          <div className="flex flex-col gap-1">
            {['', 'italian', 'french', 'asian', 'mexican'].map((c) => (
              <button
                key={c}
                onClick={() => {
                  setCuisine(c);
                  setPage(1);
                }}
                className={`text-md w-full rounded-lg px-4 py-2 text-left transition hover:cursor-pointer ${
                  cuisine === c
                    ? 'bg-orange-800/10 font-bold text-[#C04D31]'
                    : 'text-gray-700'
                }`}
              >
                {c === '' ? 'All' : c}
              </button>
            ))}
          </div>
        </div>
      </aside>

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
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {recipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>

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
