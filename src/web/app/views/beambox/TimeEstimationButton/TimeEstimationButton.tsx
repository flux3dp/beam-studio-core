import React from 'react';
import classNames from 'classnames';

import ExportFuncs from 'app/actions/beambox/export-funcs';
import FormatDuration from 'helpers/duration-formatter';
import i18n from 'helpers/i18n';
import { TimeEstimationButtonContext } from 'app/views/beambox/TimeEstimationButton/TimeEstimationButtonContext';

const LANG = i18n.lang.beambox.time_est_button;

const TimeEstimationButton = (): JSX.Element => {
  const { estimatedTime, setEstimatedTime } = React.useContext(TimeEstimationButtonContext);

  const calculateEstimatedTime = async () => {
    const estimateTime = await ExportFuncs.estimateTime();
    setEstimatedTime(estimateTime);
  };

  const renderButton = () => (
    <div className="time-est-btn" title={LANG.calculate} onClick={calculateEstimatedTime}>
      <img src="img/icon-stopwatch.svg" draggable="false" />
    </div>
  );

  const renderResult = () => (
    <div className="time-est-result">
      {`Estimated Time: ${FormatDuration(estimatedTime)}`}
    </div>
  );

  return (
    <div className={classNames('time-est-btn-container', { 'not-mac': !(window.os === 'MacOS') })}>
      {estimatedTime ? renderResult() : renderButton()}
    </div>
  );
};

export default TimeEstimationButton;
