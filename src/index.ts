import { useEffect, useRef } from 'react';

export type SuccessEvent = {
  code: string;
  state?: string;
};

export type ErrorEvent = {
  errorMessage: string;
};

export type Sandbox =
  | 'finch' /** This is to enable the new Finch (simulated) Sandbox */
  | 'provider' /** This is to enable the new Provider Sandbox */
  | boolean /** This is the old sandbox flag retained for backwards compatibility */;

export type ConnectOptions = {
  category: string | null;
  clientId: string;
  manual: boolean;
  state: string | null;
  onSuccess: (e: SuccessEvent) => void;
  onError: (e: ErrorEvent) => void;
  onClose: () => void;
  payrollProvider: string | null;
  products: string[];
  sandbox: Sandbox;
  zIndex: number;
  finchDevMode?: boolean;
};

type OpenFn = (
  overrides?: Partial<Pick<ConnectOptions, 'products' | 'state' | 'payrollProvider'>>
) => void;

const POST_MESSAGE_NAME = 'finch-auth-message' as const;

type FinchConnectAuthMessage = { name: typeof POST_MESSAGE_NAME } & (
  | {
      kind: 'closed';
    }
  | {
      kind: 'success';
      code: string;
      state?: string;
    }
  | {
      kind: 'error';
      error: string;
    }
);

interface FinchConnectPostMessage {
  data: FinchConnectAuthMessage;
  origin: string;
}

const BASE_FINCH_CONNECT_URI = 'https://connect.tryfinch.com';
const DEFAULT_FINCH_REDIRECT_URI = 'https://tryfinch.com';

const DEV_FINCH_CONNECT_URI = 'http://localhost:3000';
const DEV_DEFAULT_FINCH_REDIRECT_URI = 'http://localhost:4001';

const FINCH_CONNECT_IFRAME_ID = 'finch-connect-iframe';
const FINCH_AUTH_MESSAGE_NAME = 'finch-auth-message';

const constructAuthUrl = ({
  clientId,
  payrollProvider,
  category,
  products,
  manual,
  sandbox,
  state,
  finchDevMode,
}: Partial<ConnectOptions>) => {
  const canUseFinchDevMode = finchDevMode && window.location.hostname === 'localhost';

  const authUrl = new URL(
    `${canUseFinchDevMode ? DEV_FINCH_CONNECT_URI : BASE_FINCH_CONNECT_URI}/authorize`
  );
  if (clientId) authUrl.searchParams.append('client_id', clientId);
  if (payrollProvider) authUrl.searchParams.append('payroll_provider', payrollProvider);
  if (category) authUrl.searchParams.append('category', category);
  authUrl.searchParams.append('products', (products ?? []).join(' '));
  authUrl.searchParams.append('app_type', 'spa');
  authUrl.searchParams.append(
    'redirect_uri',
    canUseFinchDevMode ? DEV_DEFAULT_FINCH_REDIRECT_URI : DEFAULT_FINCH_REDIRECT_URI
  );
  /** The host URL of the SDK. This is used to store the referrer for postMessage purposes */
  authUrl.searchParams.append('sdk_host_url', window.location.origin);
  authUrl.searchParams.append('mode', 'employer');
  if (manual) authUrl.searchParams.append('manual', String(manual));
  if (sandbox) authUrl.searchParams.append('sandbox', String(sandbox));
  if (state) authUrl.searchParams.append('state', state);
  // replace with actual SDK version by rollup
  authUrl.searchParams.append('sdk_version', 'react-SDK_VERSION');

  return authUrl.href;
};

const noop = () => {
  // intentionally empty
};

const DEFAULT_OPTIONS: Omit<ConnectOptions, 'clientId'> = {
  category: null,
  manual: false,
  onSuccess: noop,
  onError: noop,
  onClose: noop,
  payrollProvider: null,
  products: [],
  sandbox: false,
  state: null,
  zIndex: 999,
  finchDevMode: false,
};

let isUseFinchConnectInitialized = false;

export const useFinchConnect = (options: Partial<ConnectOptions>): { open: OpenFn } => {
  if (!options.clientId) throw new Error('must specify clientId in options for useFinchConnect');
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

  const combinedOptions: ConnectOptions = {
    clientId: '',
    ...DEFAULT_OPTIONS,
    ...options,
  };

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
      const canUseFinchDevMode =
        combinedOptions.finchDevMode && window.location.hostname === 'localhost';

      const CONNECT_URI = canUseFinchDevMode ? DEV_FINCH_CONNECT_URI : BASE_FINCH_CONNECT_URI;

      if (!event.data) return;
      if (event.data.name !== FINCH_AUTH_MESSAGE_NAME) return;
      if (!event.origin.startsWith(CONNECT_URI)) return;

      close();

      switch (event.data.kind) {
        case 'closed':
          combinedOptions.onClose();
          break;
        case 'error':
          combinedOptions.onError({ errorMessage: event.data.error });
          break;
        case 'success':
          combinedOptions.onSuccess({
            code: event.data.code,
            state: event.data.state,
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
