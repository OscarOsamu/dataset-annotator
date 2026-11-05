import { Breadcrumb } from "antd";
import { HomeOutlined } from "@ant-design/icons"

// BREADCRUMB ITEMS

const homeItem =  {
        href: '/',
        title: <HomeOutlined />,
      };

const datasetItem = {
        href: '/datasets',
        title: 'Datasets',
      };

const datasetDetailsItem = (datasetId: string, name: string) => ({
        href: `/dataset/${datasetId}`,
        title: `Dataset ${name}`,
      });

const datasetSetupItem = (datasetId: string) => ({
        href: `/dataset/${datasetId}/setup`,
        title: 'Setup',
      });

const datasetAnnotateItem = (datasetId: string) => ({
        href: `/dataset/${datasetId}/annotate`,
        title: 'Annotate',
      });


const AppBreadcrumb: React.FC = () => {

  const currentPath = window.location.pathname;
  const items : { href: string; title: React.ReactNode }[] = [];

  items.push(homeItem);

  // Define breadcrumb items based on the current path
  if (currentPath === "/datasets") {
    // Datasets page
    items.push(datasetItem);
  } else if (currentPath.startsWith("/dataset/")) {
    // Dataset details page
    const datasetId = currentPath.split("/")[2];
    items.push(datasetItem, datasetDetailsItem(datasetId, `ID: ${datasetId}`));
    if (currentPath.endsWith("/setup")) {
      // Dataset setup page
      items.push(datasetSetupItem(datasetId));
    } else if (currentPath.endsWith("/annotate")) {
      // Dataset annotate page
      items.push(datasetAnnotateItem(datasetId));
    }
  }



  

  return (
    <Breadcrumb items={items}/>
  );
};

export default AppBreadcrumb;