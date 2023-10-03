import React, { useContext } from 'react';
import classNames from 'classnames';

import alertCaller from 'app/actions/alert-caller';
import alertConstants from 'app/constants/alert-constants';
import ExportFuncs from 'app/actions/beambox/export-funcs';
import fileExportHelper from 'helpers/file-export-helper';
import FormatDuration from 'helpers/duration-formatter';
import i18n from 'helpers/i18n';
import { CanvasContext } from 'app/contexts/CanvasContext';
import { checkConnection } from 'helpers/api/discover';
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
    if (window.FLUX.version === 'web' && !checkConnection()) {
      alertCaller.popUp({
        caption: i18n.lang.alert.oops,
        message: i18n.lang.device_selection.no_beambox,
        buttonType: alertConstants.CUSTOM_CANCEL,
        buttonLabels: [i18n.lang.topbar.menu.add_new_machine],
        callbacks: async () => {
          const res = await fileExportHelper.toggleUnsavedChangedDialog();
          if (res) window.location.hash = '#initialize/connect/select-connection-type';
        },
      });
      return;
    }
    const estimateTime = await ExportFuncs.estimateTime();
    setEstimatedTime(estimateTime);
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
