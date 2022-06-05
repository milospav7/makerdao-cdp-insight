import GoHomeButton from "../shared/GoHomeButton";

const NotFoundPage = () => {
  return (
    <div className="absolute-centered bg-dark-overlay p-5">
      <h5>Oopps, page you were looking for does not exist!</h5>
      <hr className="my-3" />
      <GoHomeButton className="float-end" />
    </div>
  );
};

export default NotFoundPage;
