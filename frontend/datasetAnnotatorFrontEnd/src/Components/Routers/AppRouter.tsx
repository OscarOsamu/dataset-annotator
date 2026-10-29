import Layout from "../Layout";
import { DatasetInfoPage } from "../Pages/DatasetInfoPage";
import { DatasetsPage } from "../Pages/DatasetsPage";
import QuestionImagePage from "../Pages/QuestionImagePage.tsx";
import WelcomePage from "../Pages/WelcomePage"
import { BrowserRouter as Router, Routes, Route} from "react-router-dom";




const AppRouter: React.FC = () => {
    return (
        <Router>
            <Layout>
                <Routes>
                    <Route path="/" element={<WelcomePage />} />
                    <Route path="/datasets" element={<DatasetsPage />} />
                    <Route path="/dataset/:id" element={<DatasetInfoPage />} />
                    <Route path="/dataset/:datasetId/annotate" element={<QuestionImagePage />} />
                </Routes>
            </Layout>
        </Router>
    )
}

export default AppRouter;