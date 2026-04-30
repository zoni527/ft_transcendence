import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';

interface NavButtonProps {
  to: string;
  children: ReactNode;
  className: string;
}

const NavButton = ({ to, className, children }: NavButtonProps) => {
  return (
    <Link to={to} className={className}>
      {children}
    </Link>
  );
};

export default NavButton;
