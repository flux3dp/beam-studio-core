import FormatDuration from './duration-formatter';

test('test duration-formatter', () => {
  const i18nHour = 'h';
  const i18nMinute = 'm';
  const i18nSecond = 's';
  expect(FormatDuration(7200, i18nHour, i18nMinute, i18nSecond)).toBe('2 h 0 m');
  expect(FormatDuration(1800, i18nHour, i18nMinute, i18nSecond)).toBe('30 m 0 s');
  expect(FormatDuration(1800, i18nHour, i18nMinute, i18nSecond)).toBe('30 m 0 s');
  expect(FormatDuration(30, i18nHour, i18nMinute, i18nSecond)).toBe('30 s');
  expect(FormatDuration(0, i18nHour, i18nMinute, i18nSecond)).toBe('');
});
