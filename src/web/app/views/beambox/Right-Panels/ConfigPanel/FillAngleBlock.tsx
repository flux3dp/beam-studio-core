import classNames from 'classnames';
import React, { memo, useContext } from 'react';

import history from 'app/svgedit/history/history';
import ISVGCanvas from 'interfaces/ISVGCanvas';
import ObjectPanelItem from 'app/views/beambox/Right-Panels/ObjectPanelItem';
import UnitInput from 'app/widgets/Unit-Input-v2';
import useI18n from 'helpers/useI18n';
import { CUSTOM_PRESET_CONSTANT, writeData } from 'helpers/layer/layer-config-helper';
import { getSVGAsync } from 'helpers/svg-editor-helper';

import ConfigPanelContext from './ConfigPanelContext';
import styles from './Block.module.scss';

let svgCanvas: ISVGCanvas;
getSVGAsync((globalSVG) => {
  svgCanvas = globalSVG.Canvas;
});

const FillAngleBlock = ({
  type = 'default',
}: {
  type?: 'default' | 'panel-item' | 'modal';
}): JSX.Element => {
  const lang = useI18n();
  const t = lang.beambox.right_panel.laser_panel;

  const { selectedLayers, state, dispatch, initState } = useContext(ConfigPanelContext);
  const { fillAngle } = state;

  const handleChange = (value: number) => {
    dispatch({
      type: 'change',
      payload: { fillAngle: value, configName: CUSTOM_PRESET_CONSTANT },
    });
    if (type !== 'modal') {
      const batchCmd = new history.BatchCommand('Change fillAngle');
      selectedLayers.forEach((layerName) => {
        writeData(layerName, 'fillAngle', value, { batchCmd });
        writeData(layerName, 'configName', CUSTOM_PRESET_CONSTANT, { batchCmd });
      });
      batchCmd.onAfter = initState;
      svgCanvas.addCommandToHistory(batchCmd);
    }
  };

  return type === 'panel-item' ? (
    <ObjectPanelItem.Number
      id="fillAngle"
      label={t.fill_angle}
      value={fillAngle.value}
      updateValue={handleChange}
      min={-360}
      max={360}
      unit="deg"
      decimal={1}
    />
  ) : (
    <div className={classNames(styles.panel, styles['without-drag'])}>
      <span className={styles.title}>{t.fill_angle}</span>
      <UnitInput
        id="fillAngle"
        className={{ [styles.input]: true }}
        defaultValue={fillAngle.value}
        getValue={handleChange}
        min={-360}
        max={360}
        unit="deg"
        decimal={1}
        displayMultiValue={fillAngle.hasMultiValue}
      />
    </div>
  );
};

export default memo(FillAngleBlock);
