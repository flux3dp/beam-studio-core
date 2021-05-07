import React from 'react';
import classNames from 'classnames';

import Alert from 'app/widgets/Alert';
import Progress from 'app/widgets/Progress';
import { AlertProgressContext, AlertProgressContextProvider } from 'app/contexts/Alert-Progress-Context';

let _contextCaller;

export class AlertsAndProgress extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      checkboxChecked: false
    }
  };

  componentDidMount() {
    _contextCaller = this.context;
  }

  render() {
    const { alertProgressStack, popFromStack } = this.context;
    const components = alertProgressStack.map((alertOrProgress, index) => {
      if (alertOrProgress.isProgrss) {
        return (
          <Progress
            key={index}
            progress={alertOrProgress}
            onClose={popFromStack}
          />
        );
      } else {
        return (
          <Alert
            key={index}
            {...alertOrProgress}
            animationClass={classNames('animate__animated', 'animate__bounceIn')}
            onClose={popFromStack}
          />
        );
      }
    })

    return (
      <div className='alerts-container'>
        {components}
      </div>
    );
  }
};

AlertsAndProgress.contextType = AlertProgressContext;

export class AlertsAndProgressContextHelper {
  static get context(): AlertProgressContextProvider {
    return _contextCaller;
  }
}
