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
  } = useI18n();
  const lengthUnit = isInch ? 'in' : 'mm';

  const settingEntries = Object.entries(tableSetting).sort(([a], [b]) => a.localeCompare(b));

  const options = settingEntries.map(([key]) => ({
    value: key,
    label: tLaserPanel[key],
  }));

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
    handleChange({ ...tableSetting, [key]: { ...tableSetting[key], [`${prefix}Value`]: value } });
  };

  const renderInputGroup = (index: number) => {
    const [key, detail] = settingEntries.find(([, { selected }]) => selected === index) || [];

    return (
      <Flex vertical justify="space-between" gap="20px" key={`table-setting-${index}`}>
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
            className={styles.input}
            value={detail?.[`${prefix}Value`]}
            max={detail?.max}
            min={detail?.min}
            precision={0}
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
        <div className={styles.label}>Parameter</div>
        <div className={styles.label}>Min</div>
        <div className={styles.label}>Max</div>
      </Flex>

      <Flex className={styles.inputs} justify="flex-end" gap="20px">
        {[0, 1].map(renderInputGroup)}
      </Flex>
    </Flex>
  );
}
