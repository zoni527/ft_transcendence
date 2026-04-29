import { useTranslation } from 'react-i18next';
import LangDropdown from './LangDropDown';
import NavButton from './NavButton';
import { cardBase, buttonBase, navLeftBase } from '../styles/styles';

const Navbar = () => {
  const { t } = useTranslation();

  return (
    <nav
      className={`${cardBase} mt-2 flex items-center justify-between px-6 py-4`}
    >
      {/* Left Side */}
      <div className="flex gap-6 text-xl font-semibold">
        <NavButton path="/" className={`${navLeftBase}`}>
          {t('nav.recipes')}
        </NavButton>
        <NavButton path="/dashboard" className={`${navLeftBase}`}>
          {t('nav.dashboard')}
        </NavButton>
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-4">
        <NavButton path="/signup" className={`${buttonBase}`}>
          {t('nav.signup')}
        </NavButton>
        <NavButton path="/login" className={`${buttonBase}`}>
          {t('nav.login')}
        </NavButton>
        <LangDropdown />
      </div>
    </nav>
  );
};

export default Navbar;
