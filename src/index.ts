import { useEffect, useRef } from 'react';

export type SuccessEvent = {
  code: string;
  state?: string;
  idpRedirectUri?: string;
};

type ErrorType = 'validation_error' | 'employer_connection_error';
export type ErrorEvent = {
  errorMessage: string;
  errorType?: ErrorType;
};

type ApiConfig = {
  connectUrl: string;
};

export type ConnectInitializeArgs = {
  onSuccess: (e: SuccessEvent) => void;
  onError: (e: ErrorEvent) => void;
  onClose: () => void;
  apiConfig?: ApiConfig;
};

export type ConnectLaunchArgs = {
  sessionId: string;
  state?: string;
  zIndex?: number;
};

type OpenFn = (args: ConnectLaunchArgs) => void;

const POST_MESSAGE_NAME = 'finch-auth-message-v2' as const;

type FinchConnectAuthMessage = { name: typeof POST_MESSAGE_NAME } & (
  | {
      kind: 'closed';
    }
  | {
      kind: 'success';
      code: string;
      state?: string;
      idpRedirectUri?: string;
    }
  | {
      kind: 'error';
      error: { shouldClose: boolean; message: string; type: ErrorType };
    }
);

interface FinchConnectPostMessage {
  data: FinchConnectAuthMessage;
  origin: string;
}

const BASE_FINCH_CONNECT_URI = 'https://connect.tryfinch.com';

const FINCH_CONNECT_IFRAME_ID = 'finch-connect-iframe';

export const constructAuthUrl = ({
  sessionId,
  state,
  apiConfig,
}: {
  sessionId: string;
  state?: string;
  apiConfig?: ApiConfig;
}) => {
  const CONNECT_URL = apiConfig?.connectUrl || BASE_FINCH_CONNECT_URI;

  const authUrl = new URL(`${CONNECT_URL}/authorize`);

  authUrl.searchParams.append('session', sessionId);
  authUrl.searchParams.append('app_type', 'spa');
  /** The host URL of the SDK. This is used to store the referrer for postMessage purposes */
  authUrl.searchParams.append('sdk_host_url', window.location.origin);
  authUrl.searchParams.append('mode', 'employer');
  if (state) authUrl.searchParams.append('state', state);
  // replace with actual SDK version by rollup
  authUrl.searchParams.append('sdk_version', 'react-SDK_VERSION');

  return authUrl.href;
};

let isUseFinchConnectInitialized = false;

export const useFinchConnect = (initializeArgs: ConnectInitializeArgs): { open: OpenFn } => {
  const isHookMounted = useRef(false);

  useEffect(() => {
    if (!isHookMounted.current) {
      if (isUseFinchConnectInitialized) {
        console.error(
          'One useFinchConnect hook has already been registered. Please ensure to only call useFinchConnect once to avoid your event callbacks getting called more than once. You can pass in override options to the open function if you so require.'
        );
      } else {
        isUseFinchConnectInitialized = true;
      }

      isHookMounted.current = true;
    }
  }, []);

  const open: OpenFn = (launchArgs) => {
    if (!document.getElementById(FINCH_CONNECT_IFRAME_ID)) {
      const iframe = document.createElement('iframe');
      iframe.src = constructAuthUrl({
        sessionId: launchArgs.sessionId,
        state: launchArgs.state,
        apiConfig: initializeArgs.apiConfig,
      });
      iframe.frameBorder = '0';
      iframe.id = FINCH_CONNECT_IFRAME_ID;
      iframe.style.position = 'fixed';
      iframe.style.zIndex = launchArgs.zIndex?.toString() || '999';
      iframe.style.height = '100%';
      iframe.style.width = '100%';
      iframe.style.top = '0';
      iframe.style.backgroundColor = 'none transparent';
      iframe.style.border = 'none';
      iframe.allow = 'clipboard-write; clipboard-read';
      document.body.prepend(iframe);
      document.body.style.overflow = 'hidden';
    }
  };

  const close = () => {
    const frameToRemove = document.getElementById(FINCH_CONNECT_IFRAME_ID);
    if (frameToRemove) {
      frameToRemove.parentNode?.removeChild(frameToRemove);
      document.body.style.overflow = 'inherit';
    }
  };

  useEffect(() => {
    function handleFinchAuth(event: FinchConnectPostMessage) {
      const CONNECT_URL = initializeArgs.apiConfig?.connectUrl || BASE_FINCH_CONNECT_URI;

      if (!event.data) return;
      if (event.data.name !== POST_MESSAGE_NAME) return;
      if (!event.origin.startsWith(CONNECT_URL)) return;

      if (event.data.kind !== 'error') close();

      switch (event.data.kind) {
        case 'closed':
          initializeArgs.onClose();
          break;
        case 'error':
          if (event.data.error?.shouldClose) close();

          initializeArgs.onError({
            errorMessage: event.data.error?.message,
            errorType: event.data.error?.type,
          });
          break;
        case 'success':
          initializeArgs.onSuccess({
            code: event.data.code,
            state: event.data.state,
            idpRedirectUri: event.data.idpRedirectUri,
          });
          break;
        default: {
          // This case should never happen, if it does it should be reported to us
          initializeArgs.onError({
            errorMessage: `Report to developers@tryfinch.com: unable to handle window.postMessage for:  ${JSON.stringify(
              event.data
            )}`,
          });
        }
      }
    }

    window.addEventListener('message', handleFinchAuth);
    return () => {
      window.removeEventListener('message', handleFinchAuth);
      isUseFinchConnectInitialized = false;
    };
  }, [initializeArgs.onClose, initializeArgs.onError, initializeArgs.onSuccess]);

  return {
    open,
  };
};
