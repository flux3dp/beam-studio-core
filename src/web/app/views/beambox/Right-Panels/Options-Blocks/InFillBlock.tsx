import * as React from 'react';
import classNames from 'classnames';

import i18n from 'helpers/i18n';
import { getSVGAsync } from 'helpers/svg-editor-helper';

let svgCanvas;

getSVGAsync((globalSVG) => {
  svgCanvas = globalSVG.Canvas;
});

const LANG = i18n.lang.beambox.right_panel.object_panel.option_panel;

interface Props {
  elem: Element;
}

interface State {
  isAnyFilled: boolean;
  isAllFilled: boolean;
  isFillable: boolean;
}

class InFillBlock extends React.Component<Props, State> {
  constructor(props) {
    super(props);
    const { elem } = props;
    const isFillable = svgCanvas.isElemFillable(elem);
    const { isAnyFilled, isAllFilled } = svgCanvas.calcElemFilledInfo(elem);
    this.state = {
      isAnyFilled,
      isAllFilled,
      isFillable,
    };
  }

  componentDidUpdate(prevProps) {
    const lastElem = prevProps.elem;
    const lastId = lastElem.getAttribute('id');
    const { elem } = this.props;
    if (elem.getAttribute('id') !== lastId) {
      const isFillable = svgCanvas.isElemFillable(elem);
      const { isAnyFilled, isAllFilled } = svgCanvas.calcElemFilledInfo(elem);
      this.setState({
        isAnyFilled,
        isAllFilled,
        isFillable,
      });
    }
  }

  onClick = () => {
    const { isAnyFilled } = this.state;
    const { elem } = this.props;
    if (isAnyFilled) {
      svgCanvas.setElemsUnfill([elem]);
    } else {
      svgCanvas.setElemsFill([elem]);
    }
    this.setState({
      isAnyFilled: !isAnyFilled,
      isAllFilled: !isAnyFilled,
    });
  };

  render() {
    const { elem } = this.props;
    const { isAnyFilled, isAllFilled, isFillable } = this.state;
    const isPartiallyFilled = isAnyFilled && !isAllFilled;
    if (!isFillable) {
      return null;
    }
    return (
      <div className="option-block" key="infill">
        <div className="label">{LANG.fill}</div>
        <div className={classNames('onoffswitch', { 'partially-filled': elem.tagName === 'g' && isPartiallyFilled })} onClick={() => this.onClick()}>
          <input type="checkbox" className="onoffswitch-checkbox" checked={isAnyFilled || false} readOnly />
          <label className="onoffswitch-label">
            <span className="onoffswitch-inner" />
            <span className="onoffswitch-switch" />
          </label>
        </div>
      </div>
    );
  }
}

export default InFillBlock;
