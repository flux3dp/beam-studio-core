/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react';

import CameraDataBackup from './CameraDataBackup';

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

jest.mock('helpers/duration-formatter', () => (sec: number) => `${sec.toFixed(2)} seconds`);

const mockMkdir = jest.fn();
const mockWriteFile = jest.fn();
const mockExists = jest.fn();
const mockReaddirSync = jest.fn();
const mockReadFile = jest.fn();
jest.mock('implementations/fileSystem', () => ({
  join: (...args: string[]) => args.join('/'),
  getPath: (name: string) => `path/${name}`,
  mkdir: (...args: any) => mockMkdir(...args),
  writeFile: (...args: any) => mockWriteFile(...args),
  exists: (...args: any) => mockExists(...args),
  readdirSync: (...args: any) => mockReaddirSync(...args),
  readFile: (...args: any) => mockReadFile(...args),
}));

jest.mock('app/widgets/PathInput', () => ({
  __esModule: true,
  default: ({ className, buttonTitle, defaultValue, type, getValue }: any) => (
    <div className={className}>
      <p>buttonTitle: {buttonTitle}</p>
      <p>type: {type}</p>
      <input defaultValue={defaultValue} onChange={(e) => getValue(e.target.value, true)} />
    </div>
  ),
  InputType: {
    Folder: 'folder',
  },
}));

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
  alert: {
    confirm: 'confirm',
    cancel: 'cancel',
  },
  camera_data_backup: {
    checking_pictures: 'checking_pictures',
    no_picture_found: 'no_picture_found',
    downloading_data: 'downloading_data',
    estimated_time_left: 'estimated_time_left',
    folder_not_exists: 'folder_not_exists',
    uploading_data: 'uploading_data',
    title: 'title',
    select_folder_download: 'select_folder_download',
    select_folder_upload: 'select_folder_upload',
    download_success: 'download_success',
    upload_success: 'upload_success',
  },
  general: {
    choose_folder: 'choose_folder',
  },
}));

const mockOnClose = jest.fn();
const mockDateNow = jest.fn();

describe('test CameraDataBackup', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    Date.now = mockDateNow;
    let t = 0;
    mockDateNow.mockImplementation(() => {
      t += 1000;
      return t;
    });
  });

  it('should render correctly when downloading', async () => {
    mockLs.mockResolvedValue({ files: ['file1', 'file2'] });
    const { baseElement } = render(
      <CameraDataBackup deviceName="deviceName" type="download" onClose={mockOnClose} />
    );
    await waitFor(() => {
      expect(mockOpenNonstopProgress).toBeCalledTimes(1);
      expect(mockOpenNonstopProgress).toHaveBeenLastCalledWith({
        id: 'camera-data-backup',
        message: 'checking_pictures',
      });
      expect(mockPopById).toBeCalledTimes(1);
      expect(mockLs).toBeCalledTimes(1);
      expect(mockLs).toHaveBeenLastCalledWith('camera_calib');
    });
    await waitFor(() =>
      expect(baseElement.querySelector('.ant-modal')).not.toHaveClass('ant-zoom-appear')
    );
    expect(baseElement).toMatchSnapshot();
  });

  it('should render correctly when downloading and no picture found', async () => {
    mockLs.mockResolvedValue({ files: [] });
    render(<CameraDataBackup deviceName="deviceName" type="download" onClose={mockOnClose} />);
    await waitFor(() => {
      expect(mockOpenNonstopProgress).toBeCalledTimes(1);
      expect(mockOpenNonstopProgress).toHaveBeenLastCalledWith({
        id: 'camera-data-backup',
        message: 'checking_pictures',
      });
      expect(mockPopById).toBeCalledTimes(1);
      expect(mockLs).toBeCalledTimes(1);
      expect(mockLs).toHaveBeenLastCalledWith('camera_calib');
      expect(mockPopUpError).toBeCalledTimes(1);
      expect(mockPopUpError).toHaveBeenLastCalledWith({ message: 'no_picture_found' });
      expect(mockOnClose).toBeCalledTimes(1);
    });
  });

  test('edit path', () => {
    mockGet.mockReturnValue('path');
    const { baseElement } = render(
      <CameraDataBackup deviceName="deviceName" type="upload" onClose={mockOnClose} />
    );
    expect(baseElement.querySelector('input')).toHaveValue('path');
    fireEvent.change(baseElement.querySelector('input'), { target: { value: 'newPath' } });
    expect(baseElement.querySelector('input')).toHaveValue('newPath');
  })

  it('should render correctly when uploading', async () => {
    const { baseElement } = render(
      <CameraDataBackup deviceName="deviceName" type="upload" onClose={mockOnClose} />
    );
    expect(mockGet).toBeCalledTimes(1);
    expect(mockGet).toHaveBeenLastCalledWith('ador-backup-path');
    expect(mockLs).not.toBeCalled();
    await waitFor(() =>
      expect(baseElement.querySelector('.ant-modal')).not.toHaveClass('ant-zoom-appear')
    );
    expect(baseElement).toMatchSnapshot();
  });

  test('handleOk when downloading', async () => {
    mockLs.mockResolvedValue({ files: ['file1', 'file2'] });
    const { getByText } = render(
      <CameraDataBackup deviceName="deviceName" type="download" onClose={mockOnClose} />
    );
    await waitFor(() => {
      expect(mockOpenNonstopProgress).toBeCalledTimes(1);
      expect(mockOpenNonstopProgress).toHaveBeenLastCalledWith({
        id: 'camera-data-backup',
        message: 'checking_pictures',
      });
      expect(mockPopById).toBeCalledTimes(1);
      expect(mockLs).toBeCalledTimes(1);
      expect(mockLs).toHaveBeenLastCalledWith('camera_calib');
    });
    mockDownloadFile.mockImplementation(async (dirName: string, name: string, onProgress) => {
      onProgress({ left: 50, size: 100 });
      const mockBlob = {
        arrayBuffer: () => `${dirName}/${name}`,
      };
      return ['info', mockBlob];
    });
    fireEvent.click(getByText('confirm'));
    await waitFor(() => {
      expect(mockPopById).toBeCalledTimes(5);
      expect(mockPopById).toHaveBeenLastCalledWith('camera-data-backup');
    });
    expect(mockSet).toBeCalledTimes(1);
    expect(mockSet).toHaveBeenLastCalledWith(
      'ador-backup-path',
      'path/documents/Beam Studio/deviceName'
    );
    expect(mockOpenSteppingProgress).toBeCalledTimes(3);
    expect(mockOpenSteppingProgress).toHaveBeenLastCalledWith({
      id: 'camera-data-backup',
      message: 'downloading_data',
      onCancel: expect.any(Function),
    });
    expect(mockMkdir).toBeCalledTimes(3);
    expect(mockMkdir).toHaveBeenNthCalledWith(
      1,
      'path/documents/Beam Studio/deviceName/camera_calib',
      true
    );
    expect(mockMkdir).toHaveBeenNthCalledWith(
      2,
      'path/documents/Beam Studio/deviceName/auto_leveling',
      true
    );
    expect(mockMkdir).toHaveBeenNthCalledWith(
      3,
      'path/documents/Beam Studio/deviceName/fisheye',
      true
    );
    expect(mockDownloadFile).toBeCalledTimes(6);
    expect(mockDownloadFile).toHaveBeenNthCalledWith(
      1,
      'camera_calib',
      'file1',
      expect.any(Function)
    );
    expect(mockDownloadFile).toHaveBeenNthCalledWith(
      2,
      'camera_calib',
      'file2',
      expect.any(Function)
    );
    expect(mockDownloadFile).toHaveBeenNthCalledWith(
      3,
      'auto_leveling',
      'file1',
      expect.any(Function)
    );
    expect(mockDownloadFile).toHaveBeenNthCalledWith(
      4,
      'auto_leveling',
      'file2',
      expect.any(Function)
    );
    expect(mockDownloadFile).toHaveBeenNthCalledWith(5, 'fisheye', 'file1', expect.any(Function));
    expect(mockDownloadFile).toHaveBeenNthCalledWith(6, 'fisheye', 'file2', expect.any(Function));
    expect(mockUpdate).toBeCalledTimes(6);
    expect(mockUpdate).toHaveBeenNthCalledWith(1, 'camera-data-backup', {
      message: 'downloading_data camera_calib 1/2<br/>estimated_time_left 3.00 seconds',
      percentage: 25,
    });
    expect(mockUpdate).toHaveBeenNthCalledWith(2, 'camera-data-backup', {
      message: 'downloading_data camera_calib 2/2<br/>estimated_time_left 0.67 seconds',
      percentage: 75,
    });
    expect(mockUpdate).toHaveBeenNthCalledWith(3, 'camera-data-backup', {
      message: 'downloading_data auto_leveling 1/2<br/>estimated_time_left 3.00 seconds',
      percentage: 25,
    });
    expect(mockUpdate).toHaveBeenNthCalledWith(4, 'camera-data-backup', {
      message: 'downloading_data auto_leveling 2/2<br/>estimated_time_left 0.67 seconds',
      percentage: 75,
    });
    expect(mockUpdate).toHaveBeenNthCalledWith(5, 'camera-data-backup', {
      message: 'downloading_data fisheye 1/2<br/>estimated_time_left 3.00 seconds',
      percentage: 25,
    });
    expect(mockUpdate).toHaveBeenNthCalledWith(6, 'camera-data-backup', {
      message: 'downloading_data fisheye 2/2<br/>estimated_time_left 0.67 seconds',
      percentage: 75,
    });
    expect(mockWriteFile).toBeCalledTimes(6);
    expect(mockWriteFile).toHaveBeenNthCalledWith(
      1,
      'path/documents/Beam Studio/deviceName/camera_calib/file1',
      expect.any(Buffer)
    );
    expect(mockWriteFile).toHaveBeenNthCalledWith(
      2,
      'path/documents/Beam Studio/deviceName/camera_calib/file2',
      expect.any(Buffer)
    );
    expect(mockWriteFile).toHaveBeenNthCalledWith(
      3,
      'path/documents/Beam Studio/deviceName/auto_leveling/file1',
      expect.any(Buffer)
    );
    expect(mockWriteFile).toHaveBeenNthCalledWith(
      4,
      'path/documents/Beam Studio/deviceName/auto_leveling/file2',
      expect.any(Buffer)
    );
    expect(mockWriteFile).toHaveBeenNthCalledWith(
      5,
      'path/documents/Beam Studio/deviceName/fisheye/file1',
      expect.any(Buffer)
    );
    expect(mockWriteFile).toHaveBeenNthCalledWith(
      6,
      'path/documents/Beam Studio/deviceName/fisheye/file2',
      expect.any(Buffer)
    );
    expect(mockPopUp).toBeCalledTimes(1);
    expect(mockPopUp).toHaveBeenLastCalledWith({ message: 'download_success' });
    expect(mockOnClose).toBeCalledTimes(1);
  });

  test('handleOk when uploading', async () => {
    mockGet.mockReturnValue('path');
    const { getByText } = render(
      <CameraDataBackup deviceName="deviceName" type="upload" onClose={mockOnClose} />
    );
    mockExists.mockReturnValue(true);
    mockReaddirSync
      .mockReturnValueOnce(['file1', 'file2'])
      .mockReturnValueOnce(['file1'])
      .mockReturnValueOnce([]);
    mockReadFile.mockImplementation((path: string) => path);
    mockUploadToDirectory.mockImplementation(async (blob, dir, filename, onProgress) => {
      onProgress({ step: 50, total: 100 });
    });
    fireEvent.click(getByText('confirm'));
    await waitFor(() => {
      expect(mockPopById).toBeCalledTimes(4);
      expect(mockPopById).toHaveBeenLastCalledWith('camera-data-backup');
    });
    expect(mockOpenSteppingProgress).toBeCalledTimes(3);
    expect(mockOpenSteppingProgress).toHaveBeenLastCalledWith({
      id: 'camera-data-backup',
      message: 'uploading_data',
      onCancel: expect.any(Function),
    });
    expect(mockReadFile).toBeCalledTimes(3);
    expect(mockReadFile).toHaveBeenNthCalledWith(1, 'path/camera_calib/file1');
    expect(mockReadFile).toHaveBeenNthCalledWith(2, 'path/camera_calib/file2');
    expect(mockReadFile).toHaveBeenNthCalledWith(3, 'path/auto_leveling/file1');
    expect(mockUploadToDirectory).toBeCalledTimes(3);
    expect(mockUploadToDirectory).toHaveBeenNthCalledWith(
      1,
      expect.any(Blob),
      'camera_calib',
      'file1',
      expect.any(Function)
    );
    expect(mockUploadToDirectory).toHaveBeenNthCalledWith(
      2,
      expect.any(Blob),
      'camera_calib',
      'file2',
      expect.any(Function)
    );
    expect(mockUploadToDirectory).toHaveBeenNthCalledWith(
      3,
      expect.any(Blob),
      'auto_leveling',
      'file1',
      expect.any(Function)
    );
    expect(mockUpdate).toBeCalledTimes(3);
    expect(mockUpdate).toHaveBeenNthCalledWith(1, 'camera-data-backup', {
      message: 'uploading_data camera_calib 1/2<br/>estimated_time_left 3.00 seconds',
      percentage: 25,
    });
    expect(mockUpdate).toHaveBeenNthCalledWith(2, 'camera-data-backup', {
      message: 'uploading_data camera_calib 2/2<br/>estimated_time_left 0.67 seconds',
      percentage: 75,
    });
    expect(mockUpdate).toHaveBeenNthCalledWith(3, 'camera-data-backup', {
      message: 'uploading_data auto_leveling 1/1<br/>estimated_time_left 1.00 seconds',
      percentage: 50,
    });
    expect(mockPopUp).toBeCalledTimes(1);
    expect(mockPopUp).toHaveBeenLastCalledWith({ message: 'upload_success' });
    expect(mockOnClose).toBeCalledTimes(1);
  });
});
