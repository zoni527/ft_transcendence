const Footer = ({ className = '' }) => {
  return (
    <footer
      className={`bg-surface-container-low border-outline-variant/30 w-full border-t py-10 ${className}`}
    >
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-12 px-12 text-center md:flex-row md:text-left">
        {/* Logo */}
        <div className="text-3xl leading-none text-[#C04D31]">rise.</div>

        {/* Links */}
        <div className="font-label text-on-surface-variant flex flex-wrap justify-center gap-8 text-xs font-bold tracking-widest uppercase">
          <a
            href="/privacy"
            className="hover:text-primary transition-colors duration-300"
          >
            Privacy
          </a>
          <a
            href="/terms"
            className="hover:text-primary transition-colors duration-300"
          >
            Terms
          </a>
          <a
            href="/contact"
            className="hover:text-primary transition-colors duration-300"
          >
            Contact
          </a>
        </div>

        {/* Copyright */}
        <div className="font-label text-outline text-xs font-medium tracking-widest uppercase">
          © {new Date().getFullYear()} RISE. All Rights Reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
