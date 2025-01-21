import isDev from './is-dev';
import localeHelper from './locale-helper';

export const checkFbb2 = (): boolean => localeHelper.isTwOrHk || localeHelper.isJp || isDev();
export const checkFpm1 = (): boolean => localeHelper.isTwOrHk || isDev();
export const checkChuckRotary = (): boolean => localeHelper.isTwOrHk || isDev();
