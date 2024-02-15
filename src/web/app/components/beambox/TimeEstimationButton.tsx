import React, { useContext } from 'react';
import classNames from 'classnames';

import ExportFuncs from 'app/actions/beambox/export-funcs';
import FormatDuration from 'helpers/duration-formatter';
import i18n from 'helpers/i18n';
import webNeedConnectionWrapper from 'helpers/web-need-connection-helper';
import { CanvasContext } from 'app/contexts/CanvasContext';
import { TimeEstimationButtonContext } from 'app/contexts/TimeEstimationButtonContext';
import { useIsMobile } from 'helpers/system-helper';

import styles from './TimeEstimationButton.module.scss';

const LANG = i18n.lang.beambox.time_est_button;

const TimeEstimationButton = (): JSX.Element => {
  const { estimatedTime, setEstimatedTime } = useContext(TimeEstimationButtonContext);
  const { isPathPreviewing } = useContext(CanvasContext);
  const isMobile = useIsMobile();

  if (isPathPreviewing) return <div />;

  const calculateEstimatedTime = async () => {
    webNeedConnectionWrapper(async () => {
      const estimateTime = await ExportFuncs.estimateTime();
      setEstimatedTime(estimateTime);
    });
  };

  const renderButton = () => (
    <div className={styles.btn} title={LANG.calculate} onClick={calculateEstimatedTime}>
      <img src="img/icon-stopwatch.svg" draggable="false" />
    </div>
  );

  const renderResult = () => (
    <div className={styles.result}>
      {`Estimated Time: ${FormatDuration(estimatedTime)}`}
    </div>
  );

  return (
    <div className={classNames(styles.container, { [styles.mac]: window.os === 'MacOS', [styles.mobile]: isMobile })}>
      {estimatedTime ? renderResult() : renderButton()}
    </div>
  );
};

export default TimeEstimationButton;
