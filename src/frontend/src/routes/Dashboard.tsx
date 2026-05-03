import { useTranslation } from 'react-i18next';
import DataField from '../components/DataField';
import NavButton from '../components/NavButton';
import PencilIcon from '../components/PencilIcon';
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
          src={'/path/to/default/avatar.jpg'}
          alt={`${user.name}'s avatar`}
          className="h-32 w-32 rounded-full border-2 border-gray-300"
        />
      </div>

      {/* Header */}
      <h1 className="mb-8 text-3xl font-bold text-orange-700">
        {t('common.welcome')}, {user.name}!
      </h1>

      {/* User Info Section */}
      <div className="mt-6 space-y-6">
        <div className="flex flex-col gap-4">
          {/* Full name */}
          <div className="flex items-center justify-between border-b border-gray-300 pb-4">
            <div className="flex-1">
              <DataField label={t('dashboard.name')} value={user.name} />
            </div>
            <button
              onClick={() => {}}
              className="rounded p-2"
              title={t('common.edit')}
            >
              <PencilIcon />
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
              title={t('common.edit')}
            >
              <PencilIcon />
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
              title={t('common.edit')}
            >
              <PencilIcon />
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
              title={t('common.edit')}
            >
              <PencilIcon />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="mt-6">
        {hasRole(['admin', 'moderator', 'chef']) && (
          <NavButton path="/create" className={buttonBase}>
            {t('dashboard.createRecipe')}
          </NavButton>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
