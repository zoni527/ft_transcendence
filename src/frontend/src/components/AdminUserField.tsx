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
        onDelete(user.id);
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
        <div className="flex-1 text-xl text-gray-700">{user.name}</div>

        {/* Buttons */}
        <div className="flex gap-x-3 p-2">
          {/* Edit user */}
          <ModalButton
            className="rounded-xl bg-slate-600 hover:bg-[#C04D31]"
            onClick={() => setIsUserEditOpen(true)}
            text={t('adminPanel.edit')}
            disabled={!hasRole(['admin'])}
          />

          {/* Delete user */}
          <SubmitButton
            className="rounded-xl bg-slate-600 hover:bg-[#C04D31]"
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
