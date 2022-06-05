import "./App.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import CdpList from "./components/CDP/CdpList";
import CdpDetails from "./components/CDP/CdpDetails";
import Layout from "./components/Layout/Layout";
import NotFoundPage from "./components/ErrorPages/NotFoundPage";
import NotAllowedPage from "./components/ErrorPages/NotAllowedPage";
import AuthenticationProvider from "./components/Auth/AuthenticationProvider";
import RequireWallet from "./components/shared/RequireWallet";
import ErrorPage from "./components/ErrorPages/ErrorPage";
import ToastContainer from "./components/shared/ToastContainer";
import ResourceNotFoundPage from "./components/ErrorPages/ResourceNotFoundPage";

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
                  <CdpList />
                </RequireWallet>
              }
            />
            <Route
              path="cdp/:cdpId"
              element={
                <RequireWallet>
                  <CdpDetails />
                </RequireWallet>
              }
            />
            <Route path="/404" element={<NotFoundPage />} />
            <Route
              path="/resource-not-found"
              element={<ResourceNotFoundPage />}
            />
            <Route path="/wallet-missing" element={<NotAllowedPage />} />
            <Route path="/error" element={<ErrorPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Layout>
      </BrowserRouter>
      <ToastContainer />
    </AuthenticationProvider>
  );
}

export default App;
