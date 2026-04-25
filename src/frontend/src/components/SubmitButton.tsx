import { buttonBase } from '../styles/styles';

interface SubmitButtonProps {
  isLoading: boolean;
  defaultText: string;
  pendingText: string;
}

const SubmitButton = ({
  isLoading,
  defaultText,
  pendingText,
}: SubmitButtonProps) => {
  return (
    <button type="submit" className={buttonBase} disabled={isLoading}>
      {isLoading ? `${pendingText}` : `${defaultText}`}
    </button>
  );
};

export default SubmitButton;
