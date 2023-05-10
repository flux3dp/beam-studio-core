import * as React from 'react';
import classNames from 'classnames';

import i18n from 'helpers/i18n';
import { getSVGAsync } from 'helpers/svg-editor-helper';
import { isMobile } from 'helpers/system-helper';
import { Switch } from 'antd-mobile';

let svgCanvas;

getSVGAsync((globalSVG) => {
  svgCanvas = globalSVG.Canvas;
});

const LANG = i18n.lang.beambox.right_panel.object_panel.option_panel;

interface Props {
  label?: string;
  id?:string
  elem: Element;
}

interface State {
  isAnyFilled: boolean;
  isAllFilled: boolean;
  isFillable: boolean;
}

class InFillBlock extends React.Component<Props, State> {
  constructor(props: Props) {
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

  componentDidUpdate(prevProps: Props): void {
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

  onClick = (): void => {
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

  renderSwitch = (): JSX.Element => {
    const { elem, label = LANG.fill } = this.props;
    const { isAnyFilled, isAllFilled, isFillable } = this.state;
    if (isMobile()) {
      return <Switch style={{
        '--height': '32px'
      }} defaultChecked={isAnyFilled} onChange={() => this.onClick()} />
    }
    return (
      <>
        <input type="checkbox" className="onoffswitch-checkbox" checked={isAnyFilled} readOnly />
        <label className="onoffswitch-label">
          <span className="onoffswitch-inner" />
          <span className="onoffswitch-switch" />
        </label>
      </>
    );
  }

  render(): JSX.Element {
    const { elem, label = LANG.fill } = this.props;
    const { isAnyFilled, isAllFilled, isFillable } = this.state;
    const isPartiallyFilled = elem.tagName === 'g' && (isAnyFilled && !isAllFilled);
    if (!isFillable) {
      return null;
    }
    return (
      <div className="option-block" key="infill">
        <div className="label">{label}</div>
        <div id="infill" className={classNames('onoffswitch', { 'partially-filled': isPartiallyFilled })} onClick={() => this.onClick()}>
          { this.renderSwitch() }
        </div>
      </div>
    );
  }
}

export default InFillBlock;
