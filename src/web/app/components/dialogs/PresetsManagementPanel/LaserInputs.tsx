import React from 'react';

import UnitInput from 'app/widgets/UnitInput';
import useI18n from 'helpers/useI18n';
import { ConfigKey, ConfigKeyTypeMap, Preset } from 'interfaces/ILayerConfig';
import { defaultConfig } from 'helpers/layer/layer-config-helper';

import styles from './PresetsManagementPanel.module.scss';

interface Props {
  preset: Preset;
  maxSpeed: number;
  minSpeed: number;
  isInch?: boolean;
  lengthUnit?: 'mm' | 'in';
  handleChange: <T extends ConfigKey>(key: T, value: ConfigKeyTypeMap[T]) => void;
}

const LaserInputs = ({
  preset,
  maxSpeed,
  minSpeed,
  isInch = false,
  lengthUnit = 'mm',
  handleChange,
}: Props): JSX.Element => {
  const tLaserPanel = useI18n().beambox.right_panel.laser_panel;
  const t = tLaserPanel.preset_management;

  return (
    <div className={styles.inputs}>
      <div>
        <div className={styles.field}>
          <div className={styles.label}>{tLaserPanel.strength}</div>
          <UnitInput
            data-testid="power"
            className={styles.input}
            disabled={preset.isDefault}
            value={preset.power ?? defaultConfig.power}
            max={100}
            min={0}
            precision={0}
            addonAfter="%"
            onChange={(value) => handleChange('power', value)}
          />
        </div>
        <div className={styles.field}>
          <div className={styles.label}>{tLaserPanel.speed}</div>
          <UnitInput
            data-testid="speed"
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
        </div>
        <div className={styles.field}>
          <div className={styles.label}>{tLaserPanel.repeat}</div>
          <UnitInput
            data-testid="repeat"
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
      <div>
        <div className={styles.field}>
          <div className={styles.label}>{t.lower_focus_by}</div>
          <UnitInput
            data-testid="focus"
            className={styles.input}
            disabled={preset.isDefault}
            value={Math.max(preset.focus ?? defaultConfig.focus, 0)}
            max={10}
            min={0}
            precision={isInch ? 2 : 1}
            addonAfter={lengthUnit}
            isInch={isInch}
            onChange={(value) => handleChange('focus', value)}
          />
        </div>
        <div className={styles.field}>
          <div className={styles.label}>{tLaserPanel.z_step}</div>
          <UnitInput
            data-testid="zStep"
            className={styles.input}
            disabled={preset.isDefault}
            value={preset.zStep ?? defaultConfig.zStep}
            max={10}
            min={0}
            precision={isInch ? 2 : 1}
            addonAfter={lengthUnit}
            isInch={isInch}
            onChange={(value) => handleChange('zStep', value)}
          />
        </div>
      </div>
    </div>
  );
};

export default LaserInputs;
