import classNames from 'classnames';
import React, { memo, useContext } from 'react';
import { Button, Popover } from 'antd-mobile';

import history from 'app/svgedit/history';
import ISVGCanvas from 'interfaces/ISVGCanvas';
import ObjectPanelItem from 'app/views/beambox/Right-Panels/ObjectPanelItem';
import objectPanelItemStyles from 'app/views/beambox/Right-Panels/ObjectPanelItem.module.scss';
import useI18n from 'helpers/useI18n';
import { DataType, writeData } from 'helpers/layer/layer-config-helper';
import { getSVGAsync } from 'helpers/svg-editor-helper';
import { ObjectPanelContext } from 'app/views/beambox/Right-Panels/contexts/ObjectPanelContext';

import ConfigPanelContext from './ConfigPanelContext';
import ConfigSlider from './ConfigSlider';
import ConfigValueDisplay from './ConfigValueDisplay';
import styles from './Block.module.scss';

let svgCanvas: ISVGCanvas;
getSVGAsync((globalSVG) => {
  svgCanvas = globalSVG.Canvas;
});

const AmDensityBlock = ({
  type = 'default',
}: {
  type?: 'default' | 'panel-item' | 'modal';
}): JSX.Element => {
  const lang = useI18n();
  const t = lang.beambox.right_panel.laser_panel;
  const {
    selectedLayers,
    state,
    dispatch,
    simpleMode = true,
    initState,
  } = useContext(ConfigPanelContext);
  const { activeKey } = useContext(ObjectPanelContext);
  const visible = activeKey === 'am-density';
  const { value, hasMultiValue } = state.amDensity;

  const handleChange = (val: number) => {
    dispatch({ type: 'change', payload: { amDensity: val } });
    if (type !== 'modal') {
      const batchCmd = new history.BatchCommand('Change AM Density');
      selectedLayers.forEach((layerName) => {
        writeData(layerName, DataType.amDensity, val, { batchCmd });
      });
      batchCmd.onAfter = initState;
      svgCanvas.addCommandToHistory(batchCmd);
    }
  };

  // const sliderOptions = useMemo(
  //   () =>
  //     simpleMode && module === LayerModule.PRINTER
  //       ? configOptions.getPrintingSpeedOptions(lang)
  //       : null,
  //   [simpleMode, module, lang]
  // );

  const content = (
    <div className={classNames(styles.panel, styles[type])}>
      <span className={styles.title}>AM Density</span>
      <ConfigValueDisplay
        inputId="am-density-input"
        type={type}
        max={10}
        min={1}
        value={value}
        hasMultiValue={hasMultiValue}
        onChange={handleChange}
        // options={sliderOptions}
      />
      <ConfigSlider
        id="am-density"
        value={value}
        onChange={handleChange}
        min={1}
        max={10}
        // options={sliderOptions}
        decimal={0}
      />
    </div>
  );

  return type === 'panel-item' ? (
    <Popover visible={visible} content={content}>
      <ObjectPanelItem.Item
        id="speed"
        content={
          <Button
            className={classNames(objectPanelItemStyles['number-item'], styles['display-btn'])}
            shape="rounded"
            size="mini"
            fill="outline"
          >
            <span style={{ whiteSpace: 'nowrap' }}>{value}</span>
          </Button>
        }
        label="AM Density"
        autoClose={false}
      />
    </Popover>
  ) : (
    content
  );
};

export default memo(AmDensityBlock);
