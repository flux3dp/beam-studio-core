import classNames from 'classnames';
import React from 'react';

import ButtonGroup from 'app/widgets/ButtonGroup';
import i18n from 'helpers/i18n';
import Modal from 'app/widgets/Modal';
import ProgressConstants from 'app/constants/progress-constants';
import { IProgressDialog } from 'interfaces/IProgress';

const LANG = i18n.lang;

interface Props {
  progress: IProgressDialog;
  popById: (id: string) => void;
}

class Progress extends React.Component<Props> {
  private closeTimeout: NodeJS.Timeout;

  constructor(props) {
    super(props);
    const {
      progress: {
        id,
        timeout,
      },
      popById,
    } = this.props;
    if (timeout) {
      this.closeTimeout = setTimeout(() => {
        if (!id) {
          console.warn('Progress without ID', id);
        } else {
          popById(id);
        }
      }, timeout);
    }
  }

  componentWillUnmount() {
    clearTimeout(this.closeTimeout);
  }

  renderCaption = (caption: string): JSX.Element => {
    if (!caption) return null;
    return (
      <div className="caption">{caption}</div>
    );
  };

  renderCancelButton = (
    id: string,
    onCancel: () => void,
  ): JSX.Element => {
    if (!onCancel) {
      return null;
    }
    const buttons = [{
      label: LANG.alert.cancel,
      className: classNames('btn-default'),
      onClick: () => {
        const { popById } = this.props;
        popById(id);
        onCancel();
      },
    }];
    return (
      <div className="button-container">
        <ButtonGroup buttons={buttons} />
      </div>
    );
  };

  renderMessage = (
    type: string,
    percentage: string | number,
    message: string,
  ): JSX.Element => {
    let content;
    if (type === ProgressConstants.NONSTOP) {
      content = <div className={classNames('spinner-roller spinner-roller-reverse')} />
    } else if (type === ProgressConstants.STEPPING) {
      content = (
        <div className="stepping-container">
          <div className="progress-message">{message}</div>
          <div className="progress-bar">
            <div
              className="current-progress"
              style={{
                width: `${percentage || 0}%`,
              }}
            />
          </div>
        </div>
      );
    }
    return (
      <pre className="message">
        {content}
      </pre>
    );
  };

  render(): JSX.Element {
    const { progress } = this.props;
    return (
      <Modal>
        <div className={classNames('modal-alert', 'progress')}>
          {this.renderCaption(progress.caption)}
          {this.renderMessage(progress.type, progress.percentage, progress.message)}
          {this.renderCancelButton(progress.id, progress.onCancel)}
        </div>
      </Modal>
    );
  }
}

export default Progress;
