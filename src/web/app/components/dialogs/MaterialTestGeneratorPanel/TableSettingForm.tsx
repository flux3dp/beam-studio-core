import React from 'react';
import UnitInput from 'app/widgets/UnitInput';
import useI18n from 'helpers/useI18n';
import { Flex } from 'antd';
import Select from 'app/widgets/AntdSelect';
import { Detail, tableParams, TableSetting } from './TableSetting';
import styles from './Form.module.scss';

interface Props {
  isInch: boolean;
  tableSetting: TableSetting;
  handleChange: (tableSetting: TableSetting) => void;
  className?: string;
}

type Param = (typeof tableParams)[number];

export default function TableSettingForm({
  isInch,
  tableSetting,
  handleChange,
  className,
}: Props): JSX.Element {
  const {
    beambox: {
      right_panel: { laser_panel: tLaserPanel },
    },
    material_test_generator: tMaterial,
  } = useI18n();
  const lengthUnit = isInch ? 'in/s' : 'mm/s';
  const settingEntries = React.useMemo(
    () => Object.entries(tableSetting) as Array<[Param, Detail]>,
    [tableSetting]
  );
  const options = tableParams.map((value) => ({ value, label: tLaserPanel[value] }));

  const handleSelectChange = (value: string, index: number) => {
    const currentKey = settingEntries.find(([, { selected }]) => selected === index)?.[0];

    if (!currentKey) {
      return;
    }

    handleChange({
      ...tableSetting,
      [currentKey]: { ...tableSetting[currentKey], selected: tableSetting[value].selected },
      [value]: { ...tableSetting[value], selected: index },
    });
  };

  const handleValueChange = (key: Param, prefix: 'min' | 'max', value: number) => {
    const { min, max } = tableSetting[key];
    const limitValue = (v: number) => {
      const rangedValue = Math[prefix](
        v,
        tableSetting[key][prefix === 'min' ? 'maxValue' : 'minValue']
      );

      return Math.min(max, Math.max(min, rangedValue));
    };

    handleChange({
      ...tableSetting,
      [key]: { ...tableSetting[key], [`${prefix}Value`]: limitValue(value) },
    });
  };

  const renderInputGroup = (index: number) => {
    const [key, detail] = settingEntries.find(([, { selected }]) => selected === index) || [];
    const useInch = isInch && key === 'speed';

    return (
      <Flex vertical justify="space-between" gap="8px" key={`table-setting-${index}`}>
        <div className={styles['sub-title']}>{tMaterial[index ? 'rows' : 'columns']}</div>
        <Select
          className={styles.input}
          options={options}
          value={key}
          onChange={(value) => handleSelectChange(value, index)}
        />
        {['min', 'max'].map((prefix) => (
          <UnitInput
            key={`${prefix}-${key}`}
            data-testid={`${prefix}-${key}`}
            isInch={useInch}
            className={styles.input}
            value={detail[`${prefix}Value`]}
            max={detail.max}
            min={detail.min}
            precision={useInch ? 4 : 0}
            step={useInch ? 25.4 : 1}
            // eslint-disable-next-line no-nested-ternary
            addonAfter={key === 'strength' ? '%' : key === 'speed' ? lengthUnit : ''}
            onChange={(value) => handleValueChange(key, prefix as 'min' | 'max', value)}
          />
        ))}
      </Flex>
    );
  };

  return (
    <Flex className={className} justify="space-between">
      <Flex vertical justify="space-between" gap="8px">
        <div className={styles.title}>{tMaterial.table_settings}</div>
        <div className={styles.label}>{tMaterial.parameter}</div>
        <div className={styles.label}>{tMaterial.min}</div>
        <div className={styles.label}>{tMaterial.max}</div>
      </Flex>

      <Flex className={styles.inputs} justify="flex-end" gap="20px">
        {[0, 1].map(renderInputGroup)}
      </Flex>
    </Flex>
  );
}
