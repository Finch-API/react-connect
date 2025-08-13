import { useEffect, useRef } from 'react';

type HasKey<T, K extends PropertyKey> = T extends Record<K, unknown> ? T : never;

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

export type Sandbox =
  | 'finch' /** This is to enable the new Finch (simulated) Sandbox */
  | 'provider' /** This is to enable the new Provider Sandbox */
  | boolean /** This is the old sandbox flag retained for backwards compatibility */;

type BaseConnectOptions = {
  state: string | null;
  onSuccess: (e: SuccessEvent) => void;
  onError: (e: ErrorEvent) => void;
  onClose: () => void;
  zIndex: number;
  apiConfig?: {
    connectUrl: string;
    redirectUrl: string;
  };
};

type ConnectOptionsWithSessionId = BaseConnectOptions & {
  // Use this option if you have a Finch Connect sessionID from the IDP redirect flow
  sessionId: string;
  // Allow for overriding products for the session
  products?: string[];
};

export type ConnectOptions = ConnectOptionsWithSessionId;

type OpenFn = (overrides?: Partial<ConnectOptions>) => void;

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
const DEFAULT_FINCH_REDIRECT_URI = 'https://tryfinch.com';

const FINCH_CONNECT_IFRAME_ID = 'finch-connect-iframe';

const constructAuthUrl = (connectOptions: ConnectOptions) => {
  const { state, apiConfig } = connectOptions;

  const CONNECT_URL = apiConfig?.connectUrl || BASE_FINCH_CONNECT_URI;
  const REDIRECT_URL = apiConfig?.redirectUrl || DEFAULT_FINCH_REDIRECT_URI;

  const authUrl = new URL(`${CONNECT_URL}/authorize`);

  const { sessionId, products } = connectOptions;
  authUrl.searchParams.append('session', sessionId);
  if (products) authUrl.searchParams.append('products', products.join(' '));

  authUrl.searchParams.append('app_type', 'spa');
  authUrl.searchParams.append('redirect_uri', REDIRECT_URL);
  /** The host URL of the SDK. This is used to store the referrer for postMessage purposes */
  authUrl.searchParams.append('sdk_host_url', window.location.origin);
  authUrl.searchParams.append('mode', 'employer');
  if (state) authUrl.searchParams.append('state', state);
  // replace with actual SDK version by rollup
  authUrl.searchParams.append('sdk_version', 'react-SDK_VERSION');

  return authUrl.href;
};

const noop = () => {
  // intentionally empty
};

const BASE_DEFAULTS = {
  onSuccess: noop,
  onError: noop,
  onClose: noop,
  state: null,
  zIndex: 999,
};

const DEFAULT_OPTIONS_WITH_SESSION_ID: HasKey<ConnectOptions, 'sessionId'> = {
  ...BASE_DEFAULTS,
  sessionId: '',
};

let isUseFinchConnectInitialized = false;

export const useFinchConnect = (options: Partial<ConnectOptions>): { open: OpenFn } => {
  if (!('sessionId' in options) && !('clientId' in options)) {
    throw new Error('must specify either sessionId or clientId in options for useFinchConnect');
  }

  if ('sessionId' in options && 'clientId' in options) {
    throw new Error('cannot specify both sessionId and clientId in options for useFinchConnect');
  }

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

  const combinedOptions: ConnectOptions = { ...DEFAULT_OPTIONS_WITH_SESSION_ID, ...options };

  const open: OpenFn = (overrides) => {
    const openOptions: ConnectOptions = {
      ...combinedOptions,
      ...overrides,
    };

    if (!document.getElementById(FINCH_CONNECT_IFRAME_ID)) {
      const iframe = document.createElement('iframe');
      iframe.src = constructAuthUrl(openOptions);
      iframe.frameBorder = '0';
      iframe.id = FINCH_CONNECT_IFRAME_ID;
      iframe.style.position = 'fixed';
      iframe.style.zIndex = openOptions.zIndex.toString();
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
      const CONNECT_URL = combinedOptions.apiConfig?.connectUrl || BASE_FINCH_CONNECT_URI;

      if (!event.data) return;
      if (event.data.name !== POST_MESSAGE_NAME) return;
      if (!event.origin.startsWith(CONNECT_URL)) return;

      if (event.data.kind !== 'error') close();

      switch (event.data.kind) {
        case 'closed':
          combinedOptions.onClose();
          break;
        case 'error':
          if (event.data.error?.shouldClose) close();

          combinedOptions.onError({
            errorMessage: event.data.error?.message,
            errorType: event.data.error?.type,
          });
          break;
        case 'success':
          combinedOptions.onSuccess({
            code: event.data.code,
            state: event.data.state,
            idpRedirectUri: event.data.idpRedirectUri,
          });
          break;
        default: {
          // This case should never happen, if it does it should be reported to us
          combinedOptions.onError({
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
  }, [combinedOptions.onClose, combinedOptions.onError, combinedOptions.onSuccess]);

  return {
    open,
  };
};
