import { useEffect } from 'react';
import type { NotificationVariant } from '../utils/NotifContext.ts';

type NotificationProps = {
  message: string;
  onClose: () => void;
  variant: NotificationVariant;
};

const variantStyles: Record<NotificationVariant, string> = {
  error: 'bg-red-600',
  success: 'bg-green-600',
  warning: 'bg-orange-600',
  info: 'bg-yellow-600',
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
      className={`fixed right-0 bottom-5 left-0 z-50 mx-4 rounded-md border-2 border-slate-800 px-4 py-2 text-lg font-semibold text-white shadow-lg sm:right-5 sm:left-auto sm:mx-0 sm:w-auto ${
        variantStyles[variant]
      }`}
    >
      {message}
    </div>
  );
};

export default Notification;
