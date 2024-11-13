import { parse } from 'bcp-47';

function detectLocale(
  regions: Array<string>,
  timezoneOffsetPredicate: (timezoneOffset: number) => boolean
): () => boolean {
  return () => {
    try {
      const userLocales = navigator.languages || [
        // @ts-expect-error: Support for older browsers with userLanguage
        navigator.language || (navigator.userLanguage as string),
      ];
      const hasMatchingRegion = userLocales.some((locale) =>
        regions.includes(parse(locale).region)
      );

      return hasMatchingRegion && timezoneOffsetPredicate(new Date().getTimezoneOffset());
    } catch (e) {
      console.error('Failed to get locale', e);

      return true;
    }
  };
}

const detectNorthAmerica = detectLocale(
  ['US', 'CA'],
  // UTC-10 (Hawaii) to UTC-4 (Eastern Time Zone)
  (timezoneOffset) => timezoneOffset <= 600 && timezoneOffset >= 240
);
const isNorthAmerica = detectNorthAmerica();

const detectTwOrHk = detectLocale(
  ['TW', 'HK'],
  // UTC+8 timezone
  (timezoneOffset) => timezoneOffset === -480
);
const isTwOrHk = detectTwOrHk();

export default {
  isNorthAmerica,
  detectNorthAmerica,
  isTwOrHk,
  detectTwOrHk,
};
