import React from 'react';
import { buttonBase } from '../styles/styles';

interface ModalButtonProps {
  onClick: () => void;
  text: string;
  disabled?: boolean;
  className?: string;
}

const ModalButton: React.FC<ModalButtonProps> = ({
  onClick,
  text,
  disabled = false,
  className = '',
}) => {
  return (
    <button
      onClick={onClick}
      className={`${buttonBase} ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'} ${className}`}
      disabled={disabled}
    >
      {text}
    </button>
  );
};

export default ModalButton;
