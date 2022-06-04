import { useNavigate } from "react-router-dom";

interface IProps {
  className?: string;
}

const GoHomeButton = ({ className = "" }: IProps) => {
  const navigate = useNavigate();

  const goHome = () => {
    navigate("/");
  };

  return (
    <div className={className}>
      <button className="btn btn-dark btn-md" onClick={goHome}>
        Go Back Home
      </button>
    </div>
  );
};

export default GoHomeButton;
