import { useTranslation } from 'react-i18next';
import FooterLink from './FooterLink';

const Footer = ({ className = '' }) => {
  const { t } = useTranslation();

  return (
    <footer
      className={`bg-surface-container-low border-outline-variant/30 w-full border-t py-10 ${className}`}
    >
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-12 px-12 text-center md:flex-row md:text-left">
        {/* Logo */}
        <div className="text-4xl leading-none text-[#C04D31]">rise.</div>
        {/* Links */}
        <div className="font-label text-on-surface-variant flex flex-wrap justify-center gap-8 text-sm font-bold tracking-widest uppercase">
          <FooterLink to="/privacy">{t('footer.privacy')}</FooterLink>
          <FooterLink to="/terms">{t('footer.terms')}</FooterLink>
        </div>

        {/* Copyright */}
        <div className="font-label text-outline text-sm font-medium tracking-widest uppercase">
          © {new Date().getFullYear()} {t('common.rightsReserved')}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
