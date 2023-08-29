import React, { memo, useContext, useEffect } from 'react';
import { Select } from 'antd';

import beamboxPreference from 'app/actions/beambox/beambox-preference';
import beamboxStore from 'app/stores/beambox-store';
import colorConstants from 'app/constants/color-constants';
import eventEmitterFactory from 'helpers/eventEmitterFactory';
import ISVGCanvas from 'interfaces/ISVGCanvas';
import LayerModule from 'app/constants/layer-module/layer-modules';
import moduleBoundaryDrawer from 'app/actions/canvas/module-boundary-drawer';
import presprayArea from 'app/actions/beambox/prespray-area';
import storage from 'implementations/storage';
import useI18n from 'helpers/useI18n';
import {
  DataType,
  getData,
  getLayerConfig,
  getLayersConfig,
  writeData,
} from 'helpers/layer/layer-config-helper';
import { getLayerElementByName } from 'helpers/layer/layer-helper';
import { getSVGAsync } from 'helpers/svg-editor-helper';
import { ILaserConfig } from 'interfaces/ILaserConfig';
import { modelsWithModules } from 'app/constants/right-panel-constants';

import ConfigPanelContext from './ConfigPanelContext';
import styles from './ModuleBlock.module.scss';

let svgCanvas: ISVGCanvas;
getSVGAsync((globalSVG) => {
  svgCanvas = globalSVG.Canvas;
});
const layerPanelEventEmitter = eventEmitterFactory.createEventEmitter('layer-panel');

const ModuleBlock = (): JSX.Element => {
  const lang = useI18n();
  const t = lang.beambox.right_panel.laser_panel;
  const { selectedLayers, state, dispatch } = useContext(ConfigPanelContext);
  const { module } = state;
  const { value } = module;

  useEffect(() => {
    const updateBoundary = () => moduleBoundaryDrawer.update(value);
    updateBoundary();
    beamboxStore.onUpdateWorkArea(updateBoundary);
    return () => {
      beamboxStore.removeUpdateWorkAreaListener(updateBoundary);
    };
  }, [value]);

  if (!modelsWithModules.includes(beamboxPreference.read('workarea'))) return null;

  const handleChange = (val: number) => {
    const customizedLaserConfigs = (storage.get('customizedLaserConfigs') as ILaserConfig[]) || [];
    selectedLayers.forEach((layerName) => {
      writeData(layerName, DataType.module, val);
      const layer = getLayerElementByName(layerName);
      if (
        val === LayerModule.PRINTER &&
        !colorConstants.printingLayerColor.includes(layer.getAttribute('data-color'))
      ) {
        layer.setAttribute('data-color', '#1D1D1B');
        svgCanvas.updateLayerColor(layer);
      }
      const currentConfig = getData<string>(layer, DataType.configName);
      const newConfig = customizedLaserConfigs.find(
        (config) => config.name === currentConfig && (config.module === val || !config.isDefault)
      );
      if (newConfig) {
        const { speed, power, repeat } = newConfig;
        layer.setAttribute('data-speed', String(speed));
        layer.setAttribute('data-strength', String(power));
        layer.setAttribute('data-repeat', String(repeat || 1));
      } else {
        layer.removeAttribute('data-configName');
      }
    });
    if (selectedLayers.length > 1) {
      const drawing = svgCanvas.getCurrentDrawing();
      const currentLayerName = drawing.getCurrentLayerName();
      const config = getLayersConfig(selectedLayers, currentLayerName);
      dispatch({ type: 'update', payload: config });
    } else if (selectedLayers.length === 1) {
      const config = getLayerConfig(selectedLayers[0]);
      dispatch({ type: 'update', payload: config });
    }
    layerPanelEventEmitter.emit('UPDATE_LAYER_PANEL');
    presprayArea.togglePresprayArea();
  };

  const options = [
    { label: lang.layer_module.laser_10w_diode, value: LayerModule.LASER_10W_DIODE },
    { label: lang.layer_module.laser_20w_diode, value: LayerModule.LASER_20W_DIODE },
    { label: lang.layer_module.printing, value: LayerModule.PRINTER },
    { label: lang.layer_module.laser_2w_infrared, value: LayerModule.LASER_1064 },
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
