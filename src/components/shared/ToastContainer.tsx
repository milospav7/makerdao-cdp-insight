import { ToastContainer as RTToastContainer, Slide } from "react-toastify";

const ToastContainer = () => (
  <RTToastContainer
    transition={Slide}
    hideProgressBar
    position="top-right"
    autoClose={2000}
    bodyClassName="p-2"
  />
);

export default ToastContainer;
