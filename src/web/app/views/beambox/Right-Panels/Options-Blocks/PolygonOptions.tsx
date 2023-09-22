import React from 'react';

import i18n from 'helpers/i18n';
import ObjectPanelItem from 'app/views/beambox/Right-Panels/ObjectPanelItem';
import OptionPanelIcons from 'app/icons/option-panel/OptionPanelIcons';
import UnitInput from 'app/widgets/Unit-Input-v2';
import { useIsMobile } from 'helpers/system-helper';

import styles from './PolygonOptions.module.scss';

const LANG = i18n.lang.beambox.right_panel.object_panel.option_panel;

interface Props {
  elem: Element;
  polygonSides: number;
}

function PolygonOptions({ elem, polygonSides }: Props): JSX.Element {
  const [sides, setSides] = React.useState(polygonSides || 5);
  const isMobile = useIsMobile();
  React.useEffect(() => {
    if (polygonSides) setSides(polygonSides);
  }, [polygonSides]);

  const handleSideChanage = (val) => {
    if (val === sides) return;
    if (val > sides) {
      for (let i = sides; i < val; i += 1) window.polygonAddSides?.();
    } else {
      for (let i = val; i < sides; i += 1) window.polygonDecreaseSides?.();
    }
    setSides(+$(elem).attr('sides'));
  };

  const renderSides = () =>
    isMobile ? (
      <ObjectPanelItem.Number
        id="polygon-sides"
        value={sides}
        min={3}
        updateValue={handleSideChanage}
        label={LANG.sides}
        unit=""
        decimal={0}
      />
    ) : (
      <div className={styles['polygon-sides']} key="polygon-sides">
        <div className={styles.label} title={LANG.sides}>
          <OptionPanelIcons.PolygonSide />
        </div>
        <UnitInput
          min={3}
          className={{ 'option-input': true }}
          defaultValue={sides}
          decimal={0}
          getValue={(val) => handleSideChanage(val)}
        />
      </div>
    );

  return isMobile ? renderSides() : <div>{renderSides()}</div>;
}

export default PolygonOptions;
