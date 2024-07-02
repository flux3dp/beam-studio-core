import { parse } from 'bcp-47';

const detectNorthAmerica = (): boolean => {
  // @ts-expect-error incase some old browser use userLanguage
  const userLocale = navigator.language || navigator.userLanguage;
  const result = parse(userLocale);
  if (result.region !== 'US' && result.region !== 'CA') return false;
  const timezoneOffset = new Date().getTimezoneOffset();
  // UTC-10 (Hawaii) to UTC-4 (Eastern Time Zone)
  if (timezoneOffset > 600 || timezoneOffset < 240) return false;
  return true;
};

const isNorthAmerica = detectNorthAmerica();

export default {
  isNorthAmerica,
  detectNorthAmerica,
};
