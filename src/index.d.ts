declare module 'react-finch-connect' {
  export type SuccessEvent = {
    code: string;
  };

  export type ErrorEvent = {
    errorMessage: string;
  };

  export type ConnectOptions = {
    clientId: string;
    products?: string[];
    mode?: string;
    manual?: boolean;
    payrollProvider?: string;
    sandbox?: boolean;
    onSuccess?: (e: SuccessEvent) => void;
    onError?: (e: ErrorEvent) => void;
    onClose?: () => void;
    zIndex?: bigint | string;
    redirectUri: string;
  };

  export function useFinchConnect(opts: ConnectOptions): { open: () => void };
}
