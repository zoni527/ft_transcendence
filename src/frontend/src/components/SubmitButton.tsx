import React from 'react';
import { useTranslation } from 'react-i18next';
import { buttonBase } from '../styles/styles';

interface SubmitButtonProps {
  isLoading: boolean;
  defaultText: string;
  pendingText: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  type?: 'button' | 'submit';
  disabled?: boolean;
  className?: string;
  title?: string;
}

const SubmitButton = ({
  isLoading,
  defaultText,
  pendingText,
  onClick,
  type = 'submit',
  disabled = false,
  title,
  className = '',
}: SubmitButtonProps) => {
  const { t } = useTranslation();

  const resolvedTitle =
    title ?? (disabled ? t('info.insufficientPermissions') : '');

  return (
    <button
      title={resolvedTitle}
      type={type}
      className={`${buttonBase} ${disabled ? 'cursor-not-allowed opacity-30' : 'cursor-pointer'} ${className}`}
      disabled={isLoading || disabled}
      aria-busy={isLoading}
      onClick={onClick}
    >
      {isLoading ? pendingText : defaultText}
    </button>
  );
};

export default SubmitButton;
