import classNames from 'classnames';
import React from 'react';

import ButtonGroup from 'app/widgets/ButtonGroup';
import i18n from 'helpers/i18n';
import keyCodeConstants from 'app/constants/keycode-constants';
import Modal from 'app/widgets/Modal';

const LANG = i18n.lang.alert;

interface Props {
  caption: string;
  message: string;
  confirmValue: string;
  onConfirmed: () => void;
  onClose: () => void;
  onCancel: () => void;
}

function ConfirmPrompt({
  caption, message, confirmValue,
  onCancel, onClose, onConfirmed,
}: Props): JSX.Element {
  const containerRef = React.useRef(null);
  const inputRef = React.useRef(null);

  const onValidate = () => {
    if (!confirmValue) {
      onConfirmed();
      onClose();
    } else {
      const input = inputRef.current;
      if (confirmValue === input.value) {
        onConfirmed();
        onClose();
      } else {
        const container = containerRef.current;
        input.value = '';
        container.classList.remove('animate__animated', 'animate__bounceIn');
        container.offsetWidth; // some magic: https://css-tricks.com/restart-css-animation/
        container.classList.add('animate__animated', 'animate__bounceIn');
      }
    }
  };

  const handleKeyDown = (e): void => {
    if (e.keyCode === keyCodeConstants.KEY_RETURN) {
      onValidate();
    }
    e.stopPropagation();
  };

  const renderButtons = (): JSX.Element => {
    const defaultButtons = [
      {
        label: LANG.ok,
        className: 'btn-default primary',
        onClick: () => {
          onValidate();
        },
      },
      {
        label: LANG.cancel,
        className: 'btn-default',
        onClick: () => {
          onCancel();
          onClose();
        },
      },
    ];
    return <ButtonGroup className="btn-right" buttons={defaultButtons} />;
  };

  return (
    <Modal>
      <div className={classNames('confirm-prompt-dialog-container', 'animate__animated', 'animate__bounceIn')} ref={containerRef}>
        <div className="caption">{caption}</div>
        <pre className="message">{message}</pre>
        <input
          autoFocus
          ref={inputRef}
          className="text-input"
          type="text"
          onKeyDown={handleKeyDown}
          placeholder={confirmValue}
        />
        <div className="footer">
          {renderButtons()}
        </div>
      </div>
    </Modal>
  );
}

export default ConfirmPrompt;
