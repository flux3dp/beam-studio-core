import React from 'react';
import classNames from 'classnames';

import Alert from 'app/widgets/Alert';
import Progress from 'app/widgets/Progress';
import { AlertProgressContext, IAlertProgressContext } from 'app/contexts/Alert-Progress-Context';

let contextCaller;

export class AlertsAndProgress extends React.Component {
  componentDidMount(): void {
    contextCaller = this.context;
  }

  render(): JSX.Element {
    const { alertProgressStack, popFromStack } = this.context;
    let alertCount = 0;
    let progressCount = 0;
    const components = alertProgressStack.map((alertOrProgress) => {
      if (alertOrProgress.isProgress) {
        progressCount += 1;
        return (
          <Progress
            id={alertOrProgress.buttonType}
            key={`progress-${progressCount}`}
            progress={alertOrProgress}
            onClose={popFromStack}
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

export const AlertsAndProgressContextHelper = {
  get context(): IAlertProgressContext {
    return contextCaller;
  },
};
