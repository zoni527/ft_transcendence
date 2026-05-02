import { useEffect } from 'react';
import type { NotificationVariant } from '../utils/NotifContext';

type NotificationProps = {
  message: string;
  onClose: () => void;
  variant: NotificationVariant;
};

const variantStyles: Record<NotificationVariant, string> = {
  error: 'bg-red-600',
  success: 'bg-green-600',
  warning: 'bg-yellow-500 text-black',
  info: 'bg-blue-600',
};

const Notification = ({ message, onClose, variant }: NotificationProps) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={`fixed right-5 bottom-5 z-1000 rounded-md px-4 py-2 text-lg font-semibold text-white shadow-lg ${
        variantStyles[variant]
      }`}
    >
      {message}
    </div>
  );
};

export default Notification;
