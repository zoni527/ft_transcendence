import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import AdminUserField from '../components/AdminUserField.tsx';
import StatusBox from '../components/StatusBox';
import { useAuth } from '../utils/AuthContext';
import { getUsers } from '../api';
import { useNotification } from '../utils/NotifContext.ts';
import type { User } from '../types/types';
import { cardBase } from '../styles/styles';

const AdminPanel = () => {
  const { user, hasRole } = useAuth();
  const { showNotification } = useNotification();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  useEffect(() => {
    getUsers(t)
      .then(setUsers)
      .catch((err: unknown) => {
        const message =
          err instanceof Error ? err.message : t('error.genericError');

        showNotification(message, 'error');
      })
      .finally(() => setLoading(false));
  }, [t, showNotification]);

  if (loading) {
    return <StatusBox message={t('common.loading')} className="text-black" />;
  }

  if (!user) {
    return (
      <StatusBox message={t('error.userNotFound')} className="text-red-600" />
    );
  }

  if (!hasRole(['admin'])) {
    return (
      <StatusBox message={t('error.accessDenied')} className="text-red-600" />
    );
  }

  if (users.length === 0) {
    return (
      <StatusBox message={t('error.usersNotFound')} className="text-red-600" />
    );
  }

  return (
    <div className={`${cardBase} relative mt-8 p-8 wrap-anywhere`}>
      {/* Avatar */}
      <div className="absolute top-8 right-8">
        <img
          src={user.avatar_url}
          alt={`${user.name}'s avatar`}
          className="h-28 w-28 rounded-full border-2 border-gray-300"
        />
      </div>

      {/* Header */}
      <h1 className="mb-8 text-3xl font-bold text-[#C04D31]">
        {t('adminPanel.header')}
      </h1>

      {/* List of Users */}
      <div className="mt-28 space-y-6">
        <div className="flex flex-col gap-4">
          {' '}
          {users.map((user) => (
            <AdminUserField user={user} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
