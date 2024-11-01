import classNames from 'classnames';
import React, { memo, useContext, useMemo } from 'react';

import history from 'app/svgedit/history/history';
import ISVGCanvas from 'interfaces/ISVGCanvas';
import ObjectPanelItem from 'app/views/beambox/Right-Panels/ObjectPanelItem';
import UnitInput from 'app/widgets/Unit-Input-v2';
import useI18n from 'helpers/useI18n';
import { CUSTOM_PRESET_CONSTANT, writeData } from 'helpers/layer/layer-config-helper';
import { getSVGAsync } from 'helpers/svg-editor-helper';
import { PromarkInfo } from 'interfaces/Promark';

import ConfigPanelContext from './ConfigPanelContext';
import styles from './Block.module.scss';

let svgCanvas: ISVGCanvas;
getSVGAsync((globalSVG) => {
  svgCanvas = globalSVG.Canvas;
});

const PulseWidthBlock = ({
  type = 'default',
  info,
}: {
  type?: 'default' | 'panel-item' | 'modal';
  info: PromarkInfo;
}): JSX.Element => {
  const lang = useI18n();
  const t = lang.beambox.right_panel.laser_panel;

  const { selectedLayers, state, dispatch, initState } = useContext(ConfigPanelContext);
  const { pulseWidth } = state;
  const { min, max } = useMemo(() => {
    const { watt } = info;
    if (watt >= 100) return { min: 10, max: 500 };
    // TODO: check M60
    return { min: 2, max: 350 };
  }, [info]);

  const handleChange = (value: number) => {
    dispatch({
      type: 'change',
      payload: { pulseWidth: value, configName: CUSTOM_PRESET_CONSTANT },
    });
    if (type !== 'modal') {
      const batchCmd = new history.BatchCommand('Change pulseWidth');
      selectedLayers.forEach((layerName) => {
        writeData(layerName, 'pulseWidth', value, { batchCmd });
        writeData(layerName, 'configName', CUSTOM_PRESET_CONSTANT, { batchCmd });
      });
      batchCmd.onAfter = initState;
      svgCanvas.addCommandToHistory(batchCmd);
    }
  };

  return type === 'panel-item' ? (
    <ObjectPanelItem.Number
      id="pulseWidth"
      label={t.pulse_width}
      value={pulseWidth.value}
      updateValue={handleChange}
      min={min}
      max={max}
      unit="ns"
      decimal={0}
    />
  ) : (
    <div className={classNames(styles.panel, styles['without-drag'])}>
      <span className={styles.title}>{t.pulse_width}</span>
      <UnitInput
        id="pulseWidth"
        className={{ [styles.input]: true }}
        defaultValue={pulseWidth.value}
        getValue={handleChange}
        min={min}
        max={max}
        unit="ns"
        decimal={0}
        displayMultiValue={pulseWidth.hasMultiValue}
      />
    </div>
  );
};

export default memo(PulseWidthBlock);
