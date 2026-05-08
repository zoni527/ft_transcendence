import React from 'react';
import { useTranslation } from 'react-i18next';
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
  title,
  className = '',
}) => {
  const { t } = useTranslation();

  const resolvedTitle =
    title ?? (disabled ? t('info.insufficientPermissions') : '');

  return (
    <button
      title={resolvedTitle}
      onClick={onClick}
      className={`${buttonBase} ${
        disabled ? 'cursor-not-allowed opacity-30' : 'cursor-pointer'
      } ${className}`}
      disabled={disabled}
    >
      {text}
    </button>
  );
};

export default ModalButton;
