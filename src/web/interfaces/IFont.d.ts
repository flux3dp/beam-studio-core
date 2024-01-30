import { Font } from 'fontkit';
import { IUser } from 'interfaces/IUser';

export interface IFont {
  family?: string,
  postscriptName?: string,
  style?: string,
  weight?: number,
  italic?: boolean,
}

export interface IFontQuery {
  family: string,
  style?: string,
  weight?: number,
  italic?: boolean // not sure about type
}

export interface FontHelper {
  findFont: (fontDescriptor: FontDescriptor) => Promise<FontDescriptor>;
  findFonts: (fontDescriptor: FontDescriptor) => Promise<FontDescriptor[]>;
  getAvailableFonts: () => Promise<FontDescriptor[]>;
  substituteFont: (postscriptName: string, text: string) => Promise<FontDescriptor>;
  getFontName: (font: FontDescriptor) => string;
  getWebFontPreviewUrl: (fontFamily: string) => string | null;
  applyMonotypeStyle: (
    font: WebFont | IFont,
    user: IUser | null,
    silent?: boolean
  ) => Promise<{ success: boolean; fontLoadedPromise?: Promise<void> }>;
  getMonotypeUrl: (postscriptName: string) => Promise<string | null>;
  getLocalFont: (font: FontDescriptor) => Font | undefined;
}

export type FontDescriptorKeys =
  'postscriptName' |
  'family' |
  'style' |
  'weight' |
  'italic';

export interface FontDescriptor {
  path?: string;
  postscriptName?: string;
  family?: string;
  style?: string;
  weight?: number;
  width?: number;
  italic?: boolean;
  monospace?: boolean;
}

export interface WebFont {
  family: string;
  italic: boolean;
  postscriptName: string;
  style: string;
  weight: number;
  queryString?: string;
  fileName?: string;
  supportLangs?: string[];
  hasLoaded?: boolean;
}
