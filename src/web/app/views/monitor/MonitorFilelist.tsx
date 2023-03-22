import React from 'react';
import { Breadcrumb } from 'antd';
import { HomeOutlined } from '@ant-design/icons';

import Alert from 'app/actions/alert-caller';
import AlertConstants from 'app/constants/alert-constants';
import DeviceConstants from 'app/constants/device-constants';
import DeviceMaster from 'helpers/device-master';
import { MonitorContext } from 'app/contexts/MonitorContext';

import DirectoryItem from './widgets/DirectoryItem';
import FileItem from './widgets/FileItem';

interface Props {
  path: string,
}

interface State {
  directories: string[],
  files: string[],
  fileInfos: { [key: string]: any },
}

class MonitorFilelist extends React.Component<Props, State> {
  private isUSBExist: boolean;

  private willUnmount = false;

  constructor(props: Props) {
    super(props);
    this.isUSBExist = false;
    this.state = {
      directories: [],
      files: [],
      fileInfos: {},
    };
  }

  async componentDidMount(): Promise<void> {
    const { path } = this.props;
    if (path === '') {
      await this.checkUSBFolderExistance();
    }
    await this.getFolderContent();
    await this.getFileInfos();
  }

  async componentDidUpdate(prevProps: Props): Promise<void> {
    const { path } = this.props;
    const { shouldUpdateFileList, setShouldUpdateFileList } = this.context;
    if (path !== prevProps.path || shouldUpdateFileList) {
      if (shouldUpdateFileList) {
        setShouldUpdateFileList(false);
      }
      await this.getFolderContent();
      await this.getFileInfos();
    }
  }

  componentWillUnmount(): void {
    this.willUnmount = true;
  }

  async getFolderContent(): Promise<void> {
    const { path } = this.props;
    const res = await DeviceMaster.ls(path);
    if (res.error) {
      if (res.error !== DeviceConstants.NOT_EXIST) {
        Alert.popUp({
          id: 'ls error',
          type: AlertConstants.SHOW_POPUP_ERROR,
          message: res.error,
        });
        res.directories = [];
        res.files = [];
      }
    }

    if (!this.isUSBExist && path === '') {
      const i = res.directories.indexOf('USB');
      if (i >= 0) {
        res.directories.splice(i, 1);
      }
    }

    this.setState({
      directories: res.directories,
      files: res.files,
      fileInfos: {},
    });
  }

  async getFileInfos(): Promise<void> {
    const { path } = this.props;
    const { files, fileInfos } = this.state;
    for (let i = 0; i < files.length; i += 1) {
      if (this.willUnmount) {
        return;
      }
      const file = files[i];
      // eslint-disable-next-line no-await-in-loop
      const res = await DeviceMaster.fileInfo(path, file);
      fileInfos[file] = res;
      this.setState({ fileInfos });
    }
  }

  checkUSBFolderExistance = async (): Promise<void> => {
    try {
      const res = await DeviceMaster.ls('USB');
      this.isUSBExist = true;
    } catch (error) {
      this.isUSBExist = false;
    }
  };

  renderFolders(): JSX.Element[] {
    const { directories } = this.state;
    const { path } = this.props;
    const folderElements = directories.map((folder: string) => (
      <DirectoryItem key={`${path}/${folder}`} name={folder} />
    ));
    return folderElements;
  }

  renderFiles(): JSX.Element[] {
    const { files } = this.state;
    const { path } = this.props;

    const fileElements = files.map((file: string) => (
      <FileItem
        key={`${path}/${file}`}
        path={path}
        fileName={file}
      />
    ));
    return fileElements;
  }

  render(): JSX.Element {
    const { path } = this.props;
    const { onSelectFolder } = this.context;
    return (
      <div className="wrapper">
        <Breadcrumb>
          <Breadcrumb.Item
            key={0}
            onClick={(e) => { e.preventDefault(); onSelectFolder('', true); }}
            href="a"
          >
            <HomeOutlined />
          </Breadcrumb.Item>
          {
            path.split('/').filter((v) => v !== '').map((folder, i) => (
              <Breadcrumb.Item
                key={folder}
                onClick={(e) => {
                  e.preventDefault();
                  onSelectFolder(path.split('/').slice(0, i + 1).join('/'), true);
                }}
              >
                {folder}
              </Breadcrumb.Item>
            ))
          }
        </Breadcrumb>
        <div className="file-monitor-v2">
          {this.renderFolders()}
          {this.renderFiles()}
        </div>
      </div>
    );
  }
}
MonitorFilelist.contextType = MonitorContext;

export default MonitorFilelist;
