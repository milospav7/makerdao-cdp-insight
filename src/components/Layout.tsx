import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import HeaderButton from "./Header/HeaderButton";
import { LayoutContext } from "./Auth/hooks";
import { ILayoutContext } from "./Auth/interfaces";
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

  return (
    <LayoutContext.Provider value={contextActions}>
      <div className="app-container p-relative overflow-auto">
        <div className="py-3 mb-0 app-header fw-bold sticky-top">
          <div className="container d-flex flex-row align-item-center justify-content-between ">
            <h3>
              <img
                className="header-logo me-2"
                src={"assets/logo.png"}
                alt="Logo.."
              />
              CDP Explorer
            </h3>
            <HeaderButton />
          </div>
        </div>
        {context.displayProgressBar && (
          <div className="layout-progress-bar-wrapper">
            <div
              className="layout-progress-bar bg-primary"
              style={{ width: `${context.progressPercentage}%` }}
            >
              <div className="glow"> </div>
            </div>
          </div>
        )}
        <div className=" py-4 flex-fill overflow-auto">
          <div className="container h-100">{children}</div>
        </div>
      </div>
    </LayoutContext.Provider>
  );
};

export default Layout;
