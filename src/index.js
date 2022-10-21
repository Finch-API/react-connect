import { useEffect } from 'react';

const BASE_FINCH_CONNECT_URI = 'https://connect.tryfinch.com';
const DEFAULT_FINCH_REDIRECT_URI = 'https://tryfinch.com';
const FINCH_CONNECT_IFRAME_ID = 'finch-connect-iframe';
const FINCH_AUTH_MESSAGE_NAME = 'finch-auth-message';

const noop = () => {};

// eslint-disable-next-line import/prefer-default-export
export const useFinchConnect = (options = {}) => {
  const {
    clientId,
    products = [],
    mode = 'employer',
    category,
    manual = false,
    payrollProvider = null,
    sandbox = false,
    onSuccess = noop,
    onError = noop,
    onClose = noop,
    zIndex = 999,
  } = options;

  const _constructAuthUrl = (clientId, products) => {
    const authUrl = new URL(`${BASE_FINCH_CONNECT_URI}/authorize`);

    if (clientId) authUrl.searchParams.append('client_id', clientId);
    if (payrollProvider) authUrl.searchParams.append('payroll_provider', payrollProvider);
    if (category) authUrl.searchParams.append('category', category);
    authUrl.searchParams.append('products', products.join(' '));
    authUrl.searchParams.append('app_type', 'spa');
    authUrl.searchParams.append('redirect_uri', DEFAULT_FINCH_REDIRECT_URI);
    authUrl.searchParams.append('mode', mode);
    if (manual) authUrl.searchParams.append('manual', manual);
    if (sandbox) authUrl.searchParams.append('sandbox', sandbox);
    /* global SDK_VERSION */
    if (SDK_VERSION) authUrl.searchParams.append('sdk_version', `react-${SDK_VERSION}`);

    return authUrl.href;
  };

  const open = () => {
    if (document.getElementById(FINCH_CONNECT_IFRAME_ID)) {
      return null;
    }

    const iframe = document.createElement('iframe');
    iframe.src = _constructAuthUrl(clientId, products);
    iframe.frameBorder = '0';
    iframe.id = FINCH_CONNECT_IFRAME_ID;
    iframe.style.position = 'fixed';
    iframe.style.zIndex = zIndex.toString();
    iframe.style.height = '100%';
    iframe.style.width = '100%';
    iframe.style.top = '0';
    iframe.style.backgroundColor = 'none transparent';
    iframe.style.border = 'none';
    document.body.prepend(iframe);
    document.body.style.overflow = 'hidden';
  };

  const close = () => {
    const frameToRemove = document.getElementById(FINCH_CONNECT_IFRAME_ID);
    if (frameToRemove) {
      frameToRemove.parentNode.removeChild(frameToRemove);
      document.body.style.overflow = 'inherit';
    }
  };

  useEffect(() => {
    function handleFinchAuth(event) {
      const handleFinchAuthSuccess = (code) => onSuccess({ code });
      const handleFinchAuthError = (error) => onError({ errorMessage: error });
      const handleFinchAuthClose = () => onClose();

      if (!event.data) return;
      if (event.data.name !== FINCH_AUTH_MESSAGE_NAME) return;
      if (!event.origin.startsWith(BASE_FINCH_CONNECT_URI)) return;

      const { code, error, closed } = event.data;

      close();
      if (code) handleFinchAuthSuccess(code);
      else if (error) handleFinchAuthError(error);
      else if (closed) handleFinchAuthClose();
    }

    window.addEventListener('message', handleFinchAuth);
    return () => window.removeEventListener('message', handleFinchAuth);
  }, [onClose, onError, onSuccess]);

  return {
    open,
  };
};
