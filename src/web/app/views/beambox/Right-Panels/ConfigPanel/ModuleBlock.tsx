import React, { memo, useContext } from 'react';
import { Select } from 'antd';

import beamboxPreference from 'app/actions/beambox/beambox-preference';
import colorConstants from 'app/constants/color-constants';
import eventEmitterFactory from 'helpers/eventEmitterFactory';
import ISVGCanvas from 'interfaces/ISVGCanvas';
import LayerModule from 'app/constants/layer-module/layer-modules';
import presprayArea from 'app/actions/beambox/prespray-area';
import useI18n from 'helpers/useI18n';
import { DataType, writeData } from 'helpers/layer/layer-config-helper';
import { getLayerElementByName } from 'helpers/layer/layer-helper';
import { getSVGAsync } from 'helpers/svg-editor-helper';
import { modelsWithModules } from 'app/constants/right-panel-constants';

import ConfigPanelContext from './ConfigPanelContext';
import styles from './ModuleBlock.module.scss';

let svgCanvas: ISVGCanvas;
getSVGAsync((globalSVG) => {
  svgCanvas = globalSVG.Canvas;
});
const layerPanelEventEmitter = eventEmitterFactory.createEventEmitter('layer-panel');

// TODO: add test
const ModuleBlock = (): JSX.Element => {
  const lang = useI18n();
  const t = lang.beambox.right_panel.laser_panel;
  const { selectedLayers, state, dispatch } = useContext(ConfigPanelContext);
  const { module } = state;
  const { value } = module;

  if (!modelsWithModules.includes(beamboxPreference.read('workarea'))) return null;

  // TODO: update layer parameter if needed
  const handleChange = (val: number) => {
    dispatch({ type: 'change', payload: { module: val } });
    selectedLayers.forEach((layerName) => {
      writeData(layerName, DataType.module, val);
      const elem = getLayerElementByName(layerName);
      if (val === LayerModule.PRINTER && !colorConstants.printingLayerColor.includes(elem.getAttribute('data-color'))) {
        elem.setAttribute('data-color', '#1D1D1B');
        svgCanvas.updateLayerColor(elem);
      }
    });
    layerPanelEventEmitter.emit('UPDATE_LAYER_PANEL');
    presprayArea.togglePresprayArea();
  };

  // TODO: add i18n
  const options = [
    { label: '10W Laser', value: LayerModule.LASER },
    { label: 'Print', value: LayerModule.PRINTER },
    { label: '20W Laser', value: LayerModule.LASER_20W },
  ];

  return (
    <div className={styles.panel}>
      <div className={styles.title}>{t.module}</div>
      <Select className={styles.select} onChange={handleChange} value={value as LayerModule}>
        {options.map((option) => (
          <Select.Option key={option.value} value={option.value}>
            {option.label}
          </Select.Option>
        ))}
      </Select>
    </div>
  );
};

export default memo(ModuleBlock);
