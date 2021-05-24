import React from 'react';

import Constant from 'app/actions/beambox/constant';
import i18n from 'helpers/i18n';
import InFillBlock from 'app/views/beambox/Right-Panels/Options-Blocks/Infill-Block';
import storage from 'implementations/storage';
import UnitInput from 'app/widgets/Unit-Input-v2';
import { getSVGAsync } from 'helpers/svg-editor-helper';

let svgCanvas;
let svgEditor;
getSVGAsync((globalSVG) => { svgCanvas = globalSVG.Canvas; svgEditor = globalSVG.Editor; });
const LANG = i18n.lang.beambox.right_panel.object_panel.option_panel;

interface Props {
  elem: Element;
  dimensionValues: {[key: string]: any};
  updateDimensionValues: (val: { [key: string]: any }) => void;
}

class RectOptions extends React.Component<Props> {
  handleRoundedCornerChange = (val) => {
    const { elem, updateDimensionValues } = this.props;
    val *= Constant.dpmm;
    svgCanvas.changeSelectedAttribute('rx', val, [elem]);
    updateDimensionValues({ rx: val });
  }

  renderRoundCornerBlock() {
    const { dimensionValues } = this.props;
    const unit = storage.get('default-units') || 'mm';
    const isInch = unit === 'inches';
    return (
      <div className="option-block" key="rounded-corner">
        <div className="label">{LANG.rounded_corner}</div>
        <UnitInput
          min={0}
          unit={isInch ? 'in' : 'mm'}
          className={{ 'option-input': true }}
          defaultValue={dimensionValues.rx / Constant.dpmm || 0}
          getValue={(val) => this.handleRoundedCornerChange(val)}
        />
      </div>
    );
  }

  render() {
    const { elem } = this.props;
    return (
      <div className="rect-options">
        {this.renderRoundCornerBlock()}
        <InFillBlock elem={elem} />
      </div>
    );
  }
}

export default RectOptions;
