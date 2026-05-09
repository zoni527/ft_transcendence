import { useNavigate } from 'react-router-dom';
import type { ReactNode, MouseEvent } from 'react';

interface NavButtonProps {
  path?: string;
  children: ReactNode;
  className: string;
  onClick?: () => void;
  disabled?: boolean;
}

const NavButton = ({
  path,
  className,
  children,
  onClick,
  disabled = false,
}: NavButtonProps) => {
  const navigate = useNavigate();

  // Handle navigation when the button is clicked
  const handleNavigation = (e: MouseEvent) => {
    if (e.button === 1 || e.ctrlKey || e.metaKey) {
      return;
    }

    e.preventDefault();

    if (disabled) return;

    onClick?.();

    if (path) {
      void navigate(path);
    }
  };

  // If `path` is provided, use an anchor element
  if (path) {
    return (
      <a
        href={path}
        onClick={handleNavigation}
        className={`${className} ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
        aria-disabled={disabled}
      >
        {children}
      </a>
    );
  }

  // If no `path` is provided, render as a button and handle `onClick` directly
  return (
    <button
      onClick={handleNavigation}
      className={`${className} ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export default NavButton;
