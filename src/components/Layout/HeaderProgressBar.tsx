interface IProps {
  progress: number;
}

const HeaderProgressBar = ({ progress }: IProps) => (
  <div className="layout-progress-bar-wrapper">
    <div
      className="layout-progress-bar bg-primary"
      style={{ width: `${progress}%` }}
    >
      <div className="glow"> </div>
    </div>
  </div>
);

export default HeaderProgressBar;
