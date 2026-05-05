import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import CreateRecipeModal from '../components/CreateRecipeModal';
import DataField from '../components/DataField';
import EditUserModal from '../components/EditUserModal';
import InfoIcon from '../components/InfoIcon';
import StatusBox from '../components/StatusBox';
import { useAuth } from '../utils/AuthContext';
import { cardBase, buttonBase } from '../styles/styles';

const Dashboard = () => {
  const [isUserEditOpen, setIsUserEditOpen] = useState(false);
  const [isCreateRecipeOpen, setIsCreateRecipeOpen] = useState(false);
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
    <>
      {isUserEditOpen && (
        <EditUserModal onClose={() => setIsUserEditOpen(false)} user={user} />
      )}
      {isCreateRecipeOpen && (
        <CreateRecipeModal onClose={() => setIsCreateRecipeOpen(false)} />
      )}
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
        <div className="mt-16 flex gap-2">
          {/* Edit user */}
          <button
            onClick={() => setIsUserEditOpen(true)}
            className={`${buttonBase} rounded-xl bg-slate-600 hover:bg-[#C04D31]`}
          >
            {t('dashboard.editUser')}
          </button>

          {/* Create recipe */}
          <button
            onClick={() => setIsCreateRecipeOpen(true)}
            className={`${buttonBase} rounded-xl bg-slate-600 hover:bg-[#C04D31]`}
            disabled={!hasRole(['admin', 'moderator', 'chef'])}
          >
            {t('dashboard.createRecipe')}
          </button>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
