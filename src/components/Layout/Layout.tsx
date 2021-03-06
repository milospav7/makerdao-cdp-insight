import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ConnectButton from "../shared/ConnectButton";
import { LayoutContext } from "../Auth/hooks";
import { ILayoutContext } from "../Auth/interfaces";
import HeaderProgressBar from "./HeaderProgressBar";
interface IProps {
  children: React.ReactNode;
}

const initialState = {
  displayProgressBar: false,
  progressPercentage: 0,
};

const PROGRES_BAR_TRANSITION = 300; // ms
let timeout: undefined | NodeJS.Timeout;

const Layout = ({ children }: IProps) => {
  const { pathname } = useLocation();
  const [context, setContext] = useState(initialState);
  const navigate = useNavigate();

  useEffect(() => {
    setContext(initialState);

    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [pathname]);

  const setLayoutProgressVisiblity = useCallback((isVisible: boolean) => {
    if (!isVisible)
      timeout = setTimeout(() => {
        setContext((p) => ({ ...p, displayProgressBar: isVisible }));
      }, PROGRES_BAR_TRANSITION);
    else setContext((p) => ({ ...p, displayProgressBar: isVisible }));
  }, []);

  const setLayoutProgressPercentage = useCallback(
    (percentage: number) =>
      setContext((p) => ({ ...p, progressPercentage: percentage })),
    []
  );

  const contextActions = useMemo<ILayoutContext>(
    () => ({ setLayoutProgressPercentage, setLayoutProgressVisiblity }),
    [setLayoutProgressPercentage, setLayoutProgressVisiblity]
  );

  const goToHomepage = useCallback(() => {
    navigate("/", { replace: true });
  }, [navigate]);

  return (
    <LayoutContext.Provider value={contextActions}>
      <div className="app-container p-relative overflow-auto">
        <div className="py-3 mb-0 app-header fw-bold sticky-top">
          <div className="container d-flex flex-row align-item-center justify-content-between ">
            <h3 className="cursor-pointer" onClick={goToHomepage}>
              <img
                className="header-logo me-2"
                src={"/assets/logo.png"}
                alt="Logo.."
              />
              CDP Explorer
            </h3>
            <ConnectButton />
          </div>
        </div>
        {context.displayProgressBar && (
          <HeaderProgressBar progress={context.progressPercentage} />
        )}
        <div className=" py-4 flex-fill overflow-auto">
          <div className="container h-100">{children}</div>
        </div>
      </div>
    </LayoutContext.Provider>
  );
};

export default Layout;
