import React, { useEffect, useRef } from 'react';
import { Modal, Progress } from 'antd';
import { SpinLoading } from 'antd-mobile';

import Alert from 'app/views/dialogs/Alert';
import browser from 'implementations/browser';
import i18n from 'helpers/i18n';
import ProgressConstants from 'app/constants/progress-constants';
import { AlertProgressContext } from 'app/contexts/AlertProgressContext';
import { IAlert } from 'interfaces/IAlert';
import { IProgressDialog } from 'interfaces/IProgress';

import styles from './AlertAndProgress.module.scss';

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

  const renderNonstop = (data: IAlert | IProgressDialog) => {
    const { key, id, caption, onCancel } = data;
    return (
      <Modal
        className={styles.nonstop}
        key={`${key}-${id}`}
        style={{
          minWidth: 150,
        }}
        width="fit-content"
        open={alertProgressStack.length > 0}
        onCancel={() => {
          popById(id);
          onCancel();
        }}
        centered
        closable={false}
        maskClosable={false}
        cancelText={LANG.alert.cancel}
        cancelButtonProps={{ style: { display: 'none' } }}
        okButtonProps={{ style: { display: 'none' } }}
      >
        <div>
          <div className={styles['spinner-container']}>
            <SpinLoading color="primary" style={{ '--size': '48px' }} />
          </div>
          <div className={styles.caption}>{caption}</div>
        </div>
      </Modal>
    );
  };

  const renderProgress = (data: IProgressDialog) => {
    const { percentage, key, id, caption, onCancel } = data;
    return (
      <Modal
        key={`${key}-${id}`}
        style={{
          minWidth: window.outerWidth < 600 ? window.outerWidth - 40 : 520,
        }}
        width={window.outerWidth < 600 ? window.outerWidth - 40 : 520}
        open={alertProgressStack.length > 0}
        title={caption}
        onCancel={() => {
          popById(id);
          onCancel();
        }}
        centered
        closable={false}
        maskClosable={false}
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
  };

  const alertModals = alertProgressStack.map((data) => {
    if (isProgress(data)) {
      if (data.type === ProgressConstants.NONSTOP) {
        return renderNonstop(data);
      }
      return renderProgress(data);
    }

    return <Alert key={`${data.key}-${data.id}`} data={data} />;
  });

  return <div>{alertModals}</div>;
};

export default AlertsAndProgress;
