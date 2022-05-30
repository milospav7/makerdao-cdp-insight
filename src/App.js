import "./App.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import HomePage from "./components/HomePage";
import CdpDetailsPage from "./components/CdpDetailsPage";
import Layout from "./components/Layout";
import NotFoundPage from "./components/NotFoundPage";
import NotAllowedPage from "./components/NotAllowedPage";

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="cdp/:cdpId" element={<CdpDetailsPage />} />
          <Route path="/404" element={<NotFoundPage />} />
          <Route path="/warning" element={<NotAllowedPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
