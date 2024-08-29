import classNames from 'classnames';
import React, { memo, useCallback, useContext, useEffect, useMemo } from 'react';

import history from 'app/svgedit/history/history';
import ObjectPanelItem from 'app/views/beambox/Right-Panels/ObjectPanelItem';
import UnitInput from 'app/widgets/Unit-Input-v2';
import undoManager from 'app/svgedit/history/undoManager';
import useI18n from 'helpers/useI18n';
import { writeData } from 'helpers/layer/layer-config-helper';

import ConfigPanelContext from './ConfigPanelContext';
import styles from './Block.module.scss';

const FocusBlock = ({
  type = 'default',
}: {
  type?: 'default' | 'panel-item' | 'modal';
}): JSX.Element => {
  const lang = useI18n();
  const t = lang.beambox.right_panel.laser_panel;
  const { selectedLayers, state, dispatch, initState } = useContext(ConfigPanelContext);
  const { focus, focusStep, repeat } = state;

  const focusStepMax = useMemo(() => {
    if (repeat.value <= 1) return 10;
    return 10 / (repeat.value - 1);
  }, [repeat])

  const toggleFocusAdjust = () => {
    const value = -focus.value;
    dispatch({ type: 'change', payload: { focus: value } });
    const batchCmd = new history.BatchCommand('Toggle focus adjustment');
    selectedLayers.forEach((layerName) =>
      writeData(layerName, 'focus', value, { batchCmd })
    );
    batchCmd.onAfter = initState;
    undoManager.addCommandToHistory(batchCmd);
  };

  const handleFocusChange = (value: number) => {
    if (value < 0.01 || value > 10) return;
    dispatch({ type: 'change', payload: { focus: value } });
    const batchCmd = new history.BatchCommand('Change focus adjustment height');
    selectedLayers.forEach((layerName) =>
      writeData(layerName, 'focus', value, { batchCmd })
    );
    batchCmd.onAfter = initState;
    undoManager.addCommandToHistory(batchCmd);
  };

  const toggleFocusStep = () => {
    const value = -focusStep.value;
    dispatch({ type: 'change', payload: { focusStep: value } });
    const batchCmd = new history.BatchCommand('Toggle focus step');
    selectedLayers.forEach((layerName) =>
      writeData(layerName, 'focusStep', value, { batchCmd })
    );
    batchCmd.onAfter = initState;
    undoManager.addCommandToHistory(batchCmd);
  };

  const handleFocusStepChange = useCallback((value: number) => {
    if (value < 0.01 || value > focusStepMax) return;
    dispatch({ type: 'change', payload: { focusStep: value } });
    const batchCmd = new history.BatchCommand('Change auto focus z step');
    selectedLayers.forEach((layerName) => {
      writeData(layerName, 'focusStep', value, { batchCmd });
    });
    batchCmd.onAfter = initState;
    undoManager.addCommandToHistory(batchCmd);
  }, [focusStepMax, dispatch, selectedLayers, initState]);

  useEffect(() => {
    if (focusStepMax < focusStep.value) {
      handleFocusStepChange(focusStepMax);
    }
  }, [handleFocusStepChange, focusStep, focusStepMax]);

  if (type === 'panel-item') {
    return (
      <>
        <ObjectPanelItem.Number
          id="focus-adjustment"
          label={t.focus_adjustment}
          value={focus.value}
          min={0.01}
          max={10}
          updateValue={handleFocusChange}
          unit="mm"
          decimal={2}
        />
        <ObjectPanelItem.Number
          id="focus-step"
          label={t.z_step}
          value={focusStep.value}
          min={0.01}
          max={focusStepMax}
          updateValue={handleFocusChange}
          unit="mm"
          decimal={2}
        />
      </>
    );
  }

  return (
    <>
      <div className={classNames(styles.panel, styles.checkbox)} onClick={toggleFocusAdjust}>
        <span className={styles.title}>{t.focus_adjustment}</span>
        <input type="checkbox" checked={focus.value > 0} readOnly />
      </div>
      {focus.value >= 0 && (
        <div className={classNames(styles.panel, styles['without-drag'])}>
          <span className={styles.title}>Lower by</span>
          <UnitInput
            id="focus-adjustment"
            className={{ [styles.input]: true }}
            min={0.01}
            max={10}
            unit="mm"
            defaultValue={focus.value}
            getValue={handleFocusChange}
            displayMultiValue={focus.hasMultiValue}
          />
        </div>
      )}
      {repeat.value > 1 && (
        <>
          <div className={classNames(styles.panel, styles.checkbox)} onClick={toggleFocusStep}>
            <span className={styles.title}>Stepwise Focusing</span>
            <input type="checkbox" checked={focusStep.value > 0} readOnly />
          </div>
          {focusStep.value >= 0 && (
            <div className={classNames(styles.panel, styles['without-drag'])}>
              <span className={styles.title}>{t.z_step}</span>
              <UnitInput
                id="focus-step"
                className={{ [styles.input]: true }}
                min={0.01}
                max={focusStepMax}
                unit="mm"
                defaultValue={focusStep.value}
                getValue={handleFocusStepChange}
                displayMultiValue={focusStep.hasMultiValue}
              />
            </div>
          )}
        </>
      )}
    </>
  );
};

export default memo(FocusBlock);
