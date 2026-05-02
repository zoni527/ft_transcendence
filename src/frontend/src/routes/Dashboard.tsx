import { useTranslation } from 'react-i18next';
import DataField from '../components/DataField';
import NavButton from '../components/NavButton';
import StatusBox from '../components/StatusBox';
import { useAuth } from '../utils/AuthContext';
import { cardBase, buttonBase } from '../styles/styles';

const Dashboard = () => {
  const { user, loading } = useAuth();
  const { t } = useTranslation();

  if (loading) {
    return <StatusBox message={t('common.loading')} className="text-black" />;
  }

  if (!user) {
    return (
      <StatusBox message={t('error.userNotFound')} className="text-red-600" />
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
            <DataField
              label={t('dashboard.roles')}
              value={user.roles.join(', ')}
            />
          </div>
        </div>

        {/* Bottom */}
        <div className="w-full space-y-2"></div>
        <NavButton to="/create" className={`${buttonBase}`}>
          {t('dashboard.createRecipe')}
        </NavButton>
      </div>
    </div>
  );
};

export default Dashboard;
