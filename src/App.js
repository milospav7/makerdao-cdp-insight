import "./App.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import HomePage from "./components/HomePage";
import CdpDetailsPage from "./components/CdpDetailsPage";
import Layout from "./components/Layout";
import NotFoundPage from "./components/NotFoundPage";
import NotAllowedPage from "./components/NotAllowedPage";
import AuthenticationProvider from "./components/AuthenticationProvider";
import RequireWallet from "./components/RequireWallet";

function App() {
  return (
    <AuthenticationProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route
              path="/"
              element={
                <RequireWallet>
                  <HomePage />
                </RequireWallet>
              }
            />
            <Route
              path="cdp/:cdpId"
              element={
                <RequireWallet>
                  <CdpDetailsPage />
                </RequireWallet>
              }
            />
            <Route path="/404" element={<NotFoundPage />} />
            <Route path="/warning" element={<NotAllowedPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </AuthenticationProvider>
  );
}

export default App;
