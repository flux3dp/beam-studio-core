import React from 'react';
import classNames from 'classnames';

import alertCaller from 'app/actions/alert-caller';
import ExportFuncs from 'app/actions/beambox/export-funcs';
import FormatDuration from 'helpers/duration-formatter';
import i18n from 'helpers/i18n';
import { checkConnection } from 'helpers/api/discover';
import { TimeEstimationButtonContext } from 'app/contexts/TimeEstimationButtonContext';

const LANG = i18n.lang.beambox.time_est_button;

const TimeEstimationButton = (): JSX.Element => {
  const { estimatedTime, setEstimatedTime } = React.useContext(TimeEstimationButtonContext);

  const calculateEstimatedTime = async () => {
    if (window.FLUX.version === 'web' && !checkConnection()) {
      alertCaller.popUp({
        caption: i18n.lang.alert.oops,
        message: i18n.lang.device_selection.no_beambox,
      });
      return;
    }
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
