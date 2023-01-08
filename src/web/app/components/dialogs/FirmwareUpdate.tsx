/* eslint-disable @typescript-eslint/naming-convention */
import React from 'react';
import { sprintf } from 'sprintf-js';

import i18n from 'helpers/i18n';
import { Button, Modal } from 'antd';
import storage from 'implementations/storage';

const LANG = i18n.lang.update;
interface Props {
  deviceName: string;
  deviceModel: string;
  currentVersion: string,
  latestVersion: string,
  releaseNote: string,
  onDownload: () => void,
  onClose: () => void,
  onInstall: () => void,
}

class FirmwareUpdate extends React.Component<Props> {
  onSkip = (): void => {
    const {
      latestVersion = '',
      onClose = () => { },
    } = this.props;
    const ignoreList = (storage.get('firmware-update-ignore-list') || []) as Array<string>;
    ignoreList.push(latestVersion);

    // save skip version and close
    storage.set('firmware-update-ignore-list', ignoreList);
    onClose();
  };

  render(): JSX.Element {
    const {
      deviceName = '',
      deviceModel = '',
      latestVersion = '',
      currentVersion = '',
      releaseNote = '',
      onClose = () => { },
      onDownload = () => { },
      onInstall = () => { },
    } = this.props;

    return (
      <Modal
        open
        centered
        title={LANG.firmware.caption}
        footer={
          [
            <Button onClick={onClose}>
              {LANG.later}
            </Button>,
            <Button onClick={() => { onInstall(); onClose(); }}>
              {LANG.upload}
            </Button>,
            <Button type="primary" onClick={() => { onDownload(); onClose(); }}>
              {LANG.download}
            </Button>,
          ]
        }
      >
        <div className="update-wrapper">
          <article className="update-brief">
            <p>{sprintf(LANG.firmware.message_pattern_1, deviceName)}</p>
            <p>
              {sprintf(LANG.firmware.message_pattern_2, deviceModel,
                latestVersion, currentVersion)}
            </p>
          </article>
          <h4 className="release-note-caption">{LANG.release_note}</h4>
          <div
            className="release-note-content"
            dangerouslySetInnerHTML={{
              __html: releaseNote,
            }}
          />
        </div>
      </Modal>
    );
  }
}

export default FirmwareUpdate;
