import React, { createRef } from 'react';
import classNames from 'classnames';

import i18n from 'helpers/i18n';
import ButtonGroup from 'app/widgets/Button-Group';
import keyCodeConstants from 'app/constants/keycode-constants';
import Modal from 'app/widgets/Modal';
import { IButton } from 'interfaces/IButton';

const LANG = i18n.lang.alert;

interface Props {
  caption?: string;
  message?: string;
  buttons?: IButton[];
  confirmValue?: string;
  onConfirmed: () => void;
  onClose: () => void;
  onCancel: () => void;
}

class ConfirmPrompt extends React.Component<Props> {
  private containerRef: React.RefObject<HTMLDivElement>

  private inputRef: React.RefObject<HTMLInputElement>

  constructor(props: Props) {
    super(props);
    this.containerRef = createRef();
    this.inputRef = createRef();
  }

  onValidate = () => {
    const { confirmValue } = this.props;
    if (!confirmValue) {
      this.onConfirmed();
    } else {
      const input = this.inputRef.current;
      if (confirmValue === input.value) {
        this.onConfirmed();
      } else {
        this.onConfirmFailed();
      }
    }
  }

  onConfirmed = () => {
    const { onConfirmed, onClose } = this.props;
    onConfirmed();
    onClose();
  }

  onConfirmFailed = () => {
    const input = this.inputRef.current;
    const container = this.containerRef.current;
    input.value = '';
    container.classList.remove('animate__animated', 'animate__bounceIn');
    container.offsetWidth; // some magic: https://css-tricks.com/restart-css-animation/
    container.classList.add('animate__animated', 'animate__bounceIn');
  }

  handleKeyDown = (e) => {
    if (e.keyCode === keyCodeConstants.KEY_RETURN) {
      this.onValidate();
    }
    e.stopPropagation();
  }

  renderButtons = () => {
    const { buttons, onCancel, onClose } = this.props;
    if (buttons) {
      return <ButtonGroup className='btn-right' buttons={buttons} />;
    }
    const defaultButtons = [
      {
        label: LANG.ok,
        className: 'btn-default primary',
        onClick: () => {
          this.onValidate();
        }
      },
      {
        label: LANG.cancel,
        className: 'btn-default',
        onClick: () => {
          if (onCancel) {
            const input = this.inputRef.current;
            onCancel();
          }
          onClose();
        }
      }
    ];
    return <ButtonGroup className='btn-right' buttons={defaultButtons} />;
  };

  render() {
    return (
      <Modal>
        <div className={classNames('confirm-prompt-dialog-container', 'animate__animated', 'animate__bounceIn')} ref={this.containerRef}>
          <div className="caption">{this.props.caption}</div>
          <pre className="message">{this.props.message}</pre>
          <input
            autoFocus={true}
            ref={this.inputRef}
            className="text-input"
            type="text"
            onKeyDown={(e) => this.handleKeyDown(e)}
            placeholder={this.props.confirmValue}
          />
          <div className="footer">
            {this.renderButtons()}
          </div>
        </div>
      </Modal>
    );
  }
};

export default ConfirmPrompt;
