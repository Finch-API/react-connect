import { constructAuthUrl, validateConnectOptions } from './index';

const NOOP_CALLBACKS = {
  onSuccess: jest.fn(),
  onError: jest.fn(),
  onClose: jest.fn(),
  zIndex: 999,
};

describe('Finch React SDK', () => {
  describe('constructAuthUrl', () => {
    it('returns the correct auth URL', () => {
      const authUrl = constructAuthUrl({ sessionId: '123', state: null, ...NOOP_CALLBACKS });
      expect(authUrl.startsWith('https://connect.tryfinch.com/authorize?')).toBe(true);
    });

    it('uses the provided connectUrl and redirectUrl if they are provided', () => {
      const authUrl = constructAuthUrl({
        sessionId: '123',
        state: null,
        apiConfig: {
          connectUrl: 'https://cool.site',
          redirectUrl: 'https://cool.site/redirect',
        },
        ...NOOP_CALLBACKS,
      });
      expect(authUrl.startsWith('https://cool.site/authorize?')).toBe(true);
      expect(authUrl).toContain('redirect_uri=https%3A%2F%2Fcool.site%2Fredirect');
    });

    it('adds only the session parameter if the sessionId is provided', () => {
      const authUrl = constructAuthUrl({
        sessionId: 'test-session-id',
        state: null,
        ...NOOP_CALLBACKS,
      });

      expect(authUrl).toContain('session=test-session-id');
      expect(authUrl).not.toContain('client_id=');
      expect(authUrl).not.toContain('payroll_provider=');
      expect(authUrl).not.toContain('category=');
      expect(authUrl).not.toContain('products=');
      expect(authUrl).not.toContain('manual=');
      expect(authUrl).not.toContain('sandbox=');
      expect(authUrl).not.toContain('client_name=');
      expect(authUrl).not.toContain('connection_id=');
    });

    it('adds the provided parameters when sessionId is not provided', () => {
      const authUrl = constructAuthUrl({
        clientId: 'test-client-id',
        payrollProvider: 'test-payroll-provider',
        category: 'test-category',
        products: ['test-product'],
        manual: true,
        sandbox: true,
        clientName: 'test-client-name',
        connectionId: 'test-connection-id',
        state: null,
        ...NOOP_CALLBACKS,
      });

      expect(authUrl).toContain('client_id=test-client-id');
      expect(authUrl).toContain('payroll_provider=test-payroll-provider');
      expect(authUrl).toContain('category=test-category');
      expect(authUrl).toContain('products=test-product');
      expect(authUrl).toContain('manual=true');
      expect(authUrl).toContain('sandbox=true');
      expect(authUrl).toContain('client_name=test-client-name');
      expect(authUrl).toContain('connection_id=test-connection-id');
      expect(authUrl).not.toContain('session=');
    });

    it('adds all the expected base parameters to the auth URL', () => {
      const expectedParameters = {
        app_type: 'spa',
        redirect_uri: encodeURIComponent('https://tryfinch.com'),
        sdk_host_url: encodeURIComponent('http://localhost'),
        mode: 'employer',
        sdk_version: 'react-SDK_VERSION',
      };

      const authUrl = constructAuthUrl({
        sessionId: 'test-session-id',
        state: null,
        ...NOOP_CALLBACKS,
      });

      Object.entries(expectedParameters).forEach(([key, value]) => {
        expect(authUrl).toContain(`${key}=${value}`);
      });
    });

    it('adds the state parameter if it is provided', () => {
      const testOptions = { sessionId: 'test-session-id', state: 'test-state', ...NOOP_CALLBACKS };
      const authUrl = constructAuthUrl(testOptions);

      expect(authUrl).toContain('state=test-state');
    });
  });

  describe('validateConnectOptions', () => {
    it('throws an error if no sessionId or clientId is provided', () => {
      expect(() => validateConnectOptions({})).toThrow(
        'must specify either sessionId or clientId in options for useFinchConnect'
      );
    });

    it('throws an error if both sessionId and clientId are provided', () => {
      expect(() =>
        validateConnectOptions({
          sessionId: 'test-session-id',
          clientId: 'test-client-id',
          state: null,
          ...NOOP_CALLBACKS,
        })
      ).toThrow('cannot specify both sessionId and clientId in options for useFinchConnect');
    });
  });
});
