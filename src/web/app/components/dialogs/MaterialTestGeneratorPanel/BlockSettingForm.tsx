import React from 'react';
import UnitInput from 'app/widgets/UnitInput';
import { Flex } from 'antd';
import useI18n from 'helpers/useI18n';
import { BlockSetting, blockSettingParams, blockSettingScopes } from './BlockSetting';
import styles from './Form.module.scss';

interface Props {
  isInch: boolean;
  blockSetting: BlockSetting;
  handleChange: (blockSetting: BlockSetting) => void;
  className?: string;
}

export default function BlockSettingForm({
  isInch,
  blockSetting,
  handleChange,
  className,
}: Props): JSX.Element {
  const t = useI18n();
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
    <Flex key={scope} vertical justify="space-between" gap="8px">
      <div className={styles['sub-title']}>
        {t.material_test_generator[scope === 'row' ? 'rows' : 'columns']}
      </div>
      {blockSettingParams.map((param) => renderInput(scope, param))}
    </Flex>
  );

  return (
    <Flex className={className} justify="space-between">
      <Flex vertical justify="space-between" gap="8px">
        <div className={styles.title}>{t.material_test_generator.block_settings}</div>
        <div className={styles.label}>{t.material_test_generator.count}</div>
        <div className={styles.label}>{t.material_test_generator.size}</div>
        <div className={styles.label}>{t.material_test_generator.spacing}</div>
      </Flex>

      <Flex className={styles.inputs} justify="flex-end" gap="20px">
        {blockSettingScopes.map(renderColumn)}
      </Flex>
    </Flex>
  );
}
