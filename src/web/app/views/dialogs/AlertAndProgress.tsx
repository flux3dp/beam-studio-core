import React from 'react';
import classNames from 'classnames';

import Alert from 'app/widgets/Alert';
import Progress from 'app/widgets/Progress';
import { AlertProgressContext } from 'app/contexts/AlertProgressContext';
import { IAlert } from 'interfaces/IAlert';
import { IProgressDialog } from 'interfaces/IProgress';

interface Props {
  className?: string;
}

const AlertsAndProgress = ({ className = '' }: Props): JSX.Element => {
  const { alertProgressStack, popFromStack, popById } = React.useContext(AlertProgressContext);
  let alertCount = 0;
  let progressCount = 0;
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
  );
};

export default AlertsAndProgress;
