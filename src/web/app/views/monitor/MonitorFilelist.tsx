import React from 'react';
import classNames from 'classnames';

import Alert from 'app/actions/alert-caller';
import AlertConstants from 'app/constants/alert-constants';
import DeviceConstants from 'app/constants/device-constants';
import { ItemType } from 'app/constants/monitor-constants';
import { MonitorContext } from 'app/contexts/MonitorContext';
import DeviceMaster from 'helpers/device-master';
import { HomeOutlined } from '@ant-design/icons';

import { Breadcrumb, Divider } from 'antd';
import FileItem from './widgets/FileItem';

interface Props {
  path: string,
}

interface State {
  directories: string[],
  files: string[],
  fileInfos: { [key: string]: any },
}

const REGULAR_STYLE = {
  width: 80,
  height: 80,
  textAlign: 'center',
};

const SELECTED_STYLE = {
  ...REGULAR_STYLE,
  color: 'white',
  background: '#0099CC',
};
class MonitorFilelist extends React.Component<Props, State> {
  private isUSBExist: boolean;

  private willUnmount = false;

  constructor(props) {
    super(props);
    this.isUSBExist = false;
    this.state = {
      directories: [],
      files: [],
      fileInfos: {},
    };
  }

  async componentDidMount() {
    const { path } = this.props;
    if (path === '') {
      await this.checkUSBFolderExistance();
    }
    await this.getFolderContent();
    await this.getFileInfos();
  }

  async componentDidUpdate(prevProps) {
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

  componentWillUnmount() {
    this.willUnmount = true;
  }

  async getFolderContent() {
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

  async getFileInfos() {
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

  checkUSBFolderExistance = async () => {
    try {
      const res = await DeviceMaster.ls('USB');
      console.log(res);
      this.isUSBExist = true;
    } catch (error) {
      this.isUSBExist = false;
    }
  };

  renderFolders() {
    const { directories } = this.state;
    const { onHighlightItem, onSelectFolder, highlightedItem } = this.context;
    const { path } = this.props;
    const folderElements = directories.map((folder: string) => {
      const selected = highlightedItem.type === ItemType.FOLDER && highlightedItem.name === folder;
      return (
        <div
          className={classNames('folder', { selected })}
          key={`${path}/${folder}`}
          qa-foldername={folder}
          onClick={() => onHighlightItem({ name: folder, type: ItemType.FOLDER })}
          onDoubleClick={() => onSelectFolder(folder)}
        >
          <div className="image-wrapper">
            <img src="img/folder.svg" />
          </div>
          <div className={classNames('name', { selected })}>
            {folder}
          </div>
        </div>

      );
    });
    return folderElements;
  }

  renderFiles() {
    const { files, fileInfos } = this.state;
    const { highlightedItem } = this.context;
    const { path } = this.props;

    const fileElements = files.map((file: string) => {
      let imgSrc = 'img/ph_s.png';
      if (fileInfos[file] && fileInfos[file][2] instanceof Blob) {
        imgSrc = URL.createObjectURL(fileInfos[file][2]);
      }
      return (
        <FileItem
          key={`${path}/${file}`}
          fileName={file}
          fileInfo={fileInfos[file]}
          isSelected={highlightedItem.name === file && highlightedItem.type === ItemType.FILE}
        />
      );
    });
    return fileElements;
  }

  render() {
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
                  onSelectFolder(path.split('/').slice(0, i + 1).join('/'), true)
                }}
                href="a"
              >
                { folder }
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
