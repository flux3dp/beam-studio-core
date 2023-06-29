import AppSettings from 'app/app-settings';
import LangDe from 'app/lang/de';
import LangEn from 'app/lang/en';
import LangEs from 'app/lang/es';
import LangPt from 'app/lang/pt';
import LangFr from 'app/lang/fr';
import LangJa from 'app/lang/ja';
import LangKr from 'app/lang/kr';
import LangNl from 'app/lang/nl';
import LangZHCN from 'app/lang/zh-cn';
import LangZHTW from 'app/lang/zh-tw';
import storage from 'implementations/storage';
import { ILang } from 'interfaces/ILang';

const ACTIVE_LANG = 'active-lang';
const langCache = {
  de: LangDe,
  en: LangEn,
  es: LangEs,
  pt: LangPt,
  fr: LangFr,
  nl: LangNl,
  'zh-tw': LangZHTW,
  ja: LangJa,
  kr: LangKr,
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
