import * as i18n from 'helpers/i18n';
import React from 'react';
import storage from 'helpers/storage-helper';
import UnitInput from 'app/widgets/Unit-Input-v2';

const LANG = i18n.lang.beambox.tool_panels;

interface Props {
  spacing: number,
  onValueChange: (val: number) => void,
}

interface State {
  spacing: number,
}

class NestSpacingPanel extends React.Component<Props, State> {
  constructor(props) {
    super(props);
    const { spacing } = this.props;
    this.state = {
      spacing,
    };
  }

  updateVal(val) {
    const { onValueChange } = this.props;
    onValueChange(val);
    this.setState({ spacing: val });
  }

  getValueCaption() {
    const spacing = this.state.spacing,
      units = storage.get('default-units') || 'mm';
    if (units === 'inches') {
      return `${Number(spacing / 25.4).toFixed(3)}\"`;
    } else {
      return `${spacing} mm`;
    }
  }

  render() {
    return (
      <div className="tool-panel">
        <label className="controls accordion">
          <input type="checkbox" className="accordion-switcher" defaultChecked={true} />
          <p className="caption">
            {LANG._nest.spacing}
            <span className="value">{this.getValueCaption()}</span>
          </p>
          <label className='accordion-body'>
            <div>
              <div className='control nest-spacing'>
                <UnitInput
                  min={0}
                  unit='mm'
                  defaultValue={this.state.spacing}
                  getValue={(val) => this.updateVal(val)}
                />
              </div>
            </div>
          </label>
        </label>
      </div>
    );
  }
};

export default NestSpacingPanel;
