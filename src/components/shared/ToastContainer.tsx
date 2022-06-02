import { ToastContainer as RTToastContainer, Slide } from "react-toastify";

const ToastContainer = () => (
  <RTToastContainer
    transition={Slide}
    hideProgressBar
    position="top-right"
    autoClose={2000}
  />
);

export default ToastContainer;
