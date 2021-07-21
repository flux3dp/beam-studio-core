import classNames from 'classnames';
import React from 'react';

import BeamboxPreference from 'app/actions/beambox/beambox-preference';
import Constant from 'app/actions/beambox/constant';
import i18n from 'helpers/i18n';
import storage from 'implementations/storage';
import UnitInput from 'app/widgets/Unit-Input-v2';

const LANG = i18n.lang.beambox.tool_panels;

interface Props {
  dx?: number,
  dy?: number,
  onValueChange?: (rc: { dx: number, dy: number }) => void,
}

interface State {
  dx: number,
  dy: number,
  isCollapsed: boolean,
}

class Interval extends React.Component<Props, State> {
  constructor(props) {
    super(props);
    const { dx, dy } = this.props;
    this.state = {
      dx,
      dy,
      isCollapsed: false,
    };
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    this.setState({
      dx: nextProps.dx,
      dy: nextProps.dy,
    });
  }

  onDxChanged = (val: number) => {
    const { onValueChange } = this.props;
    const { dy } = this.state;
    onValueChange({
      dx: val,
      dy,
    });
    this.setState({ dx: val });
  }

  onDyChanged = (val: number) => {
    const { onValueChange } = this.props;
    const { dx } = this.state;
    onValueChange({
      dx,
      dy: val,
    });
    this.setState({ dy: val });
  }

  getValueCaption = () => {
    const dx = this.state.dx,
      dy = this.state.dy,
      units = storage.get('default-units') || 'mm';
    if (units === 'inches') {
      return `${Number(dx / 25.4).toFixed(3)}\", ${Number(dy / 25.4).toFixed(3)}\"`;
    } else {
      return `${dx}, ${dy} mm`;
    }
  }

  render() {
    const { isCollapsed } = this.state;
    return (
      <div className="tool-panel">
        <label className="controls accordion">
          <input type="checkbox" className="accordion-switcher" defaultChecked={true} />
          <p className="caption" onClick={() => this.setState({ isCollapsed: !isCollapsed })}>
            {LANG.array_interval}
            <span className="value">{this.getValueCaption()}</span>
          </p>
          <div className={classNames('tool-panel-body', { collapsed: isCollapsed })}>
            <div className="control">
              <span className="text-center header">{LANG.dx}</span>
              <UnitInput
                id="array_width"
                min={0}
                max={Constant.dimension.getWidth(BeamboxPreference.read('workarea')) / Constant.dpmm}
                unit="mm"
                defaultValue={this.state.dx}
                getValue={this.onDxChanged}
              />
            </div>
            <div className="control">
              <span className="text-center header">{LANG.dy}</span>
              <UnitInput
                id="array_height"
                min={0}
                max={Constant.dimension.getHeight(BeamboxPreference.read('workarea')) / Constant.dpmm}
                unit="mm"
                defaultValue={this.state.dy}
                getValue={this.onDyChanged}
              />
            </div>
          </div>
        </label>
      </div>
    );
  }
};

export default Interval;
