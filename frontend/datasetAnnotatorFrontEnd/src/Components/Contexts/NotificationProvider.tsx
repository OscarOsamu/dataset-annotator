/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useCallback, useContext, type ReactNode } from "react";
import { notification } from "antd";

type NotificationType = {
  notify: (title: string, msg: string, type: "success" | "error") => void;
};

const NotificationContext = createContext<NotificationType>({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  notify: (title: string, msg: string, type: "success" | "error") => {},
});

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {

  const [api, contextHolder] = notification.useNotification();
  const notify = useCallback((title: string, msg: string, type: "success" | "error") => {
    api[type]({
      title: title,
      description: msg,
      placement: "topRight",
      duration: 3,
    });
  }, [api]);

  return (
    <NotificationContext.Provider value={{ notify }}>
      {contextHolder}
      {children}
    </NotificationContext.Provider>
  );
}
export const useNotify = () => useContext(NotificationContext);