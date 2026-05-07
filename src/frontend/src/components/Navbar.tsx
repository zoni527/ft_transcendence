import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LangDropdown from './LangDropDown';
import NavButton from './NavButton';
import { useAuth } from '../utils/AuthContext';
import { postLogout } from '../api.tsx';
import { useNotification } from '../utils/NotifContext.ts';
import { cardBase, buttonBase, navLeftBase } from '../styles/styles';

const Navbar = () => {
  const { showNotification } = useNotification();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
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
    <nav
      className={`${cardBase} mt-2 flex items-center justify-between px-6 py-4`}
    >
      {/* Left Side */}
      <div className="flex gap-6 text-xl font-semibold">
        <NavButton path="/" className={`${navLeftBase}`}>
          {t('nav.recipes')}
        </NavButton>
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-4">
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
    </nav>
  );
};

export default Navbar;
