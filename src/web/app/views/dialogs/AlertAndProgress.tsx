import React, { useEffect, useRef } from 'react';
import { Modal, Progress } from 'antd';

import Alert from 'app/views/dialogs/Alert';
import browser from 'implementations/browser';
import i18n from 'helpers/i18n';
import ProgressConstants from 'app/constants/progress-constants';
import { AlertProgressContext } from 'app/contexts/AlertProgressContext';
import { IAlert } from 'interfaces/IAlert';
import { IProgressDialog } from 'interfaces/IProgress';

const isProgress = (d: IAlert | IProgressDialog): d is IProgressDialog => d.isProgress;

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

const AlertsAndProgress = (): JSX.Element => {
  const LANG = i18n.lang;
  const messageRef = useRef<HTMLPreElement>();

  const { alertProgressStack, popById } = React.useContext(AlertProgressContext);

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
    if (isProgress(data)) {
      let { percentage } = data;
      if (data.type === ProgressConstants.NONSTOP) {
        percentage = 1;
      }
      return (
        <Modal
          key={`${data.key}-${data.id}`}
          style={{
            minWidth: window.outerWidth < 600 ? (window.outerWidth - 40) : 520,
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
        >
          {renderMessage(data.message)}
          <Progress
            status="active"
            percent={Number(Number(percentage).toFixed(2))}
            strokeColor={{ '0%': '#108ee9', '100%': '#87d068' }}
          />
        </Modal>
      );
    }

    return <Alert key={`${data.key}-${data.id}`} data={data} />;
  });

  return (
    <div>
      {alertModals}
    </div>
  );
};

export default AlertsAndProgress;
