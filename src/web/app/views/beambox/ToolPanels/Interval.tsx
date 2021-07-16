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

  onDxChanged = (dx: number) => {
    const { onValueChange } = this.props;
    const { dy } = this.state;
    onValueChange({
      dx,
      dy,
    });
    this.setState({ dx });
  };

  onDyChanged = (dy: number) => {
    const { onValueChange } = this.props;
    const { dx } = this.state;
    onValueChange({
      dx,
      dy,
    });
    this.setState({ dy });
  };

  getValueCaption = (): string => {
    const { dx, dy } = this.state;
    const units = storage.get('default-units') || 'mm';
    return units === 'inches'
      ? `${Number(dx / 25.4).toFixed(3)}\", ${Number(dy / 25.4).toFixed(3)}\"`
      : `${dx}, ${dy} mm`;
  };

  render(): JSX.Element {
    const { dx, dy, isCollapsed } = this.state;
    return (
      <div className="tool-panel">
        <label className="controls accordion">
          <input type="checkbox" className="accordion-switcher" defaultChecked />
          <p className="caption" onClick={() => this.setState({ isCollapsed: !isCollapsed })}>
            {LANG.array_interval}
            <span className="value">{this.getValueCaption()}</span>
          </p>
          <div className={classNames('tool-panel-body', { collapsed: isCollapsed })}>
            <div className="control">
              <span className="text-center header">{LANG.dx}</span>
              <UnitInput
                min={0}
                max={Constant.dimension.getWidth(BeamboxPreference.read('workarea')) / Constant.dpmm}
                unit="mm"
                defaultValue={dx}
                getValue={this.onDxChanged}
              />
            </div>
            <div className="control">
              <span className="text-center header">{LANG.dy}</span>
              <UnitInput
                min={0}
                max={Constant.dimension.getHeight(BeamboxPreference.read('workarea')) / Constant.dpmm}
                unit="mm"
                defaultValue={dy}
                getValue={this.onDyChanged}
              />
            </div>
          </div>
        </label>
      </div>
    );
  }
}

export default Interval;
