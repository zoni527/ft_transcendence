import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNotification } from '../utils/NotifContext';
import EditRecipeModal from '../modals/EditRecipe';
import ModalButton from './ModalButton';
import SubmitButton from './SubmitButton';
import { useAuth } from '../utils/AuthContext';
import { deleteRecipe } from '../api';
import type { Recipe } from '../types/types';

interface AdminRecipeFieldProps {
  recipe: Recipe;
}

const AdminRecipeField = ({ recipe }: AdminRecipeFieldProps) => {
  const [isRecipeEditOpen, setIsRecipeEditOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { hasRole } = useAuth();
  const { showNotification } = useNotification();
  const { t } = useTranslation();

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
      })
      .catch((err: unknown) => {
        const message =
          err instanceof Error ? err.message : t('error.genericError');
        showNotification(message, 'error');
      })
      .finally(() => setLoading(false));
  };

  return (
    <>
      {isRecipeEditOpen && (
        <EditRecipeModal
          onClose={() => setIsRecipeEditOpen(false)}
          passedRecipe={recipe}
        />
      )}
      <div className="flex items-center justify-between border-b border-gray-300 pb-4">
        {/* Recipe name */}
        <div className="flex-1 text-xl text-gray-700">{recipe.title}</div>

        {/* Buttons */}
        <div className="flex gap-x-3 p-2">
          {/* Edit recipe */}
          <ModalButton
            className="rounded-xl bg-slate-600 hover:bg-[#C04D31]"
            onClick={() => setIsRecipeEditOpen(true)}
            text={t('adminPanel.edit')}
            disabled={!hasRole(['admin'])}
          />

          {/* Delete recipe */}
          <SubmitButton
            className="rounded-xl bg-slate-600 hover:bg-[#C04D31]"
            isLoading={loading}
            pendingText={t('recipeDetail.submitPending')}
            defaultText={t('recipeDetail.submit')}
            onClick={() => handleDelete(recipe.id)}
            type="button"
            disabled={!hasRole(['admin'])}
          />
        </div>
      </div>
    </>
  );
};

export default AdminRecipeField;
