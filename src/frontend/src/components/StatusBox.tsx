import { statusBoxBase } from '../styles/styles';

interface StatusFieldProps {
  message: string;
  className: string;
}

const StatusBox = ({ message, className }: StatusFieldProps) => {
  return (
    <p className={`${statusBoxBase} ${className}`}>
      <strong>{message}</strong>
    </p>
  );
};

export default StatusBox;
