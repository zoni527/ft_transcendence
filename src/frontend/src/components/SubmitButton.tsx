import React from 'react';
import { useTranslation } from 'react-i18next';
import { buttonBase } from '../styles/styles';

interface SubmitButtonProps {
  isLoading: boolean;
  defaultText: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  type?: 'button' | 'submit';
  disabled?: boolean;
  className?: string;
  title?: string;
}

const SubmitButton = ({
  isLoading,
  defaultText,
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
      className={` ${buttonBase} ${disabled ? 'cursor-not-allowed opacity-30' : 'cursor-pointer'} relative flex items-center justify-center ${className} `}
      disabled={isLoading || disabled}
      aria-busy={isLoading}
      onClick={onClick}
    >
      {isLoading ? (
        <>
          {/* Invisible text keeps original button width */}
          <span className="invisible">{defaultText}</span>

          {/* Loader overlay */}
          <div className="absolute inset-0 flex items-center justify-center space-x-1">
            <div className="h-2.5 w-2.5 animate-bounce rounded-full bg-current [animation-delay:-0.3s]" />
            <div className="h-2.5 w-2.5 animate-bounce rounded-full bg-current [animation-delay:-0.15s]" />
            <div className="h-2.5 w-2.5 animate-bounce rounded-full bg-current" />
          </div>
        </>
      ) : (
        defaultText
      )}
    </button>
  );
};

export default SubmitButton;
