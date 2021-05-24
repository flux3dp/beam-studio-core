import React from 'react';
import classNames from 'classnames';

import UnitInput from 'app/widgets/Unit-Input-v2';
import storage from 'implementations/storage';
import i18n from 'helpers/i18n';

const LANG = i18n.lang.beambox.tool_panels;

interface Props {
  distance: number,
  onValueChange: (val: number) => void,
}

interface State {
  distance: number,
  isCollapsed: boolean,
}

class OffsetDistPanel extends React.Component<Props, State> {
  constructor(props) {
    super(props);
    const { distance } = this.props;
    this.state = {
      distance,
      isCollapsed: false,
    };
  }

  updateDist(val: number) {
    const { onValueChange } = this.props;
    onValueChange(val);
    this.setState({ distance: val });
  }

  getValueCaption() {
    const { distance } = this.state;
    const units = storage.get('default-units') || 'mm';
    if (units === 'inches') {
      return `${Number(distance / 25.4).toFixed(3)}\"`;
    } else {
      return `${distance} mm`;
    }
  }

  render() {
    const { isCollapsed } = this.state;
    return (
      <div className="tool-panel">
        <label className="controls accordion">
          <input type="checkbox" className="accordion-switcher" defaultChecked={true} />
          <p className="caption" onClick={() => this.setState({ isCollapsed: !isCollapsed })}>
            {LANG._offset.dist}
            <span className="value">{this.getValueCaption()}</span>
          </p>
          <div className={classNames('tool-panel-body', { collapsed: isCollapsed })}>
            <div>
              <div className="control offset-dist">
                <UnitInput
                  min={0}
                  unit="mm"
                  defaultValue={this.state.distance}
                  getValue={(val) => this.updateDist(val)}
                />
              </div>
            </div>
          </div>
        </label>
      </div>
    );
  }
};

export default OffsetDistPanel;
