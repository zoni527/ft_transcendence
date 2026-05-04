import { Link } from 'react-router-dom';
import type { ReactNode, MouseEvent } from 'react';

interface NavButtonProps {
  to?: string;
  children: ReactNode;
  className: string;
  onClick?: () => void;
  disabled?: boolean;
}

const NavButton = ({
  to,
  className,
  children,
  onClick,
  disabled = false,
}: NavButtonProps) => {

  // Handle navigation when the button is clicked
  const handleNavigation = (e: MouseEvent) => {
    if (disabled) {
      e.preventDefault();
      return;
    }

    // If `onClick` is provided, use it (for custom actions like logout)
    if (onClick) {
      e.preventDefault();
      onClick();
    }
  };

  // If `to` is provided, use an anchor element
  if (to) {
    return (
      <Link
        to={to}
        onClick={handleNavigation}
        className={`${className} ${disabled ? 'pointer-events-none cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
        aria-disabled={disabled}
      >
        {children}
      </Link>
    );
  }

  // If no `path` is provided, render as a button and handle `onClick` directly
  return (
    <Link
      onClick={handleNavigation}
      className={`${className} ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
      disabled={disabled}
    >
      {children}
    </Link>
  );
};

export default NavButton;
