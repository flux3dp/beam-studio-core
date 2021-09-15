/* eslint-disable react/require-default-props */
import classNames from 'classnames';
import React from 'react';

import ButtonGroup from 'app/widgets/ButtonGroup';
import i18n from 'helpers/i18n';
import keyCodeConstants from 'app/constants/keycode-constants';
import Modal from 'app/widgets/Modal';

const LANG = i18n.lang.alert;

interface Props {
  caption: string;
  defaultValue?: string;
  onYes: (value?: string) => void;
  onCancel?: (value?: string) => void;
  onClose: () => void;
}

function Prompt({
  caption, defaultValue = '', onYes, onCancel = () => { }, onClose,
}: Props): JSX.Element {
  const inputRef = React.useRef(null);

  const handleKeyDown = (e: React.KeyboardEvent): void => {
    if (e.keyCode === keyCodeConstants.KEY_RETURN) {
      onYes(inputRef.current.value);
      onClose();
    }
    e.stopPropagation();
  };

  const renderButtons = (): JSX.Element => {
    const defaultButtons = [
      {
        label: LANG.ok2,
        className: 'btn-default primary',
        onClick: () => {
          const inputElem = inputRef.current;
          onYes(inputElem.value);
          onClose();
        },
      },
      {
        label: LANG.cancel,
        className: 'btn-default',
        onClick: () => {
          const inputElem = inputRef.current;
          onCancel?.(inputElem.value);
          onClose();
        },
      },
    ];
    return <ButtonGroup className="btn-right" buttons={defaultButtons} />;
  };

  return (
    <Modal>
      <div data-id="prompt-container" className={classNames('prompt-dialog-container', 'animate__animated', 'animate__bounceIn')}>
        <div className="caption">{caption}</div>
        <input
          autoFocus
          ref={inputRef}
          className="text-input"
          type="text"
          onKeyDown={handleKeyDown}
          defaultValue={defaultValue}
        />
        <div className="footer">
          {renderButtons()}
        </div>
      </div>
    </Modal>
  );
}

export default Prompt;
