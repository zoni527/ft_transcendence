import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LangDropdown from './LangDropDown';
import NavButton from './NavButton';
import SearchField from './SearchField.tsx';
import { useAuth } from '../utils/AuthContext';
import { getSearch, postLogout } from '../api.tsx';
import type { getSearchResponse } from '../api.tsx';
import { useNotification } from '../utils/NotifContext.ts';
import { cardBase, buttonBase, navLeftBase } from '../styles/styles';

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { showNotification } = useNotification();
  const navigate = useNavigate();
  const { user, logout, hasRole, loading } = useAuth();
  const { t } = useTranslation();

  const [results, setResults] = useState<getSearchResponse[]>([]);
  const [open, setOpen] = useState(false);

  const handleSelectUser = (id: string) => {
    setOpen(false);
    setResults([]);
    void navigate(`/users/${id}`);
  };

  const handleSearch = (query: string) => {
    if (loading) return;

    getSearch(query, t)
      .then((found) => {
        setResults(found);
        setOpen(true);
      })
      .catch((err: unknown) => {
        const message =
          err instanceof Error ? err.message : t('error.genericError');

        showNotification(message, 'error');
      });
  };

  const handleLogout = () => {
    postLogout(t)
      .then(() => {
        logout();

        showNotification(t('notification.logoutSuccess'), 'success');
        void navigate('/');
      })
      .catch((err: unknown) => {
        const message =
          err instanceof Error ? err.message : t('error.genericError');

        showNotification(message, 'error');
      });
  };

  return (
    <nav className={`${cardBase} mt-2 px-4 py-3`}>
      <div className="relative flex items-center">
        {/* Left (Desktop only) */}
        <div className="hidden text-xl font-semibold md:flex">
          <NavButton path="/?reset=1" className={navLeftBase}>
            {t('nav.recipes')}
          </NavButton>
        </div>

        <div className="relative w-full md:w-auto">
          <SearchField onSearch={handleSearch} />

          {open && results.length > 0 && (
            <ul className="absolute left-0 z-50 mt-2 w-full rounded-md border bg-white shadow-lg">
              {results.map((user) => (
                <li
                  key={user.id}
                  onClick={() => handleSelectUser(user.id)}
                  className="cursor-pointer px-4 py-2 hover:bg-gray-100"
                >
                  {user.username}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Center (Mobile only) */}
        <div className="flex w-full justify-center text-xl font-semibold md:hidden">
          <NavButton path="/" className={navLeftBase}>
            {t('nav.recipes')}
          </NavButton>
        </div>

        {/* Right (Desktop menu) */}
        <div className="hidden items-center gap-4 sm:ml-auto md:flex">
          {user && hasRole(['admin']) && (
            <NavButton
              path="/admin"
              className={`${buttonBase} rounded-full border-3 border-orange-700 hover:border-orange-800`}
            >
              {t('nav.admin')}
            </NavButton>
          )}

          {loading ? null : !user ? (
            <NavButton
              path="/signup"
              className={`${buttonBase} rounded-full border-3 border-orange-700 hover:border-orange-800`}
            >
              {t('nav.signup')}
            </NavButton>
          ) : (
            <NavButton
              path="/me"
              className={`${buttonBase} rounded-full border-3 border-orange-700 hover:border-orange-800`}
            >
              {t('nav.dashboard')}
            </NavButton>
          )}

          {loading ? null : !user ? (
            <NavButton
              path="/login"
              className={`${buttonBase} rounded-full border-3 border-orange-700 hover:border-orange-800`}
            >
              {t('nav.login')}
            </NavButton>
          ) : (
            <NavButton
              onClick={handleLogout}
              className={`${buttonBase} rounded-full border-3 border-orange-700 hover:border-orange-800`}
            >
              {t('nav.logout')}
            </NavButton>
          )}

          <LangDropdown />
        </div>

        {/* Mobile hamburger */}
        <button
          className="absolute right-0 hover:cursor-pointer md:hidden"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="mt-4 flex flex-col items-center gap-3 md:hidden">
          {user && hasRole(['admin']) && (
            <NavButton
              path="/admin"
              onClick={() => {
                setMenuOpen(false);
              }}
              className={`${buttonBase} w-full rounded-full border-3 border-orange-700 hover:border-orange-800`}
            >
              {t('nav.admin')}
            </NavButton>
          )}

          {!user ? (
            <NavButton
              path="/signup"
              onClick={() => {
                setMenuOpen(false);
              }}
              className={`${buttonBase} w-full rounded-full border-3 border-orange-700 hover:border-orange-800`}
            >
              {t('nav.signup')}
            </NavButton>
          ) : (
            <NavButton
              path="/me"
              onClick={() => {
                setMenuOpen(false);
              }}
              className={`${buttonBase} w-full rounded-full border-3 border-orange-700 hover:border-orange-800`}
            >
              {t('nav.dashboard')}
            </NavButton>
          )}
          {!user ? (
            <NavButton
              path="/login"
              onClick={() => {
                setMenuOpen(false);
              }}
              className={`${buttonBase} w-full rounded-full border-3 border-orange-700 hover:border-orange-800`}
            >
              {t('nav.login')}
            </NavButton>
          ) : (
            <NavButton
              className={`${buttonBase} w-full rounded-full border-3 border-orange-700 hover:border-orange-800`}
              onClick={() => {
                setMenuOpen(false);
                handleLogout();
              }}
            >
              {t('nav.logout')}
            </NavButton>
          )}
          <LangDropdown />
        </div>
      )}
    </nav>
  );
};

export default Navbar;
