import React from 'react';
import classNames from 'classnames';

import ProgressConstants from 'app/constants/progress-constants';
import { AlertProgressContext } from 'app/contexts/Alert-Progress-Context';
import ButtonGroup from 'app/widgets/Button-Group';
import Modal from 'app/widgets/Modal';
import i18n from 'helpers/i18n';
import { IProgressDialog } from 'interfaces/IProgress';

const LANG = i18n.lang;

interface IProps {
  progress: IProgressDialog,
  onClose?: () => void,
}

class Progress extends React.Component<IProps> {
  private closeTimeout: NodeJS.Timeout;

  constructor(props) {
    super(props);
    const { progress } = this.props;
    const { timeout, timeoutCallback } = progress;
    if (timeout) {
      this.closeTimeout = setTimeout(() => {
        const { popById } = this.context;
        if (!progress.id) {
          console.warn('Progress without ID', progress);
        } else {
          popById(progress.id);
        }
        if (timeoutCallback) {
          timeoutCallback();
        }
      }, timeout);
    };
  }

  componentWillUnmount() {
    clearTimeout(this.closeTimeout);
  }

  renderCaption = (caption: string) => {
    if (!caption) return null;

    return (
      <div className='caption'>{caption}</div>
    );
  }

  renderCancelButton = () => {
    const progress = this.props.progress;
    const { onCancel, id } = progress;
    if (!onCancel) {
      return null;
    }
    const buttons = [{
      label: LANG.alert.cancel,
      className: classNames('btn-default'),
      onClick: () => {
        const { popById } = this.context;
        popById(id);
        onCancel();
      },
    }];
    return (
      <div className={'button-container'}>
        <ButtonGroup buttons={buttons} />
      </div>
    );

  }

  renderMessage = (progress: IProgressDialog) => {
    let content;
    if (progress.type === ProgressConstants.NONSTOP) {
      content = <div className={classNames('spinner-roller spinner-roller-reverse')} />
    } else if (progress.type === ProgressConstants.STEPPING) {
      const progressStyle = {
        width: (progress.percentage || 0) + '%'
      };
      content = (
        <div className='stepping-container'>
          <div className='progress-message'>{progress.message}</div>
          <div className='progress-bar'>
            <div className='current-progress' style={progressStyle} />
          </div>
        </div>
      );
    }
    return (
      <pre className='message'>
        {content}
      </pre>
    );
  }

  render() {
    const { progress } = this.props;
    return (
      <Modal>
        <div className={classNames('modal-alert', 'progress')}>
          {this.renderCaption(progress.caption)}
          {this.renderMessage(progress)}
          {this.renderCancelButton()}
        </div>
      </Modal>
    );
  }
}
Progress.contextType = AlertProgressContext;

export default Progress;
