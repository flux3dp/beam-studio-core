import React from 'react';

import Constant from 'app/actions/beambox/constant';
import i18n from 'helpers/i18n';
import InFillBlock from 'app/views/beambox/Right-Panels/Options-Blocks/InFillBlock';
import ObjectPanelController from 'app/views/beambox/Right-Panels/contexts/ObjectPanelController';
import ObjectPanelItem from 'app/views/beambox/Right-Panels/ObjectPanelItem';
import storage from 'implementations/storage';
import UnitInput from 'app/widgets/Unit-Input-v2';
import { getSVGAsync } from 'helpers/svg-editor-helper';
import { useIsMobile } from 'helpers/system-helper';

let svgCanvas;
getSVGAsync((globalSVG) => { svgCanvas = globalSVG.Canvas; });

const LANG = i18n.lang.beambox.right_panel.object_panel.option_panel;

interface Props {
  elem: Element;
  rx: number;
  updateDimensionValues: (val: { [key: string]: any }) => void;
}

function RectOptions({
  elem, rx, updateDimensionValues,
}: Props): JSX.Element {
  const isMobile = useIsMobile();
  const handleRoundedCornerChange = (val) => {
    // eslint-disable-next-line no-param-reassign
    val *= Constant.dpmm;
    svgCanvas.changeSelectedAttribute('rx', val, [elem]);
    updateDimensionValues({ rx: val });
  };

  const renderRoundCornerBlock = () => {
    const unit = storage.get('default-units') || 'mm';
    const isInch = unit === 'inches';
    return isMobile ? (
      <ObjectPanelItem.Number
        id="rounded-corner"
        value={rx / Constant.dpmm || 0}
        min={0}
        updateValue={(val) => {
          handleRoundedCornerChange(val);
          ObjectPanelController.updateObjectPanel();
        }}
        label={LANG.rounded_corner}
      />
    ) : (
      <div className="option-block" key="rounded-corner">
        <div className="label">{LANG.rounded_corner}</div>
        <UnitInput
          min={0}
          unit={isInch ? 'in' : 'mm'}
          className={{ 'option-input': true }}
          defaultValue={rx / Constant.dpmm || 0}
          getValue={(val) => handleRoundedCornerChange(val)}
        />
      </div>
    );
  };

  return isMobile ? (
    <>
      <InFillBlock elem={elem} />
      {renderRoundCornerBlock()}
    </>
  ) : (
    <div className="rect-options">
      {renderRoundCornerBlock()}
      <InFillBlock elem={elem} />
    </div>
  );
}

export default RectOptions;
