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
