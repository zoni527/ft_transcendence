import { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useNotification } from '../utils/NotifContext';
import AddFriendModal from '../modals/AddFriend';
import CreateRecipeModal from '../modals/CreateRecipe';
import DataField from '../components/DataField';
import EditUserModal from '../modals/EditUser';
import FriendField from '../components/FriendField';
import InfoIcon from '../components/InfoIcon';
import ModalButton from '../components/ModalButton';
import SectionButton from '../components/SectionButton';
import SortButtons from '../components/SortButtons';
import StatusBox from '../components/StatusBox';
import SubmitButton from '../components/SubmitButton';
import UserStatus from '../components/UserStatus';
import { getUserbyId, deleteUser, getUsers } from '../api';
import { useAuth } from '../utils/AuthContext';
import type { User } from '../types/types';
import { cardBase } from '../styles/styles';

const Dashboard = () => {
  const { id } = useParams<{ id: string }>();
  const [userData, setUserData] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [isUserEditOpen, setIsUserEditOpen] = useState(false);
  const [isCreateRecipeOpen, setIsCreateRecipeOpen] = useState(false);
  const [isAddFriendOpen, setIsAddFriendOpen] = useState(false);
  const { user: authUser, hasRole, loading: authLoading, logout } = useAuth();
  const { showNotification } = useNotification();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [activeSection, setActiveSection] = useState<'profile' | 'friends'>(
    'profile',
  );
  const [sortBy, setSortBy] = useState<'name' | 'username'>('name');

  useEffect(() => {
    if (authLoading) return;

    const fetchData = async () => {
      if (!authUser) {
        setLoading(false);
        return;
      }

      let cancelled = false;

      try {
        const users = await getUsers(t);

        if (cancelled) return;

        setUsers([...users].sort((a, b) => a.name.localeCompare(b.name)));
      } catch (err: unknown) {
        if (cancelled) return;

        const message =
          err instanceof Error ? err.message : t('error.genericError');

        showNotification(message, 'error');
      } finally {
        if (!cancelled) setLoading(false);
      }

      return () => {
        cancelled = true;
      };
    };

    void fetchData();
  }, [authLoading, authUser, hasRole, t, showNotification]);

  const sortedUsers = useMemo(() => {
    return [...users].sort((a, b) =>
      sortBy === 'name'
        ? a.name.localeCompare(b.name)
        : a.display_name.localeCompare(b.display_name),
    );
  }, [users, sortBy]);

  const handleDelete = (id?: string) => {
    if (loading) return;
    if (!id) {
      showNotification(t('error.genericError'), 'error');
      return;
    }

    setLoading(true);

    deleteUser(id, t)
      .then(() => {
        logout();
        void navigate('/');
        showNotification(t('notification.userDeleteSuccess'), 'success');
      })
      .catch((err: unknown) => {
        const message =
          err instanceof Error ? err.message : t('error.genericError');
        showNotification(message, 'error');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!id && authLoading) return;

    const fetchUser = async () => {
      setLoading(true);

      try {
        if (!id) {
          if (!authUser) return;
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
  }, [id, authUser, authLoading, t, showNotification, navigate]);

  if ((!id && authLoading) || loading) {
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
          onSave={(updatedUser) => setUserData(updatedUser)}
        />
      )}
      {isCreateRecipeOpen && (
        <CreateRecipeModal onClose={() => setIsCreateRecipeOpen(false)} />
      )}
      {isAddFriendOpen && (
        <AddFriendModal
          onClose={() => setIsAddFriendOpen(false)}
          onSelectUser={() => {
            setIsAddFriendOpen(false);
            setActiveSection('profile');
          }}
        />
      )}

      <div className={`${cardBase} relative mt-8 p-8 wrap-anywhere`}>
        {/* Avatar */}
        <div className="relative mb-8 flex flex-col items-center gap-4 md:absolute md:top-8 md:right-12 md:mb-0 md:items-end">
          <img
            src={userData.avatar_url}
            alt={`${userData.name}'s avatar`}
            className="h-28 w-28 rounded-full border-2 border-slate-600"
          />
        </div>

        {/* Online/Offline Indicator */}
        <UserStatus
          isOnline={userData.is_online}
          className={'absolute top-8 right-8'}
        />

        {/* Header */}
        <h1 className="text-center text-3xl font-bold text-[#C04D31] md:text-left">
          {userData.name}
        </h1>

        {/* Tabs */}
        <div className="mt-16 border-b pb-2 md:mt-20">
          <div className="mb-4 flex justify-center gap-8 md:gap-24">
            <SectionButton
              label={t('nav.dashboard')}
              section="profile"
              activeSection={activeSection}
              setActiveSection={setActiveSection}
            />

            {isSelf && (
              <SectionButton
                label={t('nav.friends')}
                section="friends"
                activeSection={activeSection}
                setActiveSection={setActiveSection}
              />
            )}
          </div>
        </div>

        {/* Sort Controls */}
        {activeSection === 'friends' && (
          <SortButtons
            sortBy={sortBy}
            setSortBy={setSortBy}
            options={[
              {
                value: 'name',
                label: t('adminPanel.sortFullName'),
              },
              {
                value: 'username',
                label: t('adminPanel.sortUsername'),
              },
            ]}
          />
        )}

        {/* Content */}
        <div className="mt-12 flex flex-col gap-4">
          {/* Profile */}
          {activeSection === 'profile' && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-gray-300 pb-4">
                <div className="flex-1">
                  <DataField
                    label={t('dashboard.name')}
                    value={userData.name}
                  />
                </div>
                <button className="rounded p-2" title={t('info.name')}>
                  <InfoIcon />
                </button>
              </div>

              <div className="flex items-center justify-between border-b border-gray-300 pb-4">
                <div className="flex-1">
                  <DataField
                    label={t('dashboard.username')}
                    value={userData.display_name}
                  />
                </div>
                <button className="rounded p-2" title={t('info.username')}>
                  <InfoIcon />
                </button>
              </div>

              <div className="flex items-center justify-between border-b border-gray-300 pb-4">
                <div className="flex-1">
                  <DataField
                    label={t('dashboard.email')}
                    value={userData.email}
                  />
                </div>
                <button className="rounded p-2" title={t('info.email')}>
                  <InfoIcon />
                </button>
              </div>

              <div className="flex items-center justify-between border-b border-gray-300 pb-4">
                <div className="flex-1">
                  <DataField
                    label={t('dashboard.roles')}
                    value={userData.roles.join(', ')}
                  />
                </div>
                <button className="rounded p-2" title={t('info.roles')}>
                  <InfoIcon />
                </button>
              </div>

              {/* Bottom buttons */}
              <div className="mt-16 flex w-full flex-col gap-4 md:flex-row md:items-center md:justify-between">
                {/* Left */}
                <ModalButton
                  className="order-1 rounded-xl border-2 border-slate-600 hover:border-slate-950 md:order-0"
                  onClick={() => setIsCreateRecipeOpen(true)}
                  text={t('dashboard.createRecipe')}
                  disabled={
                    !(hasRole(['chef', 'moderator', 'admin']) && isSelf)
                  }
                />

                {/* Right */}
                <div className="order-2 flex flex-col gap-2 md:order-0 md:flex-row">
                  <ModalButton
                    className="rounded-xl border-2 border-slate-600 hover:border-slate-950"
                    onClick={() => setIsUserEditOpen(true)}
                    text={t('dashboard.editUser')}
                    disabled={!(hasRole(['admin']) || isSelf)}
                  />

                  <SubmitButton
                    className="rounded-xl border-2 border-slate-600 hover:border-slate-950"
                    isLoading={loading}
                    defaultText={t('dashboard.submit')}
                    onClick={() => handleDelete(userData.id)}
                    type="button"
                    disabled={!(hasRole(['admin']) || isSelf)}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Friends */}
        {activeSection === 'friends' && (
          <div className="flex flex-col gap-4">
            {/* Friends list */}
            {sortedUsers.map((listedUser) => (
              <FriendField
                key={listedUser.id}
                user={listedUser}
                onDelete={(id) =>
                  setUsers((prev) => prev.filter((u) => u.id !== id))
                }
                onUpdate={(updatedUser) =>
                  setUsers((prev) =>
                    prev.map((u) =>
                      u.id === updatedUser.id ? updatedUser : u,
                    ),
                  )
                }
              />
            ))}

            {/* Bottom buttons */}
            <div className="mt-16 flex w-full flex-col gap-4 md:flex-row md:items-center md:justify-between">
              {/* Left */}
              <ModalButton
                className="rounded-xl border-2 border-slate-600 hover:border-slate-950"
                onClick={() => setIsAddFriendOpen(true)}
                text={t('dashboard.addFriend')}
                disabled={!isSelf}
              />
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Dashboard;
