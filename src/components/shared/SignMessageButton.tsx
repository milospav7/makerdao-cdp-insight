import { useState } from "react";
import { useAuthContext } from "../Auth/hooks";
import { useWeb3 } from "../CDP/hooks";
import { DefaultProps } from "../utils";
import { ISignMessageButtonProps } from "./interfaces";

const SignMessageButton = ({
  message,
  onMessageSigned,
  onSignError = DefaultProps.voidFunction,
  className = "",
}: ISignMessageButtonProps) => {
  const [signing, setSigning] = useState(false);
  const {
    wallet: { connected },
  } = useAuthContext();
  const web3 = useWeb3();
  const {
    wallet: { account },
  } = useAuthContext();

  // Check prefix part at https://web3js.readthedocs.io/en/v1.2.11/web3-eth-personal.html#sign
  // When using metamask no password required: According to the docs, personal.sign does take 3 arguments (and an optional callback), the third argument being the password to unlock the account. In the case you're using MetaMask provider, the password is not needed, and you can pass an empty string ''
  // More at: https://ethereum.stackexchange.com/questions/67776/cant-sign-data-with-personal-sign
  const signMessage = async () => {
    try {
      setSigning(true);
      const preffixedMessage =
        "\x19Ethereum Signed Message:\n" + message.length + message;

      const sign = await web3.eth.personal.sign(preffixedMessage, account, "");
      onMessageSigned(sign);
    } catch (err: any) {
      const userJustRejectedConnection = err?.code === 4001;
      if (!userJustRejectedConnection) {
        onSignError(err); // Expose all other errors
        console.error(err);
      }
    } finally {
      setSigning(false);
    }
  };

  if (!connected || !message) return null;

  return (
    <button
      onClick={signMessage}
      className={`btn btn-success btn-sm ${className}`}
      disabled={signing}
    >
      {signing ? "SIGNING..." : "SIGN MESSAGE"}
    </button>
  );
};

export default SignMessageButton;
