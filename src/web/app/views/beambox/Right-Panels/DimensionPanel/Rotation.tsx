import classNames from 'classnames';
import React, { memo } from 'react';

import DimensionPanelIcons from 'app/icons/dimension-panel/DimensionPanelIcons';
import ObjectPanelItem from 'app/views/beambox/Right-Panels/ObjectPanelItem';
import UnitInput from 'app/widgets/Unit-Input-v2';
import useI18n from 'helpers/useI18n';
import { useIsMobile } from 'helpers/system-helper';

import styles from './DimensionPanel.module.scss';

interface Props {
  value: number;
  onChange: (value: number) => void;
}

const Rotation = ({ value, onChange }: Props): JSX.Element => {
  const isMobile = useIsMobile();
  const t = useI18n().topbar.menu;

  if (isMobile) {
    return (
      <ObjectPanelItem.Number
        id="rotate"
        value={value || 0}
        updateValue={onChange}
        label={t.rotate}
        unit="degree"
      />
    );
  }

  return (
    <div className={styles.dimension}>
      <div className={classNames(styles.label, styles.img)}>
        <DimensionPanelIcons.Rotate />
      </div>
      <UnitInput
        id="rotate"
        unit="deg"
        defaultValue={value || 0}
        getValue={onChange}
      />
    </div>
  );
};

export default memo(Rotation);
