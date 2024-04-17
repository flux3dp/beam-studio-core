import classNames from 'classnames';
import React, { memo, useContext, useMemo } from 'react';

import history from 'app/svgedit/history';
import ISVGCanvas from 'interfaces/ISVGCanvas';
import ObjectPanelItem from 'app/views/beambox/Right-Panels/ObjectPanelItem';
import Select from 'app/widgets/AntdSelect';
import useI18n from 'helpers/useI18n';
import { DataType, writeData } from 'helpers/layer/layer-config-helper';
import { getSVGAsync } from 'helpers/svg-editor-helper';
import { useIsMobile } from 'helpers/system-helper';

import ConfigPanelContext from './ConfigPanelContext';
import styles from './Block.module.scss';

let svgCanvas: ISVGCanvas;
getSVGAsync((globalSVG) => {
  svgCanvas = globalSVG.Canvas;
});

// TODO: add test
const HalftoneBlock = (): JSX.Element => {
  const isMobile = useIsMobile();
  const lang = useI18n();

  const { selectedLayers, state, dispatch, initState } = useContext(ConfigPanelContext);
  const { halftone } = state;

  const handleChange = (value: number) => {
    if (value === halftone.value) return;
    dispatch({ type: 'change', payload: { halftone: value } });
    const batchCmd = new history.BatchCommand('Change Halftone');
    selectedLayers.forEach((layerName) =>
      writeData(layerName, DataType.halftone, value, { batchCmd })
    );
    batchCmd.onAfter = initState;
    svgCanvas.addCommandToHistory(batchCmd);
  };

  const { value, hasMultiValue } = halftone;

  const options = useMemo(
    () =>
      [
        hasMultiValue ? { value: 0, label: '-' } : null,
        { value: 1, label: 'FM' },
        { value: 2, label: 'AM' },
      ].filter((option) => option),
    [hasMultiValue]
  );

  return isMobile ? (
    <ObjectPanelItem.Select
      id="halftone-type"
      selected={hasMultiValue ? options[0] : options[value]}
      onChange={handleChange}
      options={options}
      label="Haftone"
    />
  ) : (
    <div className={classNames(styles.panel)}>
      <span className={styles.title}>Halftone</span>
      <Select
        className={styles['inline-select']}
        onChange={handleChange}
        value={hasMultiValue ? 0 : value}
      >
        {options.map((option) => (
          <Select.Option key={option.value} value={option.value}>
            {option.label}
          </Select.Option>
        ))}
      </Select>
    </div>
  );
};

export default memo(HalftoneBlock);
