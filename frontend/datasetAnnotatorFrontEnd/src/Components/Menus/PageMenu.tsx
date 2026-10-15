
import { Menu } from "antd";
import { Link, useLocation } from "react-router-dom";



const items = [
  { key: "/", label: "Home", path: "/" },
  { key: "/datasets", label: "Datasets", path: "/datasets" },
];

export const PageMenu: React.FC = () => {
  const location = useLocation();
  return (
    <>
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[location.pathname]}
        items={items.map((item) => ({
          key: item.key,
          label: <Link to={item.path}>{item.label}</Link>,
        }))}
      />
    </>
  );
};
