import React from 'react';
import UnitInput from 'app/widgets/UnitInput';
import useI18n from 'helpers/useI18n';
import { Flex, Select } from 'antd';
import styles from './TableSettingForm.module.scss';
import { TableSetting } from './TableSetting';

interface Props {
  isInch: boolean;
  tableSetting: TableSetting;
  handleChange: (tableSetting: TableSetting) => void;
}

export default function TableSettingForm({
  isInch,
  tableSetting,
  handleChange,
}: Props): JSX.Element {
  const {
    beambox: {
      right_panel: { laser_panel: tLaserPanel },
    },
    material_test_generator: tMaterial,
  } = useI18n();
  const lengthUnit = isInch ? 'in' : 'mm';
  const settingEntries = Object.entries(tableSetting).sort(([a], [b]) => b.localeCompare(a));
  const options = settingEntries.map(([key]) => ({ value: key, label: tLaserPanel[key] }));

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

  const handleValueChange = (key: string, prefix: 'min' | 'max', value: number) => {
    const { min, max } = tableSetting[key];
    const limitValue = (v: number) => {
      if (prefix === 'min') {
        return v > tableSetting[key].maxValue ? tableSetting[key].maxValue : v;
      }

      return v < tableSetting[key].minValue ? tableSetting[key].minValue : v;
    };
    const finalValue = limitValue(value);

    handleChange({
      ...tableSetting,
      [key]: {
        ...tableSetting[key],
        // eslint-disable-next-line no-nested-ternary
        [`${prefix}Value`]: finalValue > max ? max : finalValue < min ? min : finalValue,
      },
    });
  };

  const renderInputGroup = (index: number) => {
    const [key, detail] = settingEntries.find(([, { selected }]) => selected === index) || [];
    const useInch = isInch && key === 'speed';

    return (
      <Flex vertical justify="space-between" gap="20px" key={`table-setting-${index}`}>
        <div className={styles['sub-title']}>{tMaterial[index ? 'rows' : 'columns']}</div>
        <Select
          className={styles.input}
          options={options}
          value={options.find(({ value }) => tableSetting[value].selected === index)?.value}
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
    <Flex justify="space-between">
      <Flex vertical justify="space-between" gap="20px">
        <div className={styles['sub-title']}>&nbsp;</div>
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
