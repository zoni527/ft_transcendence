import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useNotification } from '../utils/NotifContext';
import FriendField from '../components/FriendField';
import StatusBox from '../components/StatusBox';
import SubmitButton from '../components/SubmitButton';
import { getUsers } from '../api';
import { useAuth } from '../utils/AuthContext';
import type { User } from '../types/types';
import { cardBase } from '../styles/styles';

const Friends = () => {
  const { id } = useParams<{ id: string }>();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const { user, hasRole, loading: authLoading } = useAuth();
  const { showNotification } = useNotification();
  const { t } = useTranslation();

  useEffect(() => {
    if (authLoading) return;

    const fetchData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      if (!hasRole(['admin'])) {
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
  }, [authLoading, user, hasRole, t, showNotification]);

  if ((!id && authLoading) || loading) {
    return <StatusBox message={t('common.loading')} className="text-black" />;
  }

  if (!user) {
    return (
      <StatusBox message={t('error.userNotFound')} className="text-red-600" />
    );
  }

  return (
    <>
      <div className={`${cardBase} relative mt-8 p-8 wrap-anywhere`}>
        {/* Avatar */}
        <div className="relative mb-8 flex flex-col items-center gap-4 md:absolute md:top-8 md:right-12 md:mb-0 md:items-end">
          <img
            src={user.avatar_url}
            alt={`${user.name}'s avatar`}
            className="h-28 w-28 rounded-full border-2 border-slate-600"
          />
        </div>

        {/* Online/Offline Indicator */}
        <div
          className={`absolute top-8 right-8 h-4 w-4 rounded-full border-2 border-slate-950 ${
            user.is_online ? 'bg-green-500' : 'bg-red-500'
          }`}
          title={user.is_online ? 'Online' : 'Offline'}
        />

        {/* Header */}
        <h1 className="text-center text-3xl font-bold text-[#C04D31] md:text-left">
          {t('friends.header')}
        </h1>

        {/* Friends Section */}
        <div className="mt-16 space-y-6 md:mt-32">
          {/* Content */}
          <div className="mt-8 flex flex-col gap-4">
            {users.map((listedUser) => (
              <FriendField key={listedUser.id} user={listedUser} />
            ))}

            {/* Bottom Section */}
            <div className="mt-16 flex w-full flex-col gap-4 md:flex-row md:items-center md:justify-between">
              {/* Left */}
              <SubmitButton
                className="rounded-xl border-2 border-slate-600 hover:border-slate-950"
                isLoading={loading}
                defaultText={t('dashboard.submit')}
                type="button"
              />

              {/* Right */}
              <div className="order-2 flex flex-col gap-2 md:order-0 md:flex-row">
                <SubmitButton
                  className="rounded-xl border-2 border-slate-600 hover:border-slate-950"
                  isLoading={loading}
                  defaultText={t('dashboard.submit')}
                  type="button"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Friends;
