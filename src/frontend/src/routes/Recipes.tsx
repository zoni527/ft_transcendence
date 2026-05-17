import { useEffect, useState, useRef } from 'react';
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

type FiltersContentProps = {
  inputValue: string;
  setInputValue: React.Dispatch<React.SetStateAction<string>>;

  sortOrder: 'oldest' | 'newest';
  setSortOrder: React.Dispatch<React.SetStateAction<'oldest' | 'newest'>>;

  mealType: string;
  setMealType: React.Dispatch<React.SetStateAction<string>>;

  difficulty: string;
  setDifficulty: React.Dispatch<React.SetStateAction<string>>;

  setPage: React.Dispatch<React.SetStateAction<number>>;

  t: (key: string) => string;
};

const FiltersContent = ({
  inputValue,
  setInputValue,
  sortOrder,
  setSortOrder,
  mealType,
  setMealType,
  difficulty,
  setDifficulty,
  setPage,
  t,
}: FiltersContentProps) => (
  <>
    {/* Search */}
    <div className="mt-6 mb-4">
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        className="text-md block w-full rounded-full border border-gray-700 bg-white px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-orange-800 focus:outline-none"
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
        { label: t('common.all'), value: '' },
        { label: t('meal.type_breakfast'), value: 'breakfast' },
        { label: t('meal.type_lunch'), value: 'lunch' },
        { label: t('meal.type_dinner'), value: 'dinner' },
        { label: t('meal.type_snack'), value: 'snack' },
      ]}
    />

    {/* Difficulty */}
    <FilterGroup
      label={t('difficulty.type')}
      value={difficulty}
      onChange={setDifficulty}
      onResetPage={() => setPage(1)}
      options={[
        { label: t('common.all'), value: '' },
        { label: t('difficulty.type_easy'), value: 'easy' },
        { label: t('difficulty.type_medium'), value: 'medium' },
        { label: t('difficulty.type_hard'), value: 'hard' },
      ]}
    />
  </>
);

const Recipes = () => {
  const { showNotification } = useNotification();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const loaderRef = useRef<HTMLDivElement | null>(null);

  const [searchParams, setSearchParams] = useSearchParams();

  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);

  // Mobile filters
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

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
          setRecipes((prev) => (page === 1 ? data : [...prev, ...data]));

          setHasMore(data.length === 12);
        }
      } catch (err: unknown) {
        if (cancelled) return;

        const message =
          err instanceof Error ? err.message : t('error.genericError');

        showNotification(message, 'error');
        void navigate('/');
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void fetchRecipes();

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

    if (searchQuery) {
      params.set('q', searchQuery);
    }

    if (page !== 1) {
      params.set('page', page.toString());
    }

    if (sortOrder !== 'newest') {
      params.set('date', sortOrder);
    }

    if (mealType) {
      params.set('mealType', mealType);
    }

    if (difficulty) {
      params.set('difficulty', difficulty);
    }

    const newSearch = params.toString();

    if (newSearch !== searchParams.toString()) {
      setSearchParams(params, {
        replace: true,
      });
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

  // Pagination infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];

        if (first.isIntersecting && hasMore && !loading) {
          setPage((prev) => prev + 1);
        }
      },
      {
        threshold: 1,
      },
    );

    const currentLoader = loaderRef.current;

    if (currentLoader) {
      observer.observe(currentLoader);
    }

    return () => {
      if (currentLoader) {
        observer.unobserve(currentLoader);
      }
      observer.disconnect();
    };
  }, [hasMore, loading]);

  return (
    <>
      {/* Mobile filters button */}
      <div className="mt-6 mb-4 sm:hidden">
        <button
          onClick={() => setMobileFiltersOpen(true)}
          className={`inline-flex items-center justify-center rounded-lg bg-gray-100 px-4 py-2 text-xl font-semibold shadow-[0px_0px_5px_0px_rgba(0,0,0,0.2)]`}
        >
          {t('common.filters')}
        </button>
      </div>

      {/* Mobile filters drawer */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 sm:hidden">
          {/* Backdrop */}
          <button
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileFiltersOpen(false)}
          />

          {/* Drawer */}
          <div className="absolute top-0 left-0 h-full w-48 overflow-y-auto bg-gray-100 p-4 shadow-lg">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold">{t('common.filters')}</h2>

              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="text-xl"
              >
                ✕
              </button>
            </div>

            <FiltersContent
              inputValue={inputValue}
              setInputValue={setInputValue}
              sortOrder={sortOrder}
              setSortOrder={setSortOrder}
              mealType={mealType}
              setMealType={setMealType}
              difficulty={difficulty}
              setDifficulty={setDifficulty}
              setPage={setPage}
              t={t}
            />
          </div>
        </div>
      )}

      <div className="mt-8 flex flex-col gap-6 sm:flex-row">
        {/* Desktop / tablet sidebar */}
        <aside className="hidden w-50 shrink-0 self-start rounded-md bg-gray-100/50 p-4 sm:sticky sm:top-6 sm:block">
          <h2 className="mb-4 text-xl font-semibold">{t('common.filters')}</h2>

          <FiltersContent
            inputValue={inputValue}
            setInputValue={setInputValue}
            sortOrder={sortOrder}
            setSortOrder={setSortOrder}
            mealType={mealType}
            setMealType={setMealType}
            difficulty={difficulty}
            setDifficulty={setDifficulty}
            setPage={setPage}
            t={t}
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

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {recipes.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>

          {/* Infinite scroll trigger */}
          {hasMore && (
            <div ref={loaderRef} className="flex justify-center py-10">
              {loading && (
                <StatusBox
                  message={t('common.loading')}
                  className="text-black"
                />
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Recipes;
