interface IWrappedTaskFile {
  data: string | ArrayBuffer;
  name: string;
  uploadName: string;
  extension: string;
  type: string;
  size: number;
  thumbnailSize: number;
  index: number;
  totalFiles: number;
}

interface IWrappedSwiftrayTaskFile {
  data: string;
  name: string;
  uploadName: string;
  extension: string;
  thumbnail: string;
}

export {
  IWrappedTaskFile,
  IWrappedSwiftrayTaskFile
}
