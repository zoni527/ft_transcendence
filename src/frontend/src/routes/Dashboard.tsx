import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import DataField from '../components/DataField';
import NavLink from '../components/NavLink';
import StatusBox from '../components/StatusBox';
import { getUser } from '../api';
import type { User } from '../types/types';
import { cardBase, buttonBase } from '../styles/styles';

const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation();

  const loading = !user && !error;

  useEffect(() => {
    getUser(t)
      .then(setUser)
      .catch((err: unknown) => {
        if (err instanceof Error) setError(err.message);
        else setError(t('error.genericError'));
      });
  }, [t]);

  if (error) {
    return (
      <StatusBox
        message={`${t('error.error')} ${error}`}
        className="text-red-500"
      />
    );
  }

  if (loading) {
    return <StatusBox message={t('common.loading')} className="text-black" />;
  }

  if (!user) {
    return (
      <StatusBox message={t('error.userNotFound')} className="text-black" />
    );
  }

  return (
    <div className={`${cardBase} mt-8 p-8 wrap-anywhere`}>
      {/* Header */}
      <h1 className="mb-6 text-2xl font-semibold text-orange-700">
        {t('common.welcome')}, {user.name}!
      </h1>

      {/* User Info Fields */}
      <div className="mt-6 space-y-16">
        <div className="flex gap-8">
          {/* Left */}
          <div className="flex-1 space-y-2">
            <DataField
              label={t('dashboard.username')}
              value={user.display_name}
            />
            <DataField label={t('dashboard.email')} value={user.email} />
          </div>

          {/* Right */}
          <div className="flex-1 space-y-2">
            <DataField label="ID" value={user.id} />
          </div>
        </div>

        {/* Bottom */}
        <div className="w-full space-y-2">
          <DataField label={t('dashboard.createdAt')} value={user.created_at} />
          <DataField label={t('dashboard.updatedAt')} value={user.updated_at} />
          <DataField
            label={t('dashboard.roles')}
            value={user.roles.join(', ')}
          />
        </div>
        <NavLink to="/create" className={`${buttonBase}`}>
          {t('dashboard.createRecipe')}
        </NavLink>
      </div>
    </div>
  );
};

export default Dashboard;
