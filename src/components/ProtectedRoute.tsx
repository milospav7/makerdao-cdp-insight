import {
  IndexRouteProps,
  LayoutRouteProps,
  PathRouteProps,
  Route,
} from "react-router-dom";
import RequireWallet from "./RequireWallet";

const ProtectedRoute = ({
  element,
  ...rest
}: PathRouteProps | LayoutRouteProps | IndexRouteProps) => (
  <Route {...rest} element={<RequireWallet>{element}</RequireWallet>} />
);

export default ProtectedRoute;
