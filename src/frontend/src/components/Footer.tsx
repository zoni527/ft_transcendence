import { useTranslation } from 'react-i18next';
import FooterLink from './FooterLink';

const Footer = ({ className = '' }) => {
  const { t } = useTranslation();

  return (
    <footer
      className={`bg-surface-container-low border-outline-variant/30 w-full border-t py-6 sm:py-10 ${className}`}
    >
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-4 text-center md:flex-row md:gap-12 md:px-12 md:text-left">
        {/* Logo */}
        <div className="text-3xl leading-none text-[#C04D31] sm:text-4xl">
          rise.
        </div>

        {/* Links */}
        <div className="font-label text-on-surface-variant flex flex-wrap justify-center gap-4 text-xs font-bold tracking-widest uppercase sm:gap-8 sm:text-sm">
          <FooterLink to="/privacy">{t('footer.privacy')}</FooterLink>
          <FooterLink to="/terms">{t('footer.terms')}</FooterLink>
        </div>

        {/* Copyright */}
        <div className="font-label text-outline text-xs font-medium tracking-widest uppercase sm:text-sm">
          © {new Date().getFullYear()} {t('common.rightsReserved')}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
