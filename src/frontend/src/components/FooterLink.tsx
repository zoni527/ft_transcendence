import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';

interface FooterLinkProps {
  to: string;
  children: ReactNode;
  className?: string;
}

const FooterLink = ({ to, children, className = '' }: FooterLinkProps) => {
  return (
    <Link
      to={to}
      className={`transition-colors duration-300 hover:text-[#C04D31] ${className}`}
    >
      {children}
    </Link>
  );
};

export default FooterLink;
