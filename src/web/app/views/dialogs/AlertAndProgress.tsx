import React, { useEffect, useRef } from 'react';
import { Button, Modal, Progress } from 'antd';

import browser from 'implementations/browser';
import Draggable from 'react-draggable';
import i18n from 'helpers/i18n';
import ProgressConstants from 'app/constants/progress-constants';
import { AlertProgressContext } from 'app/contexts/AlertProgressContext';
import { IAlert } from 'interfaces/IAlert';
import { IProgressDialog } from 'interfaces/IProgress';

const isProgress = (d: IAlert | IProgressDialog): d is IProgressDialog => d.isProgress;

const AlertsAndProgress = (): JSX.Element => {
  const LANG = i18n.lang;
  const messageRef = useRef<HTMLPreElement>();

  const { alertProgressStack, popFromStack, popById } = React.useContext(AlertProgressContext);

  const DraggableElement: any = Draggable;

  const modalRender = (modal): JSX.Element => (
    <DraggableElement>
      {modal}
    </DraggableElement>
  );

  useEffect(() => {
    const message = messageRef.current as Element;
    if (message) {
      const aElements = message.querySelectorAll('a');
      for (let i = 0; i < aElements.length; i += 1) {
        const a = aElements[i];
        a.addEventListener('click', (e) => {
          e.preventDefault();
          browser.open(a.getAttribute('href'));
        });
      }
    }
  });

  if (alertProgressStack.length === 0) return <div />;
  const alertModals = alertProgressStack.map((data) => {
    const renderMessage = (): JSX.Element => {
      const { message } = data;
      return typeof message === 'string'
        // eslint-disable-next-line react/no-danger
        ? (
          <div
            className="message"
            dangerouslySetInnerHTML={{ __html: message }}
          />
        )
        : <div className="message">{message}</div>;
    };
    if (isProgress(data)) {
      let { percentage } = data;
      if (data.type === ProgressConstants.NONSTOP) {
        percentage = 1;
      }
      return (
        <Modal
          key={`${data.key}-${data.id}`}
          style={{
            minWidth: 520,
          }}
          open={alertProgressStack.length > 0}
          title={data.caption}
          onCancel={() => {
            popById(data.id);
            data.onCancel();
          }}
          centered
          closable={false}
          cancelText={LANG.alert.cancel}
          okButtonProps={{ style: { display: 'none' } }}
          modalRender={modalRender}
        >
          {renderMessage()}
          <Progress
            status="active"
            percent={Number(Number(percentage).toFixed(2))}
            strokeColor={{ '0%': '#108ee9', '100%': '#87d068' }}
          />
        </Modal>
      );
    }
    const footer = data?.buttons.map((button) => {
      const buttonType = button.className?.includes('primary') ? 'primary' : 'default';
      return (
        <Button
          key={button.label}
          onClick={() => {
            popFromStack();
            button.onClick();
          }}
          type={buttonType}
        >
          {button.label}
        </Button>
      );
    });

    return (
      <Modal
        key={`${data.key}-${data.id}`}
        open={alertProgressStack.length > 0}
        title={data.caption}
        modalRender={modalRender}
        footer={footer}
        closable={false}
        centered
        onCancel={popFromStack}
      >
        {renderMessage()}
      </Modal>
    );
  });

  return (
    <div>
      {alertModals}
    </div>
  );
};

export default AlertsAndProgress;
