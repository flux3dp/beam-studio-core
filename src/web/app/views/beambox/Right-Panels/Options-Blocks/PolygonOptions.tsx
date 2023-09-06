import React from 'react';

import i18n from 'helpers/i18n';
import InFillBlock from 'app/views/beambox/Right-Panels/Options-Blocks/InFillBlock';
import ObjectPanelItem from 'app/views/beambox/Right-Panels/ObjectPanelItem';
import UnitInput from 'app/widgets/Unit-Input-v2';
import { useIsMobile } from 'helpers/system-helper';

const LANG = i18n.lang.beambox.right_panel.object_panel.option_panel;

interface Props {
  elem: Element;
  polygonSides: number;
}

function PolygonOptions({ elem, polygonSides }: Props): JSX.Element {
  const [sides, setSides] = React.useState(polygonSides || 5);
  const isMobile = useIsMobile();
  React.useEffect(() => {
    setSides(polygonSides);
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
        updateValue={handleSideChanage}
        label={LANG.sides}
        unit=""
        decimal={0}
      />
    ) : (
      <div className="option-block" key="polygon-sides">
        <div className="label">{LANG.sides}</div>
        <UnitInput
          min={3}
          className={{ 'option-input': true }}
          defaultValue={sides}
          decimal={0}
          getValue={(val) => handleSideChanage(val)}
        />
      </div>
    );

  return isMobile ? (
    <>
      <InFillBlock elem={elem} />
      {renderSides()}
    </>
  ) : (
    <div className="polygon-options">
      {renderSides()}
      <InFillBlock elem={elem} />
    </div>
  );
}

export default PolygonOptions;
