import { useAuthContext } from "../Provider/hooks";

const HeaderButton = () => {
  const {
    wallet: { accessing, connected, installed },
    actions: { requestWalletConnection },
  } = useAuthContext();

  if (!installed || accessing) return null;

  if (!connected)
    return (
      <button
        onClick={requestWalletConnection}
        className="btn btn-primary btn-sm"
      >
        CONNECT
      </button>
    );

  return (
    <button disabled className="btn btn-primary btn-sm">
      &#10004; CONNECTED
    </button>
  );
};

export default HeaderButton;
