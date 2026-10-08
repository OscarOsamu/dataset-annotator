import {ConfigProvider, type ThemeConfig } from 'antd';
import './App.css'
import BasicPage from './Components/Pages/BasicPage';

const config: ThemeConfig = {
  "token": {
    "colorPrimary": "#13c2c2",
    "colorInfo": "#13c2c2",
    "colorSuccess": "#a0d911",
    "colorWarning": "#faad14"
  },
};

function App() {

  return (
    <ConfigProvider theme={config}>
      <BasicPage/>
    </ConfigProvider>
  )
}

export default App
