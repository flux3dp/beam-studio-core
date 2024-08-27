import classNames from 'classnames';
import React, { useMemo } from 'react';

import beamboxPreference from 'app/actions/beambox/beambox-preference';
import configOptions from 'app/constants/config-options';
import Select from 'app/widgets/AntdSelect';
import UnitInput from 'app/widgets/UnitInput';
import useI18n from 'helpers/useI18n';
import { defaultConfig } from 'helpers/layer/layer-config-helper';
import { Preset } from 'interfaces/ILayerConfig';

import styles from './PresetsManagementPanel.module.scss';

interface Props {
  preset: Preset;
  maxSpeed: number;
  minSpeed: number;
  isInch?: boolean;
  lengthUnit?: 'mm' | 'in';
  handleChange: (key: string, value: number | string) => void;
}

const PrintingInputs = ({
  preset,
  maxSpeed,
  minSpeed,
  isInch = false,
  lengthUnit = 'mm',
  handleChange,
}: Props): JSX.Element => {
  const simpleMode = useMemo(() => !beamboxPreference.read('print-advanced-mode'), []);
  const lang = useI18n();
  const { saturationOptions, printingSpeedOptions, multipassOptions } = useMemo(
    () => ({
      saturationOptions: configOptions.getSaturationOptions(lang),
      printingSpeedOptions: configOptions.getPrintingSpeedOptions(lang),
      multipassOptions: configOptions.multipassOptions,
    }),
    [lang]
  );
  const tLaserPanel = lang.beambox.right_panel.laser_panel;

  return (
    <div className={styles.inputs}>
      <div>
        <div className={styles.field}>
          <div className={styles.label}>{tLaserPanel.ink_saturation}</div>
          {simpleMode ? (
            <Select
              disabled={preset.isDefault}
              className={styles.select}
              onChange={(val) => handleChange('ink', val)}
              value={preset.ink ?? defaultConfig.ink}
            >
              {saturationOptions.map((option) => (
                <Select.Option key={option.value} value={option.value}>
                  {option.label}
                </Select.Option>
              ))}
            </Select>
          ) : (
            <UnitInput
              className={styles.input}
              disabled={preset.isDefault}
              value={preset.ink ?? defaultConfig.ink}
              max={15}
              min={1}
              precision={0}
              onChange={(value) => handleChange('ink', value)}
            />
          )}
        </div>
        <div className={classNames(styles.field, styles.small)}>
          <div className={styles.label}>Cyan</div>
          <UnitInput
            className={styles.input}
            size="small"
            disabled={preset.isDefault}
            value={preset.cRatio ?? defaultConfig.cRatio}
            max={200}
            min={0}
            precision={0}
            addonAfter="%"
            onChange={(value) => handleChange('cRatio', value)}
          />
        </div>
        <div className={classNames(styles.field, styles.small)}>
          <div className={styles.label}>Magenta</div>
          <UnitInput
            className={styles.input}
            size="small"
            disabled={preset.isDefault}
            value={preset.mRatio ?? defaultConfig.mRatio}
            max={200}
            min={0}
            precision={0}
            addonAfter="%"
            onChange={(value) => handleChange('mRatio', value)}
          />
        </div>
        <div className={classNames(styles.field, styles.small)}>
          <div className={styles.label}>Yellow</div>
          <UnitInput
            className={styles.input}
            size="small"
            disabled={preset.isDefault}
            value={preset.yRatio ?? defaultConfig.yRatio}
            max={200}
            min={0}
            precision={0}
            addonAfter="%"
            onChange={(value) => handleChange('yRatio', value)}
          />
        </div>
        <div className={classNames(styles.field, styles.small)}>
          <div className={styles.label}>Black</div>
          <UnitInput
            className={styles.input}
            size="small"
            disabled={preset.isDefault}
            value={preset.kRatio ?? defaultConfig.kRatio}
            max={200}
            min={0}
            precision={0}
            addonAfter="%"
            onChange={(value) => handleChange('kRatio', value)}
          />
        </div>
      </div>
      <div>
        <div className={styles.field}>
          <div className={styles.label}>{tLaserPanel.halftone}</div>
          <Select
            disabled={preset.isDefault}
            className={styles.select}
            onChange={(val) => handleChange('halftone', val)}
            value={preset.halftone ?? defaultConfig.halftone}
          >
            <Select.Option value={1}>FM</Select.Option>
            <Select.Option value={2}>AM</Select.Option>
          </Select>
        </div>
        <div className={styles.field}>
          <div className={styles.label}>{tLaserPanel.speed}</div>
          {simpleMode ? (
            <Select
              disabled={preset.isDefault}
              className={styles.select}
              onChange={(val) => handleChange('speed', val)}
              value={preset.speed ?? defaultConfig.speed}
            >
              {printingSpeedOptions.map((option) => (
                <Select.Option key={option.value} value={option.value}>
                  {option.label}
                </Select.Option>
              ))}
            </Select>
          ) : (
            <UnitInput
              className={styles.input}
              disabled={preset.isDefault}
              value={preset.speed ?? defaultConfig.speed}
              max={maxSpeed}
              min={minSpeed}
              precision={isInch ? 2 : 1}
              addonAfter={`${lengthUnit}/s`}
              isInch={isInch}
              onChange={(value) => handleChange('speed', value)}
            />
          )}
        </div>
        <div className={styles.field}>
          <div className={styles.label}>{tLaserPanel.print_multipass}</div>
          {simpleMode ? (
            <Select
              disabled={preset.isDefault}
              className={styles.select}
              onChange={(val) => handleChange('multipass', val)}
              value={preset.multipass ?? defaultConfig.multipass}
            >
              {multipassOptions.map(({ value }) => (
                <Select.Option key={value} value={value}>
                  {value}
                </Select.Option>
              ))}
            </Select>
          ) : (
            <UnitInput
              className={styles.input}
              disabled={preset.isDefault}
              value={preset.multipass ?? defaultConfig.multipass}
              max={10}
              min={1}
              precision={0}
              addonAfter={tLaserPanel.times}
              onChange={(value) => handleChange('multipass', value)}
            />
          )}
        </div>
        <div className={styles.field}>
          <div className={styles.label}>{tLaserPanel.repeat}</div>
          <UnitInput
            className={styles.input}
            disabled={preset.isDefault}
            value={preset.repeat ?? defaultConfig.repeat}
            max={100}
            min={0}
            precision={0}
            addonAfter={tLaserPanel.times}
            onChange={(value) => handleChange('repeat', value)}
          />
        </div>
      </div>
    </div>
  );
};

export default PrintingInputs;
