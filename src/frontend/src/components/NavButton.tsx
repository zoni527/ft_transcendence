import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

interface NavButtonProps {
  path: string;
  children: ReactNode;
  className: string;
}

const NavButton = ({ path, className, children }: NavButtonProps) => {
  const navigate = useNavigate();

  const handleNavigation = () => {
    void navigate(path);
  };

  return (
    <button onClick={handleNavigation} className={`${className}`}>
      {children}
    </button>
  );
};

export default NavButton;
