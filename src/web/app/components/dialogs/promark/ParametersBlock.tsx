import classNames from 'classnames';
import React, { Dispatch, SetStateAction } from 'react';
import { Flex } from 'antd';

import UnitInput from 'app/widgets/UnitInput';
import useI18n from 'helpers/useI18n';

import styles from './Block.module.scss';

export interface MarkParameters {
  power: number;
  speed: number;
}

interface Props {
  isInch: boolean;
  parameters: MarkParameters;
  setParameters: Dispatch<SetStateAction<MarkParameters>>;
}

const ParametersBlock = ({
  isInch,
  parameters: { power, speed },
  setParameters,
}: Props): JSX.Element => {
  const {
    promark_settings: t,
    beambox: {
      right_panel: { laser_panel: tLaserPanel },
    },
  } = useI18n();

  return (
    <Flex className={styles['full-row']} justify="space-between" align="center" gap={8}>
      <div className={styles.title}>{t.mark_parameters}</div>
      <Flex justify="space-between" align="center" gap={20}>
        <Flex className={styles.row} justify="space-between" align="center" gap={12}>
          <span className={styles.label}>{tLaserPanel.strength}</span>
          <UnitInput
            data-testid="power"
            className={classNames(styles.input, styles.short)}
            size="small"
            value={power}
            min={0}
            max={100}
            precision={0}
            addonAfter="%"
            onChange={(val) => setParameters((cur) => ({ ...cur, power: val }))}
          />
        </Flex>
        <Flex className={styles.row} justify="space-between" align="center" gap={12}>
          <span className={styles.label}>{tLaserPanel.speed}</span>
          <UnitInput
            data-testid="speed"
            className={styles.input}
            size="small"
            isInch={isInch}
            value={speed}
            min={100}
            max={3000}
            precision={0}
            addonAfter={isInch ? 'in/s' : 'mm/s'}
            onChange={(val) => setParameters((cur) => ({ ...cur, speed: val }))}
          />
        </Flex>
      </Flex>
    </Flex>
  );
};

export default ParametersBlock;
