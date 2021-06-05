import React from 'react';
import classNames from 'classnames';

import Alert from 'app/widgets/Alert';
import Progress from 'app/widgets/Progress';
import { AlertProgressContext } from 'app/contexts/AlertProgressContext';

// eslint-disable-next-line react/prefer-stateless-function
export default class AlertsAndProgress extends React.Component {
  render(): JSX.Element {
    const { alertProgressStack, popFromStack, popById } = this.context;
    let alertCount = 0;
    let progressCount = 0;
    const components = alertProgressStack.map((alertOrProgress, index) => {
      if (index === alertProgressStack.length - 1
          && document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
      if ('isProgress' in alertOrProgress) {
        progressCount += 1;
        return (
          <Progress
            key={`progress-${progressCount}`}
            progress={alertOrProgress}
            popById={popById}
          />
        );
      }
      alertCount += 1;
      return (
        <Alert
          key={`alert-${alertCount}`}
          caption={alertOrProgress.caption}
          iconUrl={alertOrProgress.iconUrl}
          message={alertOrProgress.message}
          checkboxText={alertOrProgress.checkboxText}
          checkboxCallbacks={alertOrProgress.checkboxCallbacks}
          buttons={alertOrProgress.buttons}
          animationClass={classNames('animate__animated', 'animate__bounceIn')}
          onClose={popFromStack}
        />
      );
    });

    return (
      <div className="alerts-container">
        {components}
      </div>
    );
  }
}

AlertsAndProgress.contextType = AlertProgressContext;
