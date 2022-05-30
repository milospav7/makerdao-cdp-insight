interface IProps {
  children: React.ReactNode;
}

const Layout = ({ children }: IProps) => {
  return (
    <div>
      <div>Ovde ide meni</div>
      <div>{children}</div>
    </div>
  );
};

export default Layout;
