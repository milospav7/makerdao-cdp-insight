import ReloadAppButton from "./shared/ReloadAppButton";

const ErrorPage = () => (
  <div className="absolute-centered bg-dark-overlay p-5">
    <h5>There was an error occured while communicating with your wallet.</h5>
    <hr className="my-3" />
    <ReloadAppButton className="float-end" />
  </div>
);

export default ErrorPage;
