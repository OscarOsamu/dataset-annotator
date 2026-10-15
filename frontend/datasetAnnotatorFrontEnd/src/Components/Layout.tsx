import React, { useState } from "react";
import { Layout as AntLayout  } from "antd";
import { PageMenu } from "./Menus/PageMenu";
//import AppBreadcrumb from "./AppBreadcrumb";

const { Header, Content, Sider } = AntLayout;

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);


  return (
    <AntLayout style={{ minHeight: "100vh" }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        breakpoint="lg"
        collapsedWidth={0}
      >
        <div style={{ color: "white", padding: 16, textAlign: "center" }}>Dataset Annotator</div>
        <PageMenu/>
      </Sider>

      <AntLayout>
        <Header style={{ padding: 0, textAlign: "center", paddingRight: 20 }}>
           <h1 style={{alignContent:"center"}}> An app to annotate your dataset for CNN training or others purpose </h1>
        </Header>
        <Content style={{ margin: 16 }}>
            {/* <AppBreadcrumb /> */}
          <div style={{ padding: 24, background: "#fff", minHeight: 360 }}>{children}</div>
        </Content>
      </AntLayout>
    </AntLayout>
  );
};

export default Layout;