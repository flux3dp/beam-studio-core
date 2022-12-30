/* eslint-disable react/require-default-props */
import classNames from 'classnames';
import React from 'react';

import ButtonGroup from 'app/widgets/ButtonGroup';
import i18n from 'helpers/i18n';
import keyCodeConstants from 'app/constants/keycode-constants';
import { Input, InputRef, Modal } from 'antd';
import lang from 'app/lang/de';
import Draggable from 'react-draggable';

const LANG = i18n.lang.alert;
const VISIBLE = true;

interface Props {
  caption: string;
  defaultValue?: string;
  onYes: (value?: string) => void;
  onCancel?: (value?: string) => void;
  onClose: () => void;
}

const modalRender = (modal): JSX.Element => (
  <Draggable>
    {modal}
  </Draggable>
);

function Prompt({
  caption, defaultValue = '', onYes, onCancel = () => { }, onClose,
}: Props): JSX.Element {
  const inputRef = React.useRef<InputRef>(null);

  const handleKeyDown = (e: React.KeyboardEvent): void => {
    if (e.keyCode === keyCodeConstants.KEY_RETURN) {
      onYes(inputRef.current.input.value);
      onClose();
      e.stopPropagation();
    }
  };

  return (
    <Modal
      open={VISIBLE}
      title={caption}
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
      <Input
        autoFocus
        ref={inputRef}
        className="text-input"
        type="text"
        onKeyDown={handleKeyDown}
        defaultValue={defaultValue}
      />
    </Modal>
  );
}

export default Prompt;
