/* eslint-disable react/require-default-props */
import React from 'react';
import { Input, InputRef, Modal } from 'antd';

import InputKeyWrapper, { setEditingInput, setStopEditingInput } from 'app/widgets/InputKeyWrapper';
import i18n from 'helpers/i18n';
import keyCodeConstants from 'app/constants/keycode-constants';

const LANG = i18n.lang.alert;
const VISIBLE = true;

interface Props {
  caption: string;
  message?: string;
  placeholder?: string;
  defaultValue?: string;
  onYes: (value?: string) => void;
  onCancel?: (value?: string) => void;
  onClose: () => void;
}

function Prompt({
  caption, message, placeholder, defaultValue = '', onYes, onCancel = () => { }, onClose,
}: Props): JSX.Element {
  const inputRef = React.useRef<InputRef>(null);
  const messageContent = typeof message === 'string' ? message.split('\n').map((t) => <p key={t}>{t}</p>) : message;

  const handleKeyDown = (e: React.KeyboardEvent): void => {
    if (e.keyCode === keyCodeConstants.KEY_RETURN) {
      onYes(inputRef.current.input.value);
      onClose();
    }
  };

  return (
    <Modal
      open={VISIBLE}
      title={caption}
      centered
      onOk={() => {
        const inputElem = inputRef.current;
        onYes(inputElem?.input?.value);
        onClose();
      }}
      onCancel={() => {
        const inputElem = inputRef.current;
        onCancel?.(inputElem?.input?.value);
        onClose();
      }}
      okText={LANG.ok2}
      cancelText={LANG.cancel}
    >
      {messageContent}
      <InputKeyWrapper inputRef={inputRef}>
        <Input
          autoFocus
          ref={inputRef}
          className="text-input"
          type="text"
          onFocus={() => setEditingInput()}
          onBlur={() => setStopEditingInput()}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          defaultValue={defaultValue}
        />
      </InputKeyWrapper>
    </Modal>
  );
}

export default Prompt;
