/**
 * new Alert Modal using antd Modal
 */
import React, { useContext, useState } from 'react';
import { Button, Checkbox, Modal } from 'antd';

import { AlertProgressContext } from 'app/contexts/AlertProgressContext';
import { IAlert } from 'interfaces/IAlert';

import styles from './Alert.module.scss';

const renderIcon = (url?: string): JSX.Element => {
  if (!url) return null;
  return <img className={styles.icon} src={url} />;
};

const renderMessage = (message: string | React.ReactNode): JSX.Element => {
  if (typeof message === 'string') {
    return (
      <div
        className="message"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: message }}
      />
    );
  }
  return <div className="message">{message}</div>;
};

interface Props {
  data: IAlert
}

const Alert = ({ data }: Props): JSX.Element => {
  const { popFromStack } = useContext(AlertProgressContext);
  const { caption, checkbox, message, buttons, iconUrl } = data;

  const [checkboxChecked, setCheckboxChecked] = useState(false);

  const renderCheckbox = (): JSX.Element => {
    if (!checkbox) return null;
    const { text } = checkbox;
    return (
      <Checkbox onClick={() => setCheckboxChecked(!checkboxChecked)}>{text}</Checkbox>
    );
  };

  const footer = buttons?.map((button, idx) => {
    const buttonType = button.className?.includes('primary') ? 'primary' : 'default';
    return (
      <Button
        key={button.label}
        onClick={() => {
          popFromStack();
          if (checkbox && checkboxChecked) {
            const { callbacks } = checkbox;
            if (callbacks.length > idx) callbacks[idx]?.();
            else if (typeof callbacks === 'function') callbacks?.();
            else button.onClick?.();
          } else button.onClick?.();
        }}
        type={buttonType}
      >
        {button.label}
      </Button>
    );
  });

  return (
    <Modal
      open
      title={caption}
      footer={footer}
      closable={false}
      maskClosable={false}
      centered
      onCancel={popFromStack}
    >
      {renderIcon(iconUrl)}
      {renderMessage(message)}
      {renderCheckbox()}
    </Modal>
  );
};

export default Alert;
