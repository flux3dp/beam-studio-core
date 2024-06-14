import TopBarController from 'app/views/beambox/TopBar/contexts/TopBarController';
import { IFile } from 'interfaces/IMyCloud';

class CurrentFileManager {
  isCloudFile = false;

  private name: string | null = null;

  private path: string | null = null;

  getName = (): string | null => this.name;

  getPath = (): string | null => this.path;

  extractFileName = (filepath: string) => {
    const splitPath = filepath.split(window.os === 'Windows' ? '\\' : '/');
    const fileName = splitPath[splitPath.length - 1];
    return fileName.slice(0, fileName.lastIndexOf('.')).replace(':', '/');
  };

  setFileName = (fileName: string, extractFromPath = false) => {
    const name = extractFromPath ? this.extractFileName(fileName) : fileName;
    this.name = name;
    TopBarController.updateTitle();
  };

  setLocalFile = (filepath: string) => {
    const fileName = this.extractFileName(filepath);
    this.name = fileName;
    this.path = filepath;
    this.isCloudFile = false;
    TopBarController.updateTitle();
  };

  setCloudFile = (file: IFile) => {
    this.name = file.name;
    this.path = file.uuid;
    this.isCloudFile = true;
    TopBarController.updateTitle();
  };

  setCloudUUID = (uuid: string | null) => {
    this.path = uuid;
    this.isCloudFile = !!uuid;
    // update cloud icon
    TopBarController.updateTitle();
  };

  clear = () => {
    this.name = null;
    this.path = null;
    this.isCloudFile = false;
    TopBarController.updateTitle();
  };
}

// Singleton
const currentFileManager = new CurrentFileManager();

export default currentFileManager;
