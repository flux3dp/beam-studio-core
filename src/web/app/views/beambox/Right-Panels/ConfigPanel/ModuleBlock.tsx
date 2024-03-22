import React, { memo, useContext, useEffect, useState } from 'react';
import { Select } from 'antd';

import alertCaller from 'app/actions/alert-caller';
import alertConfig from 'helpers/api/alert-config';
import alertConstants from 'app/constants/alert-constants';
import beamboxPreference from 'app/actions/beambox/beambox-preference';
import eventEmitterFactory from 'helpers/eventEmitterFactory';
import ISVGCanvas from 'interfaces/ISVGCanvas';
import LayerModule, { modelsWithModules } from 'app/constants/layer-module/layer-modules';
import moduleBoundaryDrawer from 'app/actions/canvas/module-boundary-drawer';
import ObjectPanelItem from 'app/views/beambox/Right-Panels/ObjectPanelItem';
import presprayArea from 'app/actions/canvas/prespray-area';
import storage from 'implementations/storage';
import toggleFullColorLayer from 'helpers/layer/full-color/toggleFullColorLayer';
import useI18n from 'helpers/useI18n';
import {
  DataType,
  defaultConfig,
  getData,
  getLayerConfig,
  getLayersConfig,
  writeData,
} from 'helpers/layer/layer-config-helper';
import { getLayerElementByName } from 'helpers/layer/layer-helper';
import { getSVGAsync } from 'helpers/svg-editor-helper';
import { ILaserConfig } from 'interfaces/ILaserConfig';
import { useIsMobile } from 'helpers/system-helper';
import { WorkAreaModel } from 'app/constants/workarea-constants';

import ConfigPanelContext from './ConfigPanelContext';
import styles from './ModuleBlock.module.scss';

let svgCanvas: ISVGCanvas;
getSVGAsync((globalSVG) => {
  svgCanvas = globalSVG.Canvas;
});

const documentEventEmitter = eventEmitterFactory.createEventEmitter('document-panel');
const layerPanelEventEmitter = eventEmitterFactory.createEventEmitter('layer-panel');

const ModuleBlock = (): JSX.Element => {
  const isMobile = useIsMobile();
  const lang = useI18n();
  const t = lang.beambox.right_panel.laser_panel;
  const { selectedLayers, state, dispatch } = useContext(ConfigPanelContext);
  const { module } = state;
  const { value } = module;
  const [workarea, setWorkarea] = useState(beamboxPreference.read('workarea'));

  useEffect(() => {
    // handle boundary change due to rotary mode change
    const handleWorkareaChange = (newWorkarea: WorkAreaModel) => {
      moduleBoundaryDrawer.update(value);
      setWorkarea(newWorkarea);
    };
    moduleBoundaryDrawer.update(value);
    documentEventEmitter.on('workarea-change', handleWorkareaChange);
    return () => {
      documentEventEmitter.off('workarea-change', handleWorkareaChange);
    };
  }, [value]);
  if (!modelsWithModules.has(workarea)) return null;

  const handleChange = async (val: number) => {
    if (
      value === LayerModule.PRINTER &&
      val !== LayerModule.PRINTER &&
      !alertConfig.read('skip-switch-to-printer-module')
    ) {
      const res = await new Promise((resolve) => {
        alertCaller.popUp({
          id: 'switch-to-printer-module',
          caption: lang.layer_module.notification.convertFromPrintingModuleTitle,
          message: lang.layer_module.notification.convertFromPrintingModuleMsg,
          messageIcon: 'notice',
          buttonType: alertConstants.CONFIRM_CANCEL,
          onConfirm: () => resolve(true),
          onCancel: () => resolve(false),
          checkbox: {
            text: lang.beambox.popup.dont_show_again,
            callbacks: [
              () => {
                alertConfig.write('skip-switch-to-printer-module', true);
                resolve(true);
              },
              () => resolve(false),
            ],
          },
        });
      });
      if (!res) return;
    } else if (
      value !== LayerModule.PRINTER &&
      val === LayerModule.PRINTER &&
      !alertConfig.read('skip-switch-to-laser-module')
    ) {
      const res = await new Promise((resolve) => {
        alertCaller.popUp({
          id: 'switch-to-laser-module',
          caption: lang.layer_module.notification.convertFromLaserModuleTitle,
          message: lang.layer_module.notification.convertFromLaserModuleMsg,
          messageIcon: 'notice',
          buttonType: alertConstants.CONFIRM_CANCEL,
          onConfirm: () => resolve(true),
          onCancel: () => resolve(false),
          checkbox: {
            text: lang.beambox.popup.dont_show_again,
            callbacks: [
              () => {
                alertConfig.write('skip-switch-to-laser-module', true);
                resolve(true);
              },
              () => resolve(false),
            ],
          },
        });
      });
      if (!res) return;
    }
    const customizedLaserConfigs = (storage.get('customizedLaserConfigs') as ILaserConfig[]) || [];
    selectedLayers.forEach((layerName) => {
      writeData(layerName, DataType.module, val);
      const layer = getLayerElementByName(layerName);
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
        if (value === LayerModule.PRINTER && val !== LayerModule.PRINTER) {
          layer.setAttribute('data-speed', String(defaultConfig.speed));
          layer.setAttribute('data-strength', String(defaultConfig.strength));
        } else if (value !== LayerModule.PRINTER && val === LayerModule.PRINTER) {
          layer.setAttribute('data-printingSpeed', String(defaultConfig.printingSpeed));
          layer.setAttribute('data-ink', String(defaultConfig.ink));
          layer.setAttribute('data-multipass', String(defaultConfig.multipass));
        }
      }
      toggleFullColorLayer(layer, { val: val === LayerModule.PRINTER });
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

  return isMobile ? (
    <ObjectPanelItem.Select
      id="module"
      selected={options.find((option) => option.value === value)}
      onChange={handleChange}
      options={options}
      label={t.module}
    />
  ) : (
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
