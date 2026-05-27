import { createContext, useContext } from 'react';

export type NotificationVariant = 'error' | 'success' | 'info';

export type NotificationContextType = {
  showNotification: (message: string, variant: NotificationVariant) => void;
};

export const NotificationContext = createContext<
  NotificationContextType | undefined
>(undefined);

export const useNotification = (): NotificationContextType => {
  const context = useContext(NotificationContext);

  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider');
  }
  return context;
};
