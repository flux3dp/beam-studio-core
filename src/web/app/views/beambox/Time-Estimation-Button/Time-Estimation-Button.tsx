import React from 'react';

import * as i18n from 'helpers/i18n';
import ExportFuncs from 'app/actions/beambox/export-funcs';
import FormatDuration from 'helpers/duration-formatter';

const classNames = requireNode('classnames');
const { createContext } = React;
const TimeEstimationButtonContext = createContext({});
let _context = null;
const LANG = i18n.lang.beambox.time_est_button;
const isMac = window.os === 'MacOS';

interface ITimeEstimationButtonContext {
  estimatedTime: number | null,
  setEstimatedTime(estimatedTime: number | null): void,
};

interface IState {
  estimatedTime: number,
}

class TimeEstimationButtonContextProvider extends React.Component<{}, IState> {
  constructor(props) {
    super(props);
    this.state = {
      estimatedTime: null,
    };
  }

  setEstimatedTime = (newTime: number) => {
    const { estimatedTime } = this.state;
    if (newTime !== estimatedTime) {
      this.setState({ estimatedTime: newTime });
    }
  }

  render() {
    const { setEstimatedTime } = this;
    const { estimatedTime } = this.state;
    return (
      <TimeEstimationButtonContext.Provider value={{
        setEstimatedTime,
        estimatedTime,
      }}>
        {this.props.children}
      </TimeEstimationButtonContext.Provider>
    );
  }
};

class TimeEstimationButtonComponent extends React.Component {
  componentDidMount() {
    _context = this.context;
  }

  async calculateEstimatedTime() {
    const { setEstimatedTime } = this.context as ITimeEstimationButtonContext;
    const estimatedTime = await ExportFuncs.estimateTime();
    setEstimatedTime(estimatedTime);
  }

  renderButton() {
    return (
      <div className="time-est-btn" title={LANG.calculate} onClick={() => this.calculateEstimatedTime()}>
        <img src="img/icon-stopwatch.svg" draggable="false" />
      </div>
    )
  }

  renderResult(estimatedTime: number) {
    const message = `Estimated Time: ${FormatDuration(estimatedTime)}`;
    return (
      <div className="time-est-result">
        { message}
      </div>
    )
  }

  render() {
    const { estimatedTime } = this.context as ITimeEstimationButtonContext;
    return (
      <div className={classNames('time-est-btn-container', { 'not-mac': !isMac })}>
        {estimatedTime ? this.renderResult(estimatedTime) : this.renderButton()}
      </div>
    );
  }
};
TimeEstimationButtonComponent.contextType = TimeEstimationButtonContext;

export class TimeEstimationButton extends React.Component {
  render() {
    return (
      <TimeEstimationButtonContextProvider>
        <TimeEstimationButtonComponent />
      </TimeEstimationButtonContextProvider>
    );
  }
};

export class ContextHelper {
  static get context() {
    return _context as ITimeEstimationButtonContext;
  }
};

