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

export interface IFontScanner {
  findFont: (fontDescriptor: FontDescriptor) => FontDescriptor;
  findFonts: (fontDescriptor: FontDescriptor) => FontDescriptor[];
  getAvailableFonts: () => FontDescriptor[];
  substituteFont: (postscriptName: string, text: string) => FontDescriptor;
}

export type FontDescriptorKeys =
  'path' |
  'postscriptName' |
  'family' |
  'style' |
  'weight' |
  'width' |
  'italic' |
  'monospace';

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
