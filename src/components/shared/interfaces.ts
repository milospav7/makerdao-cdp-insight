export interface ISignMessageButtonProps {
  message: string;
  onMessageSigned: (sign: string) => void;
  onSignError?: (error: any) => void;
  className?: string;
}
