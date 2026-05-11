import { useEffect, useState, useCallback } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import DataField from '../components/DataField';
import EditRecipeModal from '../modals/EditRecipe.tsx';
import ModalButton from '../components/ModalButton.tsx';
import StatusBox from '../components/StatusBox';
import SubmitButton from '../components/SubmitButton';
import { getRecipeById, deleteRecipe } from '../api';
import { useNotification } from '../utils/NotifContext';
import { useAuth } from '../utils/AuthContext';
import type { Recipe } from '../types/types';
import { cardBase } from '../styles/styles';

const RecipeDetail = () => {
  const { showNotification } = useNotification();
  const { user, hasRole } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { state } = useLocation() as { state?: { recipe?: Recipe } };
  const [recipe, setRecipe] = useState<Recipe | null>(state?.recipe ?? null);
  const [loading, setLoading] = useState(false);
  const [isEditRecipeOpen, setIsEditRecipeOpen] = useState(false);
  const { t } = useTranslation();

  const fetchRecipe: () => void = useCallback(() => {
    if (!id) return;

    getRecipeById(id, t)
      .then((fetchedRecipe) => setRecipe(fetchedRecipe))
      .catch((err: unknown) => {
        const message =
          err instanceof Error ? err.message : t('error.genericError');
        showNotification(message, 'error');
        void navigate('/');
      });
  }, [id, t, showNotification, navigate]);

  useEffect(() => {
    if (!id) return;
    if (!recipe) {
      fetchRecipe();
    }
  }, [id, recipe, fetchRecipe]);

  const handleDelete = (id?: string) => {
    if (loading) return;
    if (!id) {
      showNotification(t('error.genericError'), 'error');
      return;
    }

    setLoading(true);

    deleteRecipe(id, t)
      .then(() => {
        showNotification(t('notification.recipeDeleteSuccess'), 'success');
        void navigate('/');
      })
      .catch((err: unknown) => {
        const message =
          err instanceof Error ? err.message : t('error.genericError');
        showNotification(message, 'error');
        void navigate('/');
      })
      .finally(() => setLoading(false));
  };

  if (recipe === null) {
    return <StatusBox message={t('common.loading')} className="text-black" />;
  }

  if (!recipe) {
    return (
      <StatusBox message={t('error.recipeNotFound')} className="text-red-600" />
    );
  }

  const isSelf = recipe.author_id == user?.id;

  return (
    <>
      {/* Edit Recipe Modal */}
      {isEditRecipeOpen && recipe && (
        <EditRecipeModal
          passedRecipe={recipe}
          onClose={() => setIsEditRecipeOpen(false)}
          onSuccess={fetchRecipe}
        />
      )}

      <div className={`${cardBase} mt-8 p-8 wrap-anywhere`}>
        {/* Recipe Image */}
        <img
          src={recipe.image_url}
          alt={recipe.title}
          className="mb-8 h-64 w-full rounded object-cover shadow-md md:h-80"
        />

        {/* Header */}
        <h1 className="mb-6 text-2xl font-semibold text-orange-700">
          {recipe.title}
        </h1>

        {/* Description */}
        <h2 className="mb-6 text-lg font-semibold">{recipe.description}</h2>

        {/* Recipe Info Fields */}
        <div className="mt-6 space-y-16">
          <div className="flex gap-8">
            {/* Left */}
            <div className="flex-1 space-y-2">
              <DataField
                label={t('recipeDetail.author')}
                value={recipe.author_id}
              />
              <DataField
                label={t('recipeDetail.prep')}
                value={recipe.preparation_time_min}
              />
              <DataField
                label={t('recipeDetail.servings')}
                value={recipe.servings}
              />
              <DataField
                label={t('difficulty.type')}
                value={t(`difficulty.type_${recipe.difficulty}`)}
              />
              <DataField
                label={t('recipeDetail.cuisine')}
                value={recipe.cuisine}
              />
              <DataField
                label={t('meal.type')}
                value={t(`meal.type_${recipe.meal_type}`)}
              />
            </div>

            {/* Right */}
            <div className="flex-1 space-y-2">
              <DataField
                label={t('recipeDetail.calories')}
                value={recipe.calories}
              />
              <DataField
                label={t('recipeDetail.protein')}
                value={recipe.protein_g}
              />
              <DataField
                label={t('recipeDetail.carbs')}
                value={recipe.carbs_g}
              />
              <DataField label={t('recipeDetail.fat')} value={recipe.fat_g} />
            </div>
          </div>

          {/* Like Button */}
          <div className="mt-2">
            <DataField
              label={t('recipeDetail.likes')}
              value={'PLACEHOLDER VALUE'}
            />
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

          {/* Bottom Section */}
          <div className="mt-16 flex gap-2">
            {/* Edit recipe */}
            <ModalButton
              className="rounded-xl bg-slate-600 hover:bg-[#C04D31]"
              onClick={() => setIsEditRecipeOpen(true)}
              text={t('recipeDetail.editRecipe')}
              disabled={
                !hasRole(['moderator', 'admin']) &&
                !(hasRole(['chef']) && isSelf)
              }
            />

            {/* Delete recipe */}
            <SubmitButton
              className="rounded-xl bg-slate-600 hover:bg-[#C04D31]"
              isLoading={loading}
              pendingText={t('recipeDetail.submitPending')}
              defaultText={t('recipeDetail.submit')}
              onClick={() => handleDelete(id)}
              type="button"
              disabled={
                !hasRole(['moderator', 'admin']) &&
                !(hasRole(['chef']) && isSelf)
              }
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default RecipeDetail;
