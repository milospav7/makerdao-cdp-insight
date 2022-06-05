import { useAuthContext } from "../Auth/hooks";
import ReloadAppButton from "../shared/ReloadAppButton";

const ErrorPage = () => {
  const { error } = useAuthContext();

  return (
    <div className="absolute-centered bg-dark-overlay p-5">
      <h5>{error}</h5>
      <hr className="my-3" />
      <ReloadAppButton className="float-end" />
    </div>
  );
};

export default ErrorPage;
