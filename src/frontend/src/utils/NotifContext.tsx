import { createContext, useContext } from 'react';

export type NotificationVariant = 'error' | 'success' | 'info' | 'warning';

export type NotificationContextType = {
  showNotification: (message: string, variant: NotificationVariant) => void;
};

export const NotificationContext = createContext<
  NotificationContextType | undefined
>(undefined);

export const useNotification = (): NotificationContextType => {
  const context = useContext(NotificationContext);

  if (!context) {
    return {
      showNotification: () => {},
    };
  }
  return context;
};
