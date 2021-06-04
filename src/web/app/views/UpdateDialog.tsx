/* eslint-disable @typescript-eslint/naming-convention */
import React from 'react';
import { sprintf } from 'sprintf-js';

import ButtonGroup from 'app/widgets/ButtonGroup';
import i18n from 'helpers/i18n';
import Modal from 'app/widgets/Modal';
import storage from 'implementations/storage';

interface Props {
  open: boolean
  deviceName: string;
  deviceModel: string;
  currentVersion: string,
  latestVersion: string,
  releaseNote: string,
  onDownload: () => void,
  onClose: () => void,
  onInstall: () => void,
}

class UpdateDialog extends React.Component<Props> {
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

  getButtons = (later: string, download: string, upload: string): {
    label: string,
    dataAttrs: {
      [key: string]: string,
    },
    onClick: () => void,
  }[] => {
    const {
      onClose = () => { },
      onDownload = () => { },
      onInstall = () => { },
    } = this.props;

    const laterButton = {
      label: later,
      dataAttrs: {
        'ga-event': 'update-firmware-later',
      },
      onClick: onClose,
    };
    const downloadButton = {
      label: download,
      dataAttrs: {
        'ga-event': 'download-firmware-later',
      },
      onClick: () => {
        onDownload();
        onClose();
      },
    };
    const installButton = {
      label: upload,
      dataAttrs: {
        'ga-event': 'install-new-firmware',
      },
      className: 'btn-default primary',
      onClick: () => {
        onInstall();
        onClose();
      },
    };

    return [laterButton, downloadButton, installButton];
  };

  render() {
    const {
      open = false,
      deviceName = '',
      deviceModel = '',
      latestVersion = '',
      currentVersion = '',
      releaseNote = '',
    } = this.props;

    if (!open) {
      return <div />;
    }

    const {
      lang: {
        update: {
          firmware: {
            caption,
            message_pattern_1,
            message_pattern_2,
          },
          release_note,
          later,
          download,
          upload,
        },
      },
    } = i18n;
    const content = (
      <div className="update-wrapper">
        <h2 className="caption">{caption}</h2>
        <article className="update-brief">
          <p>{sprintf(message_pattern_1, deviceName)}</p>
          <p>{sprintf(message_pattern_2, deviceModel, latestVersion, currentVersion)}</p>
        </article>
        <h4 className="release-note-caption">{release_note}</h4>
        <div
          className="release-note-content"
          dangerouslySetInnerHTML={{
            __html: releaseNote,
          }}
        />
        <div className="action-button">
          <ButtonGroup buttons={this.getButtons(later, download, upload)} />
        </div>
      </div>
    );
    const className = {
      'modal-update': true,
      'shadow-modal': true,
    };

    return (
      // eslint-disable-next-line react/no-string-refs
      <Modal ref="modal" className={className} content={content} />
    );
  }
}

export default UpdateDialog;
