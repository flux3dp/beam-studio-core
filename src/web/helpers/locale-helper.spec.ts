const mockParse = jest.fn();
jest.mock('bcp-47', () => ({
  parse: (...args) => mockParse(...args),
}));
jest.spyOn(Date.prototype, 'getTimezoneOffset').mockReturnValue(300);

// eslint-disable-next-line import/first
import localeHelper from './locale-helper';

const mockConsoleError = jest.fn();

describe('test locale-helper', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    console.error = mockConsoleError;
  });

  test('when locale is en-US and timezone offset is 300', () => {
    const navigator = { language: 'en-US' };
    Object.defineProperty(global, 'navigator', { value: navigator });
    jest.spyOn(Date.prototype, 'getTimezoneOffset').mockReturnValue(300);
    mockParse.mockReturnValue({ region: 'US' });
    expect(localeHelper.detectNorthAmerica()).toBe(true);
    expect(mockConsoleError).not.toBeCalled();
  });

  test('when locale is en-US and timezone offset is 660', () => {
    const navigator = { language: 'en-US' };
    Object.defineProperty(global, 'navigator', { value: navigator });
    jest.spyOn(Date.prototype, 'getTimezoneOffset').mockReturnValue(660);
    mockParse.mockReturnValue({ region: 'US' });
    expect(localeHelper.detectNorthAmerica()).toBe(false);
    expect(mockConsoleError).not.toBeCalled();
  });

  test('when locale is en-CA and timezone offset is 300', () => {
    const navigator = { language: 'en-CA' };
    Object.defineProperty(global, 'navigator', { value: navigator });
    jest.spyOn(Date.prototype, 'getTimezoneOffset').mockReturnValue(300);
    mockParse.mockReturnValue({ region: 'CA' });
    expect(localeHelper.detectNorthAmerica()).toBe(true);
    expect(mockConsoleError).not.toBeCalled();
  });

  test('when locale is en-CA and timezone offset is 660', () => {
    const navigator = { language: 'en-CA' };
    Object.defineProperty(global, 'navigator', { value: navigator });
    jest.spyOn(Date.prototype, 'getTimezoneOffset').mockReturnValue(660);
    mockParse.mockReturnValue({ region: 'CA' });
    expect(localeHelper.detectNorthAmerica()).toBe(false);
    expect(mockConsoleError).not.toBeCalled();
  });

  test('when locale is zh-CN and timezone offset is 300', () => {
    const navigator = { language: 'zh-CN' };
    Object.defineProperty(global, 'navigator', { value: navigator });
    jest.spyOn(Date.prototype, 'getTimezoneOffset').mockReturnValue(300);
    mockParse.mockReturnValue({ region: 'CN' });
    expect(localeHelper.detectNorthAmerica()).toBe(false);
    expect(mockConsoleError).not.toBeCalled();
  });

  test('when locale is zh-CN and timezone offset is 660', () => {
    const navigator = { language: 'zh-CN' };
    Object.defineProperty(global, 'navigator', { value: navigator });
    jest.spyOn(Date.prototype, 'getTimezoneOffset').mockReturnValue(660);
    mockParse.mockReturnValue({ region: 'CN' });
    expect(localeHelper.detectNorthAmerica()).toBe(false);
    expect(mockConsoleError).not.toBeCalled();
  });
});
