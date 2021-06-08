export interface IProgress {
  step: number,
  total: number
}

export interface IProgressDialog {
  id?: string,
  type?: string,
  caption?: string,
  message?: string,
  onCancel?: () => void,
  percentage?: number | string,
  timeout?: number,
  timeoutCallback?: () => void,
  isProgress?: boolean,
}
