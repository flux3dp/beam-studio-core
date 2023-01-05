/* eslint-disable react/require-default-props */
import React from 'react';
import i18n from 'helpers/i18n';
import keyCodeConstants from 'app/constants/keycode-constants';
import { Input, InputRef, Modal } from 'antd';
import Draggable from 'react-draggable';
import InputKeyWrapper, { setEditingInput, setStopEditingInput } from 'app/widgets/InputKeyWrapper';

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

const DraggableElement: any = Draggable;

const modalRender = (modal): JSX.Element => (
  <DraggableElement>
    {modal}
  </DraggableElement>
);

function Prompt({
  caption, message, placeholder, defaultValue = '', onYes, onCancel = () => { }, onClose,
}: Props): JSX.Element {
  const inputRef = React.useRef<InputRef>(null);

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
      modalRender={modalRender}
      onOk={() => {
        const inputElem = inputRef.current;
        onYes(inputElem.input.value);
        onClose();
      }}
      onCancel={() => {
        const inputElem = inputRef.current;
        onCancel?.(inputElem.input.value);
        onClose();
      }}
      okText={LANG.ok2}
      cancelText={LANG.cancel}
    >
      <p>{message}</p>
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
