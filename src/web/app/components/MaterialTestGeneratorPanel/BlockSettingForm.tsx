import React from 'react';
import UnitInput from 'app/widgets/UnitInput';
import { Flex } from 'antd';
import { BlockSetting, blockSettingParams, blockSettingScopes } from './BlockSetting';
import styles from './BlockSettingForm.module.scss';

interface Props {
  isInch: boolean;
  blockSetting: BlockSetting;
  handleChange: (blockSetting: BlockSetting) => void;
}

export default function BlockSettingForm({
  isInch,
  blockSetting,
  handleChange,
}: Props): JSX.Element {
  const lengthUnit = isInch ? 'in' : 'mm';

  const handleValueChange = (scope: string, param: string, value: number) => {
    const { min, max } = blockSetting[scope][param];

    handleChange({
      ...blockSetting,
      [scope]: {
        ...blockSetting[scope],
        [param]: {
          ...blockSetting[scope][param],
          // eslint-disable-next-line no-nested-ternary
          value: value > max ? max : value < min ? min : value,
        },
      },
    });
  };

  const renderInput = (scope: string, param: string) => {
    const setting = blockSetting[scope][param];
    const useInch = isInch && param !== 'count';

    return (
      <UnitInput
        isInch={useInch}
        key={`${scope}-${param}`}
        data-testid={`${scope}-${param}`}
        className={styles.input}
        value={setting.value}
        max={setting.max}
        min={setting.min}
        precision={useInch ? 4 : 0}
        step={useInch ? 25.4 : 1}
        addonAfter={param === 'count' ? '' : lengthUnit}
        onChange={(value) => handleValueChange(scope, param, value)}
      />
    );
  };

  const renderColumn = (scope: string) => (
    <Flex key={scope} vertical justify="space-between" gap="20px">
      <div className={styles['sub-title']}>{scope === 'row' ? 'Rows' : 'Columns'}</div>
      {blockSettingParams.map((param) => renderInput(scope, param))}
    </Flex>
  );

  return (
    <Flex justify="space-between">
      <Flex vertical justify="space-between" gap="20px">
        <div className={styles['sub-title']}>&nbsp;</div>
        <div className={styles.label}>Count</div>
        <div className={styles.label}>Size (WxL)</div>
        <div className={styles.label}>Spacing</div>
      </Flex>

      <Flex className={styles.inputs} justify="flex-end" gap="20px">
        {blockSettingScopes.map(renderColumn)}
      </Flex>
    </Flex>
  );
}
