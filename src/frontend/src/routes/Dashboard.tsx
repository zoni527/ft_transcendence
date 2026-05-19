import { useState, useEffect } from 'react';
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
import SubsectionButton from '../components/SubsectionButton';
import UserStatus from '../components/UserStatus';
import {
  getUserbyId,
  deleteUser,
  getFriendships,
  acceptFriend,
  deleteFriend,
} from '../api';
import { useAuth } from '../utils/AuthContext';
import type { User, FriendshipListItem } from '../types/types';
import type { FriendAction } from '../components/FriendField';
import { cardBase } from '../styles/styles';

type FriendshipWithStatus = FriendshipListItem & {
  status: 'accepted' | 'incoming' | 'outgoing';
};

type FriendshipSection = 'accepted' | 'incoming' | 'outgoing';

const Dashboard = () => {
  const { id } = useParams<{ id: string }>();
  const [userData, setUserData] = useState<User | null>(null);
  const [userFetched, setUserFetched] = useState(false);
  const [friendshipUsers, setFriendshipUsers] = useState<
    FriendshipWithStatus[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [friendLoadingIds, setFriendLoadingIds] = useState<string[]>([]);
  const [isUserEditOpen, setIsUserEditOpen] = useState(false);
  const [isCreateRecipeOpen, setIsCreateRecipeOpen] = useState(false);
  const [isAddFriendOpen, setIsAddFriendOpen] = useState(false);
  const { user: authUser, hasRole, loading: authLoading, logout } = useAuth();
  const { showNotification } = useNotification();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [sortBy, setSortBy] = useState<'name' | 'username'>('name');
  const [activeSection, setActiveSection] = useState<'profile' | 'friends'>(
    () => {
      return (
        (localStorage.getItem('dashboardActiveSection') as
          | 'profile'
          | 'friends') || 'profile'
      );
    },
  );

  const [activeSubsection, setActiveSubsection] = useState<
    'accepted' | 'incoming' | 'outgoing'
  >(() => {
    return (
      (localStorage.getItem('dashboardActiveSubsection') as
        | 'accepted'
        | 'incoming'
        | 'outgoing') || 'accepted'
    );
  });

  const handleFriendshipError = (err: unknown) => {
    const message =
      err instanceof Error ? err.message : t('error.genericError');

    showNotification(message, 'error');
  };

  const mapFriendships = (
    data: Awaited<ReturnType<typeof getFriendships>>,
  ): FriendshipWithStatus[] => [
    ...data.friends.map((u) => ({
      ...u,
      status: 'accepted' as const,
    })),
    ...data.sent.map((u) => ({
      ...u,
      status: 'outgoing' as const,
    })),
    ...data.incoming.map((u) => ({
      ...u,
      status: 'incoming' as const,
    })),
  ];

  // Individual friendship actions
  const friendshipActions: Record<FriendshipSection, FriendAction[]> = {
    accepted: [
      {
        label: t('nav.remove'),
        onClick: async (id) => {
          try {
            setFriendLoadingIds((prev) => [...prev, id]);

            await deleteFriend(id, t);

            setFriendshipUsers((prev) => prev.filter((u) => u.id !== id));

            showNotification(t('notification.friendRemoved'), 'success');
          } catch (err: unknown) {
            handleFriendshipError(err);
          } finally {
            setFriendLoadingIds((prev) => prev.filter((x) => x !== id));
          }
        },
      },
    ],

    outgoing: [
      {
        label: t('nav.cancel'),
        onClick: async (id) => {
          try {
            setFriendLoadingIds((prev) => [...prev, id]);

            await deleteFriend(id, t);

            setFriendshipUsers((prev) => prev.filter((u) => u.id !== id));

            showNotification(
              t('notification.friendRequestCancelled'),
              'success',
            );
          } catch (err: unknown) {
            handleFriendshipError(err);
          } finally {
            setFriendLoadingIds((prev) => prev.filter((x) => x !== id));
          }
        },
      },
    ],

    incoming: [
      {
        label: t('nav.accept'),
        onClick: async (id) => {
          try {
            setFriendLoadingIds((prev) => [...prev, id]);

            await acceptFriend(id, t);

            const data = await getFriendships(t);

            setFriendshipUsers(mapFriendships(data));

            showNotification(
              t('notification.friendRequestAccepted'),
              'success',
            );
          } catch (err: unknown) {
            handleFriendshipError(err);
          } finally {
            setFriendLoadingIds((prev) => prev.filter((x) => x !== id));
          }
        },
      },

      {
        label: t('nav.reject'),
        onClick: async (id) => {
          try {
            setFriendLoadingIds((prev) => [...prev, id]);

            await deleteFriend(id, t);

            setFriendshipUsers((prev) => prev.filter((u) => u.id !== id));

            showNotification(
              t('notification.friendRequestRejected'),
              'success',
            );
          } catch (err: unknown) {
            handleFriendshipError(err);
          } finally {
            setFriendLoadingIds((prev) => prev.filter((x) => x !== id));
          }
        },
      },
    ],
  };

  // Local storage for active tabs and subtabs
  useEffect(() => {
    localStorage.setItem('dashboardActiveSection', activeSection);
  }, [activeSection]);

  useEffect(() => {
    localStorage.setItem('dashboardActiveSubsection', activeSubsection);
  }, [activeSubsection]);

  // Fetch all friends
  useEffect(() => {
    if (authLoading) return;
    if (activeSection !== 'friends') return;
    if (!authUser) return;

    let cancelled = false;

    const fetchFriendships = async () => {
      try {
        setLoading(true);

        const data = await getFriendships(t);

        if (cancelled) return;

        setFriendshipUsers(mapFriendships(data));
      } catch (err: unknown) {
        if (cancelled) return;

        const message =
          err instanceof Error ? err.message : t('error.genericError');

        showNotification(message, 'error');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void fetchFriendships();

    return () => {
      cancelled = true;
    };
  }, [activeSection, authLoading, authUser, t, showNotification]);

  // Delete user profile
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

  // Fetch profile details by UserId
  const resolvedUserId = id ?? authUser?.id;

  useEffect(() => {
    if (authLoading) return;
    if (!resolvedUserId) return;

    let cancelled = false;

    const fetchUser = async () => {
      setLoading(true);
      setUserFetched(false);

      try {
        let data: User;

        if (id) {
          data = await getUserbyId(id, t);
        } else {
          if (!authUser) return;
          data = authUser;
        }

        if (!cancelled) {
          setUserData(data);
        }
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : t('error.genericError');

        showNotification(message, 'error');
        setUserData(null);
        void navigate('/');
      } finally {
        if (!cancelled) {
          setLoading(false);
          setUserFetched(true);
        }
      }
    };

    void fetchUser();

    return () => {
      cancelled = true;
    };
  }, [
    resolvedUserId,
    authLoading,
    id,
    authUser,
    t,
    showNotification,
    navigate,
  ]);

  if ((!id && authLoading) || loading) {
    return <StatusBox message={t('common.loading')} className="text-black" />;
  }

  if (!id && !authUser) {
    void navigate('/login');
    return null;
  }

  if (userFetched && !userData) {
    return (
      <StatusBox message={t('error.userNotFound')} className="text-red-600" />
    );
  }

  if (!userData) {
    return null;
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
          onSelectUser={(user) => {
            setFriendshipUsers((prev) => [
              ...prev,
              {
                ...user,
                status: 'outgoing',
              },
            ]);
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
        <div className="mt-16 pb-2 md:mt-20">
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

        {/* Sub-Tabs */}
        <div className="border-b">
          {activeSection === 'friends' && (
            <div className="mb-4 flex justify-center gap-3 sm:gap-12 md:gap-24">
              <SubsectionButton
                label={t('nav.friends')}
                subsection="accepted"
                activeSubsection={activeSubsection}
                setActiveSubsection={setActiveSubsection}
              />

              <SubsectionButton
                label={t('nav.incoming')}
                subsection="incoming"
                activeSubsection={activeSubsection}
                setActiveSubsection={setActiveSubsection}
              />

              <SubsectionButton
                label={t('nav.outgoing')}
                subsection="outgoing"
                activeSubsection={activeSubsection}
                setActiveSubsection={setActiveSubsection}
              />
            </div>
          )}
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
                <div className="order-1 w-full md:order-0 md:w-auto">
                  {hasRole(['chef', 'moderator', 'admin']) && isSelf && (
                    <ModalButton
                      className="w-full rounded-xl border-2 border-slate-600 hover:border-slate-950 md:w-auto"
                      onClick={() => setIsCreateRecipeOpen(true)}
                      text={t('dashboard.createRecipe')}
                    />
                  )}
                </div>

                {/* Right */}
                {(hasRole(['admin']) || isSelf) && (
                  <div className="order-2 flex w-full flex-col gap-2 md:order-0 md:ml-auto md:w-auto md:flex-row">
                    <ModalButton
                      className="w-full rounded-xl border-2 border-slate-600 hover:border-slate-950 md:w-auto"
                      onClick={() => setIsUserEditOpen(true)}
                      text={t('dashboard.editUser')}
                    />

                    <SubmitButton
                      className="w-full rounded-xl border-2 border-slate-600 hover:border-slate-950 md:w-auto"
                      isLoading={loading}
                      defaultText={t('dashboard.submit')}
                      onClick={() => handleDelete(userData.id)}
                      type="button"
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Friends */}
        {activeSection === 'friends' && (
          <div className="flex flex-col">
            {friendshipUsers.filter((u) => u.status === activeSubsection)
              .length === 0 ? (
              <div className="p-4 text-lg font-semibold text-gray-500 italic">
                {t('dashboard.noEntries')}
              </div>
            ) : (
              friendshipUsers
                .filter((u) => u.status === activeSubsection)
                .sort((a, b) => a.display_name.localeCompare(b.display_name))
                .map((listedUser) => (
                  <FriendField
                    key={listedUser.id}
                    user={listedUser}
                    subsection={activeSubsection}
                    actions={friendshipActions[activeSubsection]}
                    isLoading={friendLoadingIds.includes(listedUser.id)}
                    onClick={() => {
                      setActiveSection('profile');
                      void navigate(`/users/${listedUser.id}`);
                    }}
                  />
                ))
            )}

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
