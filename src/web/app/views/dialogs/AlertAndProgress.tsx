import React, { useEffect, useRef } from 'react';

// import Alert from 'app/widgets/Alert';
// import Progress from 'app/widgets/Progress';
import { AlertProgressContext } from 'app/contexts/AlertProgressContext';
import ProgressConstants from 'app/constants/progress-constants';
import { IAlert } from 'interfaces/IAlert';
import { IProgressDialog } from 'interfaces/IProgress';
import { Button, Modal, Progress } from 'antd';
import i18n from 'helpers/i18n';
import browser from 'implementations/browser';
import Draggable from 'react-draggable';

interface Props {
  className: string;
}

const AlertsAndProgress = ({ className = '' }: Props): JSX.Element => {
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
  const alertModals = alertProgressStack.map((alertData: IAlert) => {
    const footer = alertData?.buttons?.map((button) => {
      const buttonType = button.className.includes('primary') ? 'primary' : 'default';
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

    const renderMessage = (): JSX.Element => {
      const { message } = alertData;
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

    if (alertData.isProgress) {
      let { percentage } = alertData as IProgressDialog;
      if (alertData.type === ProgressConstants.NONSTOP) {
        percentage = 1;
      }
      return (
        <Modal
          style={{
            minWidth: 520,
          }}
          open={alertProgressStack.length > 0}
          title={alertData.caption}
          onCancel={() => {
            popById(alertData.id);
            alertData.onCancel();
          }}
          centered
          footer={footer}
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

    return (
      <Modal
        key={alertData.id || Math.random()}
        open={alertProgressStack.length > 0}
        title={alertData.caption}
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

  /*
  const components = alertProgressStack.map((alertOrProgress, index) => {
    if (index === alertProgressStack.length - 1
      && document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    if ('isProgress' in alertOrProgress) {
      const progress = alertOrProgress as IProgressDialog;
      progressCount += 1;
      return (
        <Progress
          key={`progress-${progressCount}`}
          progress={progress}
          popById={popById}
        />
      );
    }
    alertCount += 1;
    const alert = alertOrProgress as IAlert;
    return (
      <Alert
        key={`alert-${alertCount}`}
        caption={alert.caption}
        iconUrl={alert.iconUrl}
        message={alert.message}
        checkboxText={alert.checkboxText}
        checkboxCallbacks={alert.checkboxCallbacks}
        buttons={alert.buttons}
        animationClass={classNames('animate__animated', 'animate__bounceIn')}
        onClose={popFromStack}
      />
    );
  });

  return (
    <div className={classNames('alerts-container', className)}>
      {components}
    </div>
  ); */
};

export default AlertsAndProgress;
