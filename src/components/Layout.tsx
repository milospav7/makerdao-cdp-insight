interface IProps {
  children: React.ReactNode;
}

const Layout = ({ children }: IProps) => {
  return (
    <div>
      <div className="text-center py-3 h3 app-header">MakerDAO CDP Insight</div>
      <div className="container py-1">{children}</div>
    </div>
  );
};

export default Layout;
