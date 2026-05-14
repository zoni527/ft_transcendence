import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  const [recipe, setRecipe] = useState<Recipe | null>(null);
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
    if (!recipe || recipe.id !== id) fetchRecipe();
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

  const isSelf = recipe.author.display_name === user?.id;

  return (
    <>
      {isEditRecipeOpen && recipe && (
        <EditRecipeModal
          passedRecipe={recipe}
          onClose={() => setIsEditRecipeOpen(false)}
          onSave={(updatedRecipe) => setRecipe(updatedRecipe)}
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
        <h1 className="mb-6 text-3xl font-bold text-[#C04D31]">
          {recipe.title}
        </h1>

        {/* Description */}
        <div className="mt-16 mb-24 flex flex-col">
          <span className="text-xl text-gray-500">
            {t('recipeDetail.description')}
          </span>

          <ul className="list-disc space-y-2 pl-5 text-xl font-medium text-gray-800">
            {recipe.description.split('\n').map((line, i) => (
              <li key={i}>{line}</li>
            ))}
          </ul>
        </div>

        {/* Recipe Info Fields */}
        <div className="mt-6 flex flex-col space-y-8 md:flex-row md:space-y-0 md:space-x-8">
          {/* Left Column */}
          <div className="flex-1 space-y-6 border-b border-gray-300 pb-8 md:border-r md:border-b-0 md:pr-4 md:pb-4">
            <DataField
              label={t('recipeDetail.author')}
              value={recipe.author.display_name}
            />

            <DataField
              label={t('recipeDetail.prep')}
              value={recipe.preparation_time_min}
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

          {/* Right Column */}
          <div className="flex-1 space-y-6 md:pl-4">
            <DataField
              label={t('recipeDetail.servings')}
              value={recipe.servings}
            />

            <DataField
              label={t('recipeDetail.calories')}
              value={recipe.calories}
            />

            <DataField
              label={t('recipeDetail.protein')}
              value={recipe.protein_g}
            />

            <DataField label={t('recipeDetail.carbs')} value={recipe.carbs_g} />

            <DataField label={t('recipeDetail.fat')} value={recipe.fat_g} />
          </div>
        </div>

        {/* Bottom Buttons */}
        <div className="mt-16 flex flex-col gap-4 md:flex-row md:items-center md:justify-end">
          {(hasRole(['moderator', 'admin']) ||
            (hasRole(['chef']) && isSelf)) && (
            <>
              <ModalButton
                className="order-1 rounded-xl border-2 border-slate-600 hover:border-slate-950 md:order-0"
                onClick={() => setIsEditRecipeOpen(true)}
                text={t('recipeDetail.editRecipe')}
              />
              <SubmitButton
                className="order-2 rounded-xl border-2 border-slate-600 hover:border-slate-950 md:order-0"
                isLoading={loading}
                defaultText={t('recipeDetail.submit')}
                onClick={() => handleDelete(id)}
                type="button"
              />
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default RecipeDetail;
