/* eslint-disable jsx-a11y/no-autofocus */
import React, { createRef } from 'react';
import classNames from 'classnames';

import i18n from 'helpers/i18n';
import ButtonGroup from 'app/widgets/Button-Group';
import keyCodeConstants from 'app/constants/keycode-constants';
import Modal from 'app/widgets/Modal';
import { IButton } from 'interfaces/IButton';

const LANG = i18n.lang.alert;

interface Props {
  buttons?: IButton[];
  closeOnBackgroundClick?: boolean;
  caption?: string;
  defaultValue?: string;
  onYes: (value?: string) => void;
  onClose: () => void;
  onCancel?: (value?: string) => void;
}

class Prompt extends React.Component<Props> {
  private inputRef: React.RefObject<HTMLInputElement>;

  constructor(props: Props) {
    super(props);
    this.inputRef = createRef();
  }

  handleKeyDown = (e: React.KeyboardEvent): void => {
    const { onYes, onClose } = this.props;
    if (e.keyCode === keyCodeConstants.KEY_RETURN) {
      if (onYes) {
        onYes(this.inputRef.current.value);
      }
      onClose();
    }
    e.stopPropagation();
  };

  renderButtons = (): JSX.Element => {
    const {
      buttons, onYes, onCancel, onClose,
    } = this.props;
    if (buttons) {
      return <ButtonGroup className="btn-right" buttons={buttons} />;
    }
    const defaultButtons = [
      {
        label: LANG.ok2,
        className: 'btn-default primary',
        onClick: () => {
          const inputElem = this.inputRef.current;
          if (onYes) {
            onYes(inputElem.value);
          }
          onClose();
        },
      },
      {
        label: LANG.cancel,
        className: 'btn-default',
        onClick: () => {
          const inputElem = this.inputRef.current;
          if (onCancel) {
            onCancel(inputElem.value);
          }
          onClose();
        },
      },
    ];
    return <ButtonGroup className="btn-right" buttons={defaultButtons} />;
  };

  render(): JSX.Element {
    const {
      closeOnBackgroundClick, onClose, caption, defaultValue,
    } = this.props;

    return (
      <Modal
        onClose={closeOnBackgroundClick ? onClose : () => { }}
      >
        <div id='addparameter' className={classNames('prompt-dialog-container', 'animate__animated', 'animate__bounceIn')}>
          <div className="caption">{caption}</div>
          <input
            autoFocus
            ref={this.inputRef}
            className="text-input"
            type="text"
            onKeyDown={(e) => this.handleKeyDown(e)}
            defaultValue={defaultValue}
          />
          <div className="footer">
            {this.renderButtons()}
          </div>
        </div>
      </Modal>
    );
  }
}

export default Prompt;
