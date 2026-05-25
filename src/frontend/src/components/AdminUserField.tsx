import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNotification } from '../utils/NotifContext';
import EditUserModal from '../modals/EditUser';
import ModalButton from './ModalButton';
import SubmitButton from './SubmitButton';
import UserStatus from './UserStatus';
import { useAuth } from '../utils/AuthContext';
import { deleteUser } from '../api';
import type { User } from '../types/types';

interface AdminUserFieldProps {
  user: User;
  onDelete: (id: string) => void;
  onUpdate: (user: User) => void;
  onClick?: () => void;
}

const AdminUserField = ({
  user,
  onDelete,
  onUpdate,
  onClick,
}: AdminUserFieldProps) => {
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
      <div
        className="flex items-center justify-between border-b border-gray-300 pt-4 pb-4 pl-2 hover:cursor-pointer hover:bg-gray-100"
        onClick={onClick}
      >
        {/* Left side */}
        <div className="flex min-w-0 flex-col gap-2 md:flex-row md:items-center md:gap-6">
          {/* Name */}
          <div className="w-36 shrink-0 truncate text-xl font-semibold text-gray-700 sm:w-60">
            {user.name}
          </div>

          {/* Username */}
          <div className="w-36 shrink-0 truncate text-xl font-semibold text-gray-700 sm:w-60">
            {user.display_name}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col items-center gap-2 p-2 md:flex-row md:gap-3">
          {/* User status */}
          <UserStatus isOnline={user.is_online} />

          {/* Edit user */}
          <ModalButton
            className="w-full rounded-xl border-2 border-slate-600 hover:border-slate-950 md:w-auto"
            onClick={(e) => {
              e.stopPropagation();
              setIsUserEditOpen(true);
            }}
            text={t('adminPanel.edit')}
            disabled={!hasRole(['admin'])}
          />

          {/* Delete user */}
          <SubmitButton
            className="w-full rounded-xl border-2 border-slate-600 hover:border-slate-950 md:w-auto"
            isLoading={loading}
            defaultText={t('adminPanel.delete')}
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(user.id);
            }}
            type="button"
            disabled={!hasRole(['admin'])}
          />
        </div>
      </div>
    </>
  );
};

export default AdminUserField;
