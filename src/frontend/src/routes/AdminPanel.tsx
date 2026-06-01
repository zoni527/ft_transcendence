import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import AdminUserField from '../components/AdminUserField.tsx';
import AdminRecipeField from '../components/AdminRecipeField.tsx';
import SectionButton from '../components/SectionButton.tsx';
import SortButtons from '../components/SortButtons.tsx';
import StatusBox from '../components/StatusBox';
import UserStatus from '../components/UserStatus.tsx';
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
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [sortBy, setSortBy] = useState<'name' | 'username'>('name');
  const [activeSection, setActiveSection] = useState<'users' | 'recipes'>(
    () => {
      return (
        (localStorage.getItem('adminActiveSection') as 'users' | 'recipes') ||
        'recipes'
      );
    },
  );

  useEffect(() => {
    localStorage.setItem('adminActiveSection', activeSection);
  }, [activeSection]);

  // Fetches recipes and users
  useEffect(() => {
    const controller = new AbortController();

    const fetchData = async () => {
      if (authLoading) return;

      if (!user) {
        setLoading(false);
        return;
      }

      if (!hasRole(['admin'])) {
        setLoading(false);
        return;
      }

      try {
        const [usersData, recipesData] = await Promise.all([
          getUsers(t, controller.signal),
          getRecipes(t, controller.signal),
        ]);

        if (controller.signal.aborted) return;

        setUsers([...usersData].sort((a, b) => a.name.localeCompare(b.name)));
        setRecipes(
          [...recipesData].sort((a, b) => a.title.localeCompare(b.title)),
        );
      } catch (err: unknown) {
        if (controller.signal.aborted) return;

        const message =
          err instanceof Error ? err.message : t('error.genericError');

        showNotification(message, 'error');
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    void fetchData();

    return () => {
      controller.abort();
    };
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

  if (!hasRole(['admin']) || !user) {
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
      <UserStatus
        isOnline={user.is_online}
        className={'absolute top-8 right-8'}
      />

      {/* Header */}
      <h1 className="text-center text-3xl font-bold text-[#C04D31] md:text-left">
        {t('adminPanel.header')}
      </h1>

      {/* Tabs */}
      <div className="mt-16 border-b pb-2 md:mt-20">
        <div className="mb-4 flex justify-center gap-8 md:gap-24">
          <SectionButton
            label={t('adminPanel.recipes')}
            section="recipes"
            activeSection={activeSection}
            setActiveSection={setActiveSection}
          />

          <SectionButton
            label={t('adminPanel.users')}
            section="users"
            activeSection={activeSection}
            setActiveSection={setActiveSection}
          />
        </div>
      </div>

      {/* Sort Controls */}
      {activeSection === 'users' && (
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
      <div className="mt-12 flex flex-col">
        {/* Recipes */}
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
              onClick={() => {
                void navigate(`/recipes/${recipe.id}`);
              }}
            />
          ))}

        {/* Users */}
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
              onClick={() => {
                void navigate(`/users/${listedUser.id}`);
              }}
            />
          ))}
      </div>
    </div>
  );
};

export default AdminPanel;
