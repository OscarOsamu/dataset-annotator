import Layout from "../Layout";
import { DatasetsPage } from "../Pages/DatasetsPage";
import WelcomePage from "../Pages/WelcomePage"
import { BrowserRouter as Router, Routes, Route} from "react-router-dom";




const AppRouter: React.FC = () => {
    return (
        <Router>
            <Layout>
                <Routes>
                    <Route path="/" element={<WelcomePage />} />
                    <Route path="/datasets" element={<DatasetsPage/>} /> // see all dataset
                    <Route path="dataset/:id"element={<WelcomePage/>} />  // see information about one dataset 
                </Routes>
            </Layout>
        </Router>
    )
}

export default AppRouter;