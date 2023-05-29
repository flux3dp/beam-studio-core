/* eslint-disable react/require-default-props */
import React, { useEffect } from 'react';
import { Input, InputRef, Modal } from 'antd';

import InputKeyWrapper, { setEditingInput, setStopEditingInput } from 'app/widgets/InputKeyWrapper';
import i18n from 'helpers/i18n';

const LANG = i18n.lang.alert;
const VISIBLE = true;

interface Props {
  caption: string;
  message?: string;
  placeholder?: string;
  defaultValue?: string;
  confirmValue?: string;
  onYes: (value?: string) => void;
  onCancel?: (value?: string) => void;
  onClose: () => void;
}

function Prompt({
  caption, message, placeholder, defaultValue = '', confirmValue, onYes, onCancel = () => { }, onClose,
}: Props): JSX.Element {
  const inputRef = React.useRef<InputRef>(null);

  useEffect(() => () => {
    if (document.activeElement === inputRef.current?.input) setStopEditingInput();
  }, []);

  const messageContent = typeof message === 'string' ? message.split('\n').map((t) => <p key={t}>{t}</p>) : message;
  const handleOk = (): void => {
    const inputElem = inputRef.current;
    const value = inputElem?.input?.value;
    onYes(value);
    if (!confirmValue || value === confirmValue) onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent): void => {
    if (e.key === 'Enter' && !e.nativeEvent.isComposing) handleOk();
  };

  return (
    <Modal
      open={VISIBLE}
      title={caption}
      centered
      onOk={handleOk}
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
          onFocus={setEditingInput}
          onBlur={setStopEditingInput}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          defaultValue={defaultValue}
        />
      </InputKeyWrapper>
    </Modal>
  );
}

export default Prompt;
