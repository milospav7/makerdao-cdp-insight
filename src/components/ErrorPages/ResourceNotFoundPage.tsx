import GoHomeButton from "../shared/GoHomeButton";

const ResourceNotFoundPage = () => {
  return (
    <div className="absolute-centered bg-dark-overlay p-5">
      <h5>Resource with provided id does not exist!</h5>
      <hr className="my-3" />
      <GoHomeButton className="float-end" />
    </div>
  );
};

export default ResourceNotFoundPage;
