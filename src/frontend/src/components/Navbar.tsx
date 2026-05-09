import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LangDropdown from './LangDropDown';
import NavButton from './NavButton';
import { useAuth } from '../utils/AuthContext';
import { postLogout } from '../api.tsx';
import { useNotification } from '../utils/NotifContext.ts';
import { cardBase, buttonBase, navLeftBase } from '../styles/styles';

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  const { showNotification } = useNotification();
  const navigate = useNavigate();
  const { user, logout, hasRole } = useAuth();
  const { t } = useTranslation();

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
      <div className="relative flex items-center justify-center">
        {/* Centered Recipes Button */}
        <div className="flex text-xl font-semibold">
          <NavButton path="/" className={navLeftBase}>
            {t('nav.recipes')}
          </NavButton>
        </div>

        {/* Desktop Right Menu */}
        <div className="absolute right-0 hidden items-center gap-4 sm:flex">
          {user && hasRole(['admin']) && (
            <NavButton
              path="/admin"
              className={`${buttonBase} rounded-full bg-orange-700 hover:bg-orange-800`}
            >
              {t('nav.admin')}
            </NavButton>
          )}

          {!user ? (
            <NavButton
              path="/signup"
              className={`${buttonBase} rounded-full bg-orange-700 hover:bg-orange-800`}
            >
              {t('nav.signup')}
            </NavButton>
          ) : (
            <NavButton
              path="/me"
              className={`${buttonBase} rounded-full bg-orange-700 hover:bg-orange-800`}
            >
              {t('nav.dashboard')}
            </NavButton>
          )}

          {!user ? (
            <NavButton
              path="/login"
              className={`${buttonBase} rounded-full bg-orange-700 hover:bg-orange-800`}
            >
              {t('nav.login')}
            </NavButton>
          ) : (
            <NavButton
              className={`${buttonBase} rounded-full bg-orange-700 hover:bg-orange-800`}
              onClick={handleLogout}
            >
              {t('nav.logout')}
            </NavButton>
          )}

          <LangDropdown />
        </div>

        {/* Mobile Hamburger */}
        <button
          className="absolute right-0 sm:hidden"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Dropdown */}
      {menuOpen && (
        <div className="mt-4 flex flex-col items-center gap-3 sm:hidden">
          {user && hasRole(['admin']) && (
            <NavButton
              path="/admin"
              onClick={() => {
                setMenuOpen(false);
              }}
              className={`${buttonBase} w-full rounded-full bg-orange-700 hover:bg-orange-800`}
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
              className={`${buttonBase} w-full rounded-full bg-orange-700 hover:bg-orange-800`}
            >
              {t('nav.signup')}
            </NavButton>
          ) : (
            <NavButton
              path="/me"
              onClick={() => {
                setMenuOpen(false);
              }}
              className={`${buttonBase} w-full rounded-full bg-orange-700 hover:bg-orange-800`}
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
              className={`${buttonBase} w-full rounded-full bg-orange-700 hover:bg-orange-800`}
            >
              {t('nav.login')}
            </NavButton>
          ) : (
            <NavButton
              className={`${buttonBase} w-full rounded-full bg-orange-700 hover:bg-orange-800`}
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
