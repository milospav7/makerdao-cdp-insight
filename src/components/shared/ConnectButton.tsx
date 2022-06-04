import { useAuthContext } from "../Auth/hooks";

const ConnectButton = () => {
  const {
    wallet: { accessing, connected, installed },
    error,
    actions: { requestWalletConnection },
  } = useAuthContext();

  if (!installed || accessing || !!error) return null;

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

export default ConnectButton;
