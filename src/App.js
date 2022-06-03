import "./App.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import CdpList from "./components/CDP/CdpList";
import CdpDetails from "./components/CDP/CdpDetails";
import Layout from "./components/Layout";
import PageNotFoundPage from "./components/PageNotFoundPage";
import NotAllowedPage from "./components/NotAllowedPage";
import AuthenticationProvider from "./components/Auth/AuthenticationProvider";
import RequireWallet from "./components/RequireWallet";
import ErrorPage from "./components/ErrorPage";
import ToastContainer from "./components/shared/ToastContainer";
import ResourceNotFoundPage from "./components/ResourceNotFoundPage";

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
            <Route path="/404" element={<PageNotFoundPage />} />
            <Route
              path="/resource-not-found"
              element={<ResourceNotFoundPage />}
            />
            <Route path="/wallet-missing" element={<NotAllowedPage />} />
            <Route path="/error" element={<ErrorPage />} />
            <Route path="*" element={<PageNotFoundPage />} />
          </Routes>
        </Layout>
      </BrowserRouter>
      <ToastContainer />
    </AuthenticationProvider>
  );
}

export default App;
