/* eslint-disable @typescript-eslint/no-explicit-any */
import { downloadCameraData, uploadCameraData } from './camera-data-backup';

const mockPopUp = jest.fn();
const mockPopUpError = jest.fn();
jest.mock('app/actions/alert-caller', () => ({
  popUp: (...args: any) => mockPopUp(...args),
  popUpError: (...args: any) => mockPopUpError(...args),
}));

const mockLs = jest.fn();
const mockDownloadFile = jest.fn();
const mockUploadToDirectory = jest.fn();
jest.mock('helpers/device-master', () => ({
  ls: (...args: any) => mockLs(...args),
  downloadFile: (...args: any) => mockDownloadFile(...args),
  uploadToDirectory: (...args: any) => mockUploadToDirectory(...args),
}));

const mockWriteFileDialog = jest.fn();
const mockGetFileFromDialog = jest.fn();
jest.mock('implementations/dialog', () => ({
  writeFileDialog: (...args: any) => mockWriteFileDialog(...args),
  getFileFromDialog: (...args: any) => mockGetFileFromDialog(...args),
}));

jest.mock('helpers/duration-formatter', () => (sec: number) => `${sec.toFixed(2)} seconds`);

const mockOpenNonstopProgress = jest.fn();
const mockOpenSteppingProgress = jest.fn();
const mockUpdate = jest.fn();
const mockPopById = jest.fn();
jest.mock('app/actions/progress-caller', () => ({
  openNonstopProgress: (...args: any) => mockOpenNonstopProgress(...args),
  openSteppingProgress: (...args: any) => mockOpenSteppingProgress(...args),
  update: (...args: any) => mockUpdate(...args),
  popById: (...args: any) => mockPopById(...args),
}));

const mockGet = jest.fn();
const mockSet = jest.fn();
jest.mock('implementations/storage', () => ({
  get: (...args: any) => mockGet(...args),
  set: (...args: any) => mockSet(...args),
}));

jest.mock('helpers/useI18n', () => () => ({
  camera_data_backup: {
    checking_pictures: 'checking_pictures',
    no_picture_found: 'no_picture_found',
    downloading_data: 'downloading_data',
    estimated_time_left: 'estimated_time_left',
    folder_not_exists: 'folder_not_exists',
    incorrect_folder: 'incorrect_folder',
    uploading_data: 'uploading_data',
    title: 'title',
    download_success: 'download_success',
    upload_success: 'upload_success',
  },
}));
