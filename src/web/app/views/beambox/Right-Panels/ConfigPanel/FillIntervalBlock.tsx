import classNames from 'classnames';
import React, { memo, useContext, useMemo } from 'react';

import history from 'app/svgedit/history/history';
import ISVGCanvas from 'interfaces/ISVGCanvas';
import ObjectPanelItem from 'app/views/beambox/Right-Panels/ObjectPanelItem';
import storage from 'implementations/storage';
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

const FillIntervalBlock = ({
  type = 'default',
}: {
  type?: 'default' | 'panel-item' | 'modal';
}): JSX.Element => {
  const lang = useI18n();
  const t = lang.beambox.right_panel.laser_panel;

  const { selectedLayers, state, dispatch, initState } = useContext(ConfigPanelContext);
  const { fillInterval } = state;

  const minInterval = useMemo(() => {
    const unit: 'mm' | 'inches' = storage.get('default-units') || 'mm';
    return unit === 'inches' ? 0.0254 : 0.001;
  }, []);

  const handleChange = (value: number) => {
    dispatch({
      type: 'change',
      payload: { fillInterval: value, configName: CUSTOM_PRESET_CONSTANT },
    });
    if (type !== 'modal') {
      const batchCmd = new history.BatchCommand('Change fillInterval');
      selectedLayers.forEach((layerName) => {
        writeData(layerName, 'fillInterval', value, { batchCmd });
        writeData(layerName, 'configName', CUSTOM_PRESET_CONSTANT, { batchCmd });
      });
      batchCmd.onAfter = initState;
      svgCanvas.addCommandToHistory(batchCmd);
    }
  };

  return type === 'panel-item' ? (
    <ObjectPanelItem.Number
      id="fillInterval"
      label={t.fill_interval}
      value={fillInterval.value}
      updateValue={handleChange}
      min={minInterval}
      max={100}
      unit="mm"
      decimal={3}
    />
  ) : (
    <div className={classNames(styles.panel, styles['without-drag'])}>
      <span className={styles.title}>{t.fill_interval}</span>
      <UnitInput
        id="fillInterval"
        className={{ [styles.input]: true }}
        defaultValue={fillInterval.value}
        getValue={handleChange}
        min={minInterval}
        max={100}
        unit="mm"
        decimal={3}
        displayMultiValue={fillInterval.hasMultiValue}
      />
    </div>
  );
};

export default memo(FillIntervalBlock);
