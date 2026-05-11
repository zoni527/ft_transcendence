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
  onUpdate: (user: User) => void;
}

const AdminUserField = ({ user, onDelete, onUpdate }: AdminUserFieldProps) => {
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
        <EditUserModal
          onClose={() => setIsUserEditOpen(false)}
          user={user}
          onSave={onUpdate}
        />
      )}
      <div className="flex items-center justify-between border-b border-gray-300 pb-4">
        {/* Left side: names */}
        <div className="flex flex-col gap-2 md:flex-col lg:flex-row lg:items-center lg:gap-6">
          {/* Full name */}
          <div className="text-xl font-semibold text-gray-700">{user.name}</div>

          {/* Username */}
          <div className="text-xl font-semibold text-gray-700">
            {user.display_name}
          </div>
        </div>

        {/* Right side: buttons */}
        <div className="flex flex-col gap-2 p-2 md:flex-row md:gap-3">
          <ModalButton
            className="w-full rounded-xl border-2 border-slate-600 hover:border-slate-950 md:w-auto"
            onClick={() => setIsUserEditOpen(true)}
            text={t('adminPanel.edit')}
            disabled={!hasRole(['admin'])}
          />

          <SubmitButton
            className="w-full rounded-xl border-2 border-slate-600 hover:border-slate-950 md:w-auto"
            isLoading={loading}
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
