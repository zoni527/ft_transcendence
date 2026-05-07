import React from 'react';
import { buttonBase } from '../styles/styles';

interface ModalButtonProps {
  onClick: () => void;
  title?: string;
  text: string;
  disabled?: boolean;
  className?: string;
}

const ModalButton: React.FC<ModalButtonProps> = ({
  onClick,
  text,
  disabled = false,
  title = disabled ? 'Insufficient permissions' : '',
  className = '',
}) => {
  return (
    <button
      title={title}
      onClick={onClick}
      className={`${buttonBase} ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'} ${className}`}
      disabled={disabled}
    >
      {text}
    </button>
  );
};

export default ModalButton;
