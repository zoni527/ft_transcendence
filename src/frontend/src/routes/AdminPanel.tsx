import { useEffect, useState } from 'react';
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
  const { user, hasRole } = useAuth();
  const { showNotification } = useNotification();

  const [users, setUsers] = useState<User[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);

  const [loading, setLoading] = useState(true);

  // active tab
  const [activeSection, setActiveSection] = useState<'users' | 'recipes'>(
    'users',
  );

  const { t } = useTranslation();

  useEffect(() => {
    Promise.all([getUsers(t), getRecipes(t)])
      .then(([usersData, recipesData]) => {
        setUsers(usersData);
        setRecipes(recipesData);
      })
      .catch((err: unknown) => {
        const message =
          err instanceof Error ? err.message : t('error.genericError');

        showNotification(message, 'error');
      })
      .finally(() => setLoading(false));
  }, [t, showNotification]);

  if (loading) {
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
      <div className="absolute top-8 right-8">
        <img
          src={user.avatar_url}
          alt={`${user.name}'s avatar`}
          className="h-28 w-28 rounded-full border-2 border-gray-300"
        />
      </div>

      {/* Main Header */}
      <h1 className="mb-8 text-3xl font-bold text-[#C04D31]">
        {t('adminPanel.header')}
      </h1>

      {/* Section Tabs */}
      <div className="mt-28 flex gap-8 border-b pb-2">
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

      {/* Content */}
      <div className="mt-8 flex flex-col gap-4">
        {activeSection === 'users' &&
          users.map((user) => <AdminUserField key={user.id} user={user} />)}

        {activeSection === 'recipes' &&
          recipes.map((recipe) => (
            <AdminRecipeField key={recipe.id} recipe={recipe} />
          ))}
      </div>
    </div>
  );
};

export default AdminPanel;
