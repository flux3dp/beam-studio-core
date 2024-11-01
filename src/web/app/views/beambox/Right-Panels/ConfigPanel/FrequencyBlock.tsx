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

const FrequencyBlock = ({
  type = 'default',
  info,
}: {
  type?: 'default' | 'panel-item' | 'modal';
  info: PromarkInfo;
}): JSX.Element => {
  const lang = useI18n();
  const t = lang.beambox.right_panel.laser_panel;

  const { selectedLayers, state, dispatch, initState } = useContext(ConfigPanelContext);
  const { frequency } = state;
  const { min, max } = useMemo(() => {
    const { isMopa, watt } = info;
    if (isMopa) {
      // TODO: check M60
      return { min: 1, max: 4000 };
    }
    if (watt >= 50) return { min: 45, max: 170 };
    if (watt >= 30) return { min: 30, max: 60 };
    return { min: 27, max: 60 };
  }, [info]);

  const handleChange = (value: number) => {
    dispatch({
      type: 'change',
      payload: { frequency: value, configName: CUSTOM_PRESET_CONSTANT },
    });
    if (type !== 'modal') {
      const batchCmd = new history.BatchCommand('Change frequency');
      selectedLayers.forEach((layerName) => {
        writeData(layerName, 'frequency', value, { batchCmd });
        writeData(layerName, 'configName', CUSTOM_PRESET_CONSTANT, { batchCmd });
      });
      batchCmd.onAfter = initState;
      svgCanvas.addCommandToHistory(batchCmd);
    }
  };

  return type === 'panel-item' ? (
    <ObjectPanelItem.Number
      id="frequency"
      label={t.frequency}
      value={frequency.value}
      min={min}
      max={max}
      updateValue={handleChange}
      unit="kHz"
      decimal={0}
    />
  ) : (
    <div className={classNames(styles.panel, styles['without-drag'])}>
      <span className={styles.title}>{t.frequency}</span>
      <UnitInput
        id="frequency"
        className={{ [styles.input]: true }}
        min={min}
        max={max}
        unit="kHz"
        defaultValue={frequency.value}
        getValue={handleChange}
        decimal={0}
        displayMultiValue={frequency.hasMultiValue}
      />
    </div>
  );
};

export default memo(FrequencyBlock);
