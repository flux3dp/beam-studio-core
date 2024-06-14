import { IFile } from 'interfaces/IMyCloud';

import currentFileManager from './currentFileManager';

const mockUpdateTitle = jest.fn();

jest.mock('app/views/beambox/TopBar/contexts/TopBarController', () => ({
  updateTitle: () => mockUpdateTitle(),
}));

describe('test currentFileManager', () => {
  beforeEach(() => {
    currentFileManager.clear();
    mockUpdateTitle.mockClear();
  });

  it('should set file name', () => {
    currentFileManager.setFileName('test');
    expect(currentFileManager.getName()).toBe('test');
    expect(mockUpdateTitle).toHaveBeenCalledTimes(1);
  });

  it('should set file name extracted from path', () => {
    currentFileManager.setFileName('/some/path/to/test.svg', true);
    expect(currentFileManager.getName()).toBe('test');
    expect(mockUpdateTitle).toHaveBeenCalledTimes(1);
  });

  it('should set local file', () => {
    currentFileManager.setLocalFile('/some/path/to/test.svg');
    expect(currentFileManager.getName()).toBe('test');
    expect(currentFileManager.getPath()).toBe('/some/path/to/test.svg');
    expect(currentFileManager.isCloudFile).toBe(false);
    expect(mockUpdateTitle).toHaveBeenCalledTimes(1);
  });

  it('should set cloud file', () => {
    currentFileManager.setCloudFile({ name: 'test', uuid: '123' } as IFile);
    expect(currentFileManager.getName()).toBe('test');
    expect(currentFileManager.getPath()).toBe('123');
    expect(currentFileManager.isCloudFile).toBe(true);
    expect(mockUpdateTitle).toHaveBeenCalledTimes(1);
  });

  it('should set cloud UUID', () => {
    currentFileManager.setCloudUUID('123');
    expect(currentFileManager.getPath()).toBe('123');
    expect(currentFileManager.isCloudFile).toBe(true);
    expect(mockUpdateTitle).toHaveBeenCalledTimes(1);
  });

  it('should clear', () => {
    currentFileManager.setFileName('test');
    expect(mockUpdateTitle).toHaveBeenCalledTimes(1);
    currentFileManager.clear();
    expect(currentFileManager.getName()).toBe(null);
    expect(currentFileManager.getPath()).toBe(null);
    expect(currentFileManager.isCloudFile).toBe(false);
    expect(mockUpdateTitle).toHaveBeenCalledTimes(2);
  });
});
