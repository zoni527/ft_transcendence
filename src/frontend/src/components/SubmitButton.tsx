import React from 'react';
import { buttonBase } from '../styles/styles';

interface SubmitButtonProps {
  isLoading: boolean;
  defaultText: string;
  pendingText: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  type?: 'button' | 'submit';
  disabled?: boolean;
  className?: string; // 👈 add this
}

const SubmitButton = ({
  isLoading,
  defaultText,
  pendingText,
  onClick,
  type = 'submit',
  disabled = false,
  className = '', // 👈 default empty
}: SubmitButtonProps) => {
  return (
    <button
      type={type}
      className={` ${buttonBase} ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'} ${className} `}
      disabled={isLoading || disabled}
      aria-busy={isLoading}
      onClick={onClick}
    >
      {isLoading ? pendingText : defaultText}
    </button>
  );
};

export default SubmitButton;
