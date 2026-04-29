import { useTranslation } from 'react-i18next';
import LangDropdown from './LangDropDown';
import NavLink from './NavLink';
import { cardBase, buttonBase, navLeftBase } from '../styles/styles';

const Navbar = () => {
  const { t } = useTranslation();

  return (
    <nav
      className={`${cardBase} mt-2 flex items-center justify-between px-6 py-4`}
    >
      {/* Left Side */}
      <div className="flex gap-6 text-xl font-semibold">
        <NavLink to="/" className={`${navLeftBase}`}>
          {t('nav.recipes')}
        </NavLink>
        <NavLink to="/dashboard" className={`${navLeftBase}`}>
          {t('nav.dashboard')}
        </NavLink>
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-4">
        <NavLink to="/signup" className={`${buttonBase}`}>
          {t('nav.signup')}
        </NavLink>
        <NavLink to="/login" className={`${buttonBase}`}>
          {t('nav.login')}
        </NavLink>
        <LangDropdown />
      </div>
    </nav>
  );
};

export default Navbar;
