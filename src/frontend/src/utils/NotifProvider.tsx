import { useState, useMemo, type ReactNode } from 'react';
import Notification from '../components/Notification';
import { NotificationContext } from './NotifContext';
import type { NotificationVariant } from './NotifContext';

type NotificationState = {
  message: string;
  variant: NotificationVariant;
} | null;

type Props = {
  children: ReactNode;
};

const NotificationProvider = ({ children }: Props) => {
  const [notification, setNotification] = useState<NotificationState>(null);

  const showNotification = (msg: string, variant: NotificationVariant) => {
    setNotification({ message: msg, variant });
  };

  const clear = () => setNotification(null);

  const value = useMemo(() => ({ showNotification }), []);

  return (
    <NotificationContext.Provider value={value}>
      {children}

      {notification && (
        <Notification
          message={notification.message}
          variant={notification.variant}
          onClose={clear}
        />
      )}
    </NotificationContext.Provider>
  );
};

export default NotificationProvider;
