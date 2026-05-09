import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNotification } from '../utils/NotifContext';
import EditUserModal from '../modals/EditUser';
import ModalButton from './ModalButton';
import SubmitButton from './SubmitButton';
import { useAuth } from '../utils/AuthContext';
import { deleteUser } from '../api';
import type { User } from '../types/types';

interface AdminUserFieldProps {
  user: User;
  onDelete: (id: string) => void;
}

const AdminUserField = ({ user, onDelete }: AdminUserFieldProps) => {
  const [isUserEditOpen, setIsUserEditOpen] = useState(false);
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

    deleteUser(id, t)
      .then(() => {
        onDelete(id);
        showNotification(t('notification.userDeleteSuccess'), 'success');
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
      {isUserEditOpen && (
        <EditUserModal onClose={() => setIsUserEditOpen(false)} user={user} />
      )}
      <div className="flex items-center justify-between border-b border-gray-300 pb-4">
        {/* User name */}
        <div className="flex-1 text-xl font-semibold text-gray-700">
          {user.name}
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-2 p-2 md:flex-row md:gap-3">
          {/* Edit user */}
          <ModalButton
            className="w-full rounded-xl border-3 border-slate-600 hover:border-slate-800 md:w-auto"
            onClick={() => setIsUserEditOpen(true)}
            text={t('adminPanel.edit')}
            disabled={!hasRole(['admin'])}
          />

          {/* Delete user */}
          <SubmitButton
            className="w-full rounded-xl border-3 border-slate-600 hover:border-slate-800 md:w-auto"
            isLoading={loading}
            pendingText={t('adminPanel.deletePending')}
            defaultText={t('adminPanel.delete')}
            onClick={() => handleDelete(user.id)}
            type="button"
            disabled={!hasRole(['admin'])}
          />
        </div>
      </div>
    </>
  );
};

export default AdminUserField;
