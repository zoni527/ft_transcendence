import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import AdminUserField from '../components/AdminUserField.tsx';
import AdminRecipeField from '../components/AdminRecipeField.tsx';
import StatusBox from '../components/StatusBox';
import { useAuth } from '../utils/AuthContext';
import { getUsers, getRecipes } from '../api';
import { useNotification } from '../utils/NotifContext.ts';
import type { User, Recipe } from '../types/types';
import { cardBase } from '../styles/styles';

const AdminPanel = () => {
  const { user, hasRole, loading: authLoading } = useAuth();
  const { showNotification } = useNotification();
  const [users, setUsers] = useState<User[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<'users' | 'recipes'>(
    'users',
  );
  const [sortBy, setSortBy] = useState<'name' | 'username'>('name');
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
        const [usersData, recipesData] = await Promise.all([
          getUsers(t),
          getRecipes(t),
        ]);

        if (cancelled) return;

        setUsers([...usersData].sort((a, b) => a.name.localeCompare(b.name)));
        setRecipes(
          [...recipesData].sort((a, b) => a.title.localeCompare(b.title)),
        );
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

  const sortedUsers = useMemo(() => {
    return [...users].sort((a, b) =>
      sortBy === 'name'
        ? a.name.localeCompare(b.name)
        : a.display_name.localeCompare(b.display_name),
    );
  }, [users, sortBy]);

  if (loading || authLoading) {
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

  return (
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
        {t('adminPanel.header')}
      </h1>

      {/* Section Tabs */}
      <div className="mt-16 flex flex-col gap-4 border-b pb-2 md:mt-32 md:flex-row md:gap-8">
        <button
          onClick={() => setActiveSection('users')}
          className={`text-2xl font-bold transition-colors hover:cursor-pointer ${
            activeSection === 'users'
              ? 'text-[#C04D31]'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          {t('adminPanel.users')}
        </button>

        <button
          onClick={() => setActiveSection('recipes')}
          className={`text-2xl font-bold transition-colors hover:cursor-pointer ${
            activeSection === 'recipes'
              ? 'text-[#C04D31]'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          {t('adminPanel.recipes')}
        </button>
      </div>

      {/* Sort Controls */}
      {activeSection === 'users' && (
        <div className="mt-6 flex w-full justify-center md:justify-start">
          <div className="flex flex-col items-center gap-3 md:flex-row md:items-start md:gap-6">
            <button
              onClick={() => setSortBy('name')}
              className={`text-lg font-bold transition-colors hover:cursor-pointer md:w-64 md:text-left ${
                sortBy === 'name'
                  ? 'text-[#C04D31]'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {t('adminPanel.sortFullName')}
            </button>

            <button
              onClick={() => setSortBy('username')}
              className={`text-lg font-bold transition-colors hover:cursor-pointer md:w-64 md:text-left ${
                sortBy === 'username'
                  ? 'text-[#C04D31]'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {t('adminPanel.sortUsername')}
            </button>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="mt-10 flex flex-col gap-4">
        {activeSection === 'users' &&
          sortedUsers.map((listedUser) => (
            <AdminUserField
              key={listedUser.id}
              user={listedUser}
              onDelete={(id) =>
                setUsers((prev) => prev.filter((u) => u.id !== id))
              }
              onUpdate={(updatedUser) =>
                setUsers((prev) =>
                  prev.map((u) => (u.id === updatedUser.id ? updatedUser : u)),
                )
              }
            />
          ))}

        {activeSection === 'recipes' &&
          recipes.map((recipe) => (
            <AdminRecipeField
              key={recipe.id}
              recipe={recipe}
              onDelete={(id) =>
                setRecipes((prev) => prev.filter((r) => r.id !== id))
              }
              onUpdate={(updatedRecipe) =>
                setRecipes((prev) =>
                  [
                    ...prev.map((r) =>
                      r.id === updatedRecipe.id ? updatedRecipe : r,
                    ),
                  ].sort((a, b) => a.title.localeCompare(b.title)),
                )
              }
            />
          ))}
      </div>
    </div>
  );
};

export default AdminPanel;
