import socialAuth from './social-auth';

describe('test social-auth', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    Object.defineProperty(window, 'opener', { value: {}, writable: true });
    Object.defineProperty(window.opener, 'location', { value: {}, writable: true });
  });

  describe('result is true', () => {
    test('opener\'s location is at flux id login page', () => {
      window.opener.location.hash = '#/initialize/connect/flux-id-login';
      window.opener.dispatchEvent = jest.fn();
      window.close = jest.fn();
      socialAuth(true);

      expect(window.opener.location.hash).toBe('#initialize/connect/select-connection-type');
      expect(window.opener.dispatchEvent).not.toHaveBeenCalled();
      expect(window.close).toHaveBeenCalledTimes(1);
    });

    test('opener\'s location is NOT at flux id login page', () => {
      window.opener.location.hash = '#/studio/beambox';
      window.opener.dispatchEvent = jest.fn();
      socialAuth(true);

      expect(window.opener.location.hash).toBe('#/studio/beambox');
      expect(window.opener.dispatchEvent).toHaveBeenCalledTimes(1);
    });
  });

  test('result is false', () => {
    window.opener.dispatchEvent = jest.fn();
    window.close = jest.fn();
    socialAuth(false);

    expect(window.opener.dispatchEvent).not.toHaveBeenCalled();
    expect(window.close).not.toHaveBeenCalled();
  });
});
