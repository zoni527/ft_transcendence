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
  onUpdate: (recipe: Recipe) => void;
  onClick?: () => void;
}

const AdminRecipeField = ({
  recipe,
  onDelete,
  onUpdate,
  onClick,
}: AdminRecipeFieldProps) => {
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
          onSave={onUpdate}
        />
      )}
      <div
        className="flex items-center justify-between border-b border-gray-300 pt-4 pb-4 pl-2 hover:cursor-pointer hover:bg-gray-100"
        onClick={onClick}
      >
        {/* Recipe name */}
        <div className="flex-1 text-xl font-semibold text-gray-700">
          {recipe.title}
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-2 p-2 md:flex-row md:gap-3">
          {/* Edit recipe */}
          <ModalButton
            className="w-full rounded-xl border-2 border-slate-600 hover:border-slate-950 md:w-auto"
            onClick={(e) => {
              e.stopPropagation();
              setIsRecipeEditOpen(true);
            }}
            text={t('adminPanel.edit')}
            disabled={!hasRole(['admin'])}
          />

          {/* Delete recipe */}
          <SubmitButton
            className="w-full rounded-xl border-2 border-slate-600 hover:border-slate-950 md:w-auto"
            isLoading={loading}
            defaultText={t('adminPanel.delete')}
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(recipe.id);
            }}
            type="button"
            disabled={!hasRole(['admin'])}
          />
        </div>
      </div>
    </>
  );
};

export default AdminRecipeField;
