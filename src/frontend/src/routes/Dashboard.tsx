import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useNotification } from '../utils/NotifContext';
import CreateRecipeModal from '../modals/CreateRecipe';
import DataField from '../components/DataField';
import EditUserModal from '../modals/EditUser';
import InfoIcon from '../components/InfoIcon';
import ModalButton from '../components/ModalButton';
import StatusBox from '../components/StatusBox';
import { getUserbyId } from '../api';
import { useAuth } from '../utils/AuthContext';
import type { User } from '../types/types';
import { cardBase } from '../styles/styles';

const Dashboard = () => {
  const { id } = useParams<{ id: string }>();
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [isUserEditOpen, setIsUserEditOpen] = useState(false);
  const [isCreateRecipeOpen, setIsCreateRecipeOpen] = useState(false);
  const { user: authUser, hasRole } = useAuth();
  const { showNotification } = useNotification();
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    if (!authUser && !id) return;

    const fetchUser = async () => {
      setLoading(true);
      try {
        if (!id) {
          setUserData(authUser);
        } else {
          const data = await getUserbyId(id, t);
          setUserData(data);
        }
      } finally {
        setLoading(false);
      }
    };

    void fetchUser().catch((err: unknown) => {
      const message =
        err instanceof Error ? err.message : t('error.genericError');

      showNotification(message, 'error');
      setUserData(null);
      void navigate('/');
    });
  }, [id, authUser, t, showNotification, navigate]);

  if (loading) {
    return <StatusBox message={t('common.loading')} className="text-black" />;
  }

  if (!userData) {
    return (
      <StatusBox message={t('error.userNotFound')} className="text-red-600" />
    );
  }

  const isSelf = !id || authUser?.id === userData.id;

  return (
    <>
      {isUserEditOpen && (
        <EditUserModal
          onClose={() => setIsUserEditOpen(false)}
          user={userData}
        />
      )}
      {isCreateRecipeOpen && (
        <CreateRecipeModal onClose={() => setIsCreateRecipeOpen(false)} />
      )}

      <div className={`${cardBase} relative mt-8 p-8 wrap-anywhere`}>
        {/* Avatar */}
        <div className="absolute top-8 right-8">
          <img
            src={userData.avatar_url}
            alt={`${userData.name}'s avatar`}
            className="h-28 w-28 rounded-full border-2 border-gray-300"
          />
        </div>

        {/* Header */}
        <h1 className="mb-8 text-3xl font-bold text-[#C04D31]">
          {t('common.welcome')}, {userData.name}!
        </h1>

        {/* User Info Section */}
        <div className="mt-28 space-y-6">
          <div className="flex flex-col gap-4">
            {/* Full name */}
            <div className="flex items-center justify-between border-b border-gray-300 pb-4">
              <div className="flex-1">
                <DataField label={t('dashboard.name')} value={userData.name} />
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
                  value={userData.display_name}
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
                <DataField
                  label={t('dashboard.email')}
                  value={userData.email}
                />
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
                  value={userData.roles.join(', ')}
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
          <ModalButton
            className="rounded-xl bg-slate-600 hover:bg-[#C04D31]"
            onClick={() => setIsUserEditOpen(true)}
            text={t('dashboard.editUser')}
            disabled={!(hasRole(['admin']) || isSelf)}
          />

          {/* Create recipe */}
          <ModalButton
            className="rounded-xl bg-slate-600 hover:bg-[#C04D31]"
            onClick={() => setIsCreateRecipeOpen(true)}
            text={t('dashboard.createRecipe')}
            disabled={!(hasRole(['chef', 'moderator', 'admin']) && isSelf)}
          />
        </div>
      </div>
    </>
  );
};

export default Dashboard;
