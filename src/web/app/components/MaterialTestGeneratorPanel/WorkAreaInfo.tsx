import React, { useMemo } from 'react';
import BeamboxPreference from 'app/actions/beambox/beambox-preference';

import useI18n from 'helpers/useI18n';
import { Tooltip } from 'antd';
import { sprintf } from 'sprintf-js';
import { getWorkarea } from 'app/constants/workarea-constants';
import layerModuleHelper from 'helpers/layer-module/layer-module-helper';
import moduleBoundary from 'app/constants/layer-module/module-boundary';
import LayerModule from 'app/constants/layer-module/layer-modules';
import { QuestionCircleOutlined } from '@ant-design/icons';
import styles from './WorkAreaInfo.module.scss';

interface Props {
  isInch: boolean;
}

export default function WorkAreaInfo({ isInch }: Props): JSX.Element {
  const { boxgen: tBoxGen } = useI18n();

  // TODO: following logic is duplicated from BoxgenProvider, should be refactored with state management library
  const workareaType = BeamboxPreference.read('workarea');
  const workarea = useMemo(() => {
    const workareaInfo = getWorkarea(workareaType);
    const { width, height, displayHeight, label } = workareaInfo;

    if (workareaType === 'ado1') {
      const laserModule = layerModuleHelper.getDefaultLaserModule();
      const boundary = moduleBoundary[laserModule];

      return {
        value: workareaType,
        label: `${label} ${laserModule === LayerModule.LASER_10W_DIODE ? '10W' : '20W'}`,
        canvasWidth: width - boundary.left - boundary.right,
        canvasHeight: (displayHeight ?? height) - boundary.top - boundary.bottom,
      };
    }

    return {
      value: workareaType,
      label,
      canvasWidth: width,
      canvasHeight: displayHeight ?? height,
    };
  }, [workareaType]);

  const workareaLimit = Math.min(workarea.canvasWidth, workarea.canvasHeight);
  const { unitRatio, unit, decimal } = isInch
    ? { unit: 'in' as const, unitRatio: 25.4, decimal: 2 }
    : { unit: 'mm' as const, unitRatio: 1, decimal: 0 };
  // end of duplicated logic

  return (
    <div className={styles.workarea}>
      <Tooltip
        title={sprintf(
          tBoxGen.max_dimension_tooltip,
          `${(workareaLimit / unitRatio).toFixed(decimal)}${unit}`
        )}
        placement="bottomLeft"
        arrow={{ pointAtCenter: true }}
      >
        <QuestionCircleOutlined className={styles.icon} />
      </Tooltip>
      <span>
        {tBoxGen.workarea} : {workarea.label}( {(workarea.canvasWidth / unitRatio).toFixed(decimal)}{' '}
        x {(workarea.canvasHeight / unitRatio).toFixed(decimal)} {unit}
        <sup>2</sup> )
      </span>
    </div>
  );
}
