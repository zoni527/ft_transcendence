import { useTranslation } from 'react-i18next';
import DataField from '../components/DataField';
import NavButton from '../components/NavButton';
import InfoIcon from '../components/InfoIcon';
import StatusBox from '../components/StatusBox';
import { useAuth } from '../utils/AuthContext';
import { cardBase, buttonBase } from '../styles/styles';

const Dashboard = () => {
  const { user, loading, hasRole } = useAuth();
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
        {t('common.welcome')}, {user.name}!
      </h1>

      {/* User Info Section */}
      <div className="mt-28 space-y-6">
        <div className="flex flex-col gap-4">
          {/* Full name */}
          <div className="flex items-center justify-between border-b border-gray-300 pb-4">
            <div className="flex-1">
              <DataField label={t('dashboard.name')} value={user.name} />
            </div>
            <button
              onClick={() => {}}
              className="rounded p-2"
              title={t('info.name')}
            >
              <InfoIcon />
            </button>
          </div>

          {/* Username */}
          <div className="flex items-center justify-between border-b border-gray-300 pb-4">
            <div className="flex-1">
              <DataField
                label={t('dashboard.username')}
                value={user.display_name}
              />
            </div>
            <button
              onClick={() => {}}
              className="rounded p-2"
              title={t('info.username')}
            >
              <InfoIcon />
            </button>
          </div>

          {/* Email */}
          <div className="flex items-center justify-between border-b border-gray-300 pb-4">
            <div className="flex-1">
              <DataField label={t('dashboard.email')} value={user.email} />
            </div>
            <button
              onClick={() => {}}
              className="rounded p-2"
              title={t('info.email')}
            >
              <InfoIcon />
            </button>
          </div>

          {/* Roles */}
          <div className="flex items-center justify-between border-b border-gray-300 pb-4">
            <div className="flex-1">
              <DataField
                label={t('dashboard.roles')}
                value={user.roles.join(', ')}
              />
            </div>
            <button
              onClick={() => {}}
              className="rounded p-2"
              title={t('info.roles')}
            >
              <InfoIcon />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="mt-16">
        <NavButton path="/editUser" className={buttonBase}>
          {t('dashboard.createRecipe')}
        </NavButton>
        <NavButton
          path="/create"
          className={buttonBase}
          disabled={!hasRole(['admin', 'moderator', 'chef'])}
        >
          {t('dashboard.createRecipe')}
        </NavButton>
      </div>
    </div>
  );
};

export default Dashboard;
