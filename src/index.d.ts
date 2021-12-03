declare module 'react-finch-connect' {
  export interface SuccessEvent {
    code: string;
  }

  export interface ErrorEvent {
    errorMessage: string;
  }

  export interface ConnectOptions {
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
  }

  export function useFinchConnect(opts: ConnectOptions): { open: () => void };
}
