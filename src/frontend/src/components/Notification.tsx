import { useEffect } from 'react';
import type { NotificationVariant } from '../utils/NotifContext.ts';

type NotificationProps = {
  message: string;
  onClose: () => void;
  variant: NotificationVariant;
};

const variantStyles: Record<NotificationVariant, string> = {
  error: 'bg-red-600 text-white',
  success: 'bg-green-600 text-white',
  info: 'bg-yellow-400 text-gray-800',
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
      className={`fixed right-0 bottom-5 left-0 z-50 mx-4 rounded-md border-2 border-slate-800 px-4 py-2 text-lg font-semibold shadow-lg sm:right-5 sm:left-auto sm:mx-0 sm:w-auto ${
        variantStyles[variant]
      }`}
    >
      {message}
    </div>
  );
};

export default Notification;
