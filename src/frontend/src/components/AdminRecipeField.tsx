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
  onDelete: (id: string) => void;
}

const AdminRecipeField = ({ recipe, onDelete }: AdminRecipeFieldProps) => {
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
        onDelete(id);
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
        <div className="flex-1 text-xl font-semibold text-gray-700">
          {recipe.title}
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-2 p-2 md:flex-row md:gap-3">
          {/* Edit recipe */}
          <ModalButton
            className="w-full rounded-xl border-3 border-slate-600 hover:border-slate-800 md:w-auto"
            onClick={() => setIsRecipeEditOpen(true)}
            text={t('adminPanel.edit')}
            disabled={!hasRole(['admin'])}
          />

          {/* Delete recipe */}
          <SubmitButton
            className="w-full rounded-xl border-3 border-slate-600 hover:border-slate-800 md:w-auto"
            isLoading={loading}
            pendingText={t('adminPanel.deletePending')}
            defaultText={t('adminPanel.delete')}
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
