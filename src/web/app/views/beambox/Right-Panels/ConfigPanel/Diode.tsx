import classNames from 'classnames';
import React, { memo, useContext } from 'react';

import history from 'app/svgedit/history';
import ISVGCanvas from 'interfaces/ISVGCanvas';
import useI18n from 'helpers/useI18n';
import { DataType, writeData } from 'helpers/layer/layer-config-helper';
import { getSVGAsync } from 'helpers/svg-editor-helper';

import ConfigPanelContext from './ConfigPanelContext';
import styles from './Block.module.scss';

let svgCanvas: ISVGCanvas;
getSVGAsync((globalSVG) => {
  svgCanvas = globalSVG.Canvas;
});

const Diode = (): JSX.Element => {
  const lang = useI18n();
  const t = lang.beambox.right_panel.laser_panel;
  const { selectedLayers, state, dispatch, initState } = useContext(ConfigPanelContext);
  const { diode } = state;

  const handleToggle = () => {
    const newValue = diode.value === 1 ? 0 : 1;
    dispatch({ type: 'change', payload: { diode: newValue } });
    const batchCmd = new history.BatchCommand('Change diode toggle');
    selectedLayers.forEach((layerName) =>
      writeData(layerName, DataType.diode, newValue, { batchCmd })
    );
    batchCmd.onAfter = initState;
    svgCanvas.addCommandToHistory(batchCmd);
  };

  return (
    <div className={classNames(styles.panel, styles.checkbox)} onClick={handleToggle}>
      <span className={styles.title}>{t.diode}</span>
      <input type="checkbox" checked={diode.value === 1} readOnly />
    </div>
  );
};

export default memo(Diode);
