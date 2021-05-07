export interface IProgress {
  step: number,
  total: number
}

export interface IProgressDialog {
  id?: string,
  type?: string,
  caption?: string,
  message?: string,
  onCancel?: Function,
  percentage?: number | string,
  timeout?: number,
  timeoutCallback?: () => void,
}
