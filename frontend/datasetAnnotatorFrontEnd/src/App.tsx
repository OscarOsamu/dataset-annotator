import {ConfigProvider } from 'antd';
import './App.css'
import AppRouter from './Components/Routers/AppRouter';
import { NotificationProvider } from './Components/Contexts/NotificationProvider';
import { themeConfig } from './Components/Utils/Styles/Colors';



function App() {

  return (
    <ConfigProvider theme={themeConfig}>
      <NotificationProvider>
        <AppRouter />
      </NotificationProvider>
    </ConfigProvider>
  )
}

export default App
