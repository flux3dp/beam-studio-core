import AppSettings from 'app/app-settings';
import LangDe from 'app/lang/de';
import LangEn from 'app/lang/en';
import LangEs from 'app/lang/es';
import LangJa from 'app/lang/ja';
import LangZHCN from 'app/lang/zh-cn';
import LangZHTW from 'app/lang/zh-tw';
import storage from 'helpers/storage-helper';
import { ILang } from 'interfaces/ILang';

const ACTIVE_LANG = 'active-lang';
const langCache = {
  de: LangDe,
  en: LangEn,
  es: LangEs,
  'zh-tw': LangZHTW,
  ja: LangJa,
  'zh-cn': LangZHCN,
};

// TODO: Difference between activeLang and currentLang?
let activeLang = storage.get(ACTIVE_LANG) as string || AppSettings.i18n.default_lang;

/**
 * set active language
 *
 * @param {string} language code in lower case
 *
 * @return string
 */
export function getActiveLang(): string {
  return storage.get(ACTIVE_LANG) as string || AppSettings.i18n.default_lang;
}

/**
 * set active language
 *
 * @param {string} language code in lower case
 */
export function setActiveLang(lang: string): void {
  activeLang = lang;
  storage.set(ACTIVE_LANG, lang);
}

export default {
  getActiveLang,
  setActiveLang,
  get lang(): ILang {
    return langCache[activeLang];
  },
};
