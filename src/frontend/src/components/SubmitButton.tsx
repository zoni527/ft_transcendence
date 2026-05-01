import { buttonBase } from '../styles/styles';

interface SubmitButtonProps {
  isLoading: boolean;
  defaultText: string;
  pendingText: string;
  onClick?: () => void;
  type?: 'button' | 'submit';
}

const SubmitButton = ({
  isLoading,
  defaultText,
  pendingText,
  onClick,
  type = 'submit',
}: SubmitButtonProps) => {
  return (
    <button
      type={type}
      className={`${buttonBase}${isLoading ? 'cursor-not-allowed opacity-50 hover:bg-inherit' : ''}`}
      disabled={isLoading}
      aria-busy={isLoading}
      onClick={onClick}
    >
      {isLoading ? `${pendingText}` : `${defaultText}`}
    </button>
  );
};

export default SubmitButton;
