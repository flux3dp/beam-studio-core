import React, { useContext } from 'react';
import { Select } from 'antd';

import colorConstants from 'app/constants/color-constants';
import eventEmitterFactory from 'helpers/eventEmitterFactory';
import ISVGCanvas from 'interfaces/ISVGCanvas';
import useI18n from 'helpers/useI18n';
import { DataType, Module, writeData } from 'helpers/layer/layer-config-helper';
import { getLayerElementByName } from 'helpers/layer/layer-helper';
import { getSVGAsync } from 'helpers/svg-editor-helper';

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

  const handleChange = (val: number) => {
    dispatch({ type: 'change', payload: { module: val } });
    selectedLayers.forEach((layerName) => {
      writeData(layerName, DataType.module, val);
      const elem = getLayerElementByName(layerName);
      if (val === Module.PRINTER && !colorConstants.printingLayerColor.includes(elem.getAttribute('data-color'))) {
        elem.setAttribute('data-color', '#1D1D1B');
        svgCanvas.updateLayerColor(elem);
      }
    });
    layerPanelEventEmitter.emit('UPDATE_LAYER_PANEL');
  };

  // TODO: add i18n
  const options = [
    { label: '10W Laser', value: Module.LASER },
    { label: 'Print', value: Module.PRINTER },
  ];

  return (
    <div className={styles.panel}>
      <div className={styles.title}>{t.module}</div>
      <Select className={styles.select} onChange={handleChange} value={value as Module}>
        {options.map((option) => (
          <Select.Option key={option.value} value={option.value}>
            {option.label}
          </Select.Option>
        ))}
      </Select>
    </div>
  );
};

export default ModuleBlock;
