import React, { createContext, useContext, type ReactNode } from "react";
import { notification} from "antd";

type NotificationType = {
  notify: (title : string, msg: string, type: "success" | "error") => void;
}



const NotificationContext = createContext<NotificationType>({
  notify: (title : string, msg: string, type: "success" | "error") => {},
});

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {

  const [api, contextHolder] = notification.useNotification();
  //green in success, red in error
    const notify = (title: string, msg: string, type: "success" | "error") => {

    api[type]({
      title: title,
      description: msg,
      placement: "topRight",
      duration: 3,
      
      
    });
  };    

    return (
    <NotificationContext.Provider value={{ notify }}>
      {contextHolder}
      {children}
    </NotificationContext.Provider>
  );
}
export const useNotify = () => useContext(NotificationContext);