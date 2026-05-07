import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import EditUserModal from '../modals/EditUser';
import ModalButton from './ModalButton';
import { useAuth } from '../utils/AuthContext';
import type { User } from '../types/types';

interface AdminUserFieldProps {
  user: User;
}

const AdminUserField = ({ user }: AdminUserFieldProps) => {
  const [isUserEditOpen, setIsUserEditOpen] = useState(false);
  const { hasRole } = useAuth();
  const { t } = useTranslation();

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
          <ModalButton
            className="rounded-xl bg-slate-600 hover:bg-[#C04D31]"
            onClick={() => setIsUserEditOpen(true)}
            text={t('adminPanel.delete')}
            disabled={!hasRole(['admin'])}
          />
        </div>
      </div>
    </>
  );
};

export default AdminUserField;
