import { useCallback, useMemo, useState } from "react";
import { LayoutContext } from "./Provider/hooks";
import { ILayoutContext } from "./Provider/interfaces";
interface IProps {
  children: React.ReactNode;
}

const Layout = ({ children }: IProps) => {
  const [context, setContext] = useState({
    displayProgressBar: false,
    progressPercentage: 0,
  });

  const setLayoutProgressVisiblity = useCallback(
    (isVisible: boolean) =>
      setContext((p) => ({ ...p, displayProgressBar: isVisible })),
    []
  );

  const setLayoutProgressPercentage = useCallback(
    (percentage: number) =>
      setContext((p) => ({ ...p, progressPercentage: percentage })),
    []
  );

  const contextActions = useMemo<ILayoutContext>(
    () => ({ setLayoutProgressPercentage, setLayoutProgressVisiblity }),
    [setLayoutProgressPercentage, setLayoutProgressVisiblity]
  );
  console.log(context);
  return (
    <LayoutContext.Provider value={contextActions}>
      <div className="app-container">
        <div className="text-center py-3 h3 mb-0 app-header">
          MakerDAO CDP Insight
        </div>
        {context.displayProgressBar && (
          <div
            className="layout-progress-bar bg-info"
            style={{ width: `${context.progressPercentage}%` }}
          ></div>
        )}
        <div className="container py-3">{children}</div>
      </div>
    </LayoutContext.Provider>
  );
};

export default Layout;
