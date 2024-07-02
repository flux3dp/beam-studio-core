import localeHelper from './locale-helper';

const mockParse = jest.fn();
jest.mock('bcp-47', () => ({
  parse: (...args) => mockParse(...args),
}));

describe('test locale-helper', () => {
  test('when locale is en-US and timezone offset is 300', () => {
    const navigator = { language: 'en-US' };
    const date = { getTimezoneOffset: () => 300 };
    Object.defineProperty(global, 'navigator', { value: navigator });
    Object.defineProperty(global, 'Date', { value: date });
    mockParse.mockReturnValue({ region: 'US' });
    expect(localeHelper.isNorthAmerica).toBe(true);
  });

  test('when locale is en-US and timezone offset is 660', () => {
    const navigator = { language: 'en-US' };
    const date = { getTimezoneOffset: () => 660 };
    Object.defineProperty(global, 'navigator', { value: navigator });
    Object.defineProperty(global, 'Date', { value: date });
    mockParse.mockReturnValue({ region: 'US' });
    expect(localeHelper.isNorthAmerica).toBe(false);
  });

  test('when locale is en-CA and timezone offset is 300', () => {
    const navigator = { language: 'en-CA' };
    const date = { getTimezoneOffset: () => 300 };
    Object.defineProperty(global, 'navigator', { value: navigator });
    Object.defineProperty(global, 'Date', { value: date });
    mockParse.mockReturnValue({ region: 'CA' });
    expect(localeHelper.isNorthAmerica).toBe(true);
  });

  test('when locale is en-CA and timezone offset is 660', () => {
    const navigator = { language: 'en-CA' };
    const date = { getTimezoneOffset: () => 660 };
    Object.defineProperty(global, 'navigator', { value: navigator });
    Object.defineProperty(global, 'Date', { value: date });
    mockParse.mockReturnValue({ region: 'CA' });
    expect(localeHelper.isNorthAmerica).toBe(false);
  });

  test('when locale is zh-CN and timezone offset is 300', () => {
    const navigator = { language: 'zh-CN' };
    const date = { getTimezoneOffset: () => 300 };
    Object.defineProperty(global, 'navigator', { value: navigator });
    Object.defineProperty(global, 'Date', { value: date });
    mockParse.mockReturnValue({ region: 'CN' });
    expect(localeHelper.isNorthAmerica).toBe(false);
  });

  test('when locale is zh-CN and timezone offset is 660', () => {
    const navigator = { language: 'zh-CN' };
    const date = { getTimezoneOffset: () => 660 };
    Object.defineProperty(global, 'navigator', { value: navigator });
    Object.defineProperty(global, 'Date', { value: date });
    mockParse.mockReturnValue({ region: 'CN' });
    expect(localeHelper.isNorthAmerica).toBe(false);
  });
});
