import React from 'react';
import classNames from 'classnames';

import { ItemType } from 'app/constants/monitor-constants';
import { MonitorContext } from 'app/contexts/MonitorContext';

const maxFileNameLength = 12;
const DEFAULT_IMAGE = 'img/ph_s.png';

interface Props {
  fileName: string,
  fileInfo: { [key: string]: any },
  isSelected: boolean,
}

export default class FileItem extends React.Component<Props> {
  private imgSrc: string;

  constructor(props: Props) {
    super(props);
    this.imgSrc = null;
    const { fileInfo } = this.props;
    this.createImgURL(fileInfo);
  }

  componentWillUnmount() {
    this.revokeImgURL();
  }

  shouldComponentUpdate(nextProps: Props) {
    for (const key in nextProps) {
      if (nextProps[key] !== this.props[key]) {
        if (key === 'fileInfo') {
          const { fileInfo } = nextProps;
          this.revokeImgURL();
          this.createImgURL(fileInfo);
        }
        return true;
      }
    }
    return false;
  }

  createImgURL(fileInfo) {
    if (fileInfo && fileInfo[2] instanceof Blob) {
      this.imgSrc = URL.createObjectURL(fileInfo[2]);
    }
  }

  revokeImgURL() {
    if (this.imgSrc) {
      URL.revokeObjectURL(this.imgSrc);
      this.imgSrc = null;
    }
  }

  onImageError(evt) {
    evt.target.src = 'img/ph_s.png';
  }

  render() {
    const { imgSrc } = this;
    const { onHighlightItem, onSelectFile, onDeleteFile } = this.context;
    const { fileName, fileInfo, isSelected } = this.props;
    const iNameClass = classNames('fa', 'fa-times-circle-o', { selected: isSelected });
    return (
      <div
        title={fileName}
        className={classNames('file', { selected: isSelected })}
        data-test-key={fileName}
        data-filename={fileName}
        onClick={() => onHighlightItem({ name: fileName, type: ItemType.FILE })}
        onDoubleClick={() => onSelectFile(fileName, fileInfo)}
      >
        <div className="image-wrapper">
          <img src={imgSrc || DEFAULT_IMAGE} onError={this.onImageError} />
          <i
            className={iNameClass}
            onClick={onDeleteFile}
          />
        </div>
        <div className={classNames('name', { selected: isSelected })}>
          {fileName.length > maxFileNameLength ? `${fileName.substring(0, maxFileNameLength)}...` : fileName}
        </div>
      </div>
    );
  }
}

FileItem.contextType = MonitorContext;
