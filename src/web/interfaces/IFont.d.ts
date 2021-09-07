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
  findFont: (fontDescriptor: FontDescriptor) => FontDescriptor;
  findFonts: (fontDescriptor: FontDescriptor) => FontDescriptor[];
  getAvailableFonts: () => FontDescriptor[];
  substituteFont: (postscriptName: string, text: string) => FontDescriptor;
  getFontName: (font: FontDescriptor) => string;
  getWebFontAndUpload: (postscriptName: string) => Promise<boolean>;
  getWebFontPreviewUrl: (fontFamily: string) => string | null;
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
  family: string,
  italic: boolean,
  postscriptName: string,
  style: string,
  weight: number,
  queryString?: string,
  fileName?: string,
  supportLangs?: string[],
}
